import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// Create a new order
export const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, contactInfo, paymentMethod, totalAmount, deliveryNotes } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!contactInfo || !contactInfo.name || !contactInfo.email || !contactInfo.phone) {
        res.status(400);
        throw new Error('Contact information is required');
    }

    // Calculate total amount and validate quantities
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.product}`);
        }

        // Check if product is out of stock
        if (product.outOfStock) {
            res.status(400);
            throw new Error(`${product.name} is out of stock`);
        }

        // Check if requested quantity is available
        if (product.quantity < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient quantity available for ${product.name}`);
        }

        // Check if product requires prescription
        if (product.prescriptionRequired && !item.prescription) {
            res.status(400);
            throw new Error(`Prescription required for ${product.name}`);
        }

        // Update product quantity and outOfStock status
        const newQuantity = product.quantity - item.quantity;
        await Product.findByIdAndUpdate(product._id, {
            quantity: newQuantity,
            outOfStock: newQuantity <= 0
        });

        calculatedTotal += product.price * item.quantity;
        orderItems.push({
            product: product._id,
            quantity: item.quantity,
            price: product.price
        });
    }

    const order = new Order({
        user: userId,
        items: orderItems,
        totalAmount: calculatedTotal,
        shippingAddress,
        contactInfo: {
            name: contactInfo.name,
            email: contactInfo.email,
            phone: contactInfo.phone
        },
        paymentMethod: 'Cash on Delivery',
        deliveryNotes: deliveryNotes || '',
        status: 'Pending'
    });

    await order.save();

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
    });
});

// Get user's orders
export const getUserOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        orders
    });
});

// Get single order
export const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('items.product');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this order');
    }

    res.status(200).json({
        success: true,
        order
    });
});

// Get all orders (admin only)
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate({
            path: 'items.product',
            select: 'name price image brand category'
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        orders
    });
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Handle quantity updates based on status changes
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
        // Restore quantities if order was not delivered
        if (order.status !== 'Delivered') {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    const newQuantity = product.quantity + item.quantity;
                    await Product.findByIdAndUpdate(product._id, {
                        quantity: newQuantity,
                        outOfStock: newQuantity <= 0
                    });
                }
            }
        }
    }

    order.status = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        order
    });
});

// Update order
export const updateOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, deliveryNotes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Validate status if provided
    if (status) {
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            res.status(400);
            throw new Error('Invalid status');
        }

        // Handle quantity updates based on status changes
        if (status === 'Delivered' && order.status !== 'Delivered') {
            // Reduce quantities when order is delivered
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    if (product.quantity < item.quantity) {
                        res.status(400);
                        throw new Error(`Insufficient quantity available for ${product.name}`);
                    }
                    const newQuantity = product.quantity - item.quantity;
                    await Product.findByIdAndUpdate(product._id, {
                        quantity: newQuantity,
                        outOfStock: newQuantity <= 0
                    });
                }
            }
        } else if (status === 'Cancelled' && order.status !== 'Cancelled') {
            // Restore quantities if order was not delivered
            if (order.status !== 'Delivered') {
                for (const item of order.items) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        const newQuantity = product.quantity + item.quantity;
                        await Product.findByIdAndUpdate(product._id, {
                            quantity: newQuantity,
                            outOfStock: newQuantity <= 0
                        });
                    }
                }
            }
        }

        order.status = status;
    }

    // Update delivery notes if provided
    if (deliveryNotes !== undefined) {
        order.deliveryNotes = deliveryNotes;
    }

    const updatedOrder = await order.save();

    res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        order: updatedOrder
    });
});

// Delete order
export const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Only allow deletion of pending or cancelled orders
    if (!['Pending', 'Cancelled'].includes(order.status)) {
        res.status(400);
        throw new Error('Can only delete pending or cancelled orders');
    }

    // If order is not cancelled and not delivered, restore product quantities
    if (order.status !== 'Cancelled' && order.status !== 'Delivered') {
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                const newQuantity = product.quantity + item.quantity;
                await Product.findByIdAndUpdate(product._id, {
                    quantity: newQuantity,
                    outOfStock: newQuantity <= 0
                });
            }
        }
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    });
});

// Get supplier orders
export const getSupplierOrders = asyncHandler(async (req, res) => {
    // Check if user is a supplier
    if (req.user.userType !== 'supplier') {
        res.status(403);
        throw new Error('Not authorized as a supplier');
    }

    // Get all orders that contain products from this supplier
    const orders = await Order.find()
        .populate({
            path: 'items.product',
            match: { supplier: req.user._id }
        })
        .sort({ createdAt: -1 });

    // Filter out orders that don't have any products from this supplier
    const supplierOrders = orders.filter(order =>
        order.items.some(item => item.product !== null)
    );

    // Format the orders to only include relevant items
    const formattedOrders = supplierOrders.map(order => ({
        _id: order._id,
        orderDate: order.orderDate,
        status: order.status,
        totalAmount: order.totalAmount,
        items: order.items.filter(item => item.product !== null).map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price
        })),
        shippingAddress: order.shippingAddress,
        contactInfo: order.contactInfo,
        deliveryNotes: order.deliveryNotes
    }));

    res.status(200).json({
        success: true,
        orders: formattedOrders
    });
}); 