import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Grid,
  Card, CardContent, Divider, Tabs, Tab
} from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    // Fetch all products for admin
    axios.get('/api/products')
      .then(response => {
        setProducts(Array.isArray(response.data) ? response.data : []);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });

    // Fetch all orders
    axios.get('/api/orders')
      .then(response => {
        setOrders(Array.isArray(response.data) ? response.data : []);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });

    // Fetch all users (would need a new endpoint)
    axios.get('/api/admin/users')
      .then(response => {
        setUsers(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>Products</Typography>
              <Typography variant="h3">{products.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>Orders</Typography>
              <Typography variant="h3">{orders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>Users</Typography>
              <Typography variant="h3">{users.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different sections */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Products" />
          <Tab label="Orders" />
          <Tab label="Users" />
        </Tabs>
      </Box>

      {/* Products Tab */}
      <Box hidden={tabValue !== 0}>
        <Typography variant="h5" gutterBottom>All Products</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Seller ID</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.seller_id}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Orders Tab */}
      <Box hidden={tabValue !== 1}>
        <Typography variant="h5" gutterBottom>All Orders</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Buyer ID</TableCell>
                <TableCell>Seller ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.buyer_id}</TableCell>
                  <TableCell>{order.seller_id}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Users Tab */}
      <Box hidden={tabValue !== 2}>
        <Typography variant="h5" gutterBottom>All Users</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AdminDashboard;