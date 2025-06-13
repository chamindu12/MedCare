import express from 'express';
import { createOrder, getUserOrders, getOrder, getAllOrders, updateOrderStatus, updateOrder, deleteOrder, getSupplierOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getUserOrders);
router.get('/:id', protect, getOrder);

// Supplier routes
router.get('/supplier/orders', protect, getSupplierOrders);

// Admin routes
router.get('/', protect, getAllOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id', protect, updateOrder);
router.delete('/:id', protect, deleteOrder);

export default router; 