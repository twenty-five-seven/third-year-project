import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Paper, Button, Divider, CircularProgress, Stack } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/orders/view/${orderId}`)
      .then(response => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          // If the API returns an array, take the first element
          setOrder({ ...response.data[0], products: response.data });
        } else {
          setOrder(response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details');
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button component={Link} to="/dashboard" variant="contained" sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 5 }}>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Thank You for Your Order!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Your order has been placed successfully.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Order #{orderId}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Status: {order?.status || 'Processing'}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        
        {order?.products?.map((product) => (
            <Stack 
                direction="row" 
                key={product.id} 
                sx={{ py: 2 }}
                justifyContent="space-between"
            >
                <Box sx={{ width: '66%' }}>
                <Typography>{product.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {product.description}
                </Typography>
                </Box>
                <Box sx={{ width: '33%', textAlign: 'right' }}>
                <Typography>${product.price}</Typography>
                </Box>
            </Stack>
            ))}

        <Divider sx={{ my: 3 }} />
        <Stack 
            direction="row" 
            justifyContent="space-between"
            >
            <Box sx={{ width: '66%' }}>
                <Typography variant="h6">Total</Typography>
            </Box>
            <Box sx={{ width: '33%', textAlign: 'right' }}>
                <Typography variant="h6">
                ${order?.products?.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2) || '0.00'}
                </Typography>
            </Box>
        </Stack>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" component={Link} to="/dashboard">
            View All Orders
          </Button>
          <Button variant="outlined" component={Link} to="/products">
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderConfirmation;