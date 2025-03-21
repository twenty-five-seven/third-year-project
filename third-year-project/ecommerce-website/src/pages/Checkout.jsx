import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Button, Stepper, Step, StepLabel,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  Divider
} from '@mui/material';
import { UserContext } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';


const steps = ['Shipping information', 'Payment details', 'Review your order'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (user && user.buyerId) {
      axios
        .get(`/api/cart/${user.buyerId}`)
        .then((response) => {
          setCart(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching cart:', error);
          setError('Failed to load your cart items');
          setLoading(false);
        });
    }
  }, [user]);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleShippingInfoChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePaymentInfoChange = (e) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value
    });
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);
  };

  // Update the handlePlaceOrder function in the Checkout component
        // Fix the handlePlaceOrder function - this is a syntax error in the current code
    const handlePlaceOrder = async () => {
      if (!user || !user.buyerId) {
        alert('You must be logged in to place an order.');
        navigate('/login');
        return;
      }
    
      try {
        console.log('Placing order with cart items:', cart);
        
        // Place the order
        const orderResponse = await axios.post('/api/orders/place', {
          buyer_id: user.buyerId,
          products: cart.map(item => ({ id: item.id }))
        });
        
        if (!orderResponse.data || !orderResponse.data.orderId) {
          console.error('Invalid order response:', orderResponse);
          throw new Error('Invalid order response from server');
        }
        
        const orderId = orderResponse.data.orderId;
        console.log('Order created with ID:', orderId);
        
        // Process payment
        await axios.post('/api/payments/make', {
          order_id: orderId,
          amount: calculateTotal(),
          method: 'Credit Card'
        });
        
        console.log('Payment processed successfully');
        
        // Navigate to order confirmation
        navigate(`/order-confirmation/${orderId}`);
      } catch (err) {
        console.error('Error placing order:', err);
        setError(err.response?.data?.error || 'Failed to place your order. Please try again.');
      }
    };
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping address
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="fullName"
                  name="fullName"
                  label="Full name"
                  fullWidth
                  autoComplete="given-name"
                  variant="outlined"
                  value={shippingInfo.fullName}
                  onChange={handleShippingInfoChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="address"
                  name="address"
                  label="Address"
                  fullWidth
                  autoComplete="shipping address-line1"
                  variant="outlined"
                  value={shippingInfo.address}
                  onChange={handleShippingInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="city"
                  name="city"
                  label="City"
                  fullWidth
                  autoComplete="shipping address-level2"
                  variant="outlined"
                  value={shippingInfo.city}
                  onChange={handleShippingInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="state"
                  name="state"
                  label="State/Province/Region"
                  fullWidth
                  variant="outlined"
                  value={shippingInfo.state}
                  onChange={handleShippingInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="postalCode"
                  name="postalCode"
                  label="Zip / Postal code"
                  fullWidth
                  autoComplete="shipping postal-code"
                  variant="outlined"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="country"
                  name="country"
                  label="Country"
                  fullWidth
                  autoComplete="shipping country"
                  variant="outlined"
                  value={shippingInfo.country}
                  onChange={handleShippingInfoChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment method
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="cardName"
                  name="cardName"
                  label="Name on card"
                  fullWidth
                  autoComplete="cc-name"
                  variant="outlined"
                  value={paymentInfo.cardName}
                  onChange={handlePaymentInfoChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="cardNumber"
                  name="cardNumber"
                  label="Card number"
                  fullWidth
                  autoComplete="cc-number"
                  variant="outlined"
                  value={paymentInfo.cardNumber}
                  onChange={handlePaymentInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="expiryDate"
                  name="expiryDate"
                  label="Expiry date"
                  fullWidth
                  autoComplete="cc-exp"
                  variant="outlined"
                  value={paymentInfo.expiryDate}
                  onChange={handlePaymentInfoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="cvv"
                  name="cvv"
                  label="CVV"
                  helperText="Last three digits on signature strip"
                  fullWidth
                  autoComplete="cc-csc"
                  variant="outlined"
                  value={paymentInfo.cvv}
                  onChange={handlePaymentInfoChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order summary
            </Typography>
            {cart.map((product) => (
              <Box key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">{product.name}</Typography>
                <Typography variant="body1">${product.price}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${calculateTotal()}</Typography>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Shipping
              </Typography>
              <Typography gutterBottom>{shippingInfo.fullName}</Typography>
              <Typography gutterBottom>{shippingInfo.address}</Typography>
              <Typography gutterBottom>{`${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}`}</Typography>
              <Typography gutterBottom>{shippingInfo.country}</Typography>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Payment details
              </Typography>
              <Typography gutterBottom>Card: {paymentInfo.cardNumber}</Typography>
            </Box>
          </Box>
        );
      default:
        throw new Error('Unknown step');
    }
  };

  if (loading) {
    return <Typography>Loading your cart...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (cart.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" component={Link} to="/products">
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Add this error message display */}
        {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
            </Alert>
        )}
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handlePlaceOrder}
            >
              Place order
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Checkout;