import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Upload, 
  Camera, 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Film, 
  Sparkles, 
  Square,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CraftVideoUploadProps {
  videoUrl: string | null;
  videoDuration: number | null;
  onVideoChange: (url: string | null, duration: number | null) => void;
}

export const CraftVideoUpload: React.FC<CraftVideoUploadProps> = ({
  videoUrl,
  videoDuration,
  onVideoChange
}) => {
  const { t } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const validateAndSetVideo = (file: File | Blob, objectUrl: string) => {
    setError(null);

    // 1. File Size Validation (Max 50 MB)
    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(t.videoTooLarge || "Video is too large. Please upload a video under 50 MB.");
      return;
    }

    // 2. Format / Type Validation (MP4, WebM, MOV)
    if (file.type && !file.type.startsWith('video/')) {
      setError("Invalid file type. Please upload a valid video (MP4, WebM, MOV).");
      return;
    }

    // 3. Duration Validation (Max 60 seconds)
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      window.URL.revokeObjectURL(tempVideo.src);
      const durationSec = Math.round(tempVideo.duration);

      if (durationSec > 60) {
        setError(t.videoTooLong || "Please upload a video under 60 seconds.");
        return;
      }

      onVideoChange(objectUrl, durationSec);
    };

    tempVideo.onerror = () => {
      // Fallback if metadata fails to load (e.g. mobile codec)
      onVideoChange(objectUrl, 30);
    };

    tempVideo.src = objectUrl;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    validateAndSetVideo(file, url);

    // Reset file input value so re-selecting same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startCameraRecording = async () => {
    setError(null);
    recordedChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      setMediaStream(stream);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/mp4')
            ? 'video/mp4'
            : 'video/webm'
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'video/mp4' });
        const recordedUrl = URL.createObjectURL(blob);
        validateAndSetVideo(blob, recordedUrl);
        stopCameraStream();
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Start duration timer
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            stopCameraRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Could not access camera or microphone. Please use file upload.");
      stopCameraStream();
      setIsRecording(false);
    }
  };

  const stopCameraRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      stopCameraStream();
      setIsRecording(false);
    }
  };

  const handleTogglePlay = () => {
    if (!previewVideoRef.current) return;
    if (isPlaying) {
      previewVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      previewVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRemoveVideo = () => {
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }
    onVideoChange(null, null);
    setError(null);
    setIsPlaying(false);
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return '00:00';
    const mins = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-5 craft-shadow-subtle animate-fade-in">
      
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-[#5D634C]">
          <Film className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Craft Story & Provenance</span>
        </div>
        <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
          {t.showYourCraft || "Show Your Craft"}
        </h2>
        <p className="text-xs text-[#73776A]">
          {t.showYourCraftSubtitle || "Upload a short video showing how you create this product."}
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* LIVE CAMERA RECORDING VIEW */}
      {isRecording ? (
        <div className="p-4 bg-[#2C2E29] rounded-3xl space-y-4 text-center text-white">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video
              ref={liveVideoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-rose-600/90 text-white font-mono text-xs px-3 py-1 rounded-full flex items-center space-x-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>REC {formatDuration(recordingSeconds)} / 01:00</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={stopCameraRecording}
              className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop & Save Video ({recordingSeconds}s)</span>
            </button>
          </div>
        </div>
      ) : videoUrl ? (
        /* PREVIEW MODE: Embedded Player with Playback & Controls */
        <div className="p-4 bg-[#FAF8F5] border border-[#DCD7CF] rounded-3xl space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center group">
            <video
              ref={previewVideoRef}
              src={videoUrl}
              playsInline
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />
            
            {/* Play/Pause Overlay Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all group-hover:scale-105 cursor-pointer backdrop-blur-xs"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            {/* Video Duration Badge */}
            <div className="absolute bottom-3 right-3 bg-black/70 text-white font-mono text-[11px] px-2.5 py-1 rounded-md flex items-center space-x-1 backdrop-blur-xs">
              <Clock className="w-3 h-3 text-[#BC8E6D]" />
              <span>{formatDuration(videoDuration)}</span>
            </div>
          </div>

          {/* Video Metadata & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#E8E4DD]">
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-[#5D634C]/15 text-[#5D634C] font-bold text-[10px] uppercase border border-[#5D634C]/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Process Video: Submitted</span>
              </span>
              <span className="text-[11px] text-[#73776A] font-semibold">
                Duration: {formatDuration(videoDuration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-full bg-white border border-[#DCD7CF] text-[#2C2E29] text-xs font-bold hover:bg-[#E8E4DD] transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#5D634C]" />
                <span>{t.replaceVideo || "[ Replace ]"}</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveVideo}
                className="px-3 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.removeVideo || "[ Remove ]"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* UPLOAD CARD (BEFORE SELECTION) */
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border border-dashed border-[#BC8E6D]/50 hover:border-[#5D634C] rounded-3xl text-center space-y-5 transition-all craft-shadow-subtle group">
          
          <div className="w-16 h-16 rounded-full bg-[#BC8E6D]/15 text-[#BC8E6D] group-hover:bg-[#5D634C]/15 group-hover:text-[#5D634C] flex items-center justify-center mx-auto transition-colors">
            <Video className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif italic text-lg font-bold text-[#2C2E29]">
              🎥 {t.showYourCraft || "Show Your Craft"}
            </h3>
            <p className="text-xs text-[#73776A] max-w-sm mx-auto">
              {t.showYourCraftSubtitle || "Upload a short video of your making process."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#5D634C] hover:bg-[#4A4F3C] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{t.uploadMakingVideo || "[ Upload Video ]"}</span>
            </button>

            <button
              type="button"
              onClick={startCameraRecording}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-[#DCD7CF] hover:bg-[#E8E4DD] text-[#2C2E29] font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#BC8E6D]" />
              <span>{t.recordVideo || "[ Record Video ]"}</span>
            </button>
          </div>

          {/* Technical Specifications Footnote */}
          <div className="text-[10px] text-[#73776A] font-semibold tracking-wider uppercase pt-2 border-t border-[#E8E4DD]/60">
            MP4, WebM, MOV • Maximum 60 seconds • Max 50 MB
          </div>
        </div>
      )}

      {/* Artisan Guidance Tip */}
      <div className="p-4 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/25 text-xs text-[#5D634C] flex items-start space-x-2.5">
        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#5D634C]" />
        <div>
          <span className="font-bold block mb-0.5">Artisan Guidance:</span>
          <span className="text-[11px] text-[#73776A]">
            {t.artisanTip || "Tip: Show your hands, tools, materials, or the making process."}
          </span>
        </div>
      </div>

    </div>
  );
};
