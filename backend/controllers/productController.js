import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';
import Supplier from '../models/SupplierModel.js';

// Get all products (visible products only for customers)
export const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ isVisible: true })
        .populate('supplier', 'firstName lastName email companyName')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Get all products (including hidden) - Admin only
export const getAllProducts = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
        res.status(403);
        throw new Error('Only admins can access all products');
    }

    const products = await Product.find()
        .populate('supplier', 'firstName lastName email companyName')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Get products by supplier ID - Admin only
export const getProductsBySupplier = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
        res.status(403);
        throw new Error('Only admins can access supplier products');
    }

    const supplierId = req.params.supplierId;
    if (!supplierId) {
        res.status(400);
        throw new Error('Supplier ID is required');
    }

    // First get the supplier's products from their own collection
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
        res.status(404);
        throw new Error('Supplier not found');
    }

    // Then get products from the main products collection that belong to this supplier
    const products = await Product.find({ supplier: supplierId })
        .populate('supplier', 'firstName lastName email companyName')
        .sort({ createdAt: -1 });

    // Combine both sets of products
    const allProducts = [
        ...supplier.products.map(p => ({
            ...p.toObject(),
            isSupplierProduct: true
        })),
        ...products.map(p => ({
            ...p.toObject(),
            isSupplierProduct: false
        }))
    ];

    res.status(200).json({
        success: true,
        count: allProducts.length,
        products: allProducts
    });
});

// Get single product by ID
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('supplier', 'firstName lastName email companyName');

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.status(200).json({
        success: true,
        product
    });
});

// Create new product (admin or supplier)
export const createProduct = asyncHandler(async (req, res) => {
    // Check if user is admin or supplier
    if (!['admin', 'supplier'].includes(req.user.userType)) {
        res.status(403);
        throw new Error('Only admins or suppliers can create products');
    }

    const {
        name,
        price,
        buyingPrice,
        image,
        category,
        description,
        quantity,
        brand,
        expiryDate,
        prescriptionRequired,
        minimumQuantity,
        reorderPoint,
        supplierProductCode,
        supplierPrice,
        supplierDiscount,
        supplierLeadTime,
        supplierMinimumOrder,
        supplierMaxOrder,
        supplierNotes,
        supplierStatus,
        supplierPaymentTerms,
        supplierWarranty,
        supplierReturnPolicy,
        supplierShippingInfo,
        supplierContactPerson,
        supplierContactEmail,
        supplierContactPhone
    } = req.body;

    // Validate expiry date (must be in the future)
    if (new Date(expiryDate) <= new Date()) {
        res.status(400);
        throw new Error('Expiry date must be in the future');
    }

    // If user is a supplier, they must provide required fields
    if (req.user.userType === 'supplier') {
        if (!name || !price || !buyingPrice || !image || !category || !description || !quantity || !brand || !expiryDate) {
            res.status(400);
            throw new Error('All fields are required for suppliers');
        }
    }

    const product = await Product.create({
        name,
        price,
        buyingPrice,
        image,
        category,
        description,
        quantity,
        brand,
        expiryDate,
        prescriptionRequired,
        supplier: req.user.userType === 'admin' ? req.body.supplier : req.user._id,
        isVisible: req.user.userType === 'admin',
        minimumQuantity: minimumQuantity || 10,
        reorderPoint: reorderPoint || 5,
        lastRestocked: new Date(),
        outOfStock: quantity <= 0,
        // Add supplier-specific fields
        supplierProductCode,
        supplierPrice,
        supplierDiscount,
        supplierLeadTime,
        supplierMinimumOrder,
        supplierMaxOrder,
        supplierNotes,
        supplierStatus,
        supplierPaymentTerms,
        supplierWarranty,
        supplierReturnPolicy,
        supplierShippingInfo,
        supplierContactPerson,
        supplierContactEmail,
        supplierContactPhone
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
    });
});

// Update product (admin or supplier)
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user is authorized (admin or supplier of the product)
    if (
        req.user.userType !== 'admin' &&
        product.supplier.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error('Not authorized to update this product');
    }

    const {
        name,
        price,
        image,
        category,
        description,
        quantity,
        brand,
        expiryDate,
        prescriptionRequired,
        minimumQuantity,
        reorderPoint
    } = req.body;

    // Validate expiry date if provided
    if (expiryDate && new Date(expiryDate) <= new Date()) {
        res.status(400);
        throw new Error('Expiry date must be in the future');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: name || product.name,
            price: price || product.price,
            image: image || product.image,
            category: category || product.category,
            description: description || product.description,
            quantity: quantity !== undefined ? quantity : product.quantity,
            brand: brand || product.brand,
            expiryDate: expiryDate || product.expiryDate,
            prescriptionRequired: prescriptionRequired !== undefined ? prescriptionRequired : product.prescriptionRequired,
            minimumQuantity: minimumQuantity || product.minimumQuantity,
            reorderPoint: reorderPoint || product.reorderPoint,
            outOfStock: quantity <= 0 ? true : product.outOfStock,
            lastRestocked: quantity > product.quantity ? new Date() : product.lastRestocked
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
    });
});

// Get low stock products - Admin only
export const getLowStockProducts = asyncHandler(async (req, res) => {
    if (req.user.userType !== 'admin') {
        res.status(403);
        throw new Error('Only admins can access low stock products');
    }

    const products = await Product.find({
        quantity: { $lte: '$reorderPoint' }
    })
    .populate('supplier', 'firstName lastName email companyName')
    .sort({ quantity: 1 });

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Get expiring products - Admin only
export const getExpiringProducts = asyncHandler(async (req, res) => {
    if (req.user.userType !== 'admin') {
        res.status(403);
        throw new Error('Only admins can access expiring products');
    }

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const products = await Product.find({
        expiryDate: { $lte: thirtyDaysFromNow }
    })
    .populate('supplier', 'firstName lastName email companyName')
    .sort({ expiryDate: 1 });

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Delete product (admin or supplier)
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user is the supplier of this product or admin
    if (
        req.user.userType !== 'admin' &&
        product.supplier.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error('Not authorized to delete this product');
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    });
});

// Get products by category
export const getProductsByCategory = asyncHandler(async (req, res) => {
    const products = await Product.find({ category: req.params.category })
        .populate('supplier', 'firstName lastName email');

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Get supplier's products
export const getSupplierProducts = asyncHandler(async (req, res) => {
    // Check if user is a supplier
    if (req.user.userType !== 'supplier') {
        res.status(403);
        throw new Error('Only suppliers can access their products');
    }

    const products = await Product.find({ supplier: req.user._id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Update product quantity (admin or supplier)
export const updateProductQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user is the supplier of this product or admin
    if (
        req.user.userType !== 'admin' &&
        product.supplier.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error('Not authorized to update this product');
    }

    if (quantity < 0) {
        res.status(400);
        throw new Error('Quantity cannot be negative');
    }

    // Update quantity and outOfStock status
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            quantity,
            outOfStock: quantity <= 0
        },
        { new: true }
    );

    res.status(200).json({
        success: true,
        message: 'Product quantity updated successfully',
        product: updatedProduct
    });
});

// Toggle product visibility - Admin only
export const toggleProductVisibility = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
        res.status(403);
        throw new Error('Only admins can manage product visibility');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.isVisible = !product.isVisible;
    await product.save();

    res.status(200).json({
        success: true,
        message: `Product ${product.isVisible ? 'shown' : 'hidden'} in shop`,
        product
    });
});
