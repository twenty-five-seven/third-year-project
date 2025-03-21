import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper,
  Divider,
  Skeleton,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import { UserContext } from '../context/UserContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/products/${id}`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    if (!user || !user.buyerId) {
      alert('You must be logged in to add items to the cart.');
      navigate('/login');
      return;
    }
  
    try {
      const payload = {
        buyer_id: user.buyerId,
        product_id: product.id,
      };
  
      console.log('Sending request to /api/cart/add with payload:', payload);
  
      const response = await axios.post('/api/cart/add', payload);
  
      if (response.status === 200 || response.status === 201) {
        setOpenSnackbar(true);
      } else {
        console.error('Unexpected response:', response);
        alert('Failed to add product to cart. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        console.error('API error response:', error.response);
        alert(`Error: ${error.response.data.message || 'Failed to add product to cart.'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('No response from server. Please try again later.');
      } else {
        console.error('Error adding product to cart:', error.message);
        alert('An error occurred while adding the product to the cart. Please try again later.');
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} width="80%" />
            <Skeleton variant="text" height={30} width="40%" sx={{ mt: 2 }} />
            <Skeleton variant="text" height={100} />
            <Skeleton variant="text" height={50} width="60%" sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: 400,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'light' 
                    ? theme.palette.grey[100]
                    : theme.palette.grey[900],
                // backgroundImage: `url(https://source.unsplash.com/random?${product.category})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 2
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            
            <Chip 
              label={product.category} 
              color="primary" 
              variant="outlined" 
              size="small" 
              sx={{ mb: 2 }} 
            />
            
            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button 
                onClick={handleAddToCart} 
                variant="contained" 
                color="primary"
                size="large"
                startIcon={<ShoppingCartIcon />}
                sx={{ flex: 1 }}
              >
                Add to Cart
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/products')}
                sx={{ flex: 1 }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleViewCart}>
              VIEW CART
            </Button>
          }
        >
          Product added to cart successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetails;