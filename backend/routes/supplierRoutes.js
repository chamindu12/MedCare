// routes/supplierRoutes.js
import express from 'express';
import { registerSupplier, getSuppliers, getSupplierById, updateSupplier, deleteSupplier } from '../controllers/SupplierController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for registering a supplier
router.route('/register').post(registerSupplier);

// Admin routes for managing suppliers
router.route('/')
  .get(protect, admin, getSuppliers); // Get all suppliers (Admin only)

router.route('/:id')
  .get(protect, admin, getSupplierById)   // Get supplier by ID (Admin only)
  .put(protect, admin, updateSupplier)    // Update supplier details (Admin only)
  .delete(protect, admin, deleteSupplier); // Delete supplier (Admin only)

export default router;
