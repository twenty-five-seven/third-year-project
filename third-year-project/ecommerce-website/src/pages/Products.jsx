import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Grid, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  CardMedia,
  Container,
  Skeleton,
  Divider,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search') || '';
    setSearchTerm(searchQuery);
  
    axios
      .get('/api/products', { params: { query: searchQuery } })
      .then((response) => {
        if (response.data.length === 0) {
          setProducts([]);
          console.warn('No products found.');
        } else {
          setProducts(response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    window.history.pushState(
      {}, 
      '', 
      searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '?'
    );
    
    setLoading(true);
    axios
      .get('/api/products', { params: { query: searchTerm } })
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error searching products:', error);
        setLoading(false);
      });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, px: 2 }}>
        {/* Search bar */}
        <Box 
          component="form" 
          onSubmit={handleSearch}
          sx={{ 
            display: 'flex', 
            mb: 4,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 1 }}
          />
          <Button 
            type="submit" 
            variant="contained"
          >
            Search
          </Button>
        </Box>
      
        <Typography 
          variant="h4" 
          gutterBottom 
          textAlign="center"
          sx={{ mb: 3 }}
        >
          {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Products'}
        </Typography>
        
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton variant="text" height={32} width="80%" />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={20} width="40%" />
                    <Skeleton variant="text" height={24} width="30%" sx={{ mt: 2 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary">
              No products found matching your search.
            </Typography>
            <Button 
              component={Link} 
              to="/products" 
              variant="contained" 
              sx={{ mt: 2 }}
            >
              View All Products
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 160,
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'light' 
                          ? theme.palette.grey[100]
                          : theme.palette.grey[900]
                    }}
                    // image={`https://source.unsplash.com/random?${product.category}`}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="medium" 
                      color="primary" 
                      component={Link} 
                      to={`/products/${product.id}`}
                      fullWidth
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Products;