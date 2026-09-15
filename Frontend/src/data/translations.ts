import { LanguageCode } from '../types';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  navHome: string;
  navProducts: string;
  navRegister: string;
  navVerify: string;
  navProfile: string;
  navArtisans: string;
  navAlerts: string;
  navCompensation: string;
  navDisputes: string;
  navVerificationQueue: string;
  dashboard: string;
  overview: string;
  systemAudit: string;
  
  // Hero & Search
  heroTitle: string;
  heroSubtitle: string;
  verifyProductBtn: string;
  registerProductBtn: string;
  scanProductBtn: string;
  artisanLoginBtn: string;
  searchPlaceholder: string;
  
  // Trust Strip
  provenanceTitle: string;
  provenanceDesc: string;
  authenticityTitle: string;
  authenticityDesc: string;
  attributionTitle: string;
  attributionDesc: string;
  compensationTitle: string;
  compensationDesc: string;

  // Artisan Wizard
  stepBasic: string;
  stepArtisan: string;
  stepMaterials: string;
  stepTechnique: string;
  stepLocation: string;
  stepVoice: string;
  stepEvidence: string;
  stepReview: string;
  productNameLabel: string;
  craftCategoryLabel: string;
  productTypeLabel: string;
  materialsLabel: string;
  tellUsVoiceBtn: string;
  speakPreferredLanguage: string;
  weUnderstood: string;
  isThisCorrect: string;
  yesBtn: string;
  editBtn: string;
  createPassportBtn: string;
  passportCreatedTitle: string;

  // Location & Provenance
  whereWasItMade: string;
  locationSubtitle: string;
  locationConsentNote: string;
  allowLocationBtn: string;
  skipForNowBtn: string;
  useThisLocationBtn: string;
  changeLocationBtn: string;
  provenanceConfidence: string;
  whereWasMadeBuyer: string;
  approximateAreaNote: string;
  locationSupportsProvenance: string;

  // Buyer Passport Labels
  backToCatalog: string;
  share: string;
  printCertificate: string;
  verifyPhysicalItem: string;
  tamperEvidentPassport: string;
  passportId: string;
  craftHeritageProvenance: string;
  masterArtisan: string;
  clusterOrigin: string;
  cooperativeGuild: string;
  craftDuration: string;
  hoursCraftwork: string;
  fairCompensationFloor: string;
  artisanDirectPayout: string;
  trustIndexScore: string;
  verifiedFactors: string;
  viewEvidence: string;
  provenanceChainOfCustody: string;
  cryptographicallySealed: string;
  careInstructions: string;
  meetTheMaker: string;
  listenArtisanStory: string;
  
  // Buyer Verification Page
  verifyTraditionalCraft: string;
  scanQrBtn: string;
  enterProductIdPlaceholder: string;
  trustLevel: string;
  artisanStory: string;
  provenanceTimeline: string;
  physicalMatch: string;
  careForCraft: string;
  likelyMatch: string;
  
  // Statuses & Buttons
  statusVerified: string;
  statusPending: string;
  statusFlagged: string;
  statusRejected: string;
  close: string;
  cancel: string;
  confirm: string;
  submit: string;
  loading: string;

  // Scanner & Camera
  scanQrTitle?: string;
  scanQrSubtitle?: string;
  cameraViewfinderActive?: string;
  alignQrCodeFrame?: string;
  checkingPassport?: string;
  passportFoundLedger?: string;
  cryptoHashValid?: string;
  masterArtisanVerified?: string;
  coopEscrowSealed?: string;
  authenticPassportTitle?: string;
  anomalyAlertTitle?: string;
  placeQrInsideFrame?: string;
  quickDemoTestCodes?: string;
  clickToSimulate?: string;
  uploadQrImage?: string;
  supportsQrNfc?: string;
  cameraPermissionDenied?: string;
  cameraPermissionRequired?: string;
  noQrFoundInImage?: string;
  invalidQrFormat?: string;
  processingImage?: string;
  tryAnotherImage?: string;

  // Layer 1 & Physical Authentication
  cryptographicVerification?: string;
  rsaSignatureVerified?: string;
  rsaSignatureInvalid?: string;
  digitalManifestHash?: string;
  physicalAuthenticityScore?: string;
  ransacInliers?: string;
  lbpTextureSimilarity?: string;
  orbFeatureMatching?: string;
  mlAuthenticityDecision?: string;
  genuineProduct?: string;
  counterfeitDetected?: string;
  suspiciousAnomaly?: string;

  // Layer 2 Counterfeit Intelligence
  counterfeitIntelligence?: string;
  counterfeitHeatmap?: string;
  geographicClustering?: string;
  hotspots?: string;
  incidents?: string;
  riskScore?: string;
  riskLevelLow?: string;
  riskLevelMedium?: string;
  riskLevelHigh?: string;
  riskLevelCritical?: string;
  recentActivity?: string;
  duplicateDetection?: string;
  counterfeitPattern?: string;

  // Craft Video / Making Process
  showYourCraft?: string;
  showYourCraftSubtitle?: string;
  uploadMakingVideo?: string;
  recordVideo?: string;
  replaceVideo?: string;
  removeVideo?: string;
  craftInTheMaking?: string;
  watchMakingProcess?: string;
  processVideo?: string;
  processVideoVerified?: string;
  processVideoPending?: string;
  processVideoSubmitted?: string;
  processVideoRejected?: string;
  uploadFailed?: string;
  videoTooLarge?: string;
  videoTooLong?: string;
  artisanTip?: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appTitle: "Kaarigya",
    appSubtitle: "Where Craft Meets Trust",
    navHome: "Home",
    navProducts: "My Products",
    navRegister: "Register Craft",
    navVerify: "Verify Passport",
    navProfile: "Profile",
    navArtisans: "Artisans",
    navAlerts: "Counterfeit Alerts",
    navCompensation: "Fair Compensation",
    navDisputes: "Disputes",
    navVerificationQueue: "Verification Queue",
    dashboard: "Dashboard",
    overview: "Overview",
    systemAudit: "System Audit",

    heroTitle: "Know the story behind every craft.",
    heroSubtitle: "Discover where it was made, who made it, and the journey it took from artisan to you.",
    verifyProductBtn: "Verify a Product",
    registerProductBtn: "Register a Product",
    scanProductBtn: "Scan QR Code",
    artisanLoginBtn: "Artisan Login",
    searchPlaceholder: "Enter Passport ID (e.g. CRAFT-00124)...",

    provenanceTitle: "Verified Origin",
    provenanceDesc: "Know where it was made and the hands that shaped it.",
    authenticityTitle: "Authenticity Guaranteed",
    authenticityDesc: "Tamper-evident digital passport for genuine heritage crafts.",
    attributionTitle: "Direct Attribution",
    attributionDesc: "Full recognition for master artisans and traditional guilds.",
    compensationTitle: "Fair Compensation",
    compensationDesc: "Transparent compensation ensuring artisans receive their fair share.",

    stepBasic: "Basic Info",
    stepArtisan: "Artisan Profile",
    stepMaterials: "Materials & Sourcing",
    stepTechnique: "Technique & Heritage",
    stepLocation: "Creation Location",
    stepVoice: "Voice Story",
    stepEvidence: "Evidence Photos",
    stepReview: "Review & Issue",
    productNameLabel: "Product Name",
    craftCategoryLabel: "Craft Category",
    productTypeLabel: "Product Type",
    materialsLabel: "Materials Used",
    tellUsVoiceBtn: "Tell us about your product",
    speakPreferredLanguage: "Speak in your preferred language (Odia, Hindi, English)",
    weUnderstood: "We understood:",
    isThisCorrect: "Is this details correct?",
    yesBtn: "Yes, Confirm",
    editBtn: "Edit Details",
    createPassportBtn: "Create Digital Passport",
    passportCreatedTitle: "Digital Passport Created Successfully",

    whereWasItMade: "Where was this craft created?",
    locationSubtitle: "Attach genuine location metadata to strengthen provenance.",
    locationConsentNote: "We only record general craft cluster location. Your exact home address is protected.",
    allowLocationBtn: "Allow Location Access",
    skipForNowBtn: "Skip for Now",
    useThisLocationBtn: "Use This Location",
    changeLocationBtn: "Change Location",
    provenanceConfidence: "High Provenance Confidence",
    whereWasMadeBuyer: "Where was it made?",
    approximateAreaNote: "Approximate craft cluster area — exact artisan residence protected.",
    locationSupportsProvenance: "Location verifies craft origin — GPS is one of multiple trust factors.",

    backToCatalog: "Back to Catalog",
    share: "Share",
    printCertificate: "Print Certificate",
    verifyPhysicalItem: "Verify Physical Item",
    tamperEvidentPassport: "Tamper-Evident Digital Product Passport",
    passportId: "Passport ID",
    craftHeritageProvenance: "Craft Heritage & Provenance",
    masterArtisan: "Master Artisan",
    clusterOrigin: "Cluster Origin",
    cooperativeGuild: "Cooperative Guild",
    craftDuration: "Labor & Duration",
    hoursCraftwork: "Craft Hours",
    fairCompensationFloor: "Fair Wage Floor",
    artisanDirectPayout: "Artisan Direct Payout",
    trustIndexScore: "Trust Index Score",
    verifiedFactors: "Verified Trust Factors",
    viewEvidence: "View Evidence Photos",
    provenanceChainOfCustody: "Provenance & Chain of Custody",
    cryptographicallySealed: "Cryptographically Sealed",
    careInstructions: "Care & Preservation Instructions",
    meetTheMaker: "Meet The Maker",
    listenArtisanStory: "Listen to Artisan's Story",

    verifyTraditionalCraft: "Verify Traditional Craft Passport",
    scanQrBtn: "Scan QR Code",
    enterProductIdPlaceholder: "e.g. CRAFT-00124",
    trustLevel: "Trust Level",
    artisanStory: "The Artisan's Story",
    provenanceTimeline: "Provenance Timeline",
    physicalMatch: "Physical Evidence Inspection",
    careForCraft: "Care & Maintenance",
    likelyMatch: "Likely Match",

    statusVerified: "Verified Authentic",
    statusPending: "Pending Verification",
    statusFlagged: "Counterfeit Alert",
    statusRejected: "Rejected",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    submit: "Submit",
    loading: "Loading...",

    // Scanner & Camera
    scanQrTitle: "Scan Product Tag / QR",
    scanQrSubtitle: "Instant authenticity & provenance lookup",
    cameraViewfinderActive: "Camera viewfinder active",
    alignQrCodeFrame: "Align QR code or NFC tag within frame",
    checkingPassport: "Checking Passport",
    passportFoundLedger: "Passport Found on Ledger",
    cryptoHashValid: "Cryptographic Hash Valid",
    masterArtisanVerified: "Master Artisan Verified",
    coopEscrowSealed: "Cooperative Escrow Sealed",
    authenticPassportTitle: "Authentic Product Passport",
    anomalyAlertTitle: "Anomaly Alert Detected",
    placeQrInsideFrame: "Place the QR code inside the frame.",
    quickDemoTestCodes: "Quick Demo Test Codes:",
    clickToSimulate: "click to simulate",
    uploadQrImage: "Upload QR Image",
    supportsQrNfc: "Supports QR & NFC-UID",
    cameraPermissionDenied: "Camera permission denied or camera unavailable",
    cameraPermissionRequired: "Camera permission required for live scanning",
    noQrFoundInImage: "No valid QR code detected in the uploaded image. Please try another file.",
    invalidQrFormat: "Invalid QR Code payload format.",
    processingImage: "Processing QR Code...",
    tryAnotherImage: "Try Another Image",

    // Layer 1 & Physical Authentication
    cryptographicVerification: "Cryptographic & RSA Manifest Verification",
    rsaSignatureVerified: "RSA-2048 Digital Signature Verified",
    rsaSignatureInvalid: "RSA Signature Invalid or Missing",
    digitalManifestHash: "Digital Manifest Hash",
    physicalAuthenticityScore: "Physical Authenticity Score",
    ransacInliers: "RANSAC Homography Inliers",
    lbpTextureSimilarity: "LBP Texture Vector Match",
    orbFeatureMatching: "ORB / AKAZE Feature Matching",
    mlAuthenticityDecision: "ML Authenticity Classifier Result",
    genuineProduct: "Genuine Authentic Craft",
    counterfeitDetected: "Counterfeit Replica Flagged",
    suspiciousAnomaly: "Suspicious Anomaly Detected",

    // Layer 2 Counterfeit Intelligence
    counterfeitIntelligence: "Counterfeit Intelligence & Incident Monitoring",
    counterfeitHeatmap: "Geographic Counterfeit Heatmap",
    geographicClustering: "Geographic Risk Clustering",
    hotspots: "Active Fraud Hotspots",
    incidents: "Incidents Registered",
    riskScore: "Cluster Risk Score",
    riskLevelLow: "Low Risk",
    riskLevelMedium: "Moderate Risk",
    riskLevelHigh: "High Risk",
    riskLevelCritical: "Critical Risk",
    recentActivity: "Recent Fraud Intelligence Activity",
    duplicateDetection: "Passport Reuse & Duplicate Detection",
    counterfeitPattern: "Visual Pattern Cluster Analysis",

    showYourCraft: "Show Your Craft",
    showYourCraftSubtitle: "Upload a short video showing how you create this product.",
    uploadMakingVideo: "Upload Making Video",
    recordVideo: "Record Video",
    replaceVideo: "Replace Video",
    removeVideo: "Remove Video",
    craftInTheMaking: "CRAFT IN THE MAKING",
    watchMakingProcess: "Watch the artisan create this piece using traditional techniques.",
    processVideo: "Process Video",
    processVideoVerified: "Process Video: Verified",
    processVideoPending: "Process Video: Pending Review",
    processVideoSubmitted: "Process Video: Submitted",
    processVideoRejected: "Process Video: Rejected",
    uploadFailed: "Upload failed. Please try again.",
    videoTooLarge: "Video is too large. Please upload a video under 50 MB.",
    videoTooLong: "Please upload a video under 60 seconds.",
    artisanTip: "Tip: Show your hands, tools, materials, or the making process."
  },

  hi: {
    appTitle: "कारिग्या",
    appSubtitle: "जहाँ कला से मिलता है विश्वास",
    navHome: "होम",
    navProducts: "मेरे उत्पाद",
    navRegister: "उत्पाद पंजीकृत करें",
    navVerify: "पासपोर्ट जांचें",
    navProfile: "प्रोफ़ाइल",
    navArtisans: "कारीगर",
    navAlerts: "नकली अलर्ट",
    navCompensation: "उचित पारिश्रमिक",
    navDisputes: "विवाद",
    navVerificationQueue: "सत्यापन कतार",
    dashboard: "डैशबोर्ड",
    overview: "अवलोकन",
    systemAudit: "सिस्टम ऑडिट",

    heroTitle: "हर हस्तशिल्प के पीछे की असली कहानी जानें।",
    heroSubtitle: "जानें यह कहाँ बना, किसने बनाया, और कारीगर से आप तक पहुँचने की पूरी यात्रा।",
    verifyProductBtn: "उत्पाद सत्यापित करें",
    registerProductBtn: "उत्पाद पंजीकृत करें",
    scanProductBtn: "क्यूआर स्कैन करें",
    artisanLoginBtn: "कारीगर लॉगिन",
    searchPlaceholder: "पासपोर्ट आईडी दर्ज करें (जैसे CRAFT-00124)...",

    provenanceTitle: "प्रमाणित उत्पत्ति",
    provenanceDesc: "जानें यह कहाँ बना और किन हाथों ने इसे गढ़ा।",
    authenticityTitle: "असली गुणवत्ता की गारंटी",
    authenticityDesc: "पारंपरिक हस्तशिल्प के लिए सुरक्षित डिजिटल पासपोर्ट।",
    attributionTitle: "कारीगर को सीधा सम्मान",
    attributionDesc: "मास्टर कारीगरों और पारंपरिक समितियों को पूर्ण पहचान।",
    compensationTitle: "उचित पारिश्रमिक",
    compensationDesc: "पारदर्शी पारिश्रमिक सुनिश्चित करता है कि कारीगरों को उनका सही हिस्सा मिले।",

    stepBasic: "मूल जानकारी",
    stepArtisan: "कारीगर प्रोफ़ाइल",
    stepMaterials: "सामग्री और स्रोत",
    stepTechnique: "तकनीक और विरासत",
    stepLocation: "निर्माण स्थान",
    stepVoice: "आवाज़ की कहानी",
    stepEvidence: "प्रमाण तस्वीरें",
    stepReview: "समीक्षा और जारी करें",
    productNameLabel: "उत्पाद का नाम",
    craftCategoryLabel: "शिल्प श्रेणी",
    productTypeLabel: "उत्पाद का प्रकार",
    materialsLabel: "उपयोग की गई सामग्री",
    tellUsVoiceBtn: "अपने उत्पाद के बारे में बताएं",
    speakPreferredLanguage: "अपनी पसंदीदा भाषा (ओडिया, हिंदी, अंग्रेजी) में बोलें",
    weUnderstood: "हम समझे:",
    isThisCorrect: "क्या यह जानकारी सही है?",
    yesBtn: "हाँ, पुष्टि करें",
    editBtn: "संपादन करें",
    createPassportBtn: "डिजिटल पासपोर्ट बनाएं",
    passportCreatedTitle: "डिजिटल पासपोर्ट सफलतापूर्वक बनाया गया",

    whereWasItMade: "यह हस्तशिल्प कहाँ बनाया गया था?",
    locationSubtitle: "उत्पत्ति की प्रामाणिकता को मजबूत करने के लिए स्थान विवरण जोड़ें।",
    locationConsentNote: "हम केवल सामान्य शिल्प क्लस्टर स्थान दर्ज करते हैं। आपका सटीक घर का पता सुरक्षित है।",
    allowLocationBtn: "स्थान अनुमति दें",
    skipForNowBtn: "अभी छोड़ें",
    useThisLocationBtn: "इस स्थान का उपयोग करें",
    changeLocationBtn: "स्थान बदलें",
    provenanceConfidence: "उच्च उत्पत्ति विश्वास",
    whereWasMadeBuyer: "यह कहाँ बना था?",
    approximateAreaNote: "अनुमानित शिल्प क्लस्टर क्षेत्र — सटीक कारीगर निवास सुरक्षित।",
    locationSupportsProvenance: "स्थान उत्पत्ति की पुष्टि करता है — जीपीएस कई विश्वास कारकों में से एक है।",

    backToCatalog: "कैटलॉग पर वापस जाएं",
    share: "शेयर करें",
    printCertificate: "प्रमाणपत्र प्रिंट करें",
    verifyPhysicalItem: "भौतिक वस्तु जांचें",
    tamperEvidentPassport: "सुरक्षित डिजिटल उत्पाद पासपोर्ट",
    passportId: "पासपोर्ट आईडी",
    craftHeritageProvenance: "शिल्प विरासत और उत्पत्ति",
    masterArtisan: "मुख्य कारीगर",
    clusterOrigin: "क्लस्टर उत्पत्ति",
    cooperativeGuild: "सहकारी समिति",
    craftDuration: "श्रम और अवधि",
    hoursCraftwork: "शिल्प घंटे",
    fairCompensationFloor: "न्यूनतम पारिश्रमिक",
    artisanDirectPayout: "कारीगर प्रत्यक्ष भुगतान",
    trustIndexScore: "विश्वास सूचकांक स्कोर",
    verifiedFactors: "सत्यापित विश्वास कारक",
    viewEvidence: "प्रमाण तस्वीरें देखें",
    provenanceChainOfCustody: "उत्पत्ति और स्वामित्व रिकॉर्ड",
    cryptographicallySealed: "डिजिटल रूप से सीलबंद",
    careInstructions: "रखरखाव निर्देश",
    meetTheMaker: "कारीगर से मिलें",
    listenArtisanStory: "कारीगर की कहानी सुनें",

    verifyTraditionalCraft: "पारंपरिक शिल्प पासपोर्ट जांचें",
    scanQrBtn: "क्यूआर कोड स्कैन करें",
    enterProductIdPlaceholder: "उदा. CRAFT-00124",
    trustLevel: "विश्वास स्तर",
    artisanStory: "कारीगर की कहानी",
    provenanceTimeline: "उत्पत्ति समयरेखा",
    physicalMatch: "भौतिक प्रमाण निरीक्षण",
    careForCraft: "देखभाल और रखरखाव",
    likelyMatch: "संभावित मिलान",

    statusVerified: "सत्यापित असली",
    statusPending: "सत्यापन लंबित",
    statusFlagged: "नकली अलर्ट",
    statusRejected: "अस्वीकृत",
    close: "बंद करें",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    submit: "जमा करें",
    loading: "लोड हो रहा है..."
  },

  or: {
    appTitle: "କାରିଗ୍ୟା",
    appSubtitle: "ଯେଉଁଠି କଳା ସହ ଯୋଡ଼ିହୁଏ ବିଶ୍ୱାସ",
    navHome: "ମୁଖ୍ୟ ପୃଷ୍ଠା",
    navProducts: "ମୋର ଉତ୍ପାଦ",
    navRegister: "ଉତ୍ପାଦ ପଞ୍ଜୀକରଣ",
    navVerify: "ପାସପୋର୍ଟ ଯାଞ୍ଚ",
    navProfile: "ପ୍ରୋଫାଇଲ୍",
    navArtisans: "କାରିଗର",
    navAlerts: "ନକଲି ବାର୍ତ୍ତା",
    navCompensation: "ନ୍ୟାଯ୍ୟ ମୂଲ୍ୟ",
    navDisputes: "ସମାଧାନ",
    navVerificationQueue: "ଯାଞ୍ଚ ତାଲିକା",
    dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    overview: "ଆକଳନ",
    systemAudit: "ସିଷ୍ଟମ ସମୀକ୍ଷା",

    heroTitle: "ପ୍ରତ୍ୟେକ ହସ୍ତଶିଳ୍ପ ପଛର ପ୍ରକୃତ କାହାଣୀ ଜାଣନ୍ତୁ।",
    heroSubtitle: "ଶିଳ୍ପୀଙ୍କ ହାତରୁ ଗ୍ରାହକଙ୍କ ପାଖ ଯାଏଁ — ସବୁ କଳାକୃତିକୁ ଦିଅନ୍ତୁ ଏକ ବିଶ୍ୱସ୍ତ ଡିଜିଟାଲ୍ ପରିଚୟ।",
    verifyProductBtn: "ଉତ୍ପାଦ ଯାଞ୍ଚ କରନ୍ତୁ",
    registerProductBtn: "ନୂଆ ଉତ୍ପାଦ ପଞ୍ଜୀକରଣ",
    scanProductBtn: "QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ",
    artisanLoginBtn: "କାରିଗର ଲଗଇନ୍",
    searchPlaceholder: "ପାସପୋର୍ଟ ନମ୍ବର ଲେଖନ୍ତୁ (ଯଥା: CRAFT-00124)...",

    provenanceTitle: "ଉତ୍ପତ୍ତି ସ୍ଥଳ",
    provenanceDesc: "ଜାଣନ୍ତୁ ଏହା କେଉଁଠାରୁ ଆସିଛି ଏବଂ କିଏ ତିଆରି କରିଛନ୍ତି।",
    authenticityTitle: "ପ୍ରକୃତ ପ୍ରମାଣିକତା",
    authenticityDesc: "ଟ୍ୟାମ୍ପର-ମୁକ୍ତ ଡିଜିଟାଲ୍ ପରିଚୟ ପତ୍ର ଯାଞ୍ଚ କରନ୍ତୁ।",
    attributionTitle: "କାରିଗରଙ୍କ ସମ୍ମାନ",
    attributionDesc: "ପ୍ରକୃତ ଶିଳ୍ପୀଙ୍କୁ ତାଙ୍କର ଯୋଗ୍ୟତା ଓ ସ୍ୱୀକୃତି ପ୍ରଦାନ।",
    compensationTitle: "ଉପଯୁକ୍ତ ପାରିଶ୍ରମିକ",
    compensationDesc: "ଶିଳ୍ପୀଙ୍କୁ ସିଧାସଳଖ ଉପଯୁକ୍ତ ମୂଲ୍ୟ ମିଳିବା ନିଶ୍ଚିତ କରନ୍ତୁ।",

    stepBasic: "ପ୍ରାଥମିକ ସୂଚନା",
    stepArtisan: "କାରିଗର ସୂଚନା",
    stepMaterials: "ଉପାଦାନ",
    stepTechnique: "ପାରମ୍ପରିକ ଶୈଳୀ",
    stepLocation: "ତିଆରି ସ୍ଥାନ",
    stepVoice: "ସ୍ୱର ବାର୍ତ୍ତା (Voice Story)",
    stepEvidence: "ପ୍ରମାଣ ଫଟୋ",
    stepReview: "ପାସପୋର୍ଟ ସମୀକ୍ଷା",
    productNameLabel: "ସାମଗ୍ରୀର ନାମ",
    craftCategoryLabel: "କଳା ଶ୍ରେଣୀ",
    productTypeLabel: "ଉତ୍ପାଦର ପ୍ରକାର",
    materialsLabel: "ବ୍ୟବହୃତ ସାମଗ୍ରୀ ବାଛନ୍ତୁ",
    tellUsVoiceBtn: "ନିଜ ସାମଗ୍ରୀ ବିଷୟରେ କୁହନ୍ତୁ",
    speakPreferredLanguage: "ଆପଣ ନିଜ ମାତୃଭାଷା (ଓଡ଼ିଆ, ହିନ୍ଦୀ ବା ଇଂରାଜୀ) ରେ କହିପାରିବେ",
    weUnderstood: "ଆମେ ଏହା ବୁଝିପାରିଲୁ:",
    isThisCorrect: "ଏହି ସୂଚନା ଠିକ୍ ଅଛି ତ?",
    yesBtn: "ହଁ, ନିଶ୍ଚିତ କରନ୍ତୁ",
    editBtn: "ବଦଳାନ୍ତୁ",
    createPassportBtn: "ଡିଜିଟାଲ୍ ପାସପୋର୍ଟ ତିଆରି କରନ୍ତୁ",
    passportCreatedTitle: "ଉତ୍ପାଦ ପାସପୋର୍ଟ ସଫଳତାର ସହ ପ୍ରସ୍ତୁତ ହୋଇଛି",

    whereWasItMade: "ଏହି ସାମଗ୍ରୀ କେଉଁଠାରେ ତିଆରି ହୋଇଥିଲା?",
    locationSubtitle: "ଉତ୍ପାଦର ଉତ୍ପତ୍ତି ସ୍ଥାନ ଯୋଡି ଏହାର ପ୍ରାମାଣିକତା ବଢାନ୍ତୁ।",
    locationConsentNote: "ଆମେ କେବଳ ଉତ୍ପାଦର ଉତ୍ପତ୍ତି ରେକର୍ଡ କରିବା ପାଇଁ ଆପଣଙ୍କ ଅବସ୍ଥାନ ବ୍ୟବହାର କରୁ। ଆପଣଙ୍କ ଘରର ପ୍ରକୃତ ଠିକଣା ସାର୍ବଜନୀନ ହେବ ନାହିଁ।",
    allowLocationBtn: "ସ୍ଥାନ ଅନୁମତି ଦିଅନ୍ତୁ",
    skipForNowBtn: "ବର୍ତ୍ତମାନ ଛାଡନ୍ତୁ",
    useThisLocationBtn: "ଏହି ସ୍ଥାନ ବ୍ୟବହାର କରନ୍ତୁ",
    changeLocationBtn: "ସ୍ଥାନ ବଦଳାନ୍ତୁ",
    provenanceConfidence: "ଦୃଢ଼ ଉତ୍ପତ୍ତି ପ୍ରମାଣ (Strong Provenance)",
    whereWasMadeBuyer: "ଏହା କେଉଁଠାରେ ତିଆରି ହୋଇଥିଲା?",
    approximateAreaNote: "ଆନୁମାନିକ ହସ୍ତଶିଳ୍ପ କ୍ଲଷ୍ଟର ଅଞ୍ଚଳ — ଶିଳ୍ପୀଙ୍କ ନିଜସ୍ୱ ଠିକଣା ସୁରକ୍ଷିତ।",
    locationSupportsProvenance: "ସ୍ଥାନ ଉତ୍ପାଦର ଉତ୍ପତ୍ତିକୁ ସମର୍ଥନ କରେ — କେବଳ GPS ଏକମାତ୍ର ପ୍ରମାଣ ନୁହେଁ।",

    backToCatalog: "କ୍ୟାଟାଲଗ୍‌କୁ ଫେରନ୍ତୁ",
    share: "ସେୟାର କରନ୍ତୁ",
    printCertificate: "ପ୍ରମାଣପତ୍ର ପ୍ରିଣ୍ଟ କରନ୍ତୁ",
    verifyPhysicalItem: "ଭୌତିକ ସାମଗ୍ରୀ ଯାଞ୍ଚ",
    tamperEvidentPassport: "ସୁରକ୍ଷିତ ଡିଜିଟାଲ୍ ଉତ୍ପାଦ ପାସପୋର୍ଟ",
    passportId: "ପାସପୋର୍ଟ ନମ୍ବର",
    craftHeritageProvenance: "ଐତିହ୍ୟ ଓ ଉତ୍ପତ୍ତି ବିବରଣୀ",
    masterArtisan: "ମୁଖ୍ୟ କାରିଗର",
    clusterOrigin: "ଉତ୍ପାଦନ କ୍ଲଷ୍ଟର",
    cooperativeGuild: "ସମବାୟ ସମିତି",
    craftDuration: "ଶ୍ରମ ଏବଂ ସମୟ",
    hoursCraftwork: "ଘଣ୍ଟାର ହାତକାମ",
    fairCompensationFloor: "ନ୍ୟାଯ୍ୟ ପାରିଶ୍ରମିକ",
    artisanDirectPayout: "କାରିଗର ପ୍ରତ୍ୟକ୍ଷ ପ୍ରାପ୍ୟ",
    trustIndexScore: "ବିଶ୍ୱାସ ସୂଚକାଙ୍କ (Trust Index)",
    verifiedFactors: "ପ୍ରମାଣିତ କାରକସମୂହ",
    viewEvidence: "ପ୍ରମାଣ ଫଟୋ ସମୀକ୍ଷା",
    provenanceChainOfCustody: "ଉତ୍ପତ୍ତି ଓ ମାଲିକାନା ରେକର୍ଡ",
    cryptographicallySealed: "ଡିଜିଟାଲ୍ ସିଲ୍‌ପ୍ରାପ୍ତ",
    careInstructions: "ଯତ୍ନ ନେବା ନିର୍ଦ୍ଦେଶାବଳୀ",
    meetTheMaker: "ଶିଳ୍ପୀଙ୍କୁ ଜାଣନ୍ତୁ",
    listenArtisanStory: "କାରିଗରଙ୍କ କାହାଣୀ ଶୁଣନ୍ତୁ",

    verifyTraditionalCraft: "ପାରମ୍ପରିକ ହସ୍ତଶିଳ୍ପ ଯାଞ୍ଚ କରନ୍ତୁ",
    scanQrBtn: "QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ",
    enterProductIdPlaceholder: "ଯଥା: CRAFT-00124",
    trustLevel: "ବିଶ୍ୱାସ ସ୍ତର",
    artisanStory: "କାରିଗରଙ୍କ କାହାଣୀ",
    provenanceTimeline: "ଉତ୍ପତ୍ତି ସମୟରେଖା",
    physicalMatch: "ଭୌତିକ ସାମଗ୍ରୀ ମେଳାଣ",
    careForCraft: "ଯତ୍ନ ନେବା ପାଇଁ ନିର୍ଦ୍ଦେଶାବଳୀ",
    likelyMatch: "ସଠିକ୍ ମେଳ (Likely Match)",

    statusVerified: "ପ୍ରମାଣିତ ଅସଲି",
    statusPending: "ଯାଞ୍ଚ ଅପେକ୍ଷାରେ",
    statusFlagged: "ନକଲି ଚେତାବନୀ",
    statusRejected: "ନାକଚ",
    close: "ବନ୍ଦ କରନ୍ତୁ",
    cancel: "ବାତିଲ୍",
    confirm: "ନିଶ୍ଚିତ କରନ୍ତୁ",
    submit: "ଦାଖଲ କରନ୍ତୁ",
    loading: "ଲୋଡ୍ ହେଉଛି..."
  },

  bn: {
    appTitle: "কারিজ্ঞা",
    appSubtitle: "যেখানে কারুশিল্পের সাথে বিশ্বাসের মিলন",
    navHome: "হোম",
    navProducts: "আমার পণ্যসমূহ",
    navRegister: "পণ্য নিবন্ধন করুন",
    navVerify: "পাসপোর্ট যাচাই করুন",
    navProfile: "প্রোফাইল",
    navArtisans: "শিল্পীগণ",
    navAlerts: "জালিয়াতি সতর্কতা",
    navCompensation: "ন্যায্য পারিশ্রমিক",
    navDisputes: "বিরোধ নিষ্পত্তি",
    navVerificationQueue: "যাচাইকরণ সারি",
    dashboard: "ড্যাশবোর্ড",
    overview: "সংক্ষিপ্ত বিবরণ",
    systemAudit: "সিস্টেম অডিট",

    heroTitle: "প্রতিটি হস্তশিল্পের পেছনের সত্য গল্প জানুন।",
    heroSubtitle: "জানুন এটি কোথায় তৈরি, কে তৈরি করেছেন এবং শিল্পী থেকে আপনার হাতে পৌঁছানোর যাত্রা।",
    verifyProductBtn: "পণ্য যাচাই করুন",
    registerProductBtn: "পণ্য নিবন্ধন করুন",
    scanProductBtn: "QR স্ক্যান করুন",
    artisanLoginBtn: "শিল্পী লগইন",
    searchPlaceholder: "পাসপোর্ট আইডি লিখুন (যেমন CRAFT-00124)...",

    provenanceTitle: "প্রমাণিত উৎস",
    provenanceDesc: "জানুন কোথায় তৈরি এবং কাদের হাতে এটি রূপ পেয়েছে।",
    authenticityTitle: "খাঁটি গুণমানের নিশ্চয়তা",
    authenticityDesc: "ঐতিহ্যবাহী হস্তশিল্পের জন্য নিরাপদ ডিজিটাল পাসপোর্ট।",
    attributionTitle: "শিল্পীর স্বীকৃতি",
    attributionDesc: "মাস্টার শিল্পী এবং সমবায় সমিতিকে পূর্ণ সম্মান।",
    compensationTitle: "ন্যায্য পারিশ্রমিক",
    compensationDesc: "স্বচ্ছ পারিশ্রমিক যা নিশ্চিত করে শিল্পীর ন্যায্য পাওনা।",

    stepBasic: "প্রাথমিক তথ্য",
    stepArtisan: "শিল্পী প্রোফাইল",
    stepMaterials: "উপাদান",
    stepTechnique: "ঐতিহ্যবাহী কৌশল",
    stepLocation: "তৈরির স্থান",
    stepVoice: "ভয়েস বার্তা",
    stepEvidence: "প্রমাণ ছবি",
    stepReview: "পর্যালোচনা ও প্রকাশ",
    productNameLabel: "পণ্যের নাম",
    craftCategoryLabel: "শিল্প বিভাগ",
    productTypeLabel: "পণ্যের প্রকার",
    materialsLabel: "ব্যবহৃত উপাদান",
    tellUsVoiceBtn: "পণ্য সম্পর্কে বলুন",
    speakPreferredLanguage: "আপনার মাতৃভাষায় কথা বলুন",
    weUnderstood: "আমরা বুঝেছি:",
    isThisCorrect: "তথ্য সঠিক কি?",
    yesBtn: "হ্যাঁ, নিশ্চিত করুন",
    editBtn: "সম্পাদনা করুন",
    createPassportBtn: "ডিজিটাল পাসপোর্ট তৈরি করুন",
    passportCreatedTitle: "পাসপোর্ট সফলভাবে তৈরি হয়েছে",

    whereWasItMade: "এই শিল্পকর্মটি কোথায় তৈরি হয়েছিল?",
    locationSubtitle: "উৎসের প্রামাণিকতা নিশ্চিত করতে স্থান যুক্ত করুন।",
    locationConsentNote: "আমরা কেবল সাধারণ ক্লাস্টার স্থান রেকর্ড করি। ব্যক্তিগত ঠিকানা সুরক্ষিত।",
    allowLocationBtn: "অবস্থান অনুমতি দিন",
    skipForNowBtn: "এখনই নয়",
    useThisLocationBtn: "এই অবস্থান ব্যবহার করুন",
    changeLocationBtn: "অবস্থান পরিবর্তন করুন",
    provenanceConfidence: "উচ্চ প্রামাণিকতা স্তর",
    whereWasMadeBuyer: "কোথায় তৈরি হয়েছিল?",
    approximateAreaNote: "আনুমানিক ক্লাস্টার অঞ্চল — শিল্পীর ব্যক্তিগত ঠিকানা সুরক্ষিত।",
    locationSupportsProvenance: "অবস্থান পণ্য উৎস নিশ্চিত করে।",

    backToCatalog: "ক্যাটালগে ফিরে যান",
    share: "শেয়ার করুন",
    printCertificate: "সনদ প্রিন্ট করুন",
    verifyPhysicalItem: "শারীরিক বস্তু পরীক্ষা",
    tamperEvidentPassport: "সুরক্ষিত ডিজিটাল পণ্য পাসপোর্ট",
    passportId: "পাসপোর্ট নম্বর",
    craftHeritageProvenance: "ঐতিহ্য ও বিবরণ",
    masterArtisan: "প্রধান শিল্পী",
    clusterOrigin: "উৎপাদন কেন্দ্র",
    cooperativeGuild: "সমবায় সমিতি",
    craftDuration: "শ্রম ও সময়",
    hoursCraftwork: "ঘণ্টার কাজ",
    fairCompensationFloor: "ন্যায্য পারিশ্রমিক",
    artisanDirectPayout: "শিল্পীর সরাসরি প্রাপ্য",
    trustIndexScore: "বিশ্বাস সূচক স্কোয়ার",
    verifiedFactors: "প্রমাণিত বিষয়সমূহ",
    viewEvidence: "প্রমাণ ছবি দেখুন",
    provenanceChainOfCustody: "উৎস ও মালিকানা রেকর্ড",
    cryptographicallySealed: "ডিজিটালভাবে সিল করা",
    careInstructions: "যত্ন নেওয়ার নির্দেশাবলী",
    meetTheMaker: "শিল্পীকে জানুন",
    listenArtisanStory: "শিল্পীর গল্প শুনুন",

    verifyTraditionalCraft: "ঐতিহ্যবাহী হস্তশিল্প পাসপোর্ট যাচাই করুন",
    scanQrBtn: "QR কোড স্ক্যান করুন",
    enterProductIdPlaceholder: "যেমন CRAFT-00124",
    trustLevel: "বিশ্বাস স্তর",
    artisanStory: "শিল্পীর জীবনগাথা",
    provenanceTimeline: "উৎপত্তি সময়রেখা",
    physicalMatch: "শারীরিক প্রমাণ পরীক্ষা",
    careForCraft: "যত্ন ও রক্ষণাবেক্ষণ",
    likelyMatch: "সঠিক মেল",

    statusVerified: "প্রমাণিত খাঁটি",
    statusPending: "যাচাইকরণ অপেক্ষমাণ",
    statusFlagged: "জালিয়াতি সতর্কতা",
    statusRejected: "বাতিল",
    close: "বন্ধ করুন",
    cancel: "বাতিল",
    confirm: "নিশ্চিত করুন",
    submit: "জমা দিন",
    loading: "লোড হচ্ছে..."
  },

  ta: {
    appTitle: "காரிக்யா",
    appSubtitle: "கைவினை நம்பிக்கையை சந்திக்கும் இடம்",
    navHome: "முகப்பு",
    navProducts: "என் பொருட்கள்",
    navRegister: "கைவினை பதிவு",
    navVerify: "கடவுச்சீட்டு சரிபார்ப்பு",
    navProfile: "சுயவிவரம்",
    navArtisans: "கைவினைஞர்கள்",
    navAlerts: "போலி எச்சரிக்கைகள்",
    navCompensation: "நியாயமான ஊதியம்",
    navDisputes: "தகராறு தீர்வு",
    navVerificationQueue: "சரிபார்ப்பு வரிசை",
    dashboard: "டாஷ்போர்டு",
    overview: "மேலோட்டம்",
    systemAudit: "அமைப்பு தணிக்கை",

    heroTitle: "ஒவ்வொரு கைவினைப் பொருளின் பின்னணியையும் அறியவும்.",
    heroSubtitle: "எங்கு செய்யப்பட்டது, யார் செய்தார், உங்களை அடைந்த பயணம் பற்றிய விவரங்கள்.",
    verifyProductBtn: "பொருளை சரிபார்க்கவும்",
    registerProductBtn: "பொருளை பதிவு செய்யவும்",
    scanProductBtn: "QR ஸ்கேன் செய்யவா",
    artisanLoginBtn: "கைவினைஞர் உள்நுழைவு",
    searchPlaceholder: "பாஸ்போர்ட் ஐடியை உள்ளிடவும்...",

    provenanceTitle: "உறுதிசெய்யப்பட்ட தோற்றம்",
    provenanceDesc: "எங்கு உருவாக்கப்பட்டது மற்றும் உருவாக்கிய கைவினைஞர்களை அறியவும்.",
    authenticityTitle: "உண்மைத் தன்மை உறுதிப்பாடு",
    authenticityDesc: "பாரம்பரிய கைவினைப்பொருட்களுக்கான டிஜிட்டல் பாஸ்போர்ட்.",
    attributionTitle: "கைவினைஞரின் அங்கீகாரம்",
    attributionDesc: "பாரம்பரிய கலைஞர்களுக்கான முழுமையான அங்கீகாரம்.",
    compensationTitle: "நியாயமான ஊதியம்",
    compensationDesc: "கைவினைஞர்களுக்கு நியாயமான பங்கு கிடைப்பதை உறுதிசெய்கிறது.",

    stepBasic: "அடிப்படை தகவல்",
    stepArtisan: "கைவினைஞர் சுயவிவரம்",
    stepMaterials: "மூலப்பொருட்கள்",
    stepTechnique: "பாரம்பரிய நுட்பம்",
    stepLocation: "உருவாக்கிய இடம்",
    stepVoice: "குரல் கதை",
    stepEvidence: "ஆதார புகைப்படங்கள்",
    stepReview: "மதிப்பாய்வு செய்து வெளியிடு",
    productNameLabel: "பொருளின் பெயர்",
    craftCategoryLabel: "கைவினை வகை",
    productTypeLabel: "பொருள் வகை",
    materialsLabel: "பயன்படுத்தப்பட்ட பொருட்கள்",
    tellUsVoiceBtn: "உங்கள் பொருளைப் பற்றி கூறுங்கள்",
    speakPreferredLanguage: "உங்கள் தாய்மொழியில் பேசுங்கள்",
    weUnderstood: "நாங்கள் புரிந்துகொண்டோம்:",
    isThisCorrect: "இந்த விவரங்கள் சரியானவையா?",
    yesBtn: "ஆம், உறுதிப்படுத்து",
    editBtn: "திருத்து",
    createPassportBtn: "டிஜிட்டல் பாஸ்போர்ட் உருவாக்கு",
    passportCreatedTitle: "பாஸ்போர்ட் வெற்றிகரமாக உருவாக்கப்பட்டது",

    whereWasItMade: "இந்த கைவினைப் பொருள் எங்கு செய்யப்பட்டது?",
    locationSubtitle: "உண்மைத் தன்மையை உறுதிப்படுத்த இருப்பிடத்தைச் சேர்க்கவும்.",
    locationConsentNote: "பொதுவான கைவினை மையத்தின் இடத்தை மட்டுமே பதிவு செய்கிறோம்.",
    allowLocationBtn: "இருப்பிட அனுமதி அளிக்கவும்",
    skipForNowBtn: "இப்போது தவிர்க்கவும்",
    useThisLocationBtn: "இந்த இடத்தைப் பயன்படுத்தவும்",
    changeLocationBtn: "இடத்தை மாற்றவும்",
    provenanceConfidence: "உயர் நம்பிக்கை நிலை",
    whereWasMadeBuyer: "எங்கு செய்யப்பட்டது?",
    approximateAreaNote: "தோராயமான பகுதி — கைவினைஞரின் வீட்டு முகவரி பாதுகாப்பானது.",
    locationSupportsProvenance: "இடம் பொருளின் தோற்றத்தை உறுதிப்படுத்துகிறது.",

    backToCatalog: "பட்டியலுக்குத் திரும்பு",
    share: "பகிர்",
    printCertificate: "சான்றிதழ் அச்சிடு",
    verifyPhysicalItem: "நேரடி பொருளை சரிபார்",
    tamperEvidentPassport: "பாதுகாப்பான டிஜிட்டல் பாஸ்போர்ட்",
    passportId: "பாஸ்போர்ட் எண்",
    craftHeritageProvenance: "கைவினை பாரம்பரியம் & வரலாறு",
    masterArtisan: "முக்கிய கைவினைஞர்",
    clusterOrigin: "உற்பத்தி மையம்",
    cooperativeGuild: "கூட்டுறவு சங்கம்",
    craftDuration: "உழைப்பு மற்றும் நேரம்",
    hoursCraftwork: "மணிநேர கைவேலை",
    fairCompensationFloor: "நியாயமான குறைந்தபட்ச கூலி",
    artisanDirectPayout: "நேரடி கைவினைஞர் கூலி",
    trustIndexScore: "நம்பிக்கை குறியீட்டு மதிப்பெண்",
    verifiedFactors: "சரிபார்க்கப்பட்ட காரணிகள்",
    viewEvidence: "ஆதார புகைப்படங்களை காண்",
    provenanceChainOfCustody: "தோற்றம் மற்றும் உரிமை பதிவு",
    cryptographicallySealed: "டிஜிட்டல் முத்திரையிடப்பட்டது",
    careInstructions: "பராமரிப்பு அறிவுறுத்தல்கள்",
    meetTheMaker: "கலைஞரை சந்தியுங்கள்",
    listenArtisanStory: "கலைஞரின் கதையைக் கேளுங்கள்",

    verifyTraditionalCraft: "பாரம்பரிய கைவினை பாஸ்போர்ட் சரிபார்க்கவும்",
    scanQrBtn: "QR குறியீட்டை ஸ்கேன் செய்",
    enterProductIdPlaceholder: "எ.கா. CRAFT-00124",
    trustLevel: "நம்பிக்கை நிலை",
    artisanStory: "கைவினைஞரின் வரலாறு",
    provenanceTimeline: "வரலாற்று காலக்கோடு",
    physicalMatch: "நேரடி ஆதார ஆய்வு",
    careForCraft: "பராமரிப்பு",
    likelyMatch: "சரியான பொருத்தம்",

    statusVerified: "உண்மையானது என உறுதிப்பட்டது",
    statusPending: "சரிபார்ப்பு நிலுவையில் உள்ளது",
    statusFlagged: "போலி எச்சரிக்கை",
    statusRejected: "நிராகரிக்கப்பட்டது",
    close: "மூடு",
    cancel: "ரத்து செய்",
    confirm: "உறுதிசெய்",
    submit: "சமர்ப்பி",
    loading: "ஏற்றப்படுகிறது..."
  },

  te: {
    appTitle: "కారిగ్యా",
    appSubtitle: "కళ నమ్మకాన్ని కలిసే చోటు",
    navHome: "హోమ్",
    navProducts: "నా ఉత్పత్తులు",
    navRegister: "కళ నమోదు",
    navVerify: "పాస్‌పోర్ట్ తనిఖీ",
    navProfile: "ప్రొఫైల్",
    navArtisans: "కళాకారులు",
    navAlerts: "నకిలీ హెచ్చరికలు",
    navCompensation: "న్యాయమైన వేతనం",
    navDisputes: "వివాద పరిష్కారం",
    navVerificationQueue: "తనిఖీ జాబితా",
    dashboard: "డాష్‌బోర్డ్",
    overview: "అవలోకనం",
    systemAudit: "సిస్టమ్ ఆడిట్",

    heroTitle: "ప్రతి చేతివృత్తి వెనుక ఉన్న కథను తెలుసుకోండి.",
    heroSubtitle: "ఇది ఎక్కడ తయారైంది, ఎవరు చేశారు, కళాకారుడి నుండి మీ వరకు సాగిన ప్రయాణం.",
    verifyProductBtn: "ఉత్పత్తిని తనిఖీ చేయండి",
    registerProductBtn: "ఉత్పత్తిని నమోదు చేయండి",
    scanProductBtn: "QR స్క్యాన్ చేయండి",
    artisanLoginBtn: "కళాకారుల లాగిన్",
    searchPlaceholder: "పాస్‌పోర్ట్ ఐడి ఎంటర్ చేయండి...",

    provenanceTitle: "ధృవీకరించబడిన మూలం",
    provenanceDesc: "ఇది ఎక్కడ తయారైందో మరియు తయారు చేసిన చేతులను తెలుసుకోండి.",
    authenticityTitle: "అసలైన నాణ్యత హామీ",
    authenticityDesc: "సాంప్రదాయ చేతివృత్తుల కోసం సురక్షితమైన డిజిటల్ పాస్‌పోర్ట్.",
    attributionTitle: "కళాకారుడికి గుర్తింపు",
    attributionDesc: "సాంప్రదాయ కళాకారులకు మరియు సంఘాలకు పూర్తి గుర్తింపు.",
    compensationTitle: "న్యాయమైన వేతనం",
    compensationDesc: "కళాకారులకు తగిన ఫలం అందేలా పారదర్శకమైన వేతనం.",

    stepBasic: "ప్రాథమిక సమాచారం",
    stepArtisan: "కళాకారుడి ప్రొఫైల్",
    stepMaterials: "ముడి పదార్థాలు",
    stepTechnique: "సాంప్రదాయ నైపుణ్యం",
    stepLocation: "తయారైన ప్రాంతం",
    stepVoice: "వాయిస్ కథ",
    stepEvidence: "సాక్ష్యాల ఫోటోలు",
    stepReview: "సమీక్షించి విడుదల చేయండి",
    productNameLabel: "ఉత్పత్తి పేరు",
    craftCategoryLabel: "కళా రకం",
    productTypeLabel: "ఉత్పత్తి రకం",
    materialsLabel: "వాడిన పదార్థాలు",
    tellUsVoiceBtn: "మీ ఉత్పత్తి గురించి చెప్పండి",
    speakPreferredLanguage: "మీ మాతృభాషలో మాట్లాడండి",
    weUnderstood: "మేము గ్రహించింది:",
    isThisCorrect: "ఈ వివరాలు సరైనవేనా?",
    yesBtn: "అవును, ఖరారు చేయండి",
    editBtn: "సవరించండి",
    createPassportBtn: "డిజిటల్ పాస్‌పోర్ట్ సృష్టించండి",
    passportCreatedTitle: "పాస్‌పోర్ట్ విజయవంతంగా సృష్టించబడింది",

    whereWasItMade: "ఈ చేతివృత్తి ఎక్కడ తయారైంది?",
    locationSubtitle: "మూలాల నమ్మకాన్ని పెంచడానికి స్థానాన్ని జోడించండి.",
    locationConsentNote: "మేము కేవలం సాధారణ ప్రాంతాన్ని నమోదు చేస్తాము. మీ చిరునామా సురక్షితం.",
    allowLocationBtn: "స్థాన అనుమతి ఇవ్వండి",
    skipForNowBtn: "ఇప్పుడు వద్దు",
    useThisLocationBtn: "ఈ స్థానాన్ని వాడండి",
    changeLocationBtn: "స్థానాన్ని మార్చండి",
    provenanceConfidence: "అత్యధిక నమ్మక స్థాయి",
    whereWasMadeBuyer: "ఎక్కడ తయారైంది?",
    approximateAreaNote: "అంచనా ప్రాంతం — కళాకారుడి సొంత చిరునామా సురక్షితం.",
    locationSupportsProvenance: "స్థానం ఉత్పత్తి మూలాన్ని ధృవీకరిస్తుంది.",

    backToCatalog: "జాబితాకు తిరిగి వెళ్లండి",
    share: "షేర్ చేయండి",
    printCertificate: "సర్టిఫికెట్ ప్రింట్ చేయండి",
    verifyPhysicalItem: "వస్తువును స్వయంగా తనిఖీ చేయండి",
    tamperEvidentPassport: "సురక్షిత డిజిటల్ పాస్‌పోర్ట్",
    passportId: "పాస్‌పోర్ట్ సంఖ్య",
    craftHeritageProvenance: "కళా చరిత్ర & మూలాలు",
    masterArtisan: "ప్రధాన కళాకారుడు",
    clusterOrigin: "తయారీ కేంద్రం",
    cooperativeGuild: "సహకార సంఘం",
    craftDuration: "శ్రమ మరియు సమయం",
    hoursCraftwork: "గంటల చేతిపని",
    fairCompensationFloor: "న్యాయమైన వేతనం",
    artisanDirectPayout: "కళాకారుడికి నేరుగా చెల్లింపు",
    trustIndexScore: "నమ్మక సూచిక స్కోరు",
    verifiedFactors: "ధృవీకరించబడిన అంశాలు",
    viewEvidence: "సాక్ష్యాల ఫోటోలు చూడండి",
    provenanceChainOfCustody: "మూలాలు & హక్కుల రికార్డు",
    cryptographicallySealed: "డిజిటల్‌గా సీల్ చేయబడింది",
    careInstructions: "జాగ్రత్తలు మరియు సలహాలు",
    meetTheMaker: "కళాకారుడిని కలవండి",
    listenArtisanStory: "కళాకారుడి కథ వినండి",

    verifyTraditionalCraft: "సాంప్రదాయ పాస్‌పోర్ట్ తనిఖీ చేయండి",
    scanQrBtn: "QR కోడ్ స్క్యాన్ చేయండి",
    enterProductIdPlaceholder: "ఉదా. CRAFT-00124",
    trustLevel: "నమ్మక స్థాయి",
    artisanStory: "కళాకారుడి జీవిత కథ",
    provenanceTimeline: "చారిత్రక కాలక్రమం",
    physicalMatch: "సాక్ష్యాల తనిఖీ",
    careForCraft: "రక్షణ మరియు సంరక్షణ",
    likelyMatch: "సరైన పోలిక",

    statusVerified: "అసలైనదిగా ధృవీకరించబడింది",
    statusPending: "తనిఖీ పెండింగ్‌లో ఉంది",
    statusFlagged: "నకిలీ హెచ్చరిక",
    statusRejected: "తిరస్కరించబడింది",
    close: "మూసివేయి",
    cancel: "రద్దు చేయి",
    confirm: "ఖరారు చేయి",
    submit: "సమర్పించు",
    loading: "లోడ్ అవుతోంది..."
  },

  kn: {
    appTitle: "ಕಾರಿಗ್ಯಾ",
    appSubtitle: "ಕಲೆ ಮತ್ತು ನಂಬಿಕೆಯ ಮಿಲನ",
    navHome: "ಮುಖಪುಟ",
    navProducts: "ನನ್ನ ಉತ್ಪನ್ನಗಳು",
    navRegister: "ಕಲೆ ನೋಂದಣಿ",
    navVerify: "ಪಾಸ್‌ಪೋರ್ಟ್ ಪರಿಶೀಲನೆ",
    navProfile: "ಪ್ರೊಫೈಲ್",
    navArtisans: "ಕುಶಲಕರ್ಮಿಗಳು",
    navAlerts: "ನಕಲಿ ಎಚ್ಚರಿಕೆಗಳು",
    navCompensation: "ನ್ಯಾಯಯುತ ವೇತನ",
    navDisputes: "ವಿವಾದ ಪರಿಹಾರ",
    navVerificationQueue: "ಪರಿಶೀಲನೆ ಸಾಲು",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    overview: "ಅವಲೋಕನ",
    systemAudit: "ಸಿಸ್ಟಮ್ ಆಡಿಟ್",

    heroTitle: "ಪ್ರತಿ ಕಲಾಕೃತಿಯ ಹಿಂದಿನ ನೈಜ ಕಥೆಯನ್ನು ತಿಳಿಯಿರಿ.",
    heroSubtitle: "ಎಲ್ಲಿ ತಯಾರಾಯಿತು, ಯಾರು ಮಾಡಿದರು ಮತ್ತು ಕುಶಲಕರ್ಮಿಯಿಂದ ನಿಮ್ಮವರೆಗಿನ ಪ್ರಯಾಣ.",
    verifyProductBtn: "ಉತ್ಪನ್ನ ಪರಿಶೀಲಿಸಿ",
    registerProductBtn: "ಉತ್ಪನ್ನ ನೋಂದಾಯಿಸಿ",
    scanProductBtn: "QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    artisanLoginBtn: "ಕುಶಲಕರ್ಮಿ ಲಾಗಿನ್",
    searchPlaceholder: "ಪಾಸ್‌ಪೋರ್ಟ್ ಐಡಿ ನಮೂದಿಸಿ...",

    provenanceTitle: "ಪ್ರಮಾಣೀಕೃತ ಮೂಲ",
    provenanceDesc: "ಎಲ್ಲಿ ತಯಾರಾಯಿತು ಮತ್ತು ಮಾಡಿದ ಕೈಗಳನ್ನು ತಿಳಿಯಿರಿ.",
    authenticityTitle: "ನೈಜತೆಯ ಭರವಸೆ",
    authenticityDesc: "ಸಾಂಪ್ರದಾಯಿಕ ಕಲೆಗಳಿಗಾಗಿ ಡಿಜಿಟಲ್ ಪಾಸ್‌ಪೋರ್ಟ್.",
    attributionTitle: "ಕುಶಲಕರ್ಮಿಯ ಗುರುತಿಸುವಿಕೆ",
    attributionDesc: "ಸಾಂಪ್ರದಾಯಿಕ ಕಲಾವಿದರಿಗೆ ಪೂರ್ಣ ಗೌರವ.",
    compensationTitle: "ನ್ಯಾಯಯುತ ವೇತನ",
    compensationDesc: "ಕುಶಲಕರ್ಮಿಗಳಿಗೆ ಸೂಕ್ತ ಪಾಲು ಸಿಗುವುದನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",

    stepBasic: "ಮೂಲ ಮಾಹಿತಿ",
    stepArtisan: "ಕುಶಲಕರ್ಮಿ ಪ್ರೊಫೈಲ್",
    stepMaterials: "ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು",
    stepTechnique: "ಸಾಂಪ್ರದಾಯಿಕ ಶೈಲಿ",
    stepLocation: "ತಯಾರಾದ ಸ್ಥಳ",
    stepVoice: "ಧ್ವನಿ ಕಥೆ",
    stepEvidence: "ಸಾಕ್ಷ್ಯದ ಫೋಟೋಗಳು",
    stepReview: "ಪರಿಶೀಲಿಸಿ ಬಿಡುಗಡೆ ಮಾಡಿ",
    productNameLabel: "ಉತ್ಪನ್ನದ ಹೆಸರು",
    craftCategoryLabel: "ಕಲಾ ವರ್ಗ",
    productTypeLabel: "ಉತ್ಪನ್ನದ ಪ್ರಕಾರ",
    materialsLabel: "ಬಳಸಿದ ಸಾಮಗ್ರಿಗಳು",
    tellUsVoiceBtn: "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಬಗ್ಗೆ ತಿಳಿಸಿ",
    speakPreferredLanguage: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ",
    weUnderstood: "ನಾವು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದು:",
    isThisCorrect: "ಈ ವಿವರಗಳು ಸರಿಯಿವೆಯೇ?",
    yesBtn: "ಹೌದು, ಖಚಿತಪಡಿಸಿ",
    editBtn: "ಸಂಪಾದಿಸಿ",
    createPassportBtn: "ಡಿಜಿಟಲ್ ಪಾಸ್‌ಪೋರ್ಟ್ ರಚಿಸಿ",
    passportCreatedTitle: "ಪಾಸ್‌ಪೋರ್ಟ್ ಯಶಸ್ವಿಯಾಗಿ ರಚನೆಯಾಗಿದೆ",

    whereWasItMade: "ಈ ಕಲಾಕೃತಿ ಎಲ್ಲಿ ತಯಾರಾಯಿತು?",
    locationSubtitle: "ನೈಜತೆಯನ್ನು ಹೆಚ್ಚಿಸಲು ಸ್ಥಳದ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ.",
    locationConsentNote: "ನಾವು ಕೇವಲ ಸಾಮಾನ್ಯ ಪ್ರದೇಶವನ್ನು ದಾಖಲಿಸುತ್ತೇವೆ. ಮನೆ ವಿಳಾಸ ಸುರಕ್ಷಿತವಾಗಿದೆ.",
    allowLocationBtn: "ಸ್ಥಳದ ಅನುಮತಿ ನೀಡಿ",
    skipForNowBtn: "ಈಗ ಬಿಟ್ಟುಬಿಡಿ",
    useThisLocationBtn: "ಈ ಸ್ಥಳ ಬಳಸಿ",
    changeLocationBtn: "ಸ್ಥಳ ಬದಲಾಯಿಸಿ",
    provenanceConfidence: "ಹೆಚ್ಚಿನ ನಂಬಿಕೆಯ ಮಟ್ಟ",
    whereWasMadeBuyer: "ಎಲ್ಲಿ ತಯಾರಾಯಿತು?",
    approximateAreaNote: "ಅಂದಾಜು ಪ್ರದೇಶ — ಕುಶಲಕರ್ಮಿಯ ಖಾಸಗಿ ವಿಳಾಸ ಸುರಕ್ಷಿತವಾಗಿದೆ.",
    locationSupportsProvenance: "ಸ್ಥಳವು ಉತ್ಪನ್ನದ ಮೂಲವನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.",

    backToCatalog: "ಪಟ್ಟಿ ಗೆ ಹಿಂತಿರುಗಿ",
    share: "ಹಂಚಿಕೊಳ್ಳಿ",
    printCertificate: "ಪ್ರಮಾಣಪತ್ರ ಮುದ್ರಿಸಿ",
    verifyPhysicalItem: "ವಸ್ತುವನ್ನು ಪರಿಶೀಲಿಸಿ",
    tamperEvidentPassport: "ಸುರಕ್ಷಿತ ಡಿಜಿಟಲ್ ಪಾಸ್‌ಪೋರ್ಟ್",
    passportId: "ಪಾಸ್‌ಪೋರ್ಟ್ ಸಂಖ್ಯೆ",
    craftHeritageProvenance: "ಕಲಾ ಪರಂಪರೆ ಮತ್ತು ವಿವರ",
    masterArtisan: "ಮುಖ್ಯ ಕುಶಲಕರ್ಮಿ",
    clusterOrigin: "ತಯಾರಿಕಾ ಕೇಂದ್ರ",
    cooperativeGuild: "ಸಹಕಾರ ಸಂಘ",
    craftDuration: "ಶ್ರಮ ಮತ್ತು ಸಮಯ",
    hoursCraftwork: "ಘಂಟೆಗಳ ಕೈಕೆಲಸ",
    fairCompensationFloor: "ನ್ಯಾಯಯುತ ಕನಿಷ್ಠ ವೇತನ",
    artisanDirectPayout: "ನೇರ ಕುಶಲಕರ್ಮಿ ಪಾವತಿ",
    trustIndexScore: "ನಂಬಿಕೆಯ ಸೂಚ್ಯಂಕ",
    verifiedFactors: "ಪರಿಶೀಲಿಸಿದ ಅಂಶಗಳು",
    viewEvidence: "ಸಾಕ್ಷ್ಯ ಫೋಟೋಗಳನ್ನು ನೋಡಿ",
    provenanceChainOfCustody: "ಮೂಲ ಮತ್ತು ಹಕ್ಕುಗಳ ದಾಖಲೆ",
    cryptographicallySealed: "ಡಿಜಿಟಲ್ ಆಗಿ ಸೀಲ್ ಮಾಡಲಾಗಿದೆ",
    careInstructions: "ಪಾಲನೆ ಮತ್ತು ಸಂರಕ್ಷಣೆ",
    meetTheMaker: "ಕುಶಲಕರ್ಮಿಯನ್ನು ಭೇಟಿಯಾಗಿ",
    listenArtisanStory: "ಕುಶಲಕರ್ಮಿಯ ಕಥೆ ಕೇಳಿ",

    verifyTraditionalCraft: "ಸಾಂಪ್ರದಾಯಿಕ ಪಾಸ್‌ಪೋರ್ಟ್ ಪರಿಶೀಲಿಸಿ",
    scanQrBtn: "QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    enterProductIdPlaceholder: "ಉದಾ. CRAFT-00124",
    trustLevel: "ನಂಬಿಕೆಯ ಮಟ್ಟ",
    artisanStory: "ಕುಶಲಕರ್ಮಿಯ ಕಥೆ",
    provenanceTimeline: "ಕಾಲಕ್ರಮ",
    physicalMatch: "ಸಾಕ್ಷ್ಯ ಪರಿಶೀಲನೆ",
    careForCraft: "ಸಂರಕ್ಷಣೆ",
    likelyMatch: "ಸೂಕ್ತ ಹೊಂದಾಣಿಕೆ",

    statusVerified: "ನೈಜ ಎಂದು ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    statusPending: "ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ",
    statusFlagged: "ನಕಲಿ ಎಚ್ಚರಿಕೆ",
    statusRejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    close: "ಮುಚ್ಚಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    confirm: "ಖಚಿತಪಡಿಸಿ",
    submit: "ಸಲ್ಲಿಸಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..."
  },

  mr: {
    appTitle: "कारिग्या",
    appSubtitle: "जिथे कला आणि विश्वासाचा संगम होतो",
    navHome: "मुख्य पृष्ठ",
    navProducts: "माझे उत्पादन",
    navRegister: "कला नोंदणी",
    navVerify: "पासपोर्ट तपासा",
    navProfile: "प्रोफाइल",
    navArtisans: "कारागीर",
    navAlerts: "नकली अलर्ट",
    navCompensation: "योग्य मोबदला",
    navDisputes: "तंटा निवारण",
    navVerificationQueue: "सत्यापन रांग",
    dashboard: "डॅशबोर्ड",
    overview: "आढावा",
    systemAudit: "सिस्टम ऑडिट",

    heroTitle: "प्रत्येक हस्तकलेमागील खरी कहाणी जाणून घ्या.",
    heroSubtitle: "हे कुठे बनले, कोणी बनवले आणि कारागिरापासून तुमच्यापर्यंतचा प्रवास.",
    verifyProductBtn: "उत्पादन तपासा",
    registerProductBtn: "उत्पादन नोंदवा",
    scanProductBtn: "क्यूआर स्कॅन करा",
    artisanLoginBtn: "कारागीर लॉगिन",
    searchPlaceholder: "पासपोर्ट आयडी प्रविष्ट करा...",

    provenanceTitle: "प्रमाणित मूळ",
    provenanceDesc: "हे कुठे बनले आणि कोणी घडवले ते जाणून घ्या.",
    authenticityTitle: "खऱ्या गुणवत्तेची खात्री",
    authenticityDesc: "पारंपरिक हस्तकलेसाठी सुरक्षित डिजिटल पासपोर्ट.",
    attributionTitle: "कारागिराचा सन्मान",
    attributionDesc: "पारंपरिक कारागिरांना आणि संस्थांना पूर्ण ओळख.",
    compensationTitle: "योग्य मोबदला",
    compensationDesc: "पारदर्शक मोबदला कारागिरांना त्यांचा योग्य हिस्सा मिळण्याची खात्री देतो.",

    stepBasic: "मूलभूत माहिती",
    stepArtisan: "कारागीर प्रोफाइल",
    stepMaterials: "कच्चा माल",
    stepTechnique: "पारंपरिक शैली",
    stepLocation: "निर्मितीचे ठिकाण",
    stepVoice: "आवाज संदेश",
    stepEvidence: "पुरावा फोटो",
    stepReview: "समीक्षा आणि जारी करा",
    productNameLabel: "उत्पादनाचे नाव",
    craftCategoryLabel: "कला श्रेणी",
    productTypeLabel: "उत्पादनाचा प्रकार",
    materialsLabel: "वापरलेली सामग्री",
    tellUsVoiceBtn: "तुमच्या उत्पादनाबद्दल सांगा",
    speakPreferredLanguage: "तुमच्या मूळ भाषेत बोला",
    weUnderstood: "आम्हाला समजले:",
    isThisCorrect: "ही माहिती बरोबर आहे का?",
    yesBtn: "होय, निश्चित करा",
    editBtn: "संपादित करा",
    createPassportBtn: "डिजिटल पासपोर्ट तयार करा",
    passportCreatedTitle: "पासपोर्ट यशस्वीरित्या तयार झाला",

    whereWasItMade: "ही कलाकृती कुठे बनवली गेली?",
    locationSubtitle: "मूळ प्रमाणीकरण मजबूत करण्यासाठी स्थान जोडा.",
    locationConsentNote: "आम्ही फक्त सामान्य क्षेत्र नोंदवतो. तुमचा पत्ता सुरक्षित आहे.",
    allowLocationBtn: "स्थान परवानगी द्या",
    skipForNowBtn: "आत्ता सोडा",
    useThisLocationBtn: "हे स्थान वापरा",
    changeLocationBtn: "स्थान बदला",
    provenanceConfidence: "उच्च विश्वास पातळी",
    whereWasMadeBuyer: "कुठे बनले होते?",
    approximateAreaNote: "अंदाजे क्षेत्र — कारागिराचा खाजगी पत्ता सुरक्षित.",
    locationSupportsProvenance: "स्थान उत्पादनाच्या मुळाची पुष्टी करते.",

    backToCatalog: "कॅटलॉगवर परत जा",
    share: "शेअर करा",
    printCertificate: "प्रमाणपत्र मुद्रित करा",
    verifyPhysicalItem: "वस्तु तपासा",
    tamperEvidentPassport: "सुरक्षित डिजिटल पासपोर्ट",
    passportId: "पासपोर्ट क्रमांक",
    craftHeritageProvenance: "कला वारसा आणि इतिहास",
    masterArtisan: "मुख्य कारागीर",
    clusterOrigin: "उत्पादन केंद्र",
    cooperativeGuild: "सहकारी संस्था",
    craftDuration: "श्रम आणि वेळ",
    hoursCraftwork: "तासांचे काम",
    fairCompensationFloor: "किमान योग्य वेतन",
    artisanDirectPayout: "कारागीर थेट पेमेंट",
    trustIndexScore: "विश्वास निर्देशांक",
    verifiedFactors: "सत्यापित घटक",
    viewEvidence: "पुरावा फोटो पहा",
    provenanceChainOfCustody: "मूळ आणि मालकी नोंद",
    cryptographicallySealed: "डिजिटल सील केलेले",
    careInstructions: "काळजी घेण्याच्या सूचना",
    meetTheMaker: "कारागिराला भेटा",
    listenArtisanStory: "कारागिराची कथा ऐका",

    verifyTraditionalCraft: "पारंपरिक हस्तकला पासपोर्ट तपासा",
    scanQrBtn: "क्यूआर कोड स्कॅन करा",
    enterProductIdPlaceholder: "उदा. CRAFT-00124",
    trustLevel: "विश्वास पातळी",
    artisanStory: "कारागिराची कथा",
    provenanceTimeline: "इतिहास कालक्रम",
    physicalMatch: "पुरावा तपासणी",
    careForCraft: "काळजी आणि देखभाल",
    likelyMatch: "योग्य जुळणी",

    statusVerified: "प्रमाणित खरे",
    statusPending: "सत्यापन प्रलंबित",
    statusFlagged: "नकली अलर्ट",
    statusRejected: "नाकारले",
    close: "बंद करा",
    cancel: "रद्द करा",
    confirm: "निश्चित करा",
    submit: "सादर करा",
    loading: "लोड होत आहे..."
  },

  gu: {
    appTitle: "કારીગ્યા",
    appSubtitle: "જ્યાં કળા અને વિશ્વાસનો સંગમ થાય છે",
    navHome: "મુખ્ય પૃષ્ઠ",
    navProducts: "મારા ઉત્પાદનો",
    navRegister: "કળા નોંધણી",
    navVerify: "પાસપોર્ટ ચકાસણી",
    navProfile: "પ્રોફાઇલ",
    navArtisans: "કારીગરો",
    navAlerts: "નકલી ચેતવણી",
    navCompensation: "વાજબી વળતર",
    navDisputes: "વિવાદ નિવારણ",
    navVerificationQueue: "ચકાસણી યાદી",
    dashboard: "ડેશબોર્ડ",
    overview: "ઝડપી સમીક્ષા",
    systemAudit: "સિસ્ટમ ઓડિટ",

    heroTitle: "દરેક હસ્તકળા પાછળની સાચી વાર્તા જાણો.",
    heroSubtitle: "તે ક્યાં બન્યું, કોણે બનાવ્યું અને તમારા સુધી પહોંચવાની મુસાફરી.",
    verifyProductBtn: "ઉત્પાદન ચકાસો",
    registerProductBtn: "ઉત્પાદન નોંધો",
    scanProductBtn: "QR સ્કેન કરો",
    artisanLoginBtn: "કારીગર લોગિન",
    searchPlaceholder: "પાસપોર્ટ આઈડી દાખલ કરો...",

    provenanceTitle: "પ્રમાણિત મૂળ",
    provenanceDesc: "જાણો તે ક્યાં બન્યું અને કયા હાથોએ તેને ઘડ્યું.",
    authenticityTitle: "સાચી ગુણવત્તાની ખાતરી",
    authenticityDesc: "પરંપરાગત હસ્તકળા માટે સુરક્ષિત ડિજિટલ પાસપોર્ટ.",
    attributionTitle: "કારીગરનું સન્માન",
    attributionDesc: "પરંપરાગત કારીગરો અને મંડળીઓને પૂર્ણ ઓળખ.",
    compensationTitle: "વાજબી વળતર",
    compensationDesc: "પારદર્શક વળતર કારીગરોને તેમનો યોગ્ય હિસ્સો આપે છે.",

    stepBasic: "મૂળભૂત માહિતી",
    stepArtisan: "કારીગર પ્રોફાઇલ",
    stepMaterials: "કાચો માલ",
    stepTechnique: "પરંપરાગત શૈલી",
    stepLocation: "ઉત્પાદનનું સ્થળ",
    stepVoice: "અવાજ સંદેશ",
    stepEvidence: "પુરાવા ફોટો",
    stepReview: "સમીક્ષા અને જાહેરાત",
    productNameLabel: "ઉત્પાદનનું નામ",
    craftCategoryLabel: "કળા શ્રેણી",
    productTypeLabel: "ઉત્પાદનનો પ્રકાર",
    materialsLabel: "વાપરેલી સામગ્રી",
    tellUsVoiceBtn: "તમારા ઉત્પાદન વિશે જણાવો",
    speakPreferredLanguage: "તમારી માતૃભાષામાં બોલો",
    weUnderstood: "અમે સમજ્યા:",
    isThisCorrect: "શું આ વિગતો સાચી છે?",
    yesBtn: "હા, ખાતરી કરો",
    editBtn: "સંપાદિત કરો",
    createPassportBtn: "ડિજિટલ પાસપોર્ટ બનાવો",
    passportCreatedTitle: "પાસપોર્ટ સફળતાપૂર્વક બન્યો",

    whereWasItMade: "આ કળા ક્યાં બની હતી?",
    locationSubtitle: "મૂળ ચકાસણીને મજબૂત કરવા સ્થળ ઉમેરો.",
    locationConsentNote: "અમે ફક્ત સામાન્ય વિસ્તાર નોંધીએ છીએ. સરનામું સુરક્ષિત છે.",
    allowLocationBtn: "સ્થળ પરવાનગી આપો",
    skipForNowBtn: "હમણાં છોડો",
    useThisLocationBtn: "આ સ્થળ વાપરો",
    changeLocationBtn: "સ્થળ બદલો",
    provenanceConfidence: "ઉચ્ચ વિશ્વાસ સ્તર",
    whereWasMadeBuyer: "ક્યાં બન્યું હતું?",
    approximateAreaNote: "અંદાજિત વિસ્તાર — કારીગરનું સરનામું સુરક્ષિત.",
    locationSupportsProvenance: "સ્થળ મૂળની પુષ્ટિ કરે છે.",

    backToCatalog: "યાદી પર પાછા જાઓ",
    share: "શેર કરો",
    printCertificate: "પ્રમાણપત્ર પ્રિન્ટ કરો",
    verifyPhysicalItem: "વસ્તુ ચકાસો",
    tamperEvidentPassport: "સુરક્ષિત ડિજિટલ પાસપોર્ટ",
    passportId: "પાસપોર્ટ નંબર",
    craftHeritageProvenance: "કળા વારસો आणि વિગત",
    masterArtisan: "મુખ્ય કારીગર",
    clusterOrigin: "ઉત્પાદન કેન્દ્ર",
    cooperativeGuild: "સહકારી મંડળી",
    craftDuration: "શ્રમ અને સમય",
    hoursCraftwork: "કલાકનું કામ",
    fairCompensationFloor: "ન્યૂનતમ વાજબી વેતન",
    artisanDirectPayout: "કારીગર સીધું ચુકવણું",
    trustIndexScore: "વિશ્વાસ આંક",
    verifiedFactors: "ચકાસાયેલ પરિબળો",
    viewEvidence: "પુરાવા ફોટો જુઓ",
    provenanceChainOfCustody: "મૂળ અને માલિકી નોંધ",
    cryptographicallySealed: "ડિજિટલી સીલ કરેલ",
    careInstructions: "સંભાળની સૂચનાઓ",
    meetTheMaker: "કારીગરને મળો",
    listenArtisanStory: "કારીગરની વાર્તા સાંભળો",

    verifyTraditionalCraft: "હસ્તકળા પાસપોર્ટ ચકાસો",
    scanQrBtn: "QR સ્કેન કરો",
    enterProductIdPlaceholder: "દા.ત. CRAFT-00124",
    trustLevel: "વિશ્વાસ સ્તર",
    artisanStory: "કારીગરની વાર્તા",
    provenanceTimeline: "સમયરેખા",
    physicalMatch: "પુરાવા ચકાસણી",
    careForCraft: "સંભાળ",
    likelyMatch: "સાચું જોડાણ",

    statusVerified: "ચકાસાયેલ સાચું",
    statusPending: "ચકાસણી બાકી",
    statusFlagged: "નકલી ચેતવણી",
    statusRejected: "અસ્વીકૃત",
    close: "બંધ કરો",
    cancel: "રદ કરો",
    confirm: "ખાતરી કરો",
    submit: "સબમિટ કરો",
    loading: "લોડ થઈ રહ્યું છે..."
  }
};
