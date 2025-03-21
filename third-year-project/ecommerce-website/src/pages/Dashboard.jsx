import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Grid,
  Card, CardContent, Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !user.buyerId) return;

    // Fetch dashboard statistics
    axios.get(`/api/dashboard/buyer/${user.buyerId}`)
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error('Error fetching dashboard stats:', error);
      });
    
    // Fetch orders
    axios.get(`/api/orders?buyer_id=${user.buyerId}`)
      .then(response => {
        setOrders(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setError('Failed to load your orders');
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h6">You need to be logged in to view this page.</Typography>
        <Button component={Link} to="/login" variant="contained" sx={{ mt: 2 }}>
          Log In
        </Button>
      </Box>
    );
  }

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
        Your Dashboard
      </Typography>
      
      {/* Dashboard Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>Orders Placed</Typography>
              <Typography variant="h3">{stats?.orderCount || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>Reviews Written</Typography>
              <Typography variant="h3">{stats?.reviewCount || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Your Orders
      </Typography>
      
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="textSecondary">
            You haven't placed any orders yet.
          </Typography>
          <Button component={Link} to="/products" variant="contained" sx={{ mt: 2 }}>
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    ${order.total || 
                      (order.products ? order.products.reduce((sum, p) => sum + parseFloat(p.price), 0).toFixed(2) : '0.00')}
                  </TableCell>
                  <TableCell>
                    <Button 
                      component={Link} 
                      to={`/order-confirmation/${order.id}`} 
                      size="small"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Dashboard;