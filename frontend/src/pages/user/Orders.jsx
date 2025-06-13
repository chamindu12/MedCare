import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { useUser } from '../../context/UserContext';
import Swal from 'sweetalert2';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/orders/myorders', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.success) {
                    setOrders(response.data.orders);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load orders. Please try again.'
                });
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Shipped':
                return 'bg-purple-100 text-purple-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered':
                return <FiCheckCircle className="w-5 h-5" />;
            case 'Processing':
                return <FiClock className="w-5 h-5" />;
            case 'Shipped':
                return <FiTruck className="w-5 h-5" />;
            case 'Cancelled':
                return <FiXCircle className="w-5 h-5" />;
            default:
                return <FiPackage className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <button
                        onClick={() => navigate('/shop')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2c8ba3] hover:bg-[#2c8ba3]/90"
                    >
                        Continue Shopping
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
                        <p className="mt-1 text-gray-500">Start shopping to see your orders here.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/shop')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2c8ba3] hover:bg-[#2c8ba3]/90"
                            >
                                Browse Products
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Order #{order._id.slice(-6).toUpperCase()}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="ml-1">{order.status}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="flow-root">
                                            <ul className="-my-5 divide-y divide-gray-200">
                                                {order.items.map((item) => (
                                                    <li key={item._id} className="py-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                                                                {item.product ? (
                                                                    <img
                                                                        src={item.product.image}
                                                                        alt={item.product.name}
                                                                        className="h-full w-full object-cover object-center"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                                                        No image
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {item.product ? item.product.name : 'Unknown Product'}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    Quantity: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    ${(item.price * item.quantity).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6 border-t border-gray-200 pt-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-500">Shipping Address</p>
                                                <p className="mt-1 text-sm text-gray-900">{order.shippingAddress}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Total Amount</p>
                                                <p className="mt-1 text-lg font-medium text-gray-900">
                                                    ${order.totalAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders; 