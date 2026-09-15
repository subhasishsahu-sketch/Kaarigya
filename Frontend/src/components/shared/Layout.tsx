import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { ToastNotifications } from '../common/ToastNotifications';
import { QRScannerModal } from '../buyer/QRScannerModal';
import { AuthModal } from '../common/AuthModal';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] text-[#202522] selection:bg-[#B85C45] selection:text-white">
      {/* Main Header with navigation and view switching */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global QR / NFC Verification Scanner Modal */}
      <QRScannerModal />

      {/* Global Workspace Authentication Modal */}
      <AuthModal />

      {/* Dynamic Toast Notifications */}
      <ToastNotifications />
    </div>
  );
};
