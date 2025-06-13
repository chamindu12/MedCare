import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
    userType: {
        type: String,
        enum: ['customer', 'admin', 'supplier'],
        default: 'customer'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    // Supplier specific fields
    companyName: {
        type: String,
        default: ''
    },
    businessType: {
        type: String,
        default: ''
    },
    taxId: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;