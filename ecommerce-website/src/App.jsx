import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './components/ProductDetails';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/SellerDashboard';
import { UserContext } from './context/UserContext';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';


const ProtectedRoute = ({ children, requiredType }) => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  if (!user) {
    // Redirect them to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredType) {
    // If a specific user type is required, check for it
    if (requiredType === 'admin' && user.userType !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (requiredType === 'seller' && user.userType !== 'seller') {
      return <Navigate to="/unauthorized" replace />;
    }
    if (requiredType === 'buyer' && user.userType !== 'buyer') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

function App() {
  const { user } = useContext(UserContext);
  
  return (
    <Router>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center'
      }}>
        <Header />
        <Box 
          component="main" 
          className="container-center"
          sx={{ 
            flexGrow: 1, 
            pt: 10, 
            pb: 4,
            px: 2,
            maxWidth: '1200px',
            width: '100%'
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/login" element={
              user ? (
                user.userType === 'admin' ? <Navigate to="/admin-dashboard" replace /> :
                user.userType === 'seller' ? <Navigate to="/seller-dashboard" replace /> :
                <Navigate to="/dashboard" replace />
              ) : <Login />
            } />
            <Route path="/register" element={
              user ? <Navigate to={user.userType === 'seller' ? "/seller-dashboard" : "/dashboard"} replace /> : <Register />
            } />
            
            {/* Routes requiring buyer capabilities */}
            <Route path="/cart" element={
              <ProtectedRoute requiredType="buyer">
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute requiredType="buyer">
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-confirmation/:orderId" element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                {user?.userType === 'seller' ? <Navigate to="/seller-dashboard" replace /> : <Dashboard />}
              </ProtectedRoute>
            } />
            
            {/* Seller-only routes */}
            <Route path="/seller-dashboard" element={
              <ProtectedRoute requiredType="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } />

            {/* Add admin routes */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute requiredType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
        <Box className="footer-container">
          <Footer />
        </Box>
      </Box>
    </Router>
  );
}

export default App;