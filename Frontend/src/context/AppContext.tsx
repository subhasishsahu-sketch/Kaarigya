import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  LanguageCode, 
  ProductPassport, 
  CounterfeitAlert, 
  DisputeCase, 
  ArtisanProfile,
  EvidenceItem,
  AuthUser
} from '../types';
import { mockProducts, mockCounterfeitAlerts, mockDisputes, mockArtisans } from '../data/mockData';
import { translations, Translations } from '../data/translations';

interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;

  // Auth & Session Management
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  authToken: string | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  pendingRoleTarget: UserRole | null;
  setPendingRoleTarget: (role: UserRole | null) => void;
  /** onNavigate is called after login to redirect to the appropriate dashboard via React Router */
  login: (user: AuthUser, token: string, role: UserRole, onNavigate?: (path: string) => void) => void;
  logout: (onNavigate?: () => void) => void;
  requireAuthForRole: (targetRole: UserRole) => boolean;

  // Product identifier for the current passport view
  activeProductId: string;
  setActiveProductId: (id: string) => void;

  // Data
  products: ProductPassport[];
  activeProduct: ProductPassport | undefined;
  alerts: CounterfeitAlert[];
  disputes: DisputeCase[];
  artisans: ArtisanProfile[];
  pendingArtisans: ArtisanProfile[];
  currentArtisan: ArtisanProfile;

  // Actions
  registerArtisan: (registrationData: any) => Promise<any>;
  acceptArtisan: (artisanId: string) => Promise<any>;
  rejectArtisan: (artisanId: string) => Promise<any>;
  registerNewProduct: (productData: Partial<ProductPassport>) => ProductPassport;
  approveProductVerification: (productId: string, notes?: string) => void;
  rejectProductVerification: (productId: string, reason?: string) => void;
  flagProductSuspicious: (productId: string, reasons: string[]) => void;
  resolveAlert: (alertId: string) => void;
  resolveDispute: (
    disputeId: string, 
    resolution: 'approved_authentic' | 'confirmed_counterfeit' | 'needs_evidence' | 'escalated',
    verdictNotes?: string,
    auditorName?: string
  ) => void;
  fileNewDispute: (disputeData: Partial<DisputeCase>) => DisputeCase;
  addDisputeEvidence: (disputeId: string, evidence: { title: string; type?: string; verified?: boolean; url?: string; notes?: string; submittedBy?: string }) => void;
  generateDisputeLegalNotice: (disputeId: string) => void;
  releaseDisputeEscrow: (disputeId: string, target: 'artisan' | 'buyer') => void;
  
  // Modals & UI Controls
  isQRScannerOpen: boolean;
  setIsQRScannerOpen: (open: boolean) => void;
  isPhysicalMatchOpen: boolean;
  setIsPhysicalMatchOpen: (open: boolean) => void;
  
  // Toast notifications
  notifications: NotificationItem[];
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  dismissNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('buyer');
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('kaarigya_language');
      return (saved as LanguageCode) || 'en';
    } catch {
      return 'en';
    }
  });
  const [activeProductId, setActiveProductId] = useState<string>('CRAFT-00124');
  
  const [products, setProducts] = useState<ProductPassport[]>(() => {
    const saved = localStorage.getItem('kalakriti_products');
    return saved ? JSON.parse(saved) : mockProducts;
  });

  const [alerts, setAlerts] = useState<CounterfeitAlert[]>(() => {
    const saved = localStorage.getItem('kalakriti_alerts');
    return saved ? JSON.parse(saved) : mockCounterfeitAlerts;
  });

  const [disputes, setDisputes] = useState<DisputeCase[]>(() => {
    const saved = localStorage.getItem('kalakriti_disputes');
    return saved ? JSON.parse(saved) : mockDisputes;
  });

  const [artisans, setArtisans] = useState<ArtisanProfile[]>(() => {
    try {
      const saved = localStorage.getItem('kalakriti_artisans');
      return saved ? JSON.parse(saved) : mockArtisans;
    } catch {
      return mockArtisans;
    }
  });

  // Authentication & Session Protection
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('kaarigya_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('craftpass_token') || null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('craftpass_token') && localStorage.getItem('kaarigya_user'));
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingRoleTarget, setPendingRoleTarget] = useState<UserRole | null>(null);

  // Active artisan resolution
  const currentArtisan: ArtisanProfile = React.useMemo(() => {
    if (currentUser && currentUser.role === 'artisan') {
      const userEmailNorm = (currentUser.email || '').toLowerCase().trim();
      const userNameNorm = (currentUser.fullName || '').toLowerCase().trim();

      const matched = artisans.find(a => 
        a.id === currentUser.id || 
        (a.email && a.email.toLowerCase().trim() === userEmailNorm) ||
        (userEmailNorm.length > 0 && (userEmailNorm.includes('sita') || userEmailNorm.includes('subhadra')) && (a.id === 'artisan-01' || a.name.includes('Sita'))) ||
        (userEmailNorm.length > 0 && (userEmailNorm.includes('ramesh') || userEmailNorm.includes('sahu') || userEmailNorm.includes('baghel')) && (a.id === 'artisan-02' || a.name.includes('Ramesh'))) ||
        (userEmailNorm.length > 0 && (userEmailNorm.includes('anita') || userEmailNorm.includes('das')) && (a.id === 'artisan-03' || a.name.includes('Anita'))) ||
        (userEmailNorm.length > 0 && userEmailNorm.includes('manjunath') && (a.id === 'artisan-04' || a.name.includes('Manjunath'))) ||
        a.name.toLowerCase().trim() === userNameNorm
      );
      if (matched) return matched;

      // Dynamically resolve products belonging to this custom user
      const userProducts = products.filter(p => 
        p.artisan.id === currentUser.id || 
        (p.artisan.email && p.artisan.email.toLowerCase() === userEmailNorm) ||
        p.artisan.name.toLowerCase() === userNameNorm
      );

      const rawName = currentUser.fullName && !currentUser.fullName.startsWith('user-') 
        ? currentUser.fullName 
        : (currentUser.email ? currentUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') : 'Artisan');
      
      const capitalizedName = rawName
        .split(' ')
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

      return {
        id: currentUser.id,
        name: capitalizedName || 'Artisan',
        email: currentUser.email,
        avatar: currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(capitalizedName || 'Artisan')}&background=5D634C&color=fff`,
        title: "Registered Craftsperson",
        bio: `Verified artisan account for ${currentUser.email}. Participate in Kaarigya Digital Product Passport system to document your traditional craft.`,
        location: "Artisan Workshop",
        district: "Craft District",
        state: "India",
        cooperativeName: "Artisan Guild",
        cooperativeId: "COOP-GENERIC",
        experienceYears: 1,
        craftTradition: "Handcrafted Traditional Goods",
        phone: currentUser.phoneNumber || "+91 98000 00000",
        verifiedAt: new Date().toISOString().split('T')[0],
        totalProducts: userProducts.length,
        totalPayouts: userProducts.length > 0 ? `₹${(userProducts.length * 3500).toLocaleString('en-IN')}` : "₹0",
        rating: 5.0,
        isNewProfile: userProducts.length === 0
      };
    }
    return mockArtisans[0];
  }, [currentUser, artisans, products]);

  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isPhysicalMatchOpen, setIsPhysicalMatchOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('kalakriti_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('kalakriti_alerts', JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('kalakriti_disputes', JSON.stringify(disputes));
    } catch {
      // ignore
    }
  }, [disputes]);

  useEffect(() => {
    try {
      localStorage.setItem('kalakriti_artisans', JSON.stringify(artisans));
    } catch {
      // ignore
    }
  }, [artisans]);

  useEffect(() => {
    try {
      localStorage.setItem('kaarigya_language', language);
    } catch {
      // ignore
    }
  }, [language]);

  const pendingArtisans = React.useMemo(() => {
    return artisans.filter(a => a.verificationStatus === 'PENDING');
  }, [artisans]);

  const registerArtisan = async (registrationData: any) => {
    try {
      let resData: any = null;
      try {
        const { api } = await import('../services/api');
        resData = await api.auth.registerArtisan(registrationData);
      } catch (apiErr: any) {
        console.warn('Backend API registration call failed, operating in fallback mode:', apiErr);
      }

      const userId = resData?.user?.id || `artisan-usr-${Date.now()}`;
      const newArtisanProfile: ArtisanProfile = {
        id: userId,
        name: registrationData.fullName,
        email: registrationData.email,
        phone: registrationData.phoneNumber,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(registrationData.fullName)}&background=5D634C&color=fff`,
        title: `Master ${Array.isArray(registrationData.craftSpecialties) ? registrationData.craftSpecialties[0] : registrationData.craftSpecialties} Artisan`,
        bio: registrationData.bio || `Registered artisan specializing in ${Array.isArray(registrationData.craftSpecialties) ? registrationData.craftSpecialties.join(', ') : registrationData.craftSpecialties}.`,
        location: registrationData.clusterName || `${registrationData.district} Craft Cluster`,
        district: registrationData.district,
        state: registrationData.regionState,
        cooperativeId: registrationData.cooperativeId,
        cooperativeName: registrationData.cooperativeName || "Selected Cooperative",
        experienceYears: Number(registrationData.experienceYears) || 1,
        craftTradition: Array.isArray(registrationData.craftSpecialties) ? registrationData.craftSpecialties.join(', ') : registrationData.craftSpecialties,
        verifiedAt: '',
        totalProducts: 0,
        totalPayouts: '₹0',
        rating: 5.0,
        isNewProfile: true,
        verificationStatus: 'PENDING',
        kalakritiArtisanId: undefined
      };

      setArtisans(prev => [newArtisanProfile, ...prev]);

      const authUser: AuthUser = {
        id: userId,
        email: registrationData.email,
        role: 'artisan',
        fullName: registrationData.fullName,
        phoneNumber: registrationData.phoneNumber,
        cooperativeId: registrationData.cooperativeId,
        avatar: newArtisanProfile.avatar
      };

      const token = resData?.token || `user-${userId}`;
      login(authUser, token, 'artisan');
      showNotification(`Artisan registration submitted! Verification request sent to ${newArtisanProfile.cooperativeName}. Status: PENDING.`, 'success');
      return newArtisanProfile;
    } catch (err: any) {
      showNotification(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const acceptArtisan = async (artisanId: string) => {
    try {
      let kalakritiId = '';
      try {
        const { api } = await import('../services/api');
        const res = await api.artisans.accept(artisanId);
        if (res && res.kalakritiArtisanId) {
          kalakritiId = res.kalakritiArtisanId;
        }
      } catch (apiErr) {
        console.warn('Backend API accept call failed, generating fallback ID:', apiErr);
      }

      if (!kalakritiId) {
        const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 5; i++) {
          code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
        }
        kalakritiId = `KAL-ART-${code}`;
      }

      let updatedName = '';
      setArtisans(prev => prev.map(a => {
        if (a.id === artisanId) {
          updatedName = a.name;
          return {
            ...a,
            verificationStatus: 'VERIFIED',
            kalakritiArtisanId: kalakritiId,
            verifiedAt: new Date().toISOString().split('T')[0]
          };
        }
        return a;
      }));

      if (currentUser && currentUser.id === artisanId) {
        const updatedUser = { ...currentUser, verificationStatus: 'VERIFIED', kalakritiArtisanId: kalakritiId };
        setCurrentUser(updatedUser);
        localStorage.setItem('kaarigya_user', JSON.stringify(updatedUser));
      }

      showNotification(`Artisan ${updatedName || artisanId} ACCEPTED & VERIFIED! Kalakriti Artisan ID '${kalakritiId}' generated. Product registration enabled.`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to accept artisan', 'error');
    }
  };

  const rejectArtisan = async (artisanId: string) => {
    try {
      try {
        const { api } = await import('../services/api');
        await api.artisans.reject(artisanId);
      } catch (apiErr) {
        console.warn('Backend API reject call failed, local fallback:', apiErr);
      }

      let rejectedName = '';
      setArtisans(prev => prev.map(a => {
        if (a.id === artisanId) {
          rejectedName = a.name;
          return {
            ...a,
            verificationStatus: 'REJECTED',
            kalakritiArtisanId: undefined
          };
        }
        return a;
      }));

      if (currentUser && currentUser.id === artisanId) {
        const updatedUser = { ...currentUser, verificationStatus: 'REJECTED', kalakritiArtisanId: undefined };
        setCurrentUser(updatedUser);
        localStorage.setItem('kaarigya_user', JSON.stringify(updatedUser));
      }

      showNotification(`Artisan ${rejectedName || artisanId} registration request REJECTED. Product registration access remains blocked.`, 'warning');
    } catch (err: any) {
      showNotification(err.message || 'Failed to reject artisan', 'error');
    }
  };

  const showNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString();
    const newNotif: NotificationItem = {
      id,
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
    setTimeout(() => {
      dismissNotification(id);
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const login = (user: AuthUser, token: string, newRole: UserRole, onNavigate?: (path: string) => void) => {
    setCurrentUser(user);
    setAuthToken(token);
    setIsAuthenticated(true);
    setRoleState(newRole);
    try {
      localStorage.setItem('kaarigya_user', JSON.stringify(user));
      localStorage.setItem('craftpass_token', token);
    } catch (e) {}

    // Delegate navigation to the caller (AuthModal uses useNavigate)
    if (onNavigate) {
      if (newRole === 'artisan') onNavigate('/artisan/dashboard');
      else if (newRole === 'cooperative') onNavigate('/coop/overview');
      else if (newRole === 'admin') onNavigate('/admin/overview');
      else onNavigate('/');
    }
  };

  const logout = (onNavigate?: () => void) => {
    setCurrentUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setRoleState('buyer');
    try {
      localStorage.removeItem('kaarigya_user');
      localStorage.removeItem('craftpass_token');
    } catch (e) {}
    showNotification('Signed out. Switched back to public buyer workspace.', 'info');
    if (onNavigate) onNavigate();
  };

  const requireAuthForRole = (targetRole: UserRole): boolean => {
    if (targetRole === 'buyer') return true;
    if (isAuthenticated && currentUser?.role === targetRole) return true;
    
    // Trigger authentication modal
    setPendingRoleTarget(targetRole);
    setIsAuthModalOpen(true);
    showNotification(`Authentication required for ${targetRole.toUpperCase()} workspace.`, 'warning');
    return false;
  };

  const setRole = (newRole: UserRole) => {
    if (newRole === 'buyer') {
      setRoleState('buyer');
      return;
    }
    
    // Check if user has credentials for this role
    if (requireAuthForRole(newRole)) {
      setRoleState(newRole);
      showNotification(`Active Workspace: ${newRole.toUpperCase()}`, 'info');
    }
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('kaarigya_language', lang);
    } catch {
      // ignore
    }
    const langNames: Record<LanguageCode, string> = { 
      en: 'English', 
      hi: 'हिन्दी', 
      or: 'ଓଡ଼ିଆ',
      bn: 'বাংলা',
      ta: 'தமிழ்',
      te: 'తెలుగు',
      kn: 'ಕನ್ನಡ',
      mr: 'मराठी',
      gu: 'ગુજરાતી'
    };
    showNotification(`Language set to ${langNames[lang] || lang}`, 'info');
  };


  const activeProduct = products.find(p => p.productId === activeProductId) || products[0];

  const registerNewProduct = (data: Partial<ProductPassport>): ProductPassport => {
    const newIdCode = `CRAFT-00${124 + products.length}`;
    const newProduct: ProductPassport = {
      id: `prod-${Date.now()}`,
      productId: newIdCode,
      name: data.name || "Handcrafted Heritage Piece",
      craftCategory: data.craftCategory || "Traditional Handcraft",
      productType: data.productType || "Artisan Craft",
      description: data.description || "Authentic handmade Indian craft documented through Kalakriti.",
      artisan: currentArtisan,
      materials: data.materials && data.materials.length > 0 ? data.materials : ["Handspun Cotton", "Natural Dyes"],
      techniques: data.techniques && data.techniques.length > 0 ? data.techniques : ["Traditional Handcrafting"],
      creationDate: new Date().toISOString().split('T')[0],
      productionDuration: data.productionDuration || "3 Days",
      price: data.price || {
        retail: 4500,
        artisanCompensation: 2925,
        cooperativeShare: 675,
        rawMaterialsLogistics: 900,
        currency: "INR"
      },
      primaryImage: data.primaryImage || "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
      evidenceImages: data.evidenceImages || [],
      careInstructions: [
        "Spot clean gently with mild soapy water",
        "Dry naturally away from direct harsh sunlight",
        "Store in a breathable muslin cloth"
      ],
      trustLevel: {
        score: 3.8,
        maxScore: 5.0,
        factors: [
          {
            id: `tf-new-1`,
            label: "Artisan Identity Verified",
            verified: true,
            description: `${currentArtisan.name} is a verified member of ${currentArtisan.cooperativeName}.`,
            evidenceType: "Artisan ID Card",
            authority: currentArtisan.cooperativeName
          },
          {
            id: `tf-new-2`,
            label: "Cooperative Verification In-Progress",
            verified: false,
            description: "Awaiting physical field auditor signoff.",
            evidenceType: "Verification Queue",
            authority: currentArtisan.cooperativeName
          }
        ]
      },
      physicalMatch: {
        similarityPercentage: 88,
        status: "LIKELY_MATCH",
        patternMatch: true,
        makerMarkDetected: true,
        evidenceConsistency: true,
        notes: "Uploaded photographic evidence correlates with artisan workshop signature."
      },
      provenanceTimeline: [
        {
          id: `pt-new-1`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: "Product Passport Registered by Artisan",
          actor: currentArtisan.name,
          role: "Master Artisan",
          location: `${currentArtisan.district}, ${currentArtisan.state}`,
          status: "completed",
          txRef: `TX-REG-${newIdCode}`,
          description: "Photographic evidence and voice narrative registered."
        },
        {
          id: `pt-new-2`,
          date: "Pending",
          timestamp: "--",
          title: "Cooperative Audit & Seal",
          actor: currentArtisan.cooperativeName,
          role: "Cooperative Inspector",
          location: currentArtisan.cooperativeName,
          status: "in_progress",
          description: "Scheduled for quality audit and cryptographic sealing."
        }
      ],
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${newIdCode}`,
      nfcUid: `04:${Math.floor(Math.random()*90+10)}:${Math.floor(Math.random()*90+10)}:${Math.floor(Math.random()*90+10)}:80`,
      status: "pending",
      verificationHistory: []
    };

    setProducts(prev => [newProduct, ...prev]);
    setActiveProductId(newIdCode);
    showNotification(`Passport ${newIdCode} created! Status: Pending Verification`, 'success');
    return newProduct;
  };

  const approveProductVerification = (productId: string, notes?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        return {
          ...p,
          status: 'verified',
          trustLevel: {
            ...p.trustLevel,
            score: Math.min(5.0, p.trustLevel.score + 1.0),
            factors: p.trustLevel.factors.map(f => ({ ...f, verified: true }))
          },
          verificationHistory: [
            {
              id: `vh-${Date.now()}`,
              date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              reviewer: "Cooperative Lead Inspector",
              action: "APPROVED_VERIFIED",
              notes: notes || "Audited craft techniques and authenticated provenance materials."
            },
            ...p.verificationHistory
          ],
          provenanceTimeline: [
            ...p.provenanceTimeline.map(pt => pt.status === 'in_progress' ? { ...pt, status: 'completed' as const } : pt),
            {
              id: `pt-ver-${Date.now()}`,
              date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: "Cooperative Physical Verification Approved",
              actor: "Utkalika State Apex Inspector",
              role: "Auditor",
              location: "Regional Verification Center",
              status: "completed",
              description: "Artisan wage floor locked in escrow. Cryptographic passport seal validated."
            }
          ]
        };
      }
      return p;
    }));
    showNotification(`Product ${productId} verified and passport sealed!`, 'success');
  };

  const rejectProductVerification = (productId: string, reason?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        return {
          ...p,
          status: 'rejected',
          verificationHistory: [
            {
              id: `vh-${Date.now()}`,
              date: new Date().toLocaleDateString('en-GB'),
              reviewer: "Cooperative Lead Inspector",
              action: "REJECTED_CHANGES_NEEDED",
              notes: reason || "Incomplete evidence or inconsistent material documentation."
            },
            ...p.verificationHistory
          ]
        };
      }
      return p;
    }));
    showNotification(`Product ${productId} flagged for revision.`, 'warning');
  };

  const flagProductSuspicious = (productId: string, reasons: string[]) => {
    setProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        return {
          ...p,
          status: 'flagged',
          flagDetails: {
            isSuspicious: true,
            riskLevel: 'high',
            reasons,
            investigationStatus: 'pending'
          }
        };
      }
      return p;
    }));
    showNotification(`Product ${productId} flagged for counterfeit investigation.`, 'error');
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' as const } : a));
    showNotification(`Alert ${alertId} marked as resolved.`, 'success');
  };

  const resolveDispute = (
    disputeId: string, 
    resolution: 'approved_authentic' | 'confirmed_counterfeit' | 'needs_evidence' | 'escalated',
    verdictNotes?: string,
    auditorName?: string
  ) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        let verdict = d.verdict;
        let escrowStatus = d.escrowStatus;
        let legalNoticeGenerated = d.legalNoticeGenerated;

        if (resolution === 'approved_authentic') {
          verdict = verdictNotes || 'Authentic Handicraft Approved. Full artisan compensation unlocked from escrow.';
          escrowStatus = 'released_to_artisan';
        } else if (resolution === 'confirmed_counterfeit') {
          verdict = verdictNotes || 'Counterfeit Infringement Confirmed. Rogue seller flagged & legal takedown notice generated.';
          escrowStatus = 'refunded_to_buyer';
          legalNoticeGenerated = true;
        } else if (resolution === 'needs_evidence') {
          verdict = verdictNotes || 'Adjudication Pending: Formal requisition issued for supplementary macro photography or lab spectroscopy.';
          escrowStatus = 'locked_in_escrow';
        } else if (resolution === 'escalated') {
          verdict = verdictNotes || 'Escalated to Ministry of Textiles & National Cyber Crime Unit for commercial syndicate investigation.';
          escrowStatus = 'frozen_for_investigation';
          legalNoticeGenerated = true;
        }

        return {
          ...d,
          status: resolution,
          verdict,
          verdictNotes: verdictNotes || d.verdictNotes,
          verdictDate: today,
          assignedAuditor: auditorName || d.assignedAuditor || 'Bipin Nayak (Senior Guild Inspector)',
          escrowStatus,
          legalNoticeGenerated,
          legalNoticeRef: legalNoticeGenerated ? (d.legalNoticeRef || `CD-GI-2026-TRIB-${Math.floor(1000 + Math.random() * 9000)}`) : d.legalNoticeRef
        };
      }
      return d;
    }));

    if (resolution === 'approved_authentic') {
      showNotification(`Dispute ${disputeId}: Verdict Approved as Genuine Authentic Craft. Escrow unlocked to artisan.`, 'success');
    } else if (resolution === 'confirmed_counterfeit') {
      showNotification(`Dispute ${disputeId}: Verdict Recorded as Confirmed Counterfeit. Legal Notice Generated.`, 'error');
    } else if (resolution === 'escalated') {
      showNotification(`Dispute ${disputeId}: Case Escalated to Ministry & Law Enforcement Cell.`, 'warning');
    } else {
      showNotification(`Dispute ${disputeId}: Additional inspection notice dispatched.`, 'info');
    }
  };

  const fileNewDispute = (data: Partial<DisputeCase>): DisputeCase => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const disputeCode = `DISP-D${randomNum}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newDispute: DisputeCase = {
      id: `disp-${Date.now()}`,
      disputeCode,
      caseNumber: `CASE #${disputeCode}`,
      productId: data.productId || 'CRAFT-00124',
      productName: data.productName || 'Handcrafted Heritage Piece',
      buyerName: data.buyerName || 'Verified Buyer',
      buyerContact: data.buyerContact || 'buyer@example.com',
      buyerComplaint: data.buyerComplaint || 'Claim regarding craft authenticity, material composition, or passport integrity.',
      buyerClaim: data.buyerClaim || data.buyerComplaint || 'Counterfeit claim filed.',
      artisanName: data.artisanName || currentArtisan.name,
      artisanAvatar: data.artisanAvatar || currentArtisan.avatar,
      cooperativeName: data.cooperativeName || 'Utkalika State Handicraft Apex Co-op',
      cooperativeId: data.cooperativeId || 'coop-utkalika',
      aiRiskScore: data.aiRiskScore !== undefined ? data.aiRiskScore : 65,
      aiRiskAssessment: data.aiRiskScore !== undefined ? data.aiRiskScore : 65,
      filingDate: today,
      filedDate: today,
      escrowStatus: 'locked_in_escrow',
      escrowAmount: data.escrowAmount || 4500,
      currency: 'INR',
      transactionRef: data.transactionRef || `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`,
      marketplacePlatform: data.marketplacePlatform || 'GlobalCraftBazaar.com (Third-Party Seller)',
      artisanResponse: data.artisanResponse || 'The artisan affirms craft genuineness according to traditional GI production standards.',
      evidenceList: data.evidenceList && data.evidenceList.length > 0 ? data.evidenceList : [
        {
          id: `ev-disp-${Date.now()}-1`,
          title: "Initial Complaint Documentation & Received Tag Scan",
          type: "document",
          verified: true,
          timestamp: today,
          submittedBy: data.buyerName || 'Buyer',
          notes: "Digital passport scan logged from unauthorized sales terminal."
        }
      ],
      status: 'open',
      assignedAuditor: data.assignedAuditor || 'Bipin Nayak (Senior Guild Inspector)',
      blockchainHash: `0x${Array.from({ length: 56 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };

    setDisputes(prev => [newDispute, ...prev]);
    showNotification(`New Dispute Case ${disputeCode} registered in Tribunal Registry!`, 'success');
    return newDispute;
  };

  const addDisputeEvidence = (
    disputeId: string, 
    evidence: { title: string; type?: string; verified?: boolean; url?: string; notes?: string; submittedBy?: string }
  ) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newEvidenceItem = {
      id: `ev-disp-${Date.now()}`,
      title: evidence.title,
      type: evidence.type || 'document',
      verified: evidence.verified !== undefined ? evidence.verified : true,
      url: evidence.url,
      timestamp: `${today}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      submittedBy: evidence.submittedBy || 'Cooperative Auditor',
      notes: evidence.notes || 'Forensic evidentiary item logged into case tribunal record.'
    };

    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          evidenceList: [newEvidenceItem, ...d.evidenceList]
        };
      }
      return d;
    }));

    showNotification(`Forensic Evidence '${evidence.title}' added to case file.`, 'success');
  };

  const generateDisputeLegalNotice = (disputeId: string) => {
    const noticeRef = `CD-GI-2026-TRIB-${Math.floor(1000 + Math.random() * 9000)}`;
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          legalNoticeGenerated: true,
          legalNoticeRef: noticeRef
        };
      }
      return d;
    }));
    showNotification(`Official Cease & Desist Legal Notice ${noticeRef} generated under GI Act Sec 38/39!`, 'warning');
  };

  const releaseDisputeEscrow = (disputeId: string, target: 'artisan' | 'buyer') => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          escrowStatus: target === 'artisan' ? 'released_to_artisan' : 'refunded_to_buyer'
        };
      }
      return d;
    }));
    showNotification(
      target === 'artisan'
        ? `Escrow settlement released directly to artisan bank account via PFMS.`
        : `Escrow refund dispatched back to buyer payment account.`,
      'success'
    );
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        t,
        isAuthenticated,
        currentUser,
        authToken,
        isAuthModalOpen,
        setIsAuthModalOpen,
        pendingRoleTarget,
        setPendingRoleTarget,
        login,
        logout,
        requireAuthForRole,
        activeProductId,
        setActiveProductId,
        products,
        activeProduct,
        alerts,
        disputes,
        artisans,
        pendingArtisans,
        currentArtisan,
        registerArtisan,
        acceptArtisan,
        rejectArtisan,
        registerNewProduct,
        approveProductVerification,
        rejectProductVerification,
        flagProductSuspicious,
        resolveAlert,
        resolveDispute,
        fileNewDispute,
        addDisputeEvidence,
        generateDisputeLegalNotice,
        releaseDisputeEscrow,
        isQRScannerOpen,
        setIsQRScannerOpen,
        isPhysicalMatchOpen,
        setIsPhysicalMatchOpen,
        notifications,
        showNotification,
        dismissNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
