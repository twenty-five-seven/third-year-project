import React, { useContext, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StoreIcon from '@mui/icons-material/Store';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  // Check user type - Sellers are not buyers
  const isAdmin = user?.userType === 'admin';
  const isSeller = user?.userType === 'seller';
  const isBuyer = user?.userType === 'buyer';

  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: 1201 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="h5" 
            component={Link} 
            to="/" 
            sx={{ 
              textDecoration: 'none', 
              color: 'white',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            ShopEasy
          </Typography>

          {isAdmin && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/admin-dashboard"
              startIcon={<AdminPanelSettingsIcon />}
            >
              Admin Panel
            </Button>
          )}
          
          {isMobile ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isBuyer && (
                  <IconButton 
                    color="inherit" 
                    sx={{ mr: 1 }}
                    component={Link}
                    to="/cart"
                  >
                    <ShoppingCartIcon />
                  </IconButton>
                )}

                <IconButton
                  color="inherit"
                  onClick={handleMenu}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 3
                  }}
                >
                  <MenuItem onClick={() => handleNavigate('/')}>Home</MenuItem>
                  <MenuItem onClick={() => handleNavigate('/products')}>Products</MenuItem>
                  {user ? (
                    <>
                      {isBuyer && (
                        <MenuItem onClick={() => handleNavigate('/cart')}>Cart</MenuItem>
                      )}
                      {isSeller ? (
                        <MenuItem onClick={() => handleNavigate('/seller-dashboard')}>
                          Seller Dashboard
                        </MenuItem>
                      ) : isBuyer ? (
                        <MenuItem onClick={() => handleNavigate('/dashboard')}>
                          My Dashboard
                        </MenuItem>
                      ) : null}
                      <Divider />
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem onClick={() => handleNavigate('/login')}>Login</MenuItem>
                      <MenuItem onClick={() => handleNavigate('/register')}>Register</MenuItem>
                    </>
                  )}
                </Menu>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/products">
                Products
              </Button>
              {user ? (
                <>
                  {isBuyer && (
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/cart"
                      startIcon={<ShoppingCartIcon />}
                    >
                      Cart
                    </Button>
                  )}
                  {isSeller ? (
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/seller-dashboard"
                      startIcon={<StoreIcon />}
                    >
                      Seller Dashboard
                    </Button>
                  ) : isBuyer ? (
                    <Button
                      color="inherit"
                      component={Link}
                      to="/dashboard"
                      startIcon={<DashboardIcon />}
                    >
                      My Orders
                    </Button>
                  ) : null}
                  <Button 
                    color="inherit" 
                    onClick={handleLogout}
                    startIcon={<AccountCircleIcon />}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={Link} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;