import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
} from '../controllers/payment.controller.js';
import { validateToken } from '../utils/validateToken.js'; // Assuming this is for auth

const router = express.Router();

/**
 * @route POST /payments/order
 * @description Create a new payment order
 * @access Private
 */
router.post('/order', validateToken, createPaymentOrder);

/**
 * @route POST /payments/verify
 * @description Verify a payment
 * @access Private
 */
router.post('/verify', validateToken, verifyPayment);

export default router;