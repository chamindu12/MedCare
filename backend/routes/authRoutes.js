import express from 'express';
import {
    register,
    login,
    getMe,
    updateUser,
    deleteUser,
    getUsers,
    getUserById,
    updateUserByAdmin,
    deleteUserByAdmin,
    createUserByAdmin
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update', protect, updateUser);
router.delete('/delete', protect, deleteUser);

// User management routes
router.route('/users')
    .get(protect, getUsers)
    .post(protect, createUserByAdmin);

router.route('/users/:id')
    .get(protect, getUserById)
    .put(protect, updateUserByAdmin)
    .delete(protect, deleteUserByAdmin);

export default router;