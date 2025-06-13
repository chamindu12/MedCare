// models/SupplierModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    buyingPrice: {
        type: Number,
        required: true,
        min: 0
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 0
    }
});

const supplierSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    companyName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        default: ''
    },
    taxId: {
        type: String,
        default: ''
    },
    products: [productSchema],
    userType: {
        type: String,
        default: 'supplier'
    }
}, {
    timestamps: true
});

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
