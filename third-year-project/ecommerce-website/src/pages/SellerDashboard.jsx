import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Grid,
  Card, CardContent, Divider, TextField, MenuItem, Select, FormControl,
  InputLabel, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import axios from 'axios';

const SellerDashboard = () => {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [isEdit, setIsEdit] = useState(false);

  // In the useEffect hook:
useEffect(() => {
  // Get seller ID from user context
  const sellerId = user?.sellerId || 'default-seller';

  // Fetch seller stats
  axios.get(`/api/dashboard/seller/${sellerId}`)
    .then(response => {
      setStats(response.data);
    })
    .catch(error => {
      console.error('Error fetching seller stats:', error);
    });

  // Fetch seller's products - modify this line to include seller_id parameter
  axios.get(`/api/products?seller_id=${sellerId}`)
      .then(response => {
        setProducts(Array.isArray(response.data) ? response.data : []);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });

  // Fetch seller's orders
  axios.get(`/api/orders?seller_id=${sellerId}`)
      .then(response => {
        setOrders(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      });
  }, [user]);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setIsEdit(true);
    } else {
      setCurrentProduct({
        name: '',
        description: '',
        price: '',
        category: ''
      });
      setIsEdit(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProduct = () => {
    const sellerId = user?.sellerId || 'default-seller';
    const productData = {
      ...currentProduct,
      seller_id: sellerId
    };

    if (isEdit) {
      // Update existing product
      axios.put(`/api/products/edit/${currentProduct.id}`, productData)
        .then(response => {
          setProducts(prev => 
            prev.map(p => p.id === currentProduct.id ? currentProduct : p)
          );
          handleCloseDialog();
        })
        .catch(error => {
          console.error('Error updating product:', error);
        });
    } else {
      // Add new product
      axios.post('/api/products/add_product', productData)
        .then(response => {
          setProducts(prev => [...prev, { ...currentProduct, id: response.data.id }]);
          handleCloseDialog();
        })
        .catch(error => {
          console.error('Error adding product:', error);
        });
    }
  };

  const handleDeleteProduct = (id) => {
    axios.delete(`/api/products/delete/${id}`)
      .then(() => {
        setProducts(prev => prev.filter(p => p.id !== id));
      })
      .catch(error => {
        console.error('Error deleting product:', error);
      });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    axios.put(`/api/orders/update-status/${orderId}`, { status: newStatus })
      .then(() => {
        setOrders(prev => 
          prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      })
      .catch(error => {
        console.error('Error updating order status:', error);
      });
  };

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
        Seller Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>Products</Typography>
              <Typography variant="h3">{stats?.productCount || products.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>Orders</Typography>
              <Typography variant="h3">{stats?.orderCount || orders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>Average Rating</Typography>
              <Typography variant="h3">{stats?.averageRating?.toFixed(1) || 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Your Products</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Add New Product
          </Button>
        </Box>

        {products.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1">You haven't added any products yet.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDialog(product)}>Edit</Button>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Orders Section */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Recent Orders
        </Typography>
        
        {orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1">You don't have any orders yet.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.buyer_name || 'Customer'}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        >
                          <MenuItem value="Processing">Processing</MenuItem>
                          <MenuItem value="Shipped">Shipped</MenuItem>
                          <MenuItem value="Delivered">Delivered</MenuItem>
                          <MenuItem value="Cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProduct.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentProduct.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            variant="outlined"
            value={currentProduct.price}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="category"
            label="Category"
            type="text"
            fullWidth
            variant="outlined"
            value={currentProduct.category}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerDashboard;