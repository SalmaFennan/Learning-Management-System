import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/profile', async (req, res) => {
  try {
    const response = await axios.get('http://user-service:5003/api/users/profile', {
      headers: { Authorization: req.headers.authorization },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

export default router;