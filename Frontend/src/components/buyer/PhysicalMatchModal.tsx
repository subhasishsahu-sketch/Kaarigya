import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductPassport } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { api } from '../../services/api';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Sparkles,
  MapPin,
  FileCheck
} from 'lucide-react';

export const PhysicalMatchModal: React.FC<{ product: ProductPassport }> = ({ product }) => {
  const { isPhysicalMatchOpen, setIsPhysicalMatchOpen, showNotification } = useApp();
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analyzed, setAnalyzed] = useState<boolean>(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Camera permission or access failed:", err);
      setCameraActive(false);
      showNotification('Camera access unavailable. Please select an image file to upload.', 'info');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopCamera();
        setUserImage(dataUrl);
        executeVerification(dataUrl);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUserImage(dataUrl);
        executeVerification(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeVerification = async (imageData: string) => {
    setAnalyzing(true);
    setErrorMsg(null);

    let locationMeta: any = undefined;
    if (navigator.geolocation) {
      try {
        const pos: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        }).catch(() => null);

        if (pos) {
          locationMeta = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            city: product.originDistrict || '',
            state: product.originState || 'India',
            country: 'India'
          };
        }
      } catch (e) {
        // Location optional
      }
    }

    try {
      const result = await api.products.physicalCheck(product.productId, imageData, locationMeta);
      setMatchResult(result);
      setAnalyzed(true);

      if (result.status === 'AUTHENTIC') {
        showNotification(`Physical pattern verification confirmed: ${result.similarityPercent || Math.round(result.similarityScore * 100) + '%'} similarity`, 'success');
      } else if (result.status === 'SUSPICIOUS') {
        showNotification('Verification returned suspicious morphological variance.', 'warning');
      } else if (result.status === 'COUNTERFEIT') {
        showNotification('Physical anomaly detected: Material signature mismatch.', 'error');
      } else {
        showNotification('Physical check completed.', 'info');
      }
    } catch (err: any) {
      console.error("Physical verification error:", err);
      setErrorMsg(err.message || 'Verification service failed. Please try again.');
      setAnalyzed(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsPhysicalMatchOpen(false);
  };

  if (!isPhysicalMatchOpen) return null;

  const isAuthentic = matchResult?.status === 'AUTHENTIC' || (matchResult?.similarityScore >= 0.75);
  const isSuspicious = matchResult?.status === 'SUSPICIOUS';
  const isCounterfeit = matchResult?.status === 'COUNTERFEIT' || (matchResult?.similarityScore < 0.40 && matchResult?.status !== 'ERROR');
  const isError = matchResult?.status === 'ERROR' || Boolean(errorMsg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2E29]/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-black/[0.04] rounded-[36px] max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E4DD] bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#5D634C] text-[#FAF8F5] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-base text-[#2C2E29]">
                Physical Craft Pattern Matching
              </h3>
              <p className="text-[11px] text-[#73776A]">
                Python ML Feature Extraction (ORB/AKAZE + LBP + GLCM + RANSAC Homography)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-[#73776A] hover:text-[#2C2E29] hover:bg-[#FAF8F5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Initial Capture / Upload State */}
          {!analyzed && !analyzing && !cameraActive && (
            <div className="space-y-4 text-center">
              <div className="border-2 border-dashed border-[#DCD7CF] rounded-[28px] p-8 bg-[#FAF8F5] space-y-3">
                <Camera className="w-12 h-12 text-[#BC8E6D] mx-auto" />
                <div>
                  <h4 className="font-serif italic font-bold text-base text-[#2C2E29]">
                    Capture or Upload Physical Product
                  </h4>
                  <p className="text-xs text-[#73776A] max-w-md mx-auto mt-1">
                    Photograph key texture details such as weave density, artisan needlework motif, or metal casting patina.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    onClick={startCamera}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C] shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Live Camera</span>
                  </button>

                  <label className="cursor-pointer inline-flex items-center space-x-2 px-5 py-2.5 bg-white border border-[#DCD7CF] text-xs font-semibold text-[#2C2E29] rounded-full hover:bg-[#E8E4DD]">
                    <Upload className="w-4 h-4 text-[#73776A]" />
                    <span>Upload Image File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#73776A] pt-2">
                <div className="p-3 rounded-2xl bg-[#E8E4DD]/40 font-medium">1. Detects Texture ROI</div>
                <div className="p-3 rounded-2xl bg-[#E8E4DD]/40 font-medium">2. RANSAC Inlier Match</div>
                <div className="p-3 rounded-2xl bg-[#E8E4DD]/40 font-medium">3. RSA Manifest Check</div>
              </div>
            </div>
          )}

          {/* Active Camera View */}
          {cameraActive && !analyzing && (
            <div className="space-y-4 text-center">
              <div className="rounded-[28px] overflow-hidden bg-black relative max-h-[340px]">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2.5 bg-[#5D634C] text-white text-xs font-semibold rounded-full hover:bg-[#4A4F3C] shadow-md flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo & Verify</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-200 text-[#2C2E29] text-xs font-semibold rounded-full hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Analyzing State */}
          {analyzing && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-[#5D634C] animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-serif italic font-bold text-base text-[#2C2E29]">
                  Executing Python Computer Vision Authentication...
                </h4>
                <p className="text-xs text-[#73776A]">
                  Computing ROI texture vectors, descriptor matching, RANSAC homography, and Layer 1 RSA manifest check
                </p>
              </div>
            </div>
          )}

          {/* Analyzed Results State */}
          {analyzed && !analyzing && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Image Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#73776A]">Registered Workshop Evidence</span>
                  <div className="h-40 rounded-2xl overflow-hidden border border-[#DCD7CF] bg-[#E8E4DD]">
                    <SafeImage 
                      src={product.primaryImage} 
                      alt="Registered" 
                      craftCategory={product.craftCategory}
                      productId={product.productId}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#5D634C]">Your Query Photograph</span>
                  <div className={`h-40 rounded-2xl overflow-hidden border-2 relative ${
                    isAuthentic ? 'border-[#5D634C]' : isCounterfeit ? 'border-red-500' : 'border-amber-500'
                  } bg-[#E8E4DD]`}>
                    <SafeImage 
                      src={userImage || product.primaryImage} 
                      alt="Scanned" 
                      craftCategory={product.craftCategory}
                      productId={product.productId}
                      className="w-full h-full object-cover" 
                    />
                    <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold ${
                      isAuthentic ? 'bg-[#5D634C]' : isCounterfeit ? 'bg-red-600' : 'bg-amber-600'
                    }`}>
                      {matchResult?.similarityPercent || (matchResult?.similarityScore !== undefined ? `${Math.round(matchResult.similarityScore * 100)}%` : 'N/A')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Result Banner */}
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isAuthentic 
                  ? 'bg-[#5D634C]/10 border-[#5D634C]/25 text-[#2C2E29]' 
                  : isCounterfeit
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : isError
                  ? 'bg-gray-50 border-gray-200 text-gray-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isAuthentic ? (
                      <CheckCircle2 className="w-5 h-5 text-[#5D634C]" />
                    ) : isCounterfeit ? (
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="font-serif italic font-bold text-base">
                      {isAuthentic
                        ? `Decision: AUTHENTIC (${matchResult?.similarityPercent || 'Matched'})`
                        : isCounterfeit
                        ? `Decision: COUNTERFEIT / MISMATCH (${matchResult?.similarityPercent || 'Low'})`
                        : isError
                        ? 'Service Offline / Error'
                        : `Decision: SUSPICIOUS (${matchResult?.similarityPercent || 'Review'})`}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    {matchResult?.decision || matchResult?.status || 'COMPLETED'}
                  </span>
                </div>

                <p className="text-xs leading-relaxed">
                  {matchResult?.explanation || errorMsg || 'Physical analysis complete.'}
                </p>

                {/* Real Python ML Diagnostics */}
                {matchResult?.metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-black/[0.08] text-[11px] font-mono">
                    <div className="p-2 rounded bg-white/60">
                      <span className="text-[#73776A] block text-[9px]">RANSAC Inliers</span>
                      <span className="font-bold">{matchResult.metrics.ransacInliers ?? 'N/A'} pts</span>
                    </div>
                    <div className="p-2 rounded bg-white/60">
                      <span className="text-[#73776A] block text-[9px]">LBP Texture</span>
                      <span className="font-bold">{matchResult.metrics.lbpSimilarity ? `${(matchResult.metrics.lbpSimilarity * 100).toFixed(1)}%` : 'N/A'}</span>
                    </div>
                    <div className="p-2 rounded bg-white/60">
                      <span className="text-[#73776A] block text-[9px]">GLCM Matrix</span>
                      <span className="font-bold">{matchResult.metrics.glcmSimilarity ? `${(matchResult.metrics.glcmSimilarity * 100).toFixed(1)}%` : 'N/A'}</span>
                    </div>
                    <div className="p-2 rounded bg-white/60">
                      <span className="text-[#73776A] block text-[9px]">Exec Time</span>
                      <span className="font-bold">{matchResult.metrics.processingTimeSeconds ? `${matchResult.metrics.processingTimeSeconds}s` : 'N/A'}</span>
                    </div>
                  </div>
                )}

                {/* Digital Identity Check */}
                {matchResult?.digitalIdentity?.manifestHash && (
                  <div className="flex items-center space-x-2 text-[10px] text-[#73776A] pt-1">
                    <FileCheck className="w-3.5 h-3.5 text-[#5D634C]" />
                    <span>RSA-2048 Signed Manifest Hash: <span className="font-mono">{matchResult.digitalIdentity.manifestHash.slice(0, 16)}...</span></span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => { setAnalyzed(false); setUserImage(null); setMatchResult(null); setErrorMsg(null); }}
                  className="px-4 py-2 text-xs text-[#73776A] hover:text-[#2C2E29] font-bold uppercase tracking-wider"
                >
                  Verify Another Photo
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-full hover:bg-[#4A4F3C]"
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
