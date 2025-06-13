import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartItems, clearCart } from '../../utils/cartUtils';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ShoppingBagIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, DocumentTextIcon, BanknotesIcon, TruckIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/Spinner';
import CardPaymentForm from '../../components/payment/CardPaymentForm';
import { validateEmail, validatePhone, validateRequired, validateAddress } from '../../utils/validationUtils';
import { motion } from 'framer-motion';

function Checkout() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        deliveryNotes: ''
    });
    const [formData, setFormData] = useState({
        address: user?.address || '',
        phone: user?.phone || '',
        email: user?.email || '',
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        deliveryNotes: '',
        paymentMethod: 'cod' // Default to Cash on Delivery
    });

    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    const [cardErrors, setCardErrors] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    const [isCardValid, setIsCardValid] = useState(false);

    // Add new state for step tracking
    const [currentStep, setCurrentStep] = useState(1);
    const steps = [
        { id: 1, name: 'Shipping', icon: TruckIcon },
        { id: 2, name: 'Payment', icon: BanknotesIcon },
        { id: 3, name: 'Review', icon: ShieldCheckIcon }
    ];

    useEffect(() => {
        loadCartItems();
    }, [user?._id]);

    const loadCartItems = async () => {
        try {
            setLoading(true);
            const items = getCartItems(user?._id);
            if (items.length === 0) {
                navigate('/cart');
                return;
            }

            // Fetch product details for each cart item
            const itemsWithDetails = await Promise.all(
                items.map(async (item) => {
                    try {
                        const response = await axios.get(`http://localhost:5000/api/products/${item._id}`);
                        if (response.data.success) {
                            return {
                                ...item,
                                ...response.data.product,
                                price: response.data.product.price,
                                cartQuantity: item.quantity || 1 // Keep the cart quantity separate from stock quantity
                            };
                        }
                        return item;
                    } catch (error) {
                        console.error(`Error fetching product ${item._id}:`, error);
                        return item;
                    }
                })
            );

            setCartItems(itemsWithDetails);
        } catch (error) {
            setError('Error loading cart items');
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {
            name: '',
            email: '',
            phone: '',
            address: '',
            deliveryNotes: ''
        };

        // Validate name
        if (!validateRequired(formData.name)) {
            errors.name = 'Name is required';
        }

        // Validate email
        if (!validateRequired(formData.email)) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Validate phone
        if (!validateRequired(formData.phone)) {
            errors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        // Validate address
        if (!validateRequired(formData.address)) {
            errors.address = 'Address is required';
        } else if (!validateAddress(formData.address)) {
            errors.address = 'Please enter a complete address (minimum 10 characters)';
        }

        setFormErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const validateCardDetails = () => {
        const errors = {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolderName: ''
        };

        if (formData.paymentMethod === 'card') {
            if (!cardDetails.cardNumber || !/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
                errors.cardNumber = 'Please enter a valid 16-digit card number';
            }

            if (!cardDetails.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
                errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
            }

            if (!cardDetails.cvv || !/^\d{3,4}$/.test(cardDetails.cvv)) {
                errors.cvv = 'Please enter a valid CVV';
            }

            if (!cardDetails.cardHolderName) {
                errors.cardHolderName = 'Please enter card holder name';
            }
        }

        setCardErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleCardDetailsChange = (details, isValid) => {
        setCardDetails(details);
        setIsCardValid(isValid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Calculate total
            const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.cartQuantity || 1)), 0);
            const deliveryCharge = 200; // Fixed delivery charge of 200 LKR
            const total = subtotal + deliveryCharge;

            // Prepare order data
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id,
                    quantity: item.cartQuantity || 1,
                    price: item.price,
                    prescription: item.prescriptionRequired
                })),
                shippingAddress: formData.address.trim(),
                contactInfo: {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim()
                },
                paymentMethod: formData.paymentMethod,
                deliveryNotes: formData.deliveryNotes.trim(),
                total: total,
                subtotal: subtotal,
                deliveryCharge: deliveryCharge
            };

            // Add card details if payment method is card
            if (formData.paymentMethod === 'card') {
                orderData.cardDetails = {
                    cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
                    expiryDate: cardDetails.expiryDate,
                    cvv: cardDetails.cvv,
                    cardHolderName: cardDetails.cardHolderName
                };
            }

            // Create order
            const response = await axios.post('http://localhost:5000/api/orders', orderData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                // Clear cart after successful order
                clearCart(user?._id);
                
                // Show order summary modal
                await Swal.fire({
                    title: 'Order Placed Successfully!',
                    html: `
                        <div class="text-left">
                            <h3 class="text-lg font-semibold mb-4">Order Summary</h3>
                            <div class="space-y-2">
                                <p><strong>Order ID:</strong> #${response.data.order._id.slice(-6).toUpperCase()}</p>
                                <p><strong>Name:</strong> ${formData.name}</p>
                                <p><strong>Email:</strong> ${formData.email}</p>
                                <p><strong>Phone:</strong> ${formData.phone}</p>
                                <p><strong>Shipping Address:</strong> ${formData.address}</p>
                                <p><strong>Payment Method:</strong> ${formData.paymentMethod}</p>
                                <hr class="my-3">
                                <div class="space-y-1">
                                    ${cartItems.map(item => `
                                        <div class="flex justify-between">
                                            <span>${item.name} x ${item.cartQuantity || 1}</span>
                                            <span>LKR ${(item.price * (item.cartQuantity || 1)).toFixed(2)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <hr class="my-3">
                                <div class="flex justify-between font-semibold">
                                    <span>Subtotal:</span>
                                    <span>LKR ${subtotal.toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between font-semibold">
                                    <span>Delivery Charge:</span>
                                    <span>LKR ${deliveryCharge.toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between font-semibold text-lg mt-2">
                                    <span>Total:</span>
                                    <span>LKR ${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'View My Orders',
                    showCancelButton: true,
                    cancelButtonText: 'Continue Shopping'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/orders');
                    } else {
                        navigate('/shop');
                    }
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error placing order');
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to place order. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.cartQuantity || 1)), 0);
    const deliveryCharge = 200; // Fixed delivery charge of 200 LKR
    const total = subtotal + deliveryCharge;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" text="Loading your cart..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600 text-center">
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <nav aria-label="Progress">
                        <ol className="flex items-center justify-center space-x-8">
                            {steps.map((step, index) => (
                                <motion.li
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    className={`relative ${index !== steps.length - 1 ? 'pr-8' : ''}`}
                                >
                                    <div className="flex items-center">
                                        <span className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                                            currentStep >= step.id
                                                ? 'border-[#2c8ba3] bg-[#2c8ba3] text-white'
                                                : 'border-gray-300 bg-white text-gray-500'
                                        }`}>
                                            <step.icon className="h-5 w-5" />
                                        </span>
                                        {index !== steps.length - 1 && (
                                            <div className={`absolute top-4 left-8 -ml-px h-0.5 w-8 ${
                                                currentStep > step.id ? 'bg-[#2c8ba3]' : 'bg-gray-300'
                                            }`} />
                                        )}
                                    </div>
                                    <span className="mt-2 block text-sm font-medium text-gray-900">{step.name}</span>
                                </motion.li>
                            ))}
                        </ol>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Order Summary - Now spans 4 columns */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
                    >
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <ShoppingBagIcon className="h-5 w-5 mr-2 text-[#2c8ba3]" />
                            Order Summary
                        </h2>
                        
                        {/* Cart Items with Animation */}
                        <div className="space-y-4">
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-16 w-16 object-cover rounded-lg"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.cartQuantity || 1}</p>
                                            <p className="text-sm text-gray-600">Brand: {item.brand || 'N/A'}</p>
                                            {item.prescriptionRequired && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                    Prescription Required
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        LKR {(item.price * (item.cartQuantity || 1)).toFixed(2)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary Details */}
                        <div className="mt-6 space-y-3 border-t border-gray-200 pt-4">
                            <div className="flex justify-between text-sm">
                                <p className="text-gray-600">Subtotal</p>
                                <p className="text-gray-900">LKR {subtotal.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <p className="text-gray-600">Delivery Charge</p>
                                <p className="text-gray-900">LKR {deliveryCharge.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t border-gray-200">
                                <p className="text-gray-900">Total</p>
                                <p className="text-[#2c8ba3]">LKR {total.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Delivery Time Estimate */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center">
                                <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900">Estimated Delivery</h4>
                                    <p className="text-sm text-blue-700">2-3 business days</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center">
                                <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                                <div>
                                    <h4 className="text-sm font-medium text-green-900">Secure Checkout</h4>
                                    <p className="text-sm text-green-700">Your information is protected</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shipping Form - Now spans 8 columns */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-8"
                    >
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
                            <h2 className="text-lg font-semibold mb-6 flex items-center">
                                <UserIcon className="h-5 w-5 mr-2 text-[#2c8ba3]" />
                                Shipping Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-all duration-200 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}`}
                                            placeholder="Enter your full name"
                                        />
                                        <UserIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${formErrors.name ? 'text-red-500' : 'text-gray-400'}`} />
                                    </div>
                                    {formErrors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 text-sm text-red-600 flex items-center"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formErrors.name}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-all duration-200 ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}`}
                                            placeholder="Enter your email"
                                        />
                                        <EnvelopeIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${formErrors.email ? 'text-red-500' : 'text-gray-400'}`} />
                                    </div>
                                    {formErrors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 text-sm text-red-600 flex items-center"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formErrors.email}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-all duration-200 ${formErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}`}
                                            placeholder="Enter your phone number"
                                        />
                                        <PhoneIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${formErrors.phone ? 'text-red-500' : 'text-gray-400'}`} />
                                    </div>
                                    {formErrors.phone && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 text-sm text-red-600 flex items-center"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formErrors.phone}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Address Field */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address *</label>
                                    <div className="relative">
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows="3"
                                            className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-all duration-200 ${formErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'}`}
                                            placeholder="Enter your complete shipping address"
                                        />
                                        <MapPinIcon className={`h-5 w-5 absolute left-3 top-3 ${formErrors.address ? 'text-red-500' : 'text-gray-400'}`} />
                                    </div>
                                    {formErrors.address && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 text-sm text-red-600 flex items-center"
                                        >
                                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formErrors.address}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Delivery Notes Field */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes (Optional)</label>
                                    <div className="relative">
                                        <textarea
                                            name="deliveryNotes"
                                            value={formData.deliveryNotes}
                                            onChange={handleChange}
                                            rows="2"
                                            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-all duration-200 hover:border-gray-400"
                                            placeholder="Any special instructions for delivery?"
                                        />
                                        <DocumentTextIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                                            formData.paymentMethod === 'cod'
                                                ? 'border-[#2c8ba3] bg-[#2c8ba3]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                                    >
                                        <input
                                            type="radio"
                                            id="cod"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <BanknotesIcon className="h-6 w-6 text-[#2c8ba3]" />
                                            </div>
                                            <div className="ml-3">
                                                <label htmlFor="cod" className="font-medium text-gray-900">
                                                    Cash on Delivery
                                                </label>
                                                <p className="text-sm text-gray-500">Pay when you receive your order</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                                            formData.paymentMethod === 'card'
                                                ? 'border-[#2c8ba3] bg-[#2c8ba3]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                    >
                                        <input
                                            type="radio"
                                            id="card"
                                            name="paymentMethod"
                                            value="card"
                                            checked={formData.paymentMethod === 'card'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-[#2c8ba3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <label htmlFor="card" className="font-medium text-gray-900">
                                                    Credit/Debit Card
                                                </label>
                                                <p className="text-sm text-gray-500">Pay securely with your card</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Card Details Form */}
                            {formData.paymentMethod === 'card' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6"
                                >
                                    <CardPaymentForm
                                        onCardDetailsChange={handleCardDetailsChange}
                                        errors={cardErrors}
                                        setErrors={setCardErrors}
                                    />
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <div className="mt-8">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={submitting || (formData.paymentMethod === 'card' && !isCardValid)}
                                    className={`w-full bg-[#2c8ba3] text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg ${
                                        submitting || (formData.paymentMethod === 'card' && !isCardValid)
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-[#2c8ba3]/90'
                                    }`}
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Place Order'
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Checkout; 