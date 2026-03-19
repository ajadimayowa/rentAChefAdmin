// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import RouteProtector from '../components/RouteProtector';
import DashboardLayout from '../components/DashboardLayout';
import NotFound from '../pages/public/NotFound';
import ProductSearchPage from '../pages/public/ProductSearchPage';
import UserSearchPage from '../pages/public/UserSearchPage';
import AdminLoginPage from '../pages/public/AdminLogin';
import DashboardPage from '../pages/dashboard';
import AdminPage from '../pages/dashboard/AdminsPage';
import ChefsPage from '../pages/dashboard/ChefsPage';
import CustomersPage from '../pages/dashboard/CustomersPage';
import SettingsPage from '../pages/dashboard/SettingsPage';
import ViewChefsPage from '../pages/dashboard/ViewChefPage';
import MenusPage from '../pages/dashboard/MenusPage';
import AddProcurementPage from '../pages/dashboard/AddProcurementPage';
import UpdateMenuPage from '../pages/dashboard/UpdateMenuPage';
import BookingsPage from '../pages/dashboard/BookingsPage';
import ViewMenuPage from '../pages/dashboard/ViewMenuPage';
import ViewServicePage from '../pages/dashboard/ViewServicePage';
import UserLogin from '../pages/public/UserLogin';
import SuccessfulPayment from '../pages/public/SuccessfulPayment';
import Booking from '../pages/dashboard/Booking';
import Customer from '../pages/dashboard/Customer';
import ViewServicePricingPage from '../pages/dashboard/ViewServicePricingPage';
import QuotesPage from '../pages/dashboard/QuotesPage';
import Notifications from '../pages/dashboard/Notifications';


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes: Accessible without authentication */}
        <Route path="/" element={<UserLogin/>}/>
        <Route path="/admin-login" element={<AdminLoginPage />}/>
        <Route path="/payment-succesful" element={<SuccessfulPayment />}/>
        <Route path="/search" element={<ProductSearchPage />} />
        <Route path="/user-search" element={<UserSearchPage />} />
        <Route path='*' element={<NotFound />} />
        
        <Route path="/dashboard" element={<RouteProtector><DashboardLayout /></RouteProtector>}>
          <Route index element={<DashboardPage />} />
          <Route path="admins" element={<AdminPage />} />

          <Route path="menus" element={<MenusPage/>} />
          <Route path="menu/:id" element={<ViewMenuPage />} />
          <Route path="menu/procurement/:id" element={<AddProcurementPage />} />
          <Route path="menu/update/:id" element={<UpdateMenuPage />} />

          <Route path="bookings" element={<BookingsPage />} />
          <Route path="booking/:id" element={<Booking/>} />
          <Route path="chefs" element={<ChefsPage />} />
          <Route path="chef/:id" element={<ViewChefsPage />} />
          <Route path='customers' element={<CustomersPage />} />
          <Route path='quotes' element={<QuotesPage />} />
          <Route path='notifications' element={<Notifications />} />
          <Route path='customer/:id' element={<Customer />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="service/:id" element={<ViewServicePage />} />
          <Route path="service-pricing/:id" element={<ViewServicePricingPage />} />
          <Route path="chef-category/:id" element={<ViewChefsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;