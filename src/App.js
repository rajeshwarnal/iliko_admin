import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Auth
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminMerchants from './pages/admin/Merchant';
import AdminTransactions from './pages/admin/Transactions';
import AdminCustomers from './pages/admin/Customer';

import AdminBanners from './pages/admin/Banners';
import AdminPromos from './pages/admin/Promos';

// Merchant Pages
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantTransactions from './pages/merchant/Transactions';
import MerchantQRScanner from './pages/merchant/QRscanner';
import AdminLoyaltyLevels from './pages/admin/LoyaltyLevels';
import AdminCMSTerms from './pages/admin/CMSTerms';
import AdminCMSPrivacy from './pages/admin/CMSPrivacy';
import AdminCMSHelp from './pages/admin/CMSHelp';
import AdminCMSRules from './pages/admin/CMSRules';
import AdminPendingApprovals from './pages/admin/PendingApprovals';
import AdminCategories from './pages/admin/Categories';
import AdminSettings from './pages/admin/Settings';
import MerchantCustomers from './pages/merchant/MerchantCustomers';
import MerchantSettings from './pages/merchant/MerchantSettings';
import MerchantWallet from './pages/merchant/MerchantWallet';
import MerchantProfileMedia from './pages/merchant/MerchantProfile';
import MerchantWalletTopup from './pages/merchant/MerchantWalletTopUp';
import MerchantBusinessHours from './pages/merchant/MerchantBusinessHours';
import MerchantRewardSettings from './pages/merchant/MerchantRewardSetting';
import MerchantPromos from './pages/merchant/MerchantPromos';
import MerchantPromoCreate from './pages/merchant/MerchantCreatePromo';
import MerchantBusinessInfo from './pages/merchant/MerchantBusinessInfo';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="merchants" element={<AdminMerchants />} />
            <Route path="merchants/pending" element={<AdminPendingApprovals />} />
            <Route path="merchants/categories" element={<AdminCategories />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers" element={<AdminMerchants />} />
            <Route path="marketing/banners" element={<AdminBanners />} />
            <Route path="marketing/promos" element={<AdminPromos />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="marketing/banners" element={<AdminDashboard />} />
            <Route path="marketing/promos" element={<AdminDashboard />} />                                    
            <Route path="marketing/loyalty-levels" element={<AdminLoyaltyLevels />} />
            <Route path="cms/terms" element={<AdminCMSTerms />} />
            <Route path="cms/privacy" element={<AdminCMSPrivacy />} />
            <Route path="cms/help" element={<AdminCMSHelp />} />
            <Route path="cms/rules" element={<AdminCMSRules />} />
            <Route path="settings" element={<AdminSettings />} />


          </Route>

          {/* Merchant Routes */}
          <Route
            path="/merchant"
            element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/merchant/dashboard" replace />} />
            <Route path="dashboard" element={<MerchantDashboard />} />
            <Route path="profile/business" element={<MerchantBusinessInfo />} />
            <Route path="profile/media" element={<MerchantProfileMedia />} />
            <Route path="profile/hours" element={<MerchantBusinessHours />} />
            <Route path="profile/rewards" element={<MerchantRewardSettings />} />
            <Route path="wallet" element={<MerchantWallet />} />
            <Route path="wallet/topup" element={<MerchantWalletTopup />} />
            <Route path="transactions" element={<MerchantTransactions />} />
            <Route path="customers" element={<MerchantCustomers />} />
            <Route path="promos" element={<MerchantPromos />} />
            <Route path="promos/create" element={<MerchantPromoCreate />} />
            <Route path="qr-scanner" element={<MerchantQRScanner />} />
            <Route path="qr-scanner/history" element={<MerchantQRScanner />} />
            <Route path="settings" element={<MerchantSettings />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;