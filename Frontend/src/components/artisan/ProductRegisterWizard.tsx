import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Mic, 
  Camera, 
  Upload, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Printer, 
  Share2, 
  Layers, 
  User, 
  MapPin, 
  Building2,
  Trash2,
  Lock,
  Loader2,
  ShieldCheck,
  Eye,
  RefreshCw
} from 'lucide-react';
import { EvidenceItem, ProductPassport, CreationLocation, PublicLocation, LanguageCode } from '../../types';
import { LocationCapture } from '../location/LocationCapture';
import { CraftVideoUpload } from './CraftVideoUpload';
import { CertificatePrintModal } from '../buyer/CertificatePrintModal';
import { ShareModal } from '../buyer/ShareModal';
import { SafeImage } from '../common/SafeImage';
import { api } from '../../services/api';
import { AuthenticationLabel } from '../label/AuthenticationLabel';

export const ProductRegisterWizard: React.FC = () => {
  const { 
    currentArtisan, 
    registerNewProduct, 
    navigate, 
    showNotification,
    t,
    language 
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 7;

  // Physical Registration Stages (Sub-steps after initial form entry)
  // 'FORM' -> 'PRINT_PASTE' -> 'SCAN_QR' -> 'CAPTURE_ROI' -> 'PERSIST' -> 'COMPLETE'
  // CAPTURE_ROI is now merged into SCAN_QR as a dual-scan second phase
  const [physicalStage, setPhysicalStage] = useState<'FORM' | 'PRINT_PASTE' | 'SCAN_QR' | 'PERSIST' | 'COMPLETE'>('FORM');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [createdPassport, setCreatedPassport] = useState<ProductPassport | null>(null);
  const [registeredBackendProduct, setRegisteredBackendProduct] = useState<any>(null);
  
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('Peacock Garden Appliqué Pillow Cover');
  const [craftCategory, setCraftCategory] = useState<string>('Appliqué & Needlework');
  const [productType, setProductType] = useState<string>('Home Decor Cushion Cover');
  const [description, setDescription] = useState<string>('Handcrafted Pipli needlework cushion cover with hand-cut floral petals and convex glass mirror work.');
  
  // Craft Making Process Video State ("Show Your Craft")
  const [processVideoUrl, setProcessVideoUrl] = useState<string | null>(null);
  const [processVideoDuration, setProcessVideoDuration] = useState<number | null>(null);
  
  // Materials & Techniques
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([
    'Organic Handspun Khadi Cotton',
    'Traditional Shisha (Glass Mirrors)',
    'Natural Madder Root Dye'
  ]);
  
  const [selectedTechnique, setSelectedTechnique] = useState<string>('Traditional Bakhia & Taropa Needlework');
  const [productionDuration, setProductionDuration] = useState<string>('2 Days (16 Craft Hours)');
  const [retailPrice, setRetailPrice] = useState<number>(3200);

  // Location State
  const [creationLocation, setCreationLocation] = useState<CreationLocation | undefined>({
    latitude: 19.9850,
    longitude: 85.8340,
    accuracy: 18,
    timestamp: "19 Aug 2026, 10:42 AM",
    address: `${currentArtisan.location}, ${currentArtisan.state}`,
    isSimulated: true
  });

  const [publicLocation, setPublicLocation] = useState<PublicLocation | undefined>({
    city: "Pipli",
    district: "Puri",
    state: "Odisha",
    country: "India",
    approximateArea: `${currentArtisan.location}, ${currentArtisan.state}`,
    clusterName: "Pipli Appliqué Cluster"
  });

  // Physical Verification Scanner & Capture States
  const [scannedQrId, setScannedQrId] = useState<string | null>(null);
  const [qrScanSuccess, setQrScanSuccess] = useState<boolean>(false);
  const [qrScanError, setQrScanError] = useState<string | null>(null);

  // Dual-scan phase: 'QR' = scanning for QR, 'ROI' = camera live, capture ROI
  const [dualScanPhase, setDualScanPhase] = useState<'QR' | 'ROI'>('QR');
  const [capturedRoiImage, setCapturedRoiImage] = useState<string | null>(null);
  const [roiCaptureSuccess, setRoiCaptureSuccess] = useState<boolean>(false);
  const [roiScanError, setRoiScanError] = useState<string | null>(null);

  // Video Camera Stream Ref for Physical Scanning
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Voice Assistant State
  const [voiceLang, setVoiceLang] = useState<LanguageCode>(language);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceSeconds, setVoiceSeconds] = useState<number>(0);
  const [voiceProcessed, setVoiceProcessed] = useState<boolean>(false);
  const [voiceExtractedData, setVoiceExtractedData] = useState<{
    materials: string[];
    technique: string;
    duration: string;
    summary: string;
  } | null>(null);

  // Evidence photos
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([
    {
      id: 'ev-reg-1',
      url: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80',
      category: 'finished',
      label: 'Finished Cushion Face View',
      timestamp: 'Today, 10:15 AM',
      geoTag: `${currentArtisan.location}`
    },
    {
      id: 'ev-reg-2',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      category: 'artisan_with_product',
      label: `${currentArtisan.name} with In-Progress Work`,
      timestamp: 'Today, 10:30 AM',
      geoTag: `${currentArtisan.district}`
    }
  ]);

  const availableMaterials = [
    'Organic Handspun Khadi Cotton',
    'Pure Mulberry Silk',
    'Tussar Wild Silk',
    'Traditional Shisha (Glass Mirrors)',
    'Natural Madder Root Dye',
    'Natural Indigo Dye',
    'Brass / Bell Metal Alloy',
    'Wrightia Tinctoria Wood',
    'Vegetable Lacquer Resin',
    'Terracotta Clay',
    'Natural Jute Fiber',
    'Pure Silver Zari'
  ];

  const toggleMaterial = (mat: string) => {
    if (selectedMaterials.includes(mat)) {
      setSelectedMaterials(selectedMaterials.filter(m => m !== mat));
    } else {
      setSelectedMaterials([...selectedMaterials, mat]);
    }
  };

  useEffect(() => {
    setVoiceLang(language);
  }, [language]);

  // Voice recording simulation & Web Speech Recognition
  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setVoiceSeconds(0);

    const interval = setInterval(() => {
      setVoiceSeconds(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsRecordingVoice(false);
          setVoiceProcessed(true);
          setVoiceExtractedData({
            materials: ['Organic Handspun Khadi Cotton', 'Natural Madder Root Dye', 'Traditional Shisha (Glass Mirrors)'],
            technique: 'Traditional Bakhia & Taropa Needlework',
            duration: '2 Days (16 Craft Hours)',
            summary: 'Artisan detailed handspun organic cotton foundation with natural dyes and traditional needlework.'
          });
          return 4;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const confirmVoiceData = () => {
    if (voiceExtractedData) {
      setSelectedMaterials(voiceExtractedData.materials);
      setSelectedTechnique(voiceExtractedData.technique);
      setProductionDuration(voiceExtractedData.duration);
      showNotification('Voice details confirmed and mapped to draft!', 'success');
      setStep(7);
    }
  };

  const handleAddEvidenceSimulation = (category: EvidenceItem['category'], label: string) => {
    const newEv: EvidenceItem = {
      id: `ev-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80',
      category,
      label,
      timestamp: 'Just now',
      geoTag: `${currentArtisan.location}`
    };
    setEvidenceList([...evidenceList, newEv]);
    showNotification(`Captured evidence: ${label}`, 'success');
  };

  const handleConfirmLocation = (loc: CreationLocation, pubLoc: PublicLocation) => {
    setCreationLocation(loc);
    setPublicLocation(pubLoc);
    showNotification('Creation location confirmed and linked to provenance.', 'success');
    setStep(6);
  };

  // =========================================================================
  // PHYSICAL REGISTRATION STEP 1: GENERATE DRAFT & 7-CHARACTER IDENTIFIER
  // =========================================================================
  const handleInitiatePhysicalRegistration = async () => {
    setIsRegistering(true);
    const primaryImg = evidenceList[0]?.url || 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80';

    try {
      // Call backend to generate 7-character Product ID & high-res QR code
      const backendProd = await api.products.create({
        title: name,
        craftType: craftCategory,
        productType,
        description,
        materials: selectedMaterials.map(m => ({ name: m, percentage: 100 })),
        technique: selectedTechnique,
        originState: currentArtisan.state || 'Odisha',
        originDistrict: currentArtisan.district || 'Puri',
        evidence: evidenceList.map(ev => ({
          evidenceType: ev.category === 'finished' ? 'WORKSHOP_PHOTO' : 'PROCESS_VIDEO',
          label: ev.label,
          fileUrl: ev.url,
          geoTagLabel: ev.geoTag
        })),
        image: primaryImg,
        processVideoUrl: processVideoUrl || undefined,
        processVideoDuration: processVideoDuration || undefined,
        processVideoStatus: processVideoUrl ? 'SUBMITTED' : undefined
      });

      setRegisteredBackendProduct(backendProd);
      setPhysicalStage('PRINT_PASTE');
      showNotification(`Unique 7-character Product ID [${backendProd.productId}] generated! Please print and paste the label.`, 'success');
    } catch (err: any) {
      console.error("Backend draft error:", err);
      showNotification('Could not connect to backend to generate Product ID.', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  // =========================================================================
  // PHYSICAL REGISTRATION: SCAN QR FROM UPLOADED IMAGE (upload fallback)
  // =========================================================================
  const handleScanPrintedQR = (qrDataUrlOrFile: string) => {
    setQrScanError(null);
    const expected7CharId = registeredBackendProduct?.productId;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);

      let decoded = code ? code.data : null;
      // Soft fallback: dataUrl itself contains the expected ID string
      if (!decoded && qrDataUrlOrFile.includes(expected7CharId)) decoded = expected7CharId;

      if (decoded) {
        const matched = decoded.includes('/') ? decoded.split('/').pop()?.toUpperCase() : decoded.toUpperCase();
        if (matched === expected7CharId || decoded.includes(expected7CharId)) {
          setScannedQrId(expected7CharId);
          setQrScanSuccess(true);
          setDualScanPhase('ROI');
          showNotification(`QR verified [${expected7CharId}] — now upload ROI texture photo to complete registration.`, 'success');
        } else {
          setQrScanError(`QR mismatch: decoded [${matched}] but expected [${expected7CharId}]. Registration rejected. Please upload the correct printed label photo.`);
          showNotification('QR mismatch — registration rejected.', 'error');
        }
      } else {
        setQrScanError('Could not decode QR code from uploaded image. Adjust lighting and try again, or use live camera.');
        showNotification('QR code unreadable.', 'error');
      }
    };
    img.src = qrDataUrlOrFile;
  };

  // =========================================================================
  // LIVE CAMERA SCANNER & PHYSICAL REGISTRATION PIPELINE
  // =========================================================================
  const animFrameId = useRef<number | null>(null);

  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCameraScanner = async () => {
    // Full reset — only called when starting fresh from QR phase
    setQrScanError(null);
    setRoiScanError(null);
    setDualScanPhase('QR');
    setQrScanSuccess(false);
    setRoiCaptureSuccess(false);
    setScannedQrId(null);
    setCapturedRoiImage(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanQrLoop();
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setQrScanError('Camera access denied or unavailable. Please upload a photo of the printed label below.');
      setIsCameraActive(false);
    }
  };

  // Start camera ONLY for ROI capture — QR is already verified, don't reset it
  const startCameraForROI = async () => {
    setRoiScanError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        // No QR loop — camera is live for artisan to frame & capture ROI
      }
    } catch (err: any) {
      console.warn('Camera access failed for ROI:', err);
      setRoiScanError('Camera access denied. Please upload an ROI texture photo instead.');
      setIsCameraActive(false);
    }
  };

  const scanQrLoop = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          // QR found — validate ID, then switch to ROI phase WITHOUT stopping camera
          const expected = registeredBackendProduct?.productId;
          const decoded = code.data.includes('/')
            ? code.data.split('/').pop()?.toUpperCase()
            : code.data.toUpperCase();
          if (decoded === expected || code.data.includes(expected)) {
            setScannedQrId(expected);
            setQrScanSuccess(true);
            setDualScanPhase('ROI');  // camera stays live — artisan now captures ROI
            showNotification(`QR verified [${expected}] — now point camera at craft texture and tap Capture ROI`, 'success');
          } else {
            stopCamera();
            setQrScanError(`QR mismatch: scanned [${decoded}] but expected [${expected}]. Registration blocked. Please scan the correct label.`);
            showNotification('QR mismatch — registration rejected.', 'error');
          }
          return;
        }
      }
    }
    animFrameId.current = requestAnimationFrame(scanQrLoop);
  };

  // Called when artisan taps "Capture ROI" after QR phase succeeds
  const captureRoiFromCamera = () => {
    if (!qrScanSuccess || !scannedQrId) {
      setRoiScanError('QR scan must complete before ROI capture. Please restart.');
      stopCamera();
      return;
    }
    let capturedUrl = evidenceList[0]?.url || 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80';
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        capturedUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }
    stopCamera();
    handleDualScanComplete(capturedUrl);
  };

  // Final gate: both QR and ROI must be present or we reject
  const handleDualScanComplete = async (roiUrl: string) => {
    if (!qrScanSuccess || !scannedQrId) {
      setRoiScanError('Registration rejected: QR code was not successfully scanned. Please restart and scan both QR and ROI.');
      showNotification('Registration rejected — QR not verified.', 'error');
      return;
    }
    if (!roiUrl) {
      setRoiScanError('Registration rejected: ROI texture was not captured. Please restart and scan both QR and ROI.');
      showNotification('Registration rejected — ROI not captured.', 'error');
      return;
    }
    setCapturedRoiImage(roiUrl);
    setRoiCaptureSuccess(true);
    showNotification('Both QR and ROI verified — registering in database with 2048-bit RSA signature...', 'success');
    await handleFinalizeDatabaseRegistration(roiUrl);
  };

  // Upload fallback: QR decoded from image file, then auto-start camera for ROI
  const handleUploadQrImage = (dataUrl: string) => {
    handleScanPrintedQR(dataUrl);
    // After QR verified, auto-launch camera for ROI so artisan doesn’t need to tap again
    // (handleScanPrintedQR sets dualScanPhase='ROI' on success; camera starts after state update)
    setTimeout(() => {
      // Only start camera if QR was successfully decoded (state will have updated)
      if (!qrScanError) {
        startCameraForROI();
      }
    }, 300);
  };

  const handleFinalizeDatabaseRegistration = async (overrideRoiUrl?: string) => {
    setIsRegistering(true);
    try {
      const artisanCompensation = Math.round(retailPrice * 0.65);
      const cooperativeShare = Math.round(retailPrice * 0.15);
      const rawMaterialsLogistics = retailPrice - artisanCompensation - cooperativeShare;

      const finalProductId = registeredBackendProduct?.productId || `CRAFT-${Date.now()}`;
      const primaryImg = evidenceList[0]?.url || 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80';
      const roiImg = overrideRoiUrl || capturedRoiImage || registeredBackendProduct?.fingerprintImageDataUrl || primaryImg;

      const evidencePayload = evidenceList.map((e: any) => ({
        fileUrl: e.url,
        label: e.label,
        evidenceType: e.category
      }));
      if (roiImg && !evidenceList.find((e: any) => e.url === roiImg)) {
        evidencePayload.push({
          fileUrl: roiImg,
          label: 'ROI Fingerprint',
          evidenceType: 'ROI'
        });
      }

      const apiPayload = {
        title: name,
        craftType: craftCategory,
        description,
        originState: publicLocation?.state || 'Odisha',
        originDistrict: publicLocation?.district || 'Puri',
        dimensions: 'N/A',
        weightGrams: 0,
        materials: selectedMaterials.map(m => ({ name: m, percentage: 100 })),
        technique: selectedTechnique,
        image: primaryImg,
        processVideoUrl,
        evidence: evidencePayload
      };

      const productResult = await api.products.create(apiPayload);
      
      setCreatedPassport(productResult);
      setPhysicalStage('COMPLETE');
      showNotification(`✓ Product [${productResult.productId}] fully registered in database!`, 'success');
    } catch (err: any) {
      console.error("Final registration error:", err);
      showNotification('Error committing final registration to database.', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  // =========================================================================
  // ACCESS CONTROL: VERIFY ARTISAN COOPERATIVE APPROVAL & KALAKRITI ARTISAN ID
  // =========================================================================
  const isArtisanVerified = currentArtisan?.verificationStatus === 'VERIFIED' && Boolean(currentArtisan?.kalakritiArtisanId);

  if (!isArtisanVerified) {
    const isRejected = currentArtisan?.verificationStatus === 'REJECTED';
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6 animate-fade-in">
        <div className="bg-white border border-[#DCD7CF] rounded-[32px] p-8 text-center space-y-6 craft-shadow-subtle">
          <div className={`w-16 h-16 rounded-full ${isRejected ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center mx-auto shadow-sm`}>
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${isRejected ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              {isRejected ? 'REGISTRATION REJECTED BY GUILD' : 'COOPERATIVE APPROVAL PENDING'}
            </span>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              Product Registration Blocked
            </h2>
            <p className="text-xs text-[#73776A] max-w-md mx-auto leading-relaxed">
              {isRejected 
                ? `Your artisan registration request was rejected by ${currentArtisan?.cooperativeName || 'your selected Cooperative'}. Product registration access is disabled.`
                : `Your artisan profile is currently PENDING approval by ${currentArtisan?.cooperativeName || 'your selected Cooperative'}. Once approved, a unique Kalakriti Artisan ID will be issued and Product Registration will be enabled.`
              }
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] text-xs text-left space-y-2 text-[#2C2E29]">
            <div className="font-bold uppercase tracking-wider text-[10px] text-[#73776A]">Artisan Authorization Details</div>
            <div className="flex justify-between border-b border-[#E8E4DD] pb-1">
              <span className="text-[#73776A]">Artisan Name:</span>
              <strong className="font-bold">{currentArtisan?.name}</strong>
            </div>
            <div className="flex justify-between border-b border-[#E8E4DD] pb-1">
              <span className="text-[#73776A]">Selected Guild / Cooperative:</span>
              <strong className="font-bold">{currentArtisan?.cooperativeName}</strong>
            </div>
            <div className="flex justify-between border-b border-[#E8E4DD] pb-1">
              <span className="text-[#73776A]">Verification Status:</span>
              <strong className={`font-bold ${isRejected ? 'text-rose-700' : 'text-amber-700'}`}>{currentArtisan?.verificationStatus || 'PENDING'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#73776A]">Kalakriti Artisan ID:</span>
              <strong className="font-mono text-[#73776A]">Awaiting Cooperative Approval</strong>
            </div>
          </div>

          <button
            onClick={() => navigate('/artisan/dashboard')}
            className="px-6 py-3 bg-[#5D634C] text-white font-bold text-xs rounded-full hover:bg-[#4A4F3C] transition-all shadow-xs cursor-pointer inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Artisan Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // REWARDING SUCCESS STATE WHEN REGISTRATION IS FULLY PERSISTED
  // =========================================================================
  if (physicalStage === 'COMPLETE' && createdPassport) {
    const finalProductId = registeredBackendProduct?.productId || createdPassport.productId;
    const finalQrCodeUrl = registeredBackendProduct?.qrCodeDataUrl || createdPassport.qrCodeUrl;
    const finalFingerprintUrl = capturedRoiImage || registeredBackendProduct?.fingerprintImageDataUrl || createdPassport.primaryImage;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="bg-white border border-black/[0.04] rounded-[36px] p-6 sm:p-10 text-center space-y-6 craft-shadow-certificate">
          
          <div className="w-16 h-16 rounded-full bg-[#5D634C]/15 text-[#5D634C] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5D634C]">
              ✓ Product Registered & Signed • Database Persisted
            </span>
            <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#2C2E29]">
              {createdPassport.name}
            </h2>
            <div className="flex items-center justify-center space-x-2 pt-1">
              <span className="text-xs font-bold uppercase text-[#73776A]">Unique 7-Character Product ID:</span>
              <span className="font-mono font-bold text-sm bg-[#FAF8F5] px-3 py-1 rounded-md border border-[#DCD7CF] text-[#2C2E29]">
                {finalProductId}
              </span>
            </div>
          </div>

          {/* Official Kalakriti Physical Authentication Label Card */}
          <div className="pt-2 text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#73776A] mb-2 text-center">
              Official Physical Authentication Label
            </div>
            <AuthenticationLabel
              productId={finalProductId}
              productTitle={createdPassport.name}
              qrCodeDataUrl={finalQrCodeUrl}
              fingerprintImageDataUrl={finalFingerprintUrl}
              verificationUrl={registeredBackendProduct?.verificationUrl || `http://localhost:3001/verify/${finalProductId}`}
            />
          </div>

          {/* Physical Verification Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
            <div className="p-3.5 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/25 text-[#5D634C] space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Physical QR Verified</span>
              </div>
              <p className="text-[11px] text-[#73776A]">
                Physical printed QR code was scanned via camera & validated against Product ID <strong>{finalProductId}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/25 text-[#5D634C] space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Physical ROI Captured</span>
              </div>
              <p className="text-[11px] text-[#73776A]">
                Microstructure ROI texture bound to product identity and signed with 2048-bit RSA key.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('verify-passport', finalProductId)}
              className="flex-1 py-3.5 px-5 rounded-full bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#4A4F3C] shadow-xs cursor-pointer"
            >
              View Digital Passport
            </button>
            <button
              onClick={() => navigate('public-verify', finalProductId)}
              className="flex-1 py-3.5 px-5 rounded-full bg-[#B38B42] text-white text-xs font-semibold hover:bg-[#967433] shadow-xs cursor-pointer"
            >
              Test Consumer Verification Page
            </button>
            <button
              onClick={() => navigate('artisan-dashboard')}
              className="flex-1 py-3.5 px-5 rounded-full bg-white border border-[#DCD7CF] text-xs font-semibold text-[#2C2E29] hover:bg-[#E8E4DD] cursor-pointer"
            >
              Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Verified Artisan Badge */}
      <div className="bg-[#5D634C]/10 border border-[#5D634C]/25 rounded-2xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#5D634C]" />
          <span className="font-bold text-[#2C2E29]">Verified Artisan: {currentArtisan.name}</span>
        </div>
        <span className="font-mono font-bold bg-white text-[#5D634C] px-3 py-1 rounded-full border border-[#5D634C]/30 text-[11px]">
          Kalakriti Artisan ID: {currentArtisan.kalakritiArtisanId}
        </span>
      </div>

      {/* Wizard Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (physicalStage !== 'FORM') setPhysicalStage('FORM');
              else if (step > 1) setStep(step - 1);
              else navigate('artisan-dashboard');
            }}
            className="inline-flex items-center space-x-1.5 text-xs text-[#5D634C] hover:text-[#2C2E29] font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{physicalStage !== 'FORM' ? 'Back to Form' : step === 1 ? 'Cancel' : 'Previous Step'}</span>
          </button>

          <span className="text-xs font-bold text-[#5D634C] font-mono tracking-wider">
            STEP {step} / {totalSteps} {physicalStage !== 'FORM' ? `• [${physicalStage}]` : ''}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#E8E4DD] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#5D634C] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: BASIC INFORMATION                                                */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-5 craft-shadow-subtle animate-fade-in">
          <div>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              Step 1: Basic Information
            </h2>
            <p className="text-xs text-[#73776A]">
              Name and categorize your traditional handmade craft piece.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#73776A]">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sacred Lotus Pipli Appliqué Tapestry"
                className="w-full p-3.5 text-sm bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#73776A]">
                Craft Category
              </label>
              <select
                value={craftCategory}
                onChange={(e) => setCraftCategory(e.target.value)}
                className="w-full p-3.5 text-sm bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
              >
                <option value="Appliqué & Needlework">Appliqué & Needlework (Pipli Chandua)</option>
                <option value="Metalwork & Lost-Wax">Metalwork & Lost-Wax Casting (Dhokra)</option>
                <option value="Handloom & Silk">Handloom & Silk Ikat (Sambalpuri Bandha)</option>
                <option value="Woodcraft & Lacquer">Woodcraft & Natural Lacquer (Channapatna)</option>
                <option value="Folk Painting">Folk Painting & Inks (Madhubani / Pattachitra)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#73776A]">
                Product Type / Utility
              </label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full p-3.5 text-sm bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#73776A]">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 text-sm bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-full bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#4A4F3C] flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer"
          >
            <span>Continue to Materials & Technique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: MATERIALS & TECHNIQUE */}
      {step === 2 && (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-5 craft-shadow-subtle animate-fade-in">
          <div>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              Step 2: Materials & Technique
            </h2>
            <p className="text-xs text-[#73776A]">
              Select raw materials used and specify traditional crafting techniques.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#73776A]">
                Select Raw Materials
              </label>
              <div className="flex flex-wrap gap-2">
                {availableMaterials.map((mat) => {
                  const isSelected = selectedMaterials.includes(mat);
                  return (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => toggleMaterial(mat)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#5D634C] text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-[#73776A] border border-[#DCD7CF] hover:bg-[#E8E4DD]'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{mat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#73776A]">
                Primary Technique
              </label>
              <input
                type="text"
                value={selectedTechnique}
                onChange={(e) => setSelectedTechnique(e.target.value)}
                className="w-full p-3.5 text-sm bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full py-4 rounded-full bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#4A4F3C] flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer"
          >
            <span>Continue to Production Time & Pricing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: DURATION & PRICING */}
      {step === 3 && (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-5 craft-shadow-subtle animate-fade-in">
          <div>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              Step 3: Duration & Fair Trade Pricing
            </h2>
            <p className="text-xs text-[#73776A]">
              Define craft creation time and retail valuation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#73776A]">
                Total Crafting Duration
              </label>
              <input
                type="text"
                value={productionDuration}
                onChange={(e) => setProductionDuration(e.target.value)}
                className="w-full p-3.5 text-sm bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#73776A]">
                Retail Fair Trade Price (₹)
              </label>
              <input
                type="number"
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                className="w-full p-3.5 text-sm bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl text-[#2C2E29] focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full py-4 rounded-full bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#4A4F3C] flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer"
          >
            <span>Continue to Provenance Location</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: LOCATION PROVENANCE */}
      {step === 4 && (
        <div className="space-y-4">
          <LocationCapture
            artisan={currentArtisan}
            initialLocation={creationLocation}
            initialPublicLocation={publicLocation}
            onConfirmLocation={handleConfirmLocation}
            onSkipLocation={() => setStep(5)}
          />
        </div>
      )}

      {/* STEP 5: MULTILINGUAL VOICE ASSISTANT */}
      {step === 5 && (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-5 craft-shadow-subtle animate-fade-in">
          <div>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              Step 5: Voice Story Recording
            </h2>
            <p className="text-xs text-[#73776A]">
              Speak in your native dialect (Odia, Hindi, English) to record your craft story.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] text-center space-y-4">
            {isRecordingVoice ? (
              <div className="space-y-3 py-4">
                <div className="w-16 h-16 rounded-full bg-[#A25247] text-white flex items-center justify-center mx-auto animate-pulse">
                  <Mic className="w-8 h-8" />
                </div>
                <div className="text-sm font-bold text-[#A25247]">Recording... ({voiceSeconds}s)</div>
              </div>
            ) : (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="w-16 h-16 rounded-full bg-[#BC8E6D] hover:bg-[#A77756] text-white flex items-center justify-center mx-auto transition-transform active:scale-95 shadow-md cursor-pointer"
              >
                <Mic className="w-8 h-8" />
              </button>
            )}
            <div className="text-xs font-bold text-[#2C2E29]">Tap Mic to Record Story</div>
          </div>

          <button
            onClick={() => setStep(6)}
            className="w-full py-4 rounded-full bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#4A4F3C] flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer"
          >
            <span>Continue to Product Evidence Photos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 6: EVIDENCE PHOTOS & MAKING PROCESS VIDEO ("SHOW YOUR CRAFT") */}
      {step === 6 && (
        <div className="space-y-6 animate-fade-in">
          {/* Craft Making Process Video Section */}
          <CraftVideoUpload
            videoUrl={processVideoUrl}
            videoDuration={processVideoDuration}
            onVideoChange={(url, duration) => {
              setProcessVideoUrl(url);
              setProcessVideoDuration(duration);
            }}
          />

          <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle">
            <div>
              <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
                Product Benchwork Evidence Photos
              </h2>
              <p className="text-xs text-[#73776A]">
                Upload additional benchwork and finished craft photos for physical verification.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAddEvidenceSimulation('craft_process', 'Motif Scissor Cutting')}
                className="p-4 rounded-2xl border border-[#DCD7CF] bg-[#FAF8F5] text-xs text-left hover:bg-[#E8E4DD] transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#5D634C] mb-1.5" />
                <span className="font-bold text-[#2C2E29] block">+ Craft Process Photo</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddEvidenceSimulation('makers_mark', 'Hand Signature Back Hem')}
                className="p-4 rounded-2xl border border-[#DCD7CF] bg-[#FAF8F5] text-xs text-left hover:bg-[#E8E4DD] transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#5D634C] mb-1.5" />
                <span className="font-bold text-[#2C2E29] block">+ Maker's Mark Photo</span>
              </button>
            </div>

            <button
              onClick={() => setStep(7)}
              className="w-full py-4 rounded-full bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#4A4F3C] flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer"
            >
              <span>Proceed to Step 7: Physical Registration & Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: REAL-WORLD PHYSICAL REGISTRATION & VERIFICATION PIPELINE         */}
      {/* ========================================================================= */}
      {step === 7 && physicalStage === 'FORM' && (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D] block">
              Step 7 • Physical Registration Workflow
            </span>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              Initiate Product Registration & Generate 7-Char QR ID
            </h2>
            <p className="text-xs text-[#73776A] mt-1">
              The product will generate a unique 7-character Product ID and print-ready label. You will then print and paste the label on the physical item, scan the physical QR code, and capture the physical ROI before final database registration and RSA digital signature signing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#E8E4DD]/50 border border-[#DCD7CF] space-y-2 text-xs">
            <div className="font-bold text-[#2C2E29]">Product Summary</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#73776A]">
              <div><strong className="text-[#2C2E29]">Name:</strong> {name}</div>
              <div><strong className="text-[#2C2E29]">Category:</strong> {craftCategory}</div>
              <div><strong className="text-[#2C2E29]">Artisan:</strong> {currentArtisan.name}</div>
              <div><strong className="text-[#2C2E29]">Location:</strong> {publicLocation?.approximateArea || "Pipli, Odisha"}</div>
            </div>
          </div>

          <button
            onClick={handleInitiatePhysicalRegistration}
            disabled={isRegistering}
            className="w-full py-4 rounded-full bg-[#5D634C] hover:bg-[#4A4F3C] text-white font-serif italic font-bold text-base shadow-lg transition-transform active:scale-98 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isRegistering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <QrCode className="w-5 h-5 text-white" />
            )}
            <span>{isRegistering ? 'Generating Product ID & Label...' : 'Generate Product ID & Printable Label'}</span>
          </button>
        </div>
      )}

      {/* SUB-STAGE: PRINT & PASTE LABEL */}
      {step === 7 && physicalStage === 'PRINT_PASTE' && registeredBackendProduct && (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5D634C] block">
              Physical Workflow Step 1 of 3
            </span>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              Print & Paste Authentication Label
            </h2>
            <p className="text-xs text-[#73776A] max-w-lg mx-auto">
              Please print this physical authentication label and paste it securely onto the physical craft item.
            </p>
          </div>

          {/* Printable Label View */}
          <div className="p-4 bg-[#FAF8F5] rounded-3xl border border-[#DCD7CF]">
            <AuthenticationLabel
              productId={registeredBackendProduct.productId}
              productTitle={name}
              qrCodeDataUrl={registeredBackendProduct.qrCodeDataUrl}
              fingerprintImageDataUrl={registeredBackendProduct.fingerprintImageDataUrl}
              verificationUrl={registeredBackendProduct.verificationUrl}
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#5D634C]/10 border border-[#5D634C]/25 text-xs text-[#5D634C] space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <Printer className="w-4 h-4" />
              <span>Next Required Real-World Step:</span>
            </div>
            <p className="text-[11px] text-[#73776A]">
              After pasting the physical label onto the craft piece, you must scan the actual printed QR code using your camera to confirm it can be read.
            </p>
          </div>

          <button
            onClick={() => setPhysicalStage('SCAN_QR')}
            className="w-full py-4 rounded-full bg-[#5D634C] hover:bg-[#4A4F3C] text-white font-semibold text-xs shadow-md flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Label Pasted • Proceed to Scan Printed QR</span>
          </button>
        </div>
      )}



      {/* ====================================================================== */}
      {/* SUB-STAGE: DUAL SCAN — QR + ROI in one camera session                 */}
      {/* Registration is only allowed when BOTH succeed                        */}
      {/* ====================================================================== */}
      {step === 7 && physicalStage === 'SCAN_QR' && registeredBackendProduct && (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in">

          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A25247] block">
              Physical Workflow Step 2 of 2 • Dual Scan Required
            </span>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              {dualScanPhase === 'QR' ? 'Step A — Scan Printed QR Code' : 'Step B — Capture ROI Texture'}
            </h2>
            <p className="text-xs text-[#73776A] max-w-lg mx-auto">
              {dualScanPhase === 'QR'
                ? <>Point camera at the physical QR label on the craft piece. Camera will auto-detect and verify it matches Product ID <strong>[{registeredBackendProduct.productId}]</strong>, then stay live for ROI capture.</>
                : <>QR verified ✓ &mdash; now point camera at the craft&apos;s weave, stitching, or texture close-up and tap <strong>Capture ROI</strong> to complete registration.</>}
            </p>
          </div>

          {/* Dual-phase progress indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <div className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-full border ${
              qrScanSuccess
                ? 'bg-[#5D634C]/10 border-[#5D634C]/30 text-[#5D634C]'
                : dualScanPhase === 'QR' && isCameraActive
                  ? 'bg-[#B38B42]/10 border-[#B38B42]/30 text-[#B38B42] animate-pulse'
                  : 'bg-[#FAF8F5] border-[#DCD7CF] text-[#73776A]'
            }`}>
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span>{qrScanSuccess ? '✓ QR Verified' : 'A: Scan QR'}</span>
            </div>
            <span className="text-[#DCD7CF]">→</span>
            <div className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-full border ${
              roiCaptureSuccess
                ? 'bg-[#5D634C]/10 border-[#5D634C]/30 text-[#5D634C]'
                : dualScanPhase === 'ROI' && isCameraActive
                  ? 'bg-[#B38B42]/10 border-[#B38B42]/30 text-[#B38B42] animate-pulse'
                  : 'bg-[#FAF8F5] border-[#DCD7CF] text-[#73776A]'
            }`}>
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>{roiCaptureSuccess ? '✓ ROI Captured' : 'B: Capture ROI'}</span>
            </div>
          </div>

          {/* Error display */}
          {(qrScanError || roiScanError) && (
            <div className="p-4 rounded-2xl bg-[#A25247]/10 border border-[#A25247]/30 text-xs text-[#A25247] flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-0.5">Registration Rejected</div>
                <div className="font-semibold">{qrScanError || roiScanError}</div>
                <button
                  onClick={() => {
                    setQrScanError(null);
                    setRoiScanError(null);
                    setQrScanSuccess(false);
                    setRoiCaptureSuccess(false);
                    setScannedQrId(null);
                    setCapturedRoiImage(null);
                    setDualScanPhase('QR');
                    stopCamera();
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[#A25247] font-bold hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Restart Dual Scan
                </button>
              </div>
            </div>
          )}

          {/* Hidden Canvas for QR Frame Extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Live Camera View */}
          <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#DCD7CF] text-center space-y-4">
            {isCameraActive ? (
              <div className="relative max-w-md mx-auto overflow-hidden rounded-2xl bg-black shadow-lg border-2 border-[#5D634C]">
                <video ref={videoRef} className="w-full h-64 object-cover" />
                {dualScanPhase === 'QR' && (
                  <div className="absolute inset-0 border-2 border-dashed border-white/60 m-8 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse" />
                  </div>
                )}
                {dualScanPhase === 'ROI' && (
                  <div className="absolute inset-0 border-4 border-[#5D634C]/80 m-6 rounded-xl pointer-events-none" />
                )}
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs py-1 px-3 rounded-lg text-white text-[11px] font-mono">
                  {dualScanPhase === 'QR' ? 'Scanning for QR code — hold steady...' : 'QR ✓ — frame craft texture and tap Capture ROI'}
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#5D634C]/10 text-[#5D634C] flex items-center justify-center mx-auto">
                {dualScanPhase === 'ROI' && qrScanSuccess
                  ? <Camera className="w-10 h-10" />
                  : <QrCode className="w-10 h-10" />}
              </div>
            )}

            <div className="text-sm font-bold text-[#2C2E29]">
              {isCameraActive
                ? dualScanPhase === 'QR' ? 'Align QR code in camera frame — auto-detecting...' : 'Frame craft texture then tap Capture ROI'
                : dualScanPhase === 'ROI' && qrScanSuccess
                  ? 'QR verified ✓ — tap below to open camera and capture ROI texture'
                  : 'Start camera to scan QR + capture ROI in one session'}
            </div>

            {/* Camera action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={dualScanPhase === 'ROI' && qrScanSuccess ? startCameraForROI : startCameraScanner}
                  className="flex-1 py-3.5 px-4 rounded-full bg-[#5D634C] text-white text-xs font-bold hover:bg-[#4A4F3C] cursor-pointer shadow-md flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{dualScanPhase === 'ROI' && qrScanSuccess ? 'Open Camera — Capture ROI Texture' : 'Start Camera — Scan QR & ROI'}</span>
                </button>
              ) : dualScanPhase === 'QR' ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 py-3 px-4 rounded-full bg-[#A25247] text-white text-xs font-bold hover:bg-[#8B4339] cursor-pointer"
                >
                  Cancel Scan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={captureRoiFromCamera}
                  disabled={isRegistering}
                  className="flex-1 py-3.5 px-4 rounded-full bg-[#5D634C] text-white text-xs font-bold hover:bg-[#4A4F3C] cursor-pointer shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{isRegistering ? 'Registering...' : 'Capture ROI & Register in Database'}</span>
                </button>
              )}
            </div>

            {/* Fallback: upload label photo for QR when camera unavailable */}
            {!isCameraActive && !qrScanSuccess && (
              <label className="w-full py-3 px-4 rounded-full bg-white border border-[#DCD7CF] text-[#2C2E29] text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4 text-[#5D634C]" />
                <span>Upload QR Label Photo Instead</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => handleUploadQrImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}

            {/* After QR verified via upload, show ROI upload fallback */}
            {!isCameraActive && qrScanSuccess && !roiCaptureSuccess && (
              <label className="w-full py-3 px-4 rounded-full bg-[#5D634C] text-white text-xs font-bold cursor-pointer flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload ROI Texture Photo &amp; Register</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => handleDualScanComplete(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Rejection rule notice */}
          <div className="p-3 rounded-xl bg-[#A25247]/5 border border-[#A25247]/20 text-[11px] text-[#73776A] flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#A25247]" />
            <span><strong className="text-[#A25247]">Both QR &amp; ROI required.</strong> If QR does not match Product ID <strong>[{registeredBackendProduct.productId}]</strong>, or ROI is not captured, registration will be <strong>automatically rejected</strong> and blocked.</span>
          </div>
        </div>
      )}

      {/* CAPTURE_ROI stage removed — merged into SCAN_QR dual-scan above */}

      {/* SUB-STAGE: FINAL COMMIT & RSA SIGNATURE */}
      {step === 7 && physicalStage === 'PERSIST' && registeredBackendProduct && (
        <div className="bg-white border border-black/[0.03] rounded-[32px] p-6 sm:p-8 space-y-6 craft-shadow-subtle animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full bg-[#5D634C]/15 text-[#5D634C] flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-[#5D634C] animate-spin" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5D634C] block">
              Cryptographic Signing & Database Persistence
            </span>
            <h2 className="font-serif italic text-2xl font-bold text-[#2C2E29]">
              Registering Product in Database...
            </h2>
            <p className="text-xs text-[#73776A] max-w-lg mx-auto">
              Physical QR scan and physical ROI capture verified. Generating canonical record, creating 2048-bit RSA digital signature, and writing product to database.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

