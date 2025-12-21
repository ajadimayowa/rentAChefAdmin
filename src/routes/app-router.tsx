// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/public/HomePage';
import UserProfilePage from '../pages/dashboard/ProfilePage';
import RouteProtector from '../components/RouteProtector';
import DashboardLayout from '../components/DashboardLayout';
import FavoritesPage from '../pages/dashboard/Favorites';
import PostAdPage from '../pages/dashboard/PostAdPage';
import MessagesPage from '../pages/dashboard/MessagesPage';
import ViewAdPage from '../pages/public/ViewAdInformation';
import NotFound from '../pages/public/NotFound';
import ProductSearchPage from '../pages/public/ProductSearchPage';
import CategoryProductsPage from '../pages/public/CategoryProductsPage';
import MyAds from '../pages/dashboard/MyAds';
import UserSearchPage from '../pages/public/UserSearchPage';
import AllAdsPage from '../pages/public/AllAdsPage';
import AdminLoginPage from '../pages/public/AdminLogin';
import DashboardPage from '../pages/dashboard';
import AdminPage from '../pages/dashboard/AdminsPage';
import ChefsPage from '../pages/dashboard/ChefsPage';
import CustomersPage from '../pages/dashboard/CustomersPage';
import SettingsPage from '../pages/dashboard/SettingsPage';


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes: Accessible without authentication */}
        <Route path="/" element={<AdminLoginPage />} />
        <Route path="/search" element={<ProductSearchPage />} />
        <Route path="/user-search" element={<UserSearchPage />} />
        <Route path='*' element={<NotFound/>}/>
        <Route path='/ads' element={<AllAdsPage/>}/>
        <Route path='/ad/:id' element={<ViewAdPage/>}/>
        <Route path='/category/:categoryId' element={<CategoryProductsPage/>}/>
        
        <Route path="/dashboard" element={<RouteProtector><DashboardLayout /></RouteProtector>}>
        <Route index element={<DashboardPage/>} />
        <Route path="admins" element={<AdminPage/>} />
        <Route path="chefs" element={<ChefsPage/>} />
        <Route path='customers' element={<CustomersPage/>} />
        <Route path="settings" element={<SettingsPage/>} />

        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;