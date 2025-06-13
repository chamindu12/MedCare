// controllers/supplierController.js
import Supplier from '../models/SupplierModel.js';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

// @desc    Register a new supplier
// @route   POST /api/suppliers/register
// @access  Public
export const registerSupplier = asyncHandler(async (req, res) => {
    const { 
        firstName, 
        lastName, 
        email, 
        password, 
        phone, 
        address, 
        companyName, 
        businessType, 
        taxId,
        products 
    } = req.body;

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
        res.status(400);
        throw new Error('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const supplier = await Supplier.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        address,
        companyName,
        businessType,
        taxId,
        products: products || []
    });

    if (supplier) {
        res.status(201).json({
            _id: supplier._id,
            firstName: supplier.firstName,
            lastName: supplier.lastName,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            companyName: supplier.companyName,
            businessType: supplier.businessType,
            taxId: supplier.taxId,
            products: supplier.products
        });
    } else {
        res.status(400);
        throw new Error('Invalid supplier data');
    }
});

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private/Admin
export const getSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({}).select('-password');
    res.json(suppliers);
});

// @desc    Get a supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private/Admin
export const getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id).select('-password');

    if (supplier) {
        res.json(supplier);
    } else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
export const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        // Update basic information
        supplier.firstName = req.body.firstName || supplier.firstName;
        supplier.lastName = req.body.lastName || supplier.lastName;
        supplier.email = req.body.email || supplier.email;
        supplier.phone = req.body.phone || supplier.phone;
        supplier.address = req.body.address || supplier.address;
        supplier.companyName = req.body.companyName || supplier.companyName;

        // Update products if provided
        if (req.body.products) {
            // Ensure each product has a selling price calculated
            supplier.products = req.body.products.map(product => ({
                ...product,
                sellingPrice: product.sellingPrice || (parseFloat(product.buyingPrice) * 1.15).toFixed(2)
            }));
        }

        const updatedSupplier = await supplier.save();
        
        // Return updated supplier without password
        const supplierResponse = {
            _id: updatedSupplier._id,
            firstName: updatedSupplier.firstName,
            lastName: updatedSupplier.lastName,
            email: updatedSupplier.email,
            phone: updatedSupplier.phone,
            address: updatedSupplier.address,
            companyName: updatedSupplier.companyName,
            products: updatedSupplier.products
        };

        res.json(supplierResponse);
    } else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
export const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        await supplier.deleteOne();
        res.json({ message: 'Supplier removed' });
    } else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});

// @desc    Add or update a product for a supplier
// @route   PUT /api/suppliers/:id/products
// @access  Private/Admin
export const updateSupplierProducts = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
        res.status(404);
        throw new Error('Supplier not found');
    }

    if (!req.body.products || !Array.isArray(req.body.products)) {
        res.status(400);
        throw new Error('Products must be provided as an array');
    }

    // Ensure each product has a selling price calculated
    supplier.products = req.body.products.map(product => ({
        ...product,
        sellingPrice: product.sellingPrice || (parseFloat(product.buyingPrice) * 1.15).toFixed(2)
    }));

    const updatedSupplier = await supplier.save();

    res.json({
        _id: updatedSupplier._id,
        products: updatedSupplier.products
    });
});
