import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import {
    ShoppingBagIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

function SupplierDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockProducts: 0,
        totalCategories: 0,
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/products/supplier/products', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const products = response.data.products || [];

            // Calculate statistics
            const lowStockProducts = products.filter(p => p.quantity < 10).length;
            const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
            const categories = new Set(products.map(p => p.category));

            setStats({
                totalProducts: products.length,
                lowStockProducts,
                totalCategories: categories.size,
                totalValue
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch dashboard data',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Welcome Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-[#2c8ba3] to-[#2c8ba3]/90">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">
                                Welcome back, {user?.firstName} {user?.lastName}!
                            </h2>
                            <p className="mt-1 text-sm text-white/90">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center sm:text-right">
                                <p className="text-sm text-white/90">Role</p>
                                <p className="text-base sm:text-lg font-semibold text-white">Supplier</p>
                            </div>
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-lg sm:text-xl font-bold text-white">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <ShoppingBagIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.totalProducts}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <ShoppingBagIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Categories</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.totalCategories}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <ShoppingBagIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 text-red-600">
                            <ExclamationTriangleIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                            <p className="text-lg font-semibold text-gray-900">{stats.lowStockProducts}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SupplierDashboard; 