import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminDataProvider } from './contexts/AdminDataContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { ChefLayout } from './components/chef/ChefLayout';
import { ClientLayout } from './components/client/ClientLayout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { IdleTimeoutGuard } from './components/auth/IdleTimeoutGuard';
import { ComingSoon } from './components/ui/ComingSoon';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { VerifyEmail } from './pages/VerifyEmail';
import { Dashboard } from './pages/admin/Dashboard';
import { Bookings } from './pages/admin/Bookings';
import { Services } from './pages/admin/Services';
import { ViewServicePage } from './pages/admin/ViewServicePage';
import { SpecialServices } from './pages/admin/SpecialServices';
import { ViewSpecialService } from './pages/admin/ViewSpecialService';
import { ServiceCategories } from './pages/admin/ServiceCategories';
import { Menus } from './pages/admin/Menus';
import { Packages } from './pages/admin/Packages';
import { UsersPage } from './pages/admin/Users';
import { ViewCustomerPage } from './pages/admin/ViewCustomerPage';
import { Admins } from './pages/admin/Admins';
import { Chefs } from './pages/admin/Chefs';
import { ViewChefPage } from './pages/admin/ViewChefPage';
import { ChefLevels } from './pages/admin/ChefLevels';
import { ViewChefLevel } from './pages/admin/ViewChefLevel';
import { BookingRedirect } from './pages/admin/bookings/BookingRedirect';
import { AlaseServiceBookingPage } from './pages/admin/bookings/AlaseServiceBookingPage';
import { DailyChefBookingPage } from './pages/admin/bookings/DailyChefBookingPage';
import { DateNightBookingPage } from './pages/admin/bookings/DateNightBookingPage';
import { DinnerPartyBookingPage } from './pages/admin/bookings/DinnerPartyBookingPage';
import { EventCateringBookingPage } from './pages/admin/bookings/EventCateringBookingPage';
import { StoragePackageBookingPage } from './pages/admin/bookings/StoragePackageBookingPage';
import { SpecialServiceBookingPage } from './pages/admin/bookings/SpecialServiceBookingPage';
import { HomeResidenceBookingPage } from './pages/admin/bookings/HomeResidenceBookingPage';
import { GeneralBookingPage } from './pages/admin/bookings/GeneralBookingPage';
import { Charges } from './pages/admin/Charges';
import { ChefTierPricing } from './pages/admin/ChefTierPricing';
import { TermsAndConditions } from './pages/admin/TermsAndConditions';
import { ChefDashboard } from './pages/chef/Dashboard';
import { ChefBookings } from './pages/chef/Bookings';
import { ViewChefBooking } from './pages/chef/ViewChefBooking';
import { ChefMenus } from './pages/chef/Menus';
import { ViewChefMenu } from './pages/chef/ViewChefMenu';
import { ChefProfilePage } from './pages/chef/Profile';
import { ClientDashboard } from './pages/client/Dashboard';
import { ViewBookingPage as ClientViewBookingPage } from './pages/client/ViewBookingPage';

export function App() {
  return (
    <AdminDataProvider>
      <BrowserRouter>
        <IdleTimeoutGuard />
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
            <Route path="bookings/alase-service/:id" element={<AlaseServiceBookingPage />} />
            <Route path="bookings/daily-chef/:id" element={<DailyChefBookingPage />} />
            <Route path="bookings/date-night/:id" element={<DateNightBookingPage />} />
            <Route path="bookings/dinner-party/:id" element={<DinnerPartyBookingPage />} />
            <Route path="bookings/event-catering/:id" element={<EventCateringBookingPage />} />
            <Route path="bookings/storage-package/:id" element={<StoragePackageBookingPage />} />
            <Route path="bookings/special-service/:id" element={<SpecialServiceBookingPage />} />
            <Route path="bookings/home-residence/:id" element={<HomeResidenceBookingPage />} />
            <Route path="bookings/general/:id" element={<GeneralBookingPage />} />
            <Route path="bookings/:id" element={<BookingRedirect />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:id" element={<ViewServicePage />} />
            <Route path="special-services" element={<SpecialServices />} />
            <Route path="special-services/:id" element={<ViewSpecialService />} />
            <Route path="categories" element={<ServiceCategories />} />
            <Route path="menus" element={<Menus />} />
            <Route path="packages" element={<Packages />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<ViewCustomerPage />} />
            <Route path="admins" element={<Admins />} />
            <Route path="chefs" element={<Chefs />} />
            <Route path="chefs/:id" element={<ViewChefPage />} />
            <Route path="chef-levels" element={<ChefLevels />} />
            <Route path="chef-levels/:id" element={<ViewChefLevel />} />
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
            <Route path="bookings" element={<ChefBookings />} />
            <Route path="bookings/:id" element={<ViewChefBooking />} />
            <Route path="menus" element={<ChefMenus />} />
            <Route path="menus/:id" element={<ViewChefMenu />} />
            <Route path="profile" element={<ChefProfilePage />} />
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