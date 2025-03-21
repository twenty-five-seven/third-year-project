import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, FormControl, InputLabel, MenuItem, Select, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('buyer');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        userType
      });

      setFeedback('Registration successful! Logging you in...');
      
      // Auto-login after successful registration
      const loginResponse = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      // Log user in with the token
      const { token, user } = loginResponse.data;
      login(token, user);
      
      // Redirect based on user type
      setTimeout(() => {
        if (userType === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/products');
        }
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', py: 8, px: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Create an Account
      </Typography>
      
      {feedback && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {feedback}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Full Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="user-type-label">I want to</InputLabel>
          <Select
            labelId="user-type-label"
            id="user-type"
            value={userType}
            label="I want to"
            onChange={(e) => setUserType(e.target.value)}
          >
            <MenuItem value="buyer">Shop on this platform</MenuItem>
            <MenuItem value="seller">Sell my products</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </Button>
        
        <Typography textAlign="center">
          Already have an account?{' '}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;