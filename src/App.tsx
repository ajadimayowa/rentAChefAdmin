import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminDataProvider } from './contexts/AdminDataContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { ChefLayout } from './components/chef/ChefLayout';
import { ClientLayout } from './components/client/ClientLayout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { ComingSoon } from './components/ui/ComingSoon';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { VerifyEmail } from './pages/VerifyEmail';
import { Dashboard } from './pages/admin/Dashboard';
import { Bookings } from './pages/admin/Bookings';
import { Services } from './pages/admin/Services';
import { ViewServicePage } from './pages/admin/ViewServicePage';
import { ServiceCategories } from './pages/admin/ServiceCategories';
import { Menus } from './pages/admin/Menus';
import { Packages } from './pages/admin/Packages';
import { UsersPage } from './pages/admin/Users';
import { Admins } from './pages/admin/Admins';
import { Chefs } from './pages/admin/Chefs';
import { ViewChefPage } from './pages/admin/ViewChefPage';
import { ViewBookingPage as AdminViewBookingPage } from './pages/admin/ViewBookingPage';
import { Charges } from './pages/admin/Charges';
import { ChefTierPricing } from './pages/admin/ChefTierPricing';
import { TermsAndConditions } from './pages/admin/TermsAndConditions';
import { ChefDashboard } from './pages/chef/Dashboard';
import { ViewBookingPage as ChefViewBookingPage } from './pages/chef/ViewBookingPage';
import { ClientDashboard } from './pages/client/Dashboard';
import { ViewBookingPage as ClientViewBookingPage } from './pages/client/ViewBookingPage';

export function App() {
  return (
    <AdminDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/admin"
            element={
            <PrivateRoute allowedRoles={['admin']}>
                <AdminLayout />
              </PrivateRoute>
            }>

            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<AdminViewBookingPage />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:id" element={<ViewServicePage />} />
            <Route path="categories" element={<ServiceCategories />} />
            <Route path="menus" element={<Menus />} />
            <Route path="packages" element={<Packages />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="admins" element={<Admins />} />
            <Route path="chefs" element={<Chefs />} />
            <Route path="chefs/:id" element={<ViewChefPage />} />
            <Route path="charges" element={<Charges />} />
            <Route path="chef-pricing" element={<ChefTierPricing />} />
            <Route path="terms" element={<TermsAndConditions />} />
          </Route>

          <Route
            path="/chef"
            element={
            <PrivateRoute allowedRoles={['chef']}>
                <ChefLayout />
              </PrivateRoute>
            }>

            <Route index element={<ChefDashboard />} />
            <Route path="bookings" element={<ComingSoon title="My Bookings" />} />
            <Route path="bookings/:id" element={<ChefViewBookingPage />} />
            <Route path="profile" element={<ComingSoon title="My Profile" />} />
          </Route>

          <Route
            path="/client"
            element={
            <PrivateRoute allowedRoles={['client']}>
                <ClientLayout />
              </PrivateRoute>
            }>

            <Route index element={<ClientDashboard />} />
            <Route path="bookings" element={<ComingSoon title="My Bookings" />} />
            <Route path="bookings/:id" element={<ClientViewBookingPage />} />
            <Route path="book" element={<ComingSoon title="Book a Chef" />} />
            <Route path="profile" element={<ComingSoon title="My Profile" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{ style: { fontFamily: 'DM Sans, sans-serif' } }} />
      
    </AdminDataProvider>);

}