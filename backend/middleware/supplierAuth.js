// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import Supplier from '../models/SupplierModel.js';

// Protect route middleware for supplier authentication
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.supplier = await Supplier.findById(decoded.supplierId); // Add supplier to request
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No token, authorization denied' });
    }
};

// Admin middleware to check if user is an admin
const admin = (req, res, next) => {
    if (req.supplier && req.supplier.userType === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

export { protect, admin };
