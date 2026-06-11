import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import './index.css';

// Customer
import DiscoverPage from './pages/customer/DiscoverPage';
import LiveViewerPage from './pages/customer/LiveViewerPage';
import MenuPage from './pages/customer/MenuPage';
import WaitlistPage from './pages/customer/WaitlistPage';
import OrdersPage from './pages/customer/OrdersPage';
import ProfilePage from './pages/customer/ProfilePage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';

// Owner
import OwnerStudioPage from './pages/owner/OwnerStudioPage';
import OwnerOrderQueuePage from './pages/owner/OwnerOrderQueuePage';
import OwnerMenuManagerPage from './pages/owner/OwnerMenuManagerPage';
import OwnerAnalyticsPage from './pages/owner/OwnerAnalyticsPage';
import OwnerOnboardingPage from './pages/owner/OwnerOnboardingPage';
import GoLivePage from './pages/owner/GoLivePage';
import BillingPage from './pages/owner/BillingPage';
import OwnerWaitlistPage from './pages/owner/OwnerWaitlistPage';
import OwnerReservationsPage from './pages/owner/OwnerReservationsPage';
import OwnerTablesPage from './pages/owner/OwnerTablesPage';
import OwnerCamerasPage from './pages/owner/OwnerCamerasPage';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';
import OwnerProfilePage from './pages/owner/OwnerProfilePage';
import OwnerMediaPage from './pages/owner/OwnerMediaPage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

// Marketing
import LandingPage from './pages/marketing/LandingPage';
import ForCustomersPage from './pages/marketing/ForCustomersPage';
import ForRestaurantsPage from './pages/marketing/ForRestaurantsPage';
import DemoPage from './pages/marketing/DemoPage';
import ContactPage from './pages/marketing/ContactPage';
import DataDeletionPage from './pages/marketing/DataDeletionPage';

// Auth
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// Layouts
import CustomerLayout from './components/layouts/CustomerLayout';
import OwnerLayout from './components/layouts/OwnerLayout';
import AdminLayout from './components/layouts/AdminLayout';
import MarketingLayout from './components/layouts/MarketingLayout';
import AuthLayout from './components/layouts/AuthLayout';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Marketing */}
          <Route path="/marketing" element={<MarketingLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="for-customers" element={<ForCustomersPage />} />
            <Route path="for-restaurants" element={<ForRestaurantsPage />} />
            <Route path="demo" element={<DemoPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="data-deletion" element={<DataDeletionPage />} />
          </Route>

          {/* Auth */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="/auth/signin" replace />} />
            <Route path="signin" element={<SignInPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="admin-login" element={<AdminLoginPage />} />
          </Route>

          {/* Customer app */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/discover" replace />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="live/:restaurantId" element={<LiveViewerPage />} />
            <Route path="menu/:restaurantId" element={<MenuPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="waitlist" element={<WaitlistPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Owner */}
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<Navigate to="/owner/orders" replace />} />
            <Route path="studio" element={<OwnerStudioPage />} />
            <Route path="orders" element={<OwnerOrderQueuePage />} />
            <Route path="menu" element={<OwnerMenuManagerPage />} />
            <Route path="analytics" element={<OwnerAnalyticsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="waitlist" element={<OwnerWaitlistPage />} />
            <Route path="reservations" element={<OwnerReservationsPage />} />
            <Route path="tables" element={<OwnerTablesPage />} />
            <Route path="cameras" element={<OwnerCamerasPage />} />
            <Route path="settings" element={<OwnerSettingsPage />} />
            <Route path="profile" element={<OwnerProfilePage />} />
            <Route path="media" element={<OwnerMediaPage />} />
          </Route>
          {/* Owner flows outside layout */}
          <Route path="/owner/onboarding" element={<OwnerOnboardingPage />} />
          <Route path="/owner/go-live" element={<GoLivePage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="restaurants" element={<AdminRestaurantsPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
