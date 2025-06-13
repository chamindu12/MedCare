import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'lkr'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'card'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    cardDetails: {
        last4: String,
        cardHolderName: String,
        expiryDate: String
    },
    paymentId: {
        type: String,
        unique: true
    },
    receiptUrl: String,
    error: {
        message: String,
        code: String
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment; 