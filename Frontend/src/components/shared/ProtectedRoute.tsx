import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Lock, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'artisan' | 'cooperative' | 'admin';
}

const AccessRestrictedGate: React.FC<{ targetRole: 'artisan' | 'cooperative' | 'admin' }> = ({ targetRole }) => {
  const { setIsAuthModalOpen, setPendingRoleTarget } = useApp();
  
  return (
    <div className="max-w-xl mx-auto my-16 px-4">
      <div className="p-8 bg-white border border-[#DCD7CF] rounded-3xl shadow-xl text-center animate-scaleUp">
        <div className="w-16 h-16 rounded-3xl bg-[#5D634C]/10 text-[#5D634C] mx-auto flex items-center justify-center mb-4 border border-[#5D634C]/20">
          <Lock className="w-7 h-7 text-[#5D634C]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BC8E6D] block mb-1">
          Restricted Workspace
        </span>
        <h2 className="text-2xl font-serif font-bold text-[#202522] mb-3">
          Authentication Required
        </h2>
        <p className="text-xs text-[#73776A] mb-6 leading-relaxed max-w-md mx-auto">
          Access to the <strong className="text-[#202522] uppercase">{targetRole}</strong> workspace is private. Please sign in to verify your credentials, access registered crafts, and manage passports.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setPendingRoleTarget(targetRole);
              setIsAuthModalOpen(true);
            }}
            className="px-6 py-3 bg-[#5D634C] text-white font-bold text-xs rounded-2xl hover:bg-[#4A4F3C] transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <span>Sign In to {targetRole.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-[#FAF8F5] border border-[#DCD7CF] text-[#202522] font-semibold text-xs rounded-2xl hover:bg-[#E8E4DD] transition-all flex items-center justify-center"
          >
            Return to Public Portal
          </a>
        </div>
      </div>
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { isAuthenticated, currentUser } = useApp();

  if (!isAuthenticated || currentUser?.role !== allowedRole) {
    return <AccessRestrictedGate targetRole={allowedRole} />;
  }

  return <>{children}</>;
};
