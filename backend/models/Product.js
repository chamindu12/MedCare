import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        max: 1000000
    },
    buyingPrice: {
        type: Number,
        required: true,
        min: 0,
        max: 1000000
    },
    image: {
        type: String,
        required: true,
       
    },
    category: {
        type: String,
        required: true,
        enum: ['Medicines', 'Medical Devices', 'First Aid', 'Health Supplements', 'Medical Equipment']
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: false // Made optional
    },
    brand: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    expiryDate: {
        type: Date,
        required: true,
        
    },
  
  
    isNew: {
        type: Boolean,
        default: true
    },
    outOfStock: {
        type: Boolean,
        default: false
    },
    isVisible: {
        type: Boolean,
        default: false
    },
    
    
    // New fields for supplier product management
    supplierProductCode: {
        type: String,
        trim: true,
        sparse: true
    },
    supplierPrice: {
        type: Number,
        min: 0
    },
    supplierDiscount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    
    supplierStatus: {
        type: String,
        enum: ['active', 'discontinued', 'on-hold'],
        default: 'active'
    },
    
}, {
    timestamps: true
});

// Add indexes for better query performance
productSchema.index({ supplier: 1, category: 1 });
productSchema.index({ isVisible: 1, outOfStock: 1 });
productSchema.index({ supplierProductCode: 1 }, { sparse: true });
productSchema.index({ supplierStatus: 1 });
productSchema.index({ expiryDate: 1 });
productSchema.index({ lastRestocked: 1 });

// Add a method to check if product needs reordering
productSchema.methods.needsReorder = function() {
    return this.quantity <= this.reorderPoint;
};

// Add a method to calculate days until expiry
productSchema.methods.daysUntilExpiry = function() {
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Add a method to check if product is expiring soon (within 30 days)
productSchema.methods.isExpiringSoon = function() {
    return this.daysUntilExpiry() <= 30;
};

const Product = mongoose.model('Product', productSchema);

export default Product; 