import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Globe, 
  ChevronDown, 
  Play, 
  Pause, 
  RotateCcw, 
  FileText, 
  Check, 
  Sparkles,
  Radio
} from 'lucide-react';
import { LanguageCode, ArtisanProfile } from '../../types';
import { getArtisanStory } from '../../data/artisanVoiceStories';
import { useApp } from '../../context/AppContext';
import { voiceAudioEngine } from '../../utils/voiceAudioEngine';

interface ArtisanVoiceStoryPlayerProps {
  artisan: ArtisanProfile;
}

const SUPPORTED_LANGUAGES: { code: LanguageCode; nativeName: string; label: string }[] = [
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', label: 'Odia' },
  { code: 'hi', nativeName: 'हिन्दी', label: 'Hindi' },
  { code: 'en', nativeName: 'English', label: 'English' },
  { code: 'bn', nativeName: 'বাংলা', label: 'Bengali' },
  { code: 'ta', nativeName: 'தமிழ்', label: 'Tamil' },
  { code: 'te', nativeName: 'తెలుగు', label: 'Telugu' },
  { code: 'kn', nativeName: 'କನ್ನಡ', label: 'Kannada' },
  { code: 'mr', nativeName: 'मराठी', label: 'Marathi' },
  { code: 'gu', nativeName: 'ગુજરાતી', label: 'Gujarati' },
];

export const ArtisanVoiceStoryPlayer: React.FC<ArtisanVoiceStoryPlayerProps> = ({ artisan }) => {
  const { language: globalLang, showNotification } = useApp();
  
  // Default to artisan's regional language (e.g. Odia for Odisha) or global app language
  const defaultSelectedLang: LanguageCode = (artisan.state === 'Odisha' ? 'or' : (artisan.state === 'Karnataka' ? 'kn' : globalLang));
  
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(defaultSelectedLang);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [showTranscript, setShowTranscript] = useState<boolean>(true); // Auto-show transcript for clear visibility

  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentStory = getArtisanStory(artisan.id, artisan.name, artisan.bio, selectedLang);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  // Sync selectedLang with global app language when globalLang changes
  useEffect(() => {
    setSelectedLang(globalLang);
  }, [globalLang]);

  // Preload voices & listen to voice updates
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      voiceAudioEngine.stop();
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
        htmlAudioRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic for progress bar & elapsed time
  useEffect(() => {
    if (isPlaying && !isPaused) {
      const totalSec = currentStory.durationEstimateSec || 22;
      timerRef.current = setInterval(() => {
        setElapsedSec(prev => {
          const next = prev + 1;
          const pct = Math.min(100, Math.round((next / totalSec) * 100));
          setProgress(pct);
          if (next >= totalSec) {
            stopAudio();
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isPaused, currentStory.durationEstimateSec]);

  const stopAudio = () => {
    voiceAudioEngine.stop();
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setElapsedSec(0);
  };

  const playAudioStream = (story: typeof currentStory) => {
    // Stop existing audio
    stopAudio();

    // 1. Web Audio API Synth (Guarantees audible sound tones for voice cadence)
    voiceAudioEngine.startAcousticVoiceMelody(story.durationEstimateSec);

    // 2. Web Speech API (TTS) with Smart Phonetic Voice Fallback
    voiceAudioEngine.speakText(
      story.transcript,
      story.phoneticTranscript,
      story.englishPhonetic,
      story.locale,
      () => {
        stopAudio();
      },
      () => {
        console.log("TTS playback completed or fallback active");
      }
    );

    // 3. Play HTML5 Audio fallback ambient audio if available
    try {
      if (artisan.storyAudioUrl) {
        const audio = new Audio(artisan.storyAudioUrl);
        audio.volume = 0.35;
        audio.play().catch(e => console.log("HTML5 audio autoplay restricted:", e));
        htmlAudioRef.current = audio;
      }
    } catch (e) {
      console.warn("HTML5 audio init error:", e);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        // Resume
        voiceAudioEngine.resume();
        if (htmlAudioRef.current) htmlAudioRef.current.play().catch(() => {});
        setIsPaused(false);
      } else {
        // Pause
        voiceAudioEngine.pause();
        if (htmlAudioRef.current) htmlAudioRef.current.pause();
        setIsPaused(true);
      }
    } else {
      // Start Playing
      setElapsedSec(0);
      setProgress(0);
      setIsPlaying(true);
      setIsPaused(false);
      
      playAudioStream(currentStory);
      
      showNotification(
        `🔊 Playing voice testimony in ${currentLangObj.label} (${currentLangObj.nativeName}) from ${artisan.name}`, 
        'info'
      );
    }
  };

  const handleSelectLanguage = (langCode: LanguageCode) => {
    setSelectedLang(langCode);
    setIsLangDropdownOpen(false);

    const newLangObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    const newStory = getArtisanStory(artisan.id, artisan.name, artisan.bio, langCode);

    showNotification(`Switched voice language to ${newLangObj?.label} (${newLangObj?.nativeName})`, 'info');

    // Immediately start playing in the newly selected language
    setElapsedSec(0);
    setProgress(0);
    setIsPlaying(true);
    setIsPaused(false);
    playAudioStream(newStory);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col space-y-3 w-full md:w-auto">
      <div className="flex flex-wrap items-center gap-2">
        {/* Main Audio Play / Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-full bg-[#BC8E6D] hover:bg-[#A77756] active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-md cursor-pointer group"
          title={`Click to listen to story in ${currentLangObj.label}`}
        >
          {isPlaying && !isPaused ? (
            <>
              <VolumeX className="w-4 h-4 animate-pulse text-[#FAF8F5]" />
              <span>Pause Story</span>
            </>
          ) : isPlaying && isPaused ? (
            <>
              <Play className="w-4 h-4 text-[#FAF8F5]" />
              <span>Resume Story ({currentLangObj.label})</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>🎙 Listen to Artisan's Story ({currentLangObj.label})</span>
            </>
          )}
        </button>

        {/* Language Selector Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-3.5 rounded-full bg-[#3A3F30] hover:bg-[#2F3327] text-[#FAF8F5] text-xs font-medium border border-[#5D634C]/40 transition-colors shadow-xs"
            title="Change Audio Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#BC8E6D]" />
            <span className="font-semibold">{currentLangObj.nativeName}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Languages Dropdown Menu */}
          {isLangDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#2C2E29] border border-[#5D634C]/50 shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 border-b border-[#5D634C]/30 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#BC8E6D]">
                  Select Audio Language
                </span>
                <Radio className="w-3 h-3 text-[#BC8E6D] animate-pulse" />
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === selectedLang;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors text-left ${
                        isSelected 
                          ? 'bg-[#BC8E6D]/20 text-[#BC8E6D] font-bold' 
                          : 'text-[#E8E4DD] hover:bg-[#3A3F30] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{lang.nativeName}</span>
                        <span className="text-[10px] text-[#A2A799]">({lang.label})</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#BC8E6D]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Read Transcript Toggle */}
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className={`px-3 py-3.5 rounded-full border transition-colors ${
            showTranscript 
              ? 'bg-[#BC8E6D] text-white border-[#BC8E6D]' 
              : 'bg-[#3A3F30] text-[#E8E4DD] border-[#5D634C]/40 hover:bg-[#2F3327]'
          }`}
          title={showTranscript ? "Hide Transcript" : "Read Written Story Transcript"}
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Audio Playback Status Bar & Equalizer (When Active or Paused) */}
      {isPlaying && (
        <div className="bg-[#3A3F30]/95 border border-[#BC8E6D]/40 rounded-2xl p-3.5 space-y-2 text-[#FAF8F5] animate-in fade-in duration-200 shadow-md">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              {/* Equalizer Visualizer Bars */}
              <div className="flex items-end space-x-0.5 h-3.5">
                <span className={`w-1 bg-[#BC8E6D] rounded-full transition-all ${isPaused ? 'h-1' : 'h-3.5 animate-bounce'}`} style={{ animationDuration: '0.5s' }}></span>
                <span className={`w-1 bg-[#BC8E6D] rounded-full transition-all ${isPaused ? 'h-1' : 'h-2 animate-bounce'}`} style={{ animationDuration: '0.3s' }}></span>
                <span className={`w-1 bg-[#BC8E6D] rounded-full transition-all ${isPaused ? 'h-1' : 'h-3 animate-bounce'}`} style={{ animationDuration: '0.7s' }}></span>
                <span className={`w-1 bg-[#BC8E6D] rounded-full transition-all ${isPaused ? 'h-1' : 'h-1.5 animate-bounce'}`} style={{ animationDuration: '0.4s' }}></span>
              </div>
              <span className="font-semibold text-[#BC8E6D]">
                Playing Audio ({currentLangObj.label} / {currentLangObj.nativeName})
              </span>
            </div>
            <div className="flex items-center space-x-2 font-mono text-[10px] text-[#DCD7CF]">
              <span>{formatTime(elapsedSec)} / {formatTime(currentStory.durationEstimateSec)}</span>
              <button 
                onClick={stopAudio}
                className="hover:text-red-400 p-0.5 transition-colors"
                title="Stop Audio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#2C2E29] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#BC8E6D] via-[#D5A07B] to-[#E5B895] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Transcript Box Drawer */}
      {showTranscript && (
        <div className="bg-[#2C2E29] border border-[#BC8E6D]/40 rounded-2xl p-4 text-xs space-y-2.5 text-[#E8E4DD] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#5D634C]/40 pb-2">
            <span className="font-bold text-[#BC8E6D] uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3" />
              <span>ARTISAN TESTIMONY ({currentLangObj.nativeName} – {currentLangObj.label.toUpperCase()})</span>
            </span>
            <button
              onClick={() => handleSelectLanguage(selectedLang)}
              className="text-[10px] text-[#DCD7CF] hover:text-[#BC8E6D] transition-colors font-semibold underline underline-offset-2"
            >
              Replay Audio
            </button>
          </div>
          <p className="leading-relaxed font-sans italic text-sm text-[#FAF8F5]">
            "{currentStory.transcript}"
          </p>
        </div>
      )}
    </div>
  );
};
