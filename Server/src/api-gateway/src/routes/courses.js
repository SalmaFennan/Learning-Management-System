import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/list', async (req, res) => {
  try {
    const response = await axios.get('http://course-service:5005/api/courses/list', {
      headers: { Authorization: req.headers.authorization },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

export default router;