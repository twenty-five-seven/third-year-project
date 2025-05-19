import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Button } from '@mui/material';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.buyerId) {
      axios
        .get(`/api/cart/${user.buyerId}`)
        .then((response) => setCart(response.data))
        .catch((error) => console.error('Error fetching cart:', error));
    } else {
      alert('You must be logged in to view your cart.');
      navigate('/login');
    }
  }, [user, navigate]);

  // Update the handlePlaceOrder function to redirect to checkout
  const handlePlaceOrder = () => {
    if (!user || !user.buyerId) {
      alert('You must be logged in to place an order.');
      navigate('/login');
      return;
    }

    // Navigate to checkout instead of placing order directly
    navigate('/checkout');
  };

  return (
    <Box sx={{ py: 5, px: 5 }}>
      <Typography variant="h4" gutterBottom>
        Your Cart
      </Typography>
      {cart.map((item) => (
        <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{item.name}</Typography>
          <Typography>${item.price}</Typography>
        </Paper>
      ))}
      <Button variant="contained" color="primary" onClick={handlePlaceOrder}>
        Proceed to Checkout
      </Button>
    </Box>
  );
};

export default Cart;