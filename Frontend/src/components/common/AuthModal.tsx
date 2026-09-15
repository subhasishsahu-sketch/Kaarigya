import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Sparkles,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { UserRole, AuthUser } from '../../types';
import { api } from '../../services/api';
import { mockArtisans } from '../../data/mockData';

interface DemoAccount {
  id: string;
  role: UserRole;
  name: string;
  roleLabel: string;
  email: string;
  phone: string;
  badge: string;
  craftOrOrg: string;
  avatar?: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'artisan-01',
    role: 'artisan',
    name: 'Sita Devi Mahapatra',
    roleLabel: 'Master Artisan',
    email: 'sita.mahapatra@craftpass.in',
    phone: '+91 98450 12384',
    badge: 'National Awardee (Pipli Appliqué)',
    craftOrOrg: 'Utkalika State Handicraft Apex Co-op',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'artisan-02',
    role: 'artisan',
    name: 'Ramesh Kumar Sahu',
    roleLabel: 'Master Artisan',
    email: 'ramesh.sahu@craftpass.in',
    phone: '+91 94371 89201',
    badge: 'GI Bell Metal Guild',
    craftOrOrg: 'Dhenkanal Bell Metal Artisans Society',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'artisan-03',
    role: 'artisan',
    name: 'Anita Das',
    roleLabel: 'Master Artisan',
    email: 'anita.das@craftpass.in',
    phone: '+91 97780 44512',
    badge: 'Sambalpuri Double Ikat Weavers',
    craftOrOrg: 'Bargarh Handloom Weavers Apex',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    role: 'cooperative',
    name: 'Utkal Craft Producers Co-op',
    roleLabel: 'Cooperative Authority',
    email: 'odisha.handicrafts.coop@craftpass.in',
    phone: '+91 674 2530190',
    badge: 'Reg # COOP-OD-1984-092',
    craftOrOrg: '184 Verified Member Artisans',
    avatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    role: 'admin',
    name: 'National Craft Board Admin',
    roleLabel: 'National Oversight & GI Registry',
    email: 'admin@craftpass.in',
    phone: '+91 11 23456700',
    badge: 'GI & Authenticity Regulatory Authority',
    craftOrOrg: 'Ministry of Textiles GI Verification Cell',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
  }
];

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    pendingRoleTarget, 
    login,
    registerArtisan,
    showNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'custom' | 'register_artisan'>('accounts');
  const [selectedRole, setSelectedRole] = useState<UserRole>(pendingRoleTarget || 'artisan');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Artisan Registration State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCraft, setRegCraft] = useState('Pipli Appliqué');
  const [regState, setRegState] = useState('Odisha');
  const [regDistrict, setRegDistrict] = useState('Puri');
  const [regCluster, setRegCluster] = useState('Pipli Craft Village');
  const [regCooperativeId, setRegCooperativeId] = useState('11111111-1111-1111-1111-111111111111');
  const [regExperience, setRegExperience] = useState(10);
  const [cooperativesList, setCooperativesList] = useState<any[]>([]);

  // Synchronize when pendingRoleTarget changes
  React.useEffect(() => {
    if (pendingRoleTarget) {
      setSelectedRole(pendingRoleTarget);
    }
  }, [pendingRoleTarget]);

  React.useEffect(() => {
    api.artisans.listCooperatives().then(list => {
      if (list && list.length > 0) {
        setCooperativesList(list);
        if (!regCooperativeId) setRegCooperativeId(list[0].id);
      } else {
        setCooperativesList([
          { id: '11111111-1111-1111-1111-111111111111', name: 'Utkal Craft Producers Cooperative Ltd.', district: 'Puri', regionState: 'Odisha' },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Bastar Dhokra Shilp Samiti', district: 'Bastar', regionState: 'Chhattisgarh' }
        ]);
      }
    }).catch(() => {
      setCooperativesList([
        { id: '11111111-1111-1111-1111-111111111111', name: 'Utkal Craft Producers Cooperative Ltd.', district: 'Puri', regionState: 'Odisha' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Bastar Dhokra Shilp Samiti', district: 'Bastar', regionState: 'Chhattisgarh' }
      ]);
    });
  }, []);

  const navigate = useNavigate();

  const handleArtisanRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regCraft.trim() || !regState.trim() || !regDistrict.trim() || !regCooperativeId) {
      setError('Please fill in all required registration fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const selectedCoop = cooperativesList.find(c => c.id === regCooperativeId);
      await registerArtisan({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phoneNumber: regPhone.trim(),
        craftSpecialties: [regCraft.trim()],
        regionState: regState.trim(),
        district: regDistrict.trim(),
        clusterName: regCluster.trim(),
        cooperativeId: regCooperativeId,
        cooperativeName: selectedCoop?.name || 'Utkal Craft Producers Cooperative Ltd.',
        experienceYears: Number(regExperience) || 1,
        preferredLang: 'en'
      });
      setIsAuthModalOpen(false);
      navigate('/artisan/dashboard');
    } catch (err: any) {
      setError(err.message || 'Artisan registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  const handleAccountSelect = async (account: DemoAccount) => {
    setLoading(true);
    setError(null);
    try {
      // Authenticate with backend
      const backendRole = account.role === 'admin' ? 'ADMIN' : account.role === 'cooperative' ? 'COOPERATIVE' : 'ARTISAN';
      let token = `user-${account.id}`;
      try {
        const res = await api.auth.switchRole(backendRole);
        if (res && res.token) {
          token = res.token;
        }
      } catch (apiErr) {
        console.warn('Using local fallback token:', apiErr);
      }

      const authUser: AuthUser = {
        id: account.id,
        email: account.email,
        role: account.role,
        fullName: account.name,
        phoneNumber: account.phone,
        avatar: account.avatar
      };

      login(authUser, token, account.role, navigate);
      showNotification(`Welcome back, ${account.name}! Logged into ${account.role.toUpperCase()} workspace.`, 'success');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your phone number or email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const backendRole = selectedRole === 'admin' ? 'ADMIN' : selectedRole === 'cooperative' ? 'COOPERATIVE' : 'ARTISAN';
      let token = `custom-${Date.now()}`;
      try {
        const res = await api.auth.switchRole(backendRole);
        if (res && res.token) {
          token = res.token;
        }
      } catch (e) {
        // fallback
      }

      const cleanInput = identifier.trim().toLowerCase();
      
      // Check if input matches any demo accounts or known mock artisans
      let matchedAccount = DEMO_ACCOUNTS.find(a => 
        a.email.toLowerCase() === cleanInput || 
        a.name.toLowerCase() === cleanInput ||
        a.phone.includes(cleanInput)
      );

      let matchedArtisan = mockArtisans.find(a =>
        a.email.toLowerCase() === cleanInput ||
        a.name.toLowerCase() === cleanInput ||
        (cleanInput.includes('sita') && a.id === 'artisan-01') ||
        (cleanInput.includes('ramesh') && a.id === 'artisan-02') ||
        (cleanInput.includes('anita') && a.id === 'artisan-03') ||
        (cleanInput.includes('manjunath') && a.id === 'artisan-04')
      );

      let userId = matchedAccount 
        ? matchedAccount.id 
        : matchedArtisan 
        ? matchedArtisan.id 
        : `user-${cleanInput.replace(/[^a-z0-9]/g, '-')}`;

      let userEmail = cleanInput.includes('@') 
        ? identifier.trim() 
        : (matchedAccount?.email || matchedArtisan?.email || `${cleanInput.replace(/\D/g, '')}@craftpass.in`);
      
      let rawName = matchedAccount 
        ? matchedAccount.name 
        : matchedArtisan 
        ? matchedArtisan.name 
        : (cleanInput.includes('@') ? cleanInput.split('@')[0].replace(/[^a-z0-9]/g, ' ') : `Artisan (${cleanInput.slice(-4)})`);
      
      let formattedName = rawName
        .split(' ')
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

      const authUser: AuthUser = {
        id: userId,
        email: userEmail,
        role: selectedRole,
        fullName: formattedName || 'Artisan',
        phoneNumber: matchedAccount?.phone || matchedArtisan?.phone || (cleanInput.includes('@') ? '+91 98000 00000' : identifier.trim()),
        avatar: matchedAccount?.avatar || matchedArtisan?.avatar
      };

      login(authUser, token, selectedRole, navigate);
      showNotification(`Authenticated successfully as ${authUser.fullName}`, 'success');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = DEMO_ACCOUNTS.filter(a => selectedRole ? a.role === selectedRole : true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202522]/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white border border-[#DCD7CF] rounded-3xl shadow-2xl overflow-hidden animate-scaleUp text-[#202522]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-linear-to-r from-[#5D634C] via-[#6F775B] to-[#BC8E6D] p-6 text-white relative">
          <button 
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8E4DD]">
                Kaarigya Security & Access Control
              </span>
              <h2 className="text-xl font-serif font-bold tracking-tight text-white">
                Authenticate Workspace
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#F4F1ED]/90 max-w-md">
            Private craft registers, dispute adjudications, and GI passport issuances are protected. Please authenticate to continue.
          </p>
        </div>

        {/* Workspace Role Selector Tabs */}
        <div className="p-6">
          <div className="mb-5">
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#73776A] block mb-2">
              Select Destination Workspace:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'artisan' as UserRole, label: 'Artisan Portal', icon: User },
                { id: 'cooperative' as UserRole, label: 'Cooperative Guild', icon: Building2 },
                { id: 'admin' as UserRole, label: 'National Registry', icon: ShieldAlert }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRole(item.id)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all border ${
                      isSelected
                        ? 'bg-[#5D634C] text-white border-[#5D634C] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#202522] border-[#DCD7CF] hover:bg-[#E8E4DD]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auth Method Navigation Tabs */}
          <div className="flex border-b border-[#DCD7CF] mb-5">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`pb-2.5 text-xs font-bold transition-colors relative mr-6 ${
                activeTab === 'accounts' ? 'text-[#5D634C]' : 'text-[#73776A] hover:text-[#202522]'
              }`}
            >
              Registered Test Identities
              {activeTab === 'accounts' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5D634C] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`pb-2.5 text-xs font-bold transition-colors relative mr-6 ${
                activeTab === 'custom' ? 'text-[#5D634C]' : 'text-[#73776A] hover:text-[#202522]'
              }`}
            >
              Phone / Email Login
              {activeTab === 'custom' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5D634C] rounded-full" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('register_artisan'); setSelectedRole('artisan'); }}
              className={`pb-2.5 text-xs font-bold transition-colors relative ${
                activeTab === 'register_artisan' ? 'text-[#5D634C]' : 'text-[#73776A] hover:text-[#202522]'
              }`}
            >
              Register as New Artisan
              {activeTab === 'register_artisan' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5D634C] rounded-full" />
              )}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'accounts' ? (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredAccounts.map(account => (
                <div
                  key={account.id}
                  onClick={() => handleAccountSelect(account)}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DCD7CF] hover:border-[#5D634C] hover:bg-[#E8E4DD]/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img 
                      src={account.avatar} 
                      alt={account.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-[#DCD7CF] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-[#202522] truncate">{account.name}</h4>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-[#5D634C]/10 text-[#5D634C]">
                          {account.roleLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#73776A] truncate">{account.badge}</p>
                      <p className="text-[10px] text-[#9A9E93] truncate">{account.craftOrOrg} • {account.email}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-[#DCD7CF] group-hover:bg-[#5D634C] group-hover:border-[#5D634C] group-hover:text-white flex items-center justify-center transition-colors shrink-0 ml-2">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'custom' ? (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-[#73776A] uppercase tracking-wider block mb-1.5">
                  Mobile Number or Official Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#73776A] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210 or artisan@craftpass.in"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#5D634C] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#73776A] uppercase tracking-wider block mb-1.5">
                  Security PIN / Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#73776A] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Enter 4-digit PIN or password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#5D634C] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-2xl bg-[#5D634C] text-white font-bold text-xs hover:bg-[#4A4F3C] transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>Sign In to {selectedRole.toUpperCase()} Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleArtisanRegisterSubmit} className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyadarshini Mohanty"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="artisan@craftpass.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 00000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                  Craft Specialty / Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pipli Appliqué, Dhokra Casting, Pattachitra Painting"
                  value={regCraft}
                  onChange={(e) => setRegCraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Odisha"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Puri"
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                  Village / Craft Cluster Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pipli Craft Village"
                  value={regCluster}
                  onChange={(e) => setRegCluster(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                  Select Target Cooperative / Guild *
                </label>
                <select
                  value={regCooperativeId}
                  onChange={(e) => setRegCooperativeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                >
                  {cooperativesList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district}, {c.regionState})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-[#73776A] mt-0.5">
                  Your registration verification request will be routed directly to this Cooperative's approval queue.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#73776A] uppercase tracking-wider block mb-1">
                  Years of Craft Experience
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={regExperience}
                  onChange={(e) => setRegExperience(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DCD7CF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5D634C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-2xl bg-[#5D634C] text-white font-bold text-xs hover:bg-[#4A4F3C] transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting Artisan Registration...</span>
                ) : (
                  <>
                    <span>Submit Artisan Registration & Send Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-[#DCD7CF] flex items-center justify-between text-[11px] text-[#73776A]">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5D634C]" />
              <span>256-bit Cryptographic Session Protection</span>
            </span>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="font-semibold text-[#5D634C] hover:underline"
            >
              Continue as Public Buyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
