import React from 'react';
import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { ProtectedRoute } from '../../components/shared/ProtectedRoute';
import { Layout } from '../../components/shared/Layout';
import { useApp } from '../../context/AppContext';

// Buyer Views
import { BuyerLanding } from '../../components/buyer/BuyerLanding';
import { ProductPassportView } from '../../components/buyer/ProductPassportView';
import { CounterfeitAlertView } from '../../components/buyer/CounterfeitAlertView';
import { PublicVerificationPage } from '../../components/buyer/PublicVerificationPage';

// Artisan Views
import { ArtisanDashboard } from '../../components/artisan/ArtisanDashboard';
import { ProductRegisterWizard } from '../../components/artisan/ProductRegisterWizard';
import { ArtisanProductList } from '../../components/artisan/ArtisanProductList';
import { ArtisanProfileView } from '../../components/artisan/ArtisanProfileView';

// Cooperative Views
import { CooperativeDashboard } from '../../components/cooperative/CooperativeDashboard';
import { VerificationQueue } from '../../components/cooperative/VerificationQueue';
import { CounterfeitIntelligence } from '../../components/cooperative/CounterfeitIntelligence';
import { ArtisanManagement } from '../../components/cooperative/ArtisanManagement';
import { CompensationDashboard } from '../../components/cooperative/CompensationDashboard';
import { DisputeManagement } from '../../components/cooperative/DisputeManagement';

// National Admin View
import { NationalAdminDashboard } from '../../components/admin/NationalAdminDashboard';

// Helper component to pass the initial product ID to PublicVerificationPage if any
const PublicVerificationWrapper = () => {
  const { productId } = useParams<{ productId: string }>();
  const { activeProductId } = useApp();
  const targetId = productId || activeProductId;
  return <PublicVerificationPage initialProductId={targetId} onBack={() => window.history.back()} />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<BuyerLanding />} />
        <Route path="verify-passport" element={<ProductPassportView />} />
        <Route path="public-verify" element={<PublicVerificationWrapper />} />
        <Route path="verify/:productId" element={<PublicVerificationWrapper />} />
        <Route path="counterfeit-alert" element={<CounterfeitAlertView />} />

        {/* Artisan Routes */}
        <Route 
          path="artisan" 
          element={
            <ProtectedRoute allowedRole="artisan">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ArtisanDashboard />} />
          <Route path="register" element={<ProductRegisterWizard />} />
          <Route path="products" element={<ArtisanProductList />} />
          <Route path="profile" element={<ArtisanProfileView />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Cooperative Routes */}
        <Route 
          path="coop" 
          element={
            <ProtectedRoute allowedRole="cooperative">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="overview" element={<CooperativeDashboard />} />
          <Route path="verification" element={<VerificationQueue />} />
          <Route path="alerts" element={<CounterfeitIntelligence />} />
          <Route path="artisans" element={<ArtisanManagement />} />
          <Route path="compensation" element={<CompensationDashboard />} />
          <Route path="disputes" element={<DisputeManagement />} />
          <Route index element={<Navigate to="overview" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="admin" 
          element={
            <ProtectedRoute allowedRole="admin">
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="overview" element={<NationalAdminDashboard />} />
          <Route index element={<Navigate to="overview" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
