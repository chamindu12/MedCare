import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, HeartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getCartItems, updateCartItemQuantity, removeFromCart } from '../../utils/cartUtils';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import Swal from 'sweetalert2';

function Cart() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [cartItems, setCartItems] = useState([]);
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        loadCartItems();
        // Listen for cart updates (e.g., after clearCart)
        const handleCartUpdate = () => {
            loadCartItems();
        };
        window.addEventListener('cartUpdate', handleCartUpdate);
        return () => {
            window.removeEventListener('cartUpdate', handleCartUpdate);
        };
    }, [user?._id]); // Reload cart when user changes

    const loadCartItems = async () => {
        try {
            setLoading(true);
            const items = getCartItems(user?._id);

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
                                cartQuantity: item.quantity || 1 // Ensure cart quantity starts at 1
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

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;

        const item = cartItems.find(item => item._id === id);
        if (!item) return;

        try {
            // Update cart in localStorage
            const updatedItems = updateCartItemQuantity(id, newQuantity, item.quantity, user?._id);

            // Update state with new quantities
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === id
                        ? { ...item, cartQuantity: newQuantity }
                        : item
                )
            );
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const removeItem = (id) => {
        const updatedItems = removeFromCart(id, user?._id);
        setCartItems(updatedItems);
    };

    const saveForLater = (item) => {
        setSavedItems(prev => [...prev, item]);
        removeItem(item._id);
    };

    const moveToCart = (item) => {
        setCartItems(prev => [...prev, item]);
        setSavedItems(prev => prev.filter(i => i._id !== item._id));
    };

    const removeSavedItem = (id) => {
        setSavedItems(prev => prev.filter(item => item._id !== id));
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.cartQuantity || 1)), 0);
    const deliveryCharge = 200; // Fixed delivery charge
    const total = subtotal + deliveryCharge;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
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
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#2c8ba3] text-white flex items-center justify-center">1</div>
                            <div className="ml-2 text-sm font-medium text-[#2c8ba3]">Cart</div>
                        </div>
                        <div className="flex-1 h-1 mx-4 bg-gray-200">
                            <div className="h-1 bg-[#2c8ba3] w-0"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">2</div>
                            <div className="ml-2 text-sm font-medium text-gray-600">Checkout</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/shop')}
                        className="flex items-center text-[#2c8ba3] hover:text-[#2c8ba3]/90"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Continue Shopping
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        {cartItems.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#2c8ba3] hover:bg-[#2c8ba3]/90 transition-colors duration-300"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <ul role="list" className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <li key={item._id} className="p-6 flex flex-col sm:flex-row transition-all duration-300 hover:bg-gray-50">
                                            <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-lg overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-center object-cover"
                                                />
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 flex flex-col">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {item.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                                        <p className="text-sm text-gray-600">Brand: {item.brand || 'N/A'}</p>
                                                        {item.prescriptionRequired && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                                                                Prescription Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        LKR {(item.price * (item.cartQuantity || 1)).toFixed(2)}
                                                    </p>
                                                </div>

                                                <div className="mt-2 text-sm text-gray-500">
                                                    Expiry: {formatDate(item.expiryDate)}
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => updateQuantity(item._id, (item.cartQuantity || 1) - 1)}
                                                            className="p-2 border rounded-md hover:bg-gray-100 transition-colors duration-300"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center">{item.cartQuantity || 1}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item._id, (item.cartQuantity || 1) + 1)}
                                                            disabled={(item.cartQuantity || 1) >= item.quantity}
                                                            className={`p-2 border rounded-md transition-colors duration-300 ${
                                                                (item.cartQuantity || 1) >= item.quantity
                                                                    ? 'bg-gray-100 cursor-not-allowed'
                                                                    : 'hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-sm text-gray-500">
                                                            Available: {item.quantity} units
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                Swal.fire({
                                                                    title: 'Remove Item',
                                                                    text: 'Are you sure you want to remove this item from your cart?',
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: '#2c8ba3',
                                                                    cancelButtonColor: '#d33',
                                                                    confirmButtonText: 'Yes, remove it!'
                                                                }).then((result) => {
                                                                    if (result.isConfirmed) {
                                                                        removeItem(item._id);
                                                                        Swal.fire({
                                                                            title: 'Removed!',
                                                                            text: 'Item has been removed from your cart.',
                                                                            icon: 'success',
                                                                            timer: 1500,
                                                                            showConfirmButton: false
                                                                        });
                                                                    }
                                                                });
                                                            }}
                                                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-300"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Saved Items Section */}
                        {savedItems.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Saved for Later</h2>
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <ul role="list" className="divide-y divide-gray-200">
                                        {savedItems.map((item) => (
                                            <li key={item._id} className="p-6 flex flex-col sm:flex-row">
                                                <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-lg overflow-hidden">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-center object-cover"
                                                    />
                                                </div>
                                                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-medium text-gray-900">
                                                                {item.name}
                                                            </h3>
                                                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                                        </div>
                                                        <p className="text-lg font-medium text-gray-900">
                                                            LKR {item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="mt-4 flex items-center space-x-4">
                                                        <button
                                                            onClick={() => moveToCart(item)}
                                                            className="text-sm text-[#2c8ba3] hover:text-[#2c8ba3]/90 font-medium"
                                                        >
                                                            Move to Cart
                                                        </button>
                                                        <button
                                                            onClick={() => removeSavedItem(item._id)}
                                                            className="text-sm text-gray-400 hover:text-red-500"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <p className="text-gray-600">Subtotal</p>
                                    <p className="text-gray-900">LKR {subtotal.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-gray-600">Delivery Charge</p>
                                    <p className="text-gray-900">LKR {deliveryCharge.toFixed(2)}</p>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between">
                                        <p className="text-lg font-medium text-gray-900">Total</p>
                                        <p className="text-lg font-medium text-gray-900">LKR {total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/checkout')}
                                disabled={cartItems.length === 0}
                                className={`mt-6 w-full ${
                                    cartItems.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#2c8ba3] hover:bg-[#2c8ba3]/90'
                                } text-white px-6 py-3 rounded-md transition-all duration-300 transform hover:scale-[1.02]`}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;