import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Payment from '../models/paymentModel.js';
import Order from '../models/Order.js';
import User from '../models/userModel.js';

const router = express.Router();

// Create payment intent
router.post('/create-intent', protect, async (req, res) => {
    try {
        const { amount, currency, paymentMethod, cardDetails, order } = req.body;

        // Validate order exists
        const orderExists = await Order.findById(order);
        if (!orderExists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // In a real application, you would integrate with a payment gateway here
        // For this example, we'll simulate a successful payment
        const paymentId = `pi_${Math.random().toString(36).substr(2, 9)}`;

        // Create payment record
        const payment = new Payment({
            order,
            user: req.user._id,
            amount,
            currency,
            paymentMethod,
            status: 'completed',
            paymentId,
            cardDetails: {
                last4: cardDetails.cardNumber.slice(-4),
                cardHolderName: cardDetails.cardHolderName,
                expiryDate: cardDetails.expiryDate
            }
        });

        await payment.save();

        // Update order with payment information
        orderExists.paymentDetails = {
            paymentId: payment._id,
            status: 'completed',
            method: paymentMethod
        };
        await orderExists.save();

        res.json({
            success: true,
            paymentId: payment._id,
            message: 'Payment processed successfully'
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment processing failed'
        });
    }
});

// Get all payments (admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'firstName lastName email')
            .populate('order')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching payments'
        });
    }
});

// Get payment by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('order');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user is admin or payment owner
        if (!req.user.isAdmin && payment.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this payment'
            });
        }

        res.json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching payment'
        });
    }
});

// Update payment status (admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        payment.status = status;
        await payment.save();

        res.json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating payment status'
        });
    }
});

export default router; 