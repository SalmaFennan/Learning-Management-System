import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/order', async (req, res) => {
  try {
    const response = await axios.post('http://payment-service:5004/api/payments/order', req.body, {
      headers: { Authorization: req.headers.authorization },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const response = await axios.post('http://payment-service:5004/api/payments/verify', req.body, {
      headers: { Authorization: req.headers.authorization },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

export default router;