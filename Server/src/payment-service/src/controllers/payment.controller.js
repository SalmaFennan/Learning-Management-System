import asyncHandler from '../utils/asyncHandler.middleware.js'; // Assuming you have this
import AppError from '../utils/error.util.js'; // Assuming you have this
import Payment from '../models/Payment.js';
import razorpay from '../utils/razorpay.js';

// Create payment order
export const createPaymentOrder = asyncHandler(async (req, res, next) => {
  const { amount, currency = 'INR', userId } = req.body;

  if (!amount || !userId) {
    return next(new AppError('Amount and userId are required', 400));
  }

  const options = {
    amount: amount * 100, // Amount in paise
    currency,
    receipt: `receipt_${Date.now()}_${userId}`,
  };

  const order = await razorpay.orders.create(options);

  const payment = new Payment({
    userId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    status: 'created',
  });
  await payment.save();

  res.status(201).json({
    success: true,
    order,
    payment,
  });
});

// Verify payment
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return next(new AppError('Invalid payment signature', 400));
  }

  const payment = await Payment.findOneAndUpdate(
    { orderId: razorpay_order_id },
    { status: 'completed', paymentId: razorpay_payment_id },
    { new: true }
  );

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    payment,
  });
});