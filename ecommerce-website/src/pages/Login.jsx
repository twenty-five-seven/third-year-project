import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Submitting login form with:', { email, password });
    
    axios
      .post('/api/auth/login', { email, password })
      .then((response) => {
        console.log('Login response:', response.data);
        const { token, user } = response.data;
        
        try {
          login(token, user);
          setFeedback('Login successful!');
          
          // Redirect based on user type
          if (user.userType === 'seller') {
            navigate('/seller-dashboard');
          } else {
            navigate('/products');
          }
        } catch (error) {
          console.error('Error processing login:', error);
          setError('Error processing login. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Login error:', error.response?.data || error.message);
        setError('Invalid credentials. Please try again.');
      });
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      
      {feedback && <Typography color="primary" sx={{ mb: 2 }}>{feedback}</Typography>}
      {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </Box>
  );
};

export default Login;