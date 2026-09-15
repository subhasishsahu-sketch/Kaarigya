import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  QrCode, 
  User, 
  Building2, 
  ShieldAlert, 
  Globe, 
  ChevronDown,
  Menu,
  X,
  Search,
  Lock,
  LogOut,
  KeyRound
} from 'lucide-react';
import { UserRole, LanguageCode } from '../../types';
import logo from '../../assets/logo.jpeg';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    role, 
    setRole, 
    language, 
    setLanguage,
    t, 
    setIsQRScannerOpen,
    isAuthenticated,
    currentUser,
    logout,
    setIsAuthModalOpen,
    setPendingRoleTarget,
    setActiveProductId
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [quickSearchId, setQuickSearchId] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchId.trim()) {
      const id = quickSearchId.trim().toUpperCase();
      setActiveProductId(id);
      navigate('/verify-passport');
      setQuickSearchId('');
    }
  };

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const activeClass = 'bg-[#5D634C] text-[#FAF8F5]';
  const inactiveClass = 'text-[#2C2E29]/80 hover:text-[#2C2E29] hover:bg-[#E8E4DD]';
  const navBtn = (path: string, label: string, extra?: string) => (
    <button
      key={path}
      onClick={() => navigate(path)}
      className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${isActive(path) ? activeClass : inactiveClass} ${extra || ''}`}
    >
      {label}
    </button>
  );

  const rolesList: { id: UserRole; label: string; icon: typeof User; badge: string }[] = [
    { id: 'buyer', label: 'Buyer & Collector', icon: ShieldCheck, badge: 'Public Verification' },
    { id: 'artisan', label: 'Artisan Portal', icon: User, badge: 'Craft Registry' },
    { id: 'cooperative', label: 'Cooperative Guild', icon: Building2, badge: 'Verification & Quality' },
    { id: 'admin', label: 'National Registry', icon: ShieldAlert, badge: 'Trust & Governance' }
  ];

  const languagesList: { code: LanguageCode; label: string; native: string; region: string }[] = [
    { code: 'en', label: 'English', native: 'English', region: 'Pan-India / Global' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', region: 'North & Central' },
    { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা', region: 'Bengal & East' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు', region: 'AP & Telangana' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
    { code: 'mr', label: 'Marathi', native: 'मराठी', region: 'Maharashtra' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat' }
  ];

  const handleLogoClick = () => {
    if (role === 'artisan') navigate('/artisan/dashboard');
    else if (role === 'cooperative') navigate('/coop/overview');
    else if (role === 'admin') navigate('/admin/overview');
    else navigate('/');
  };

  const handleLogout = () => {
    logout(() => navigate('/'));
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#DCD7CF] transition-all print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer shrink-0" 
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 rounded-xl bg-[#5D634C] flex items-center justify-center shadow-xs border border-[#5D634C]/20 transition-transform hover:scale-105 overflow-hidden">
              <img src={logo} alt="App Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl font-bold tracking-tight text-[#2C2E29]">Kaarigya</span>
                <span className="text-[9px] uppercase font-bold tracking-[0.15em] px-2 py-0.5 rounded-full bg-[#E8E4DD] text-[#5D634C] border border-[#DCD7CF]">
                  DPP
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#73776A] font-semibold hidden xl:block">
                Digital Product Passports • Provenance Ledger
              </p>
            </div>
          </div>

          {/* Quick Product ID Search (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-60 lg:w-72">
            <Search className="w-4 h-4 text-[#73776A] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ID (e.g. CRAFT-00124)"
              value={quickSearchId}
              onChange={(e) => setQuickSearchId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] placeholder-[#73776A]/60 focus:outline-none focus:ring-1 focus:ring-[#5D634C] focus:border-[#5D634C] transition-all shadow-2xs h-10"
            />
          </form>

          {/* Navigation Links according to Role */}
          <nav className="hidden md:flex items-center space-x-1">
            {role === 'buyer' && (
              <>{navBtn('/', t.navHome)}</>
            )}
            {role === 'artisan' && (
              <>
                {navBtn('/artisan/dashboard', t.dashboard)}
                <button
                  onClick={() => navigate('/artisan/register')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${isActive('/artisan/register') ? 'bg-[#BC8E6D] text-white shadow-xs' : 'bg-[#BC8E6D]/15 text-[#BC8E6D] hover:bg-[#BC8E6D]/25'}`}
                >
                  + {t.registerProductBtn}
                </button>
                {navBtn('/artisan/products', t.navProducts)}
                {navBtn('/artisan/profile', t.navProfile)}
              </>
            )}
            {role === 'cooperative' && (
              <>
                {navBtn('/coop/overview', t.overview)}
                {navBtn('/coop/verification', t.navVerificationQueue)}
                {navBtn('/coop/alerts', t.navAlerts)}
                {navBtn('/coop/compensation', t.navCompensation)}
                {navBtn('/coop/disputes', t.navDisputes)}
              </>
            )}
            {role === 'admin' && (
              <>
                {navBtn('/admin/overview', t.systemAudit)}
                {navBtn('/admin/users', 'Artisans & Clusters')}
              </>
            )}
          </nav>

          {/* Controls: Scan Tag, Language, Role Switcher, Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Scan Tag Button */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#5D634C] text-[#FAF8F5] text-xs font-semibold rounded-xl hover:bg-[#4A4F3C] transition-all shadow-2xs h-10"
              title="Scan physical QR code or tag"
            >
              <QrCode className="w-4 h-4 text-[#E8E4DD]" />
              <span className="hidden sm:inline">Scan Tag</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="inline-flex items-center space-x-1.5 px-3 py-2.5 bg-white border border-[#DCD7CF] rounded-xl text-xs font-semibold text-[#2C2E29] hover:bg-[#E8E4DD] transition-colors shadow-2xs h-10"
                title="Select language"
              >
                <Globe className="w-3.5 h-3.5 text-[#5D634C]" />
                <span className="max-w-[65px] truncate">{languagesList.find(l => l.code === language)?.native}</span>
                <ChevronDown className="w-3 h-3 text-[#73776A]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 max-h-80 bg-white border border-[#DCD7CF] rounded-2xl shadow-xl py-1.5 z-50 text-xs overflow-y-auto divide-y divide-[#E8E4DD]/50">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#73776A] uppercase tracking-wider bg-[#FAF8F5]">
                    Select Language
                  </div>
                  <div className="py-1">
                    {languagesList.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#F4F1ED] transition-colors ${
                          language === lang.code ? 'font-bold text-[#5D634C] bg-[#E8E4DD]/40' : 'text-[#2C2E29]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-[#2C2E29]">{lang.native}</div>
                          <div className="text-[10px] text-[#73776A]">{lang.label}</div>
                        </div>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#73776A] border border-[#DCD7CF]">
                          {lang.code.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-[#E8E4DD] border border-[#DCD7CF] rounded-xl text-xs font-semibold text-[#2C2E29] hover:bg-[#DDD8D0] transition-colors shadow-2xs h-10"
                title="Switch platform workspace"
              >
                <span className={`w-2 h-2 rounded-full ${isAuthenticated && role !== 'buyer' ? 'bg-emerald-600' : 'bg-[#BC8E6D]'}`} />
                <span className="capitalize font-semibold">{rolesList.find(r => r.id === role)?.label.split(' ')[0] || role}</span>
                <ChevronDown className="w-3 h-3 text-[#73776A]" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#DCD7CF] rounded-2xl shadow-xl py-2 z-50 text-xs divide-y divide-[#E8E4DD] overflow-hidden">
                  <div className="px-4 py-1.5 text-[10px] font-bold text-[#73776A] uppercase tracking-[0.2em] flex items-center justify-between">
                    <span>Workspaces</span>
                    {isAuthenticated && (
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold border border-emerald-200">
                        Authenticated
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    {rolesList.map(r => {
                      const IconComp = r.icon;
                      const isCurrent = role === r.id;
                      const isPrivate = r.id !== 'buyer';
                      const isAuthForThis = isAuthenticated && currentUser?.role === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => {
                            setRole(r.id);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 hover:bg-[#F4F1ED] transition-colors ${
                            isCurrent ? 'bg-[#E8E4DD]/50 font-bold text-[#5D634C]' : 'text-[#2C2E29]'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#E8E4DD] flex items-center justify-center shrink-0">
                            <IconComp className="w-4 h-4 text-[#5D634C]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs flex items-center space-x-1.5">
                              <span>{r.label}</span>
                              {isPrivate && !isAuthForThis && (
                                <Lock className="w-3 h-3 text-[#73776A]" />
                              )}
                            </div>
                            <div className="text-[10px] text-[#73776A] font-normal">{r.badge}</div>
                          </div>
                          {isCurrent && (
                            <span className="text-[#5D634C] font-bold">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Session Status & Sign In / Sign Out Button */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-2 pl-1 border-l border-[#DCD7CF]">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCD7CF] shadow-2xs h-10">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.fullName} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#5D634C] text-white flex items-center justify-center text-[10px] font-bold">
                      {currentUser?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#2C2E29] max-w-[90px] truncate">
                    {currentUser?.fullName?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-[#73776A] hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors h-10 w-10 flex items-center justify-center border border-[#DCD7CF]"
                  title="Sign out of workspace"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setPendingRoleTarget(role === 'buyer' ? 'artisan' : role);
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-[#5D634C] text-[#5D634C] text-xs font-bold rounded-xl hover:bg-[#5D634C] hover:text-white transition-all shadow-2xs h-10"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#2C2E29] hover:bg-[#E8E4DD] rounded-xl border border-[#DCD7CF]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#DCD7CF] px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-[#73776A] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Product ID (e.g. CRAFT-00124)"
              value={quickSearchId}
              onChange={(e) => setQuickSearchId(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#DCD7CF] rounded-xl text-[#2C2E29] focus:outline-none"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {role === 'buyer' && (
              <>
                <button
                  onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                  className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-[#E8E4DD] text-[#2C2E29]"
                >
                  {t.navHome}
                </button>
              </>
            )}
            {role === 'artisan' && (
              <>
                <button onClick={() => { navigate('/artisan/dashboard'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-[#E8E4DD] text-[#2C2E29]">{t.dashboard}</button>
                <button onClick={() => { navigate('/artisan/register'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-[#BC8E6D] text-white">+ {t.registerProductBtn}</button>
                <button onClick={() => { navigate('/artisan/products'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-white border border-[#DCD7CF]">{t.navProducts}</button>
                <button onClick={() => { navigate('/artisan/profile'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-white border border-[#DCD7CF]">{t.navProfile}</button>
              </>
            )}
            {role === 'cooperative' && (
              <>
                <button onClick={() => { navigate('/coop/overview'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-[#E8E4DD] text-[#2C2E29]">{t.overview}</button>
                <button onClick={() => { navigate('/coop/verification'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-white border border-[#DCD7CF]">{t.navVerificationQueue}</button>
                <button onClick={() => { navigate('/coop/alerts'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-white border border-[#DCD7CF]">{t.navAlerts}</button>
                <button onClick={() => { navigate('/coop/compensation'); setMobileMenuOpen(false); }} className="px-3 py-2 text-left text-xs font-semibold rounded-full bg-white border border-[#DCD7CF]">{t.navCompensation}</button>
              </>
            )}
          </div>

          {/* Mobile Auth Button */}
          <div className="pt-2 border-t border-[#DCD7CF]">
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#DCD7CF]">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#5D634C] text-white flex items-center justify-center text-xs font-bold">
                    {currentUser?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#202522]">{currentUser?.fullName}</div>
                    <div className="text-[10px] text-[#73776A] uppercase">{role} Workspace</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setPendingRoleTarget('artisan');
                  setIsAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#5D634C] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In to Workspace</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
