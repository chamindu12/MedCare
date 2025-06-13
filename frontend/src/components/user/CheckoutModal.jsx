import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { clearCart } from '../../utils/cartUtils';
import axios from 'axios';
import Swal from 'sweetalert2';

function CheckoutModal({ isOpen, onClose, cartItems, total }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Confirm order
            const result = await Swal.fire({
                title: 'Confirm Order',
                text: 'Are you sure you want to place this order?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, place order',
                cancelButtonText: 'No, cancel'
            });

            if (result.isConfirmed) {
                // Prepare order data
                const orderData = {
                    items: cartItems.map(item => ({
                        product: item.id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    shippingAddress: formData,
                    paymentMethod: 'Cash on Delivery'
                };

                // Create order
                const response = await axios.post('/api/orders', orderData);

                if (response.data.success) {
                    // Clear cart
                    clearCart();

                    // Show success message
                    await Swal.fire({
                        title: 'Order Placed!',
                        text: 'Your order has been placed successfully.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                    // Close modal and redirect
                    onClose();
                    navigate('/');
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Something went wrong',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-4xl">
                    <div className="absolute right-0 top-0 pr-4 pt-4">
                        <button
                            onClick={onClose}
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                            <p className="mt-1 text-sm text-gray-500">Please fill in your shipping information</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-16 w-16 object-cover rounded-md"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-sm">
                                            <p className="text-gray-600">Subtotal</p>
                                            <p className="text-gray-900">${(total * 0.9).toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <p className="text-gray-600">Tax (10%)</p>
                                            <p className="text-gray-900">${(total * 0.1).toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between text-base font-medium mt-2">
                                            <p className="text-gray-900">Total</p>
                                            <p className="text-gray-900">${total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <input
                                        type="text"
                                        name="street"
                                        required
                                        value={formData.street}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                        placeholder="Enter your street address"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                            placeholder="Enter your state"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            required
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                            placeholder="Enter your ZIP code"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            required
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                                            placeholder="Enter your country"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        className="w-full bg-[#2c8ba3] text-white px-4 py-2 rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-300"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutModal; 