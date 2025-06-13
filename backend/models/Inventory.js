const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    reorderLevel: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock'],
        default: 'in-stock'
    },
    lastRestocked: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
inventorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update status based on quantity and reorder level
inventorySchema.pre('save', function(next) {
    if (this.quantity <= 0) {
        this.status = 'out-of-stock';
    } else if (this.quantity <= this.reorderLevel) {
        this.status = 'low-stock';
    } else {
        this.status = 'in-stock';
    }
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema); 