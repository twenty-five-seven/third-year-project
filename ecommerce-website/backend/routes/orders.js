const express = require('express');
const router = express.Router();
const db = require('../db');

// Update the place order route to handle empty product lists and seller_id errors
router.post('/place', (req, res) => {
  const { buyer_id, products } = req.body;
  
  console.log('Received order request:', { buyer_id, products });
  
  if (!buyer_id) {
    return res.status(400).json({ error: 'Missing buyer_id' });
  }
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'No products in cart' });
  }

  // Extract product IDs
  const productIds = products.map(p => p.id);
  if (productIds.some(id => !id)) {
    return res.status(400).json({ error: 'Invalid product data' });
  }
  
  const placeholders = productIds.map(() => '?').join(',');
  
  // First, check if the products actually exist
  const getProductsQuery = `SELECT id, seller_id FROM Product WHERE id IN (${placeholders})`;
  
  db.query(getProductsQuery, productIds, (err, productResults) => {
    if (err) {
      console.error('Error fetching products for order:', err);
      return res.status(500).json({ error: 'Database error while fetching products' });
    }
    
    if (!productResults || productResults.length === 0) {
      return res.status(404).json({ error: 'No valid products found for order' });
    }

    if (productResults.length !== productIds.length) {
      console.warn(`Not all products found: requested ${productIds.length}, found ${productResults.length}`);
    }
    
    // For this demo, just take the first seller_id
    const seller_id = productResults[0].seller_id;
    if (!seller_id) {
      return res.status(500).json({ error: 'Product has no associated seller' });
    }
    
    console.log(`Creating order for buyer ${buyer_id} from seller ${seller_id}`);
    
    // Create a unique order ID
    const orderId = require('crypto').randomUUID();
    
    // Create the order with the generated UUID
    const orderQuery = 'INSERT INTO `Order` (id, buyer_id, seller_id, status) VALUES (?, ?, ?, "Processing")';
    db.query(orderQuery, [orderId, buyer_id, seller_id], (orderErr, orderResult) => {
      if (orderErr) {
        console.error('Error creating order:', orderErr);
        return res.status(500).json({ error: 'Database error while creating order' });
      }
      
      // Insert order-product relationships
      const orderProductValues = productIds.map(productId => [orderId, productId]);
      const orderProductQuery = 'INSERT INTO Order_Product (order_id, product_id) VALUES ?';
      
      db.query(orderProductQuery, [orderProductValues], (linkErr) => {
        if (linkErr) {
          console.error('Error linking products to order:', linkErr);
          return res.status(500).json({ error: 'Database error while linking products to order' });
        }
        
        // Clear the cart after successful order
        const clearCartQuery = 'DELETE FROM Cart_Product WHERE cart_id = ?';
        db.query(clearCartQuery, [buyer_id], (clearErr) => {
          if (clearErr) {
            console.error('Error clearing cart:', clearErr);
            // Don't fail the request if cart clearing fails
          }
          
          res.status(201).json({ message: 'Order placed successfully', orderId });
        });
      });
    });
  });
});

router.get('/view/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT o.id, o.status, p.id AS product_id, p.name, p.description, p.price
    FROM \`Order\` o
    JOIN Order_Product op ON o.id = op.order_id
    JOIN Product p ON op.product_id = p.id
    WHERE o.id = ?
  `;
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result);
  });
});

router.put('/update-status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const query = 'UPDATE `Order` SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send('Order status updated');
  });
});


// Add this route handler after your existing routes but before module.exports

// Add this GET route to handle listing orders filtered by buyer_id or seller_id
router.get('/', (req, res) => {
  const { buyer_id, seller_id } = req.query;
  let query;
  let params = [];

  if (buyer_id) {
    query = `
      SELECT o.id, o.status, o.buyer_id, o.seller_id, 
      GROUP_CONCAT(p.id) as product_ids,
      GROUP_CONCAT(p.name) as product_names,
      GROUP_CONCAT(p.price) as product_prices,
      SUM(p.price) as total,
      o.created_at
      FROM \`Order\` o
      JOIN Order_Product op ON o.id = op.order_id
      JOIN Product p ON op.product_id = p.id
      WHERE o.buyer_id = ?
      GROUP BY o.id
    `;
    params = [buyer_id];
  } else if (seller_id) {
    query = `
      SELECT o.id, o.status, o.buyer_id, o.seller_id,
      GROUP_CONCAT(p.id) as product_ids,
      GROUP_CONCAT(p.name) as product_names,
      GROUP_CONCAT(p.price) as product_prices,
      SUM(p.price) as total,
      o.created_at
      FROM \`Order\` o
      JOIN Order_Product op ON o.id = op.order_id
      JOIN Product p ON op.product_id = p.id
      WHERE o.seller_id = ?
      GROUP BY o.id
    `;
    params = [seller_id];
  } else {
    query = `
      SELECT o.id, o.status, o.buyer_id, o.seller_id,
      GROUP_CONCAT(p.id) as product_ids,
      GROUP_CONCAT(p.name) as product_names,
      GROUP_CONCAT(p.price) as product_prices,
      SUM(p.price) as total,
      o.created_at
      FROM \`Order\` o
      JOIN Order_Product op ON o.id = op.order_id
      JOIN Product p ON op.product_id = p.id
      GROUP BY o.id
      LIMIT 50
    `;
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).send(err);
    }
    
    // Format the results
    const orders = results.map(order => {
      const productIds = order.product_ids ? order.product_ids.split(',') : [];
      const productNames = order.product_names ? order.product_names.split(',') : [];
      const productPrices = order.product_prices ? order.product_prices.split(',').map(p => parseFloat(p)) : [];
      
      return {
        id: order.id,
        status: order.status,
        buyer_id: order.buyer_id,
        seller_id: order.seller_id,
        total: order.total,
        created_at: order.created_at,
        products: productIds.map((id, index) => ({
          id,
          name: productNames[index] || '',
          price: productPrices[index] || 0
        }))
      };
    });
    
    res.status(200).send(orders);
  });
});


module.exports = router;