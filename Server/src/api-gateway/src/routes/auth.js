import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await axios.post('http://user-service:5003/api/auth/login', { username, password });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

export default router;