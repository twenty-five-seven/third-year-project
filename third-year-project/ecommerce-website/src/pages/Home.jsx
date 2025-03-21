import React from 'react';
import { Box, Typography, Button, Paper, Grid, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const Home = () => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          py: 8, 
          px: 4, 
          mb: 6, 
          borderRadius: 2,
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              mb: 2
            }}
          >
            Welcome to ShopEasy
          </Typography>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              mb: 4,
              opacity: 0.9,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Discover the best products at unbeatable prices with fast delivery and exceptional customer service.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            component={Link} 
            to="/products"
            startIcon={<ShoppingBagIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: 'white',
              color: '#764ba2',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)'
              }
            }}
          >
            Shop Now
          </Button>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 5
                }
              }}
            >
              <Typography variant="h5" gutterBottom color="primary">
                Wide Selection
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Browse through thousands of products across multiple categories
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 5
                }
              }}
            >
              <Typography variant="h5" gutterBottom color="primary">
                Secure Payments
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Shop with confidence with our secure payment systems
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 5
                }
              }}
            >
              <Typography variant="h5" gutterBottom color="primary">
                Fast Delivery
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Get your purchases quickly with our reliable shipping options
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            Ready to start shopping?
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={Link} 
            to="/register"
            sx={{ mt: 2 }}
          >
            Create an Account
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;