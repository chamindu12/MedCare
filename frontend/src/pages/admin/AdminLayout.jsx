// src/pages/admin/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
    HomeIcon,
    UsersIcon,
    ShoppingBagIcon,
    ClipboardDocumentListIcon,
    Bars3Icon,
    XMarkIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    ShoppingCartIcon,
    ClockIcon,
    ArrowRightOnRectangleIcon,
    CreditCardIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BellIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalSuppliers: 0,
        expiringProducts: [],
        recentOrders: [],
        categoryDistribution: {}
    });
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [usersRes, ordersRes, productsRes, suppliersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/auth/users', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/products/admin/all', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/suppliers', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const orders = ordersRes.data.orders || [];
            const products = productsRes.data.products || [];
            const suppliers = suppliersRes.data.filter(user => user.userType === 'supplier') || [];

            // Calculate category distribution
            const categoryDistribution = products.reduce((acc, product) => {
                const category = product.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});

            // Calculate expiring products (within 10 days)
            const today = new Date();
            const tenDaysFromNow = new Date();
            tenDaysFromNow.setDate(today.getDate() + 10);

            const expiringProducts = products
                .filter(product => {
                    const expiryDate = new Date(product.expiryDate);
                    return expiryDate >= today && expiryDate <= tenDaysFromNow;
                })
                .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

            setStats({
                totalUsers: usersRes.data.length || 0,
                totalOrders: orders.length || 0,
                totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
                totalProducts: products.length || 0,
                totalSuppliers: suppliers.length || 0,
                expiringProducts: expiringProducts,
                recentOrders: orders.slice(0, 5),
                categoryDistribution
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', to: '/admin/dashboard', icon: HomeIcon },
        { name: 'Users', to: '/admin/users', icon: UsersIcon },
        { name: 'Suppliers', to: '/admin/suppliers', icon: UserGroupIcon },
        { name: 'Inventory', to: '/admin/products', icon: ShoppingBagIcon },
        { name: 'Orders', to: '/admin/orders', icon: ClipboardDocumentListIcon },
        { name: 'Payments', to: '/admin/payments', icon: CreditCardIcon },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={() => setSidebarOpen(false)}></div>
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white transform transition-transform duration-300 ease-in-out">
                    <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-[#2c8ba3] to-[#2c8ba3]/90">
                        <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-white hover:text-gray-200 transition-colors duration-200"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4 bg-white">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-[#2c8ba3]/10 text-[#2c8ba3]'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#2c8ba3]'
                                    }`
                                }
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                                        location.pathname === item.to
                                            ? 'text-[#2c8ba3]'
                                            : 'text-gray-400 group-hover:text-[#2c8ba3]'
                                    }`}
                                />
                                {item.name}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-500 transition-colors duration-200" />
                            Logout
                        </button>
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
                    <div className="flex h-16 items-center px-4 bg-gradient-to-r from-[#2c8ba3] to-[#2c8ba3]/90">
                        <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-[#2c8ba3]/10 text-[#2c8ba3]'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#2c8ba3]'
                                    }`
                                }
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                                        location.pathname === item.to
                                            ? 'text-[#2c8ba3]'
                                            : 'text-gray-400 group-hover:text-[#2c8ba3]'
                                    }`}
                                />
                                {item.name}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-500 transition-colors duration-200" />
                            Logout
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {location.pathname === '/admin/dashboard' ? (
                            <div className="space-y-6">
                                {/* Welcome Section */}
                                <div className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                                    <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-[#2c8ba3] to-[#2c8ba3]/90">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">
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
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="text-sm text-white/80">Role</p>
                                                    <p className="text-lg font-semibold text-white">Administrator</p>
                                                </div>
                                                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                                                    <span className="text-xl font-bold text-white">
                                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                                    {/* Total Users */}
                                    <div className="bg-white overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                                                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                                        <dd className="text-lg font-semibold text-gray-900">{stats.totalUsers}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Revenue */}
                                    <div className="bg-white overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                                                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                                        <dd className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Orders */}
                                    <div className="bg-white overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                                                    <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                                        <dd className="text-lg font-semibold text-gray-900">{stats.totalOrders}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Products */}
                                    <div className="bg-white overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
                                                    <ShoppingBagIcon className="h-6 w-6 text-yellow-600" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                                        <dd className="text-lg font-semibold text-gray-900">{stats.totalProducts}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Suppliers */}
                                    <div className="bg-white overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                                                    <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Suppliers</dt>
                                                        <dd className="text-lg font-semibold text-gray-900">{stats.totalSuppliers}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Categories Chart */}
                                <div className="mb-6">
                                    <div className="bg-white rounded-lg p-6 border border-gray-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-base font-semibold text-gray-900">Product Categories</h4>
                                            <div className="text-sm text-gray-500">
                                                Total Products: {stats.totalProducts}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="h-80">
                                                <Pie
                                                    data={{
                                                        labels: Object.keys(stats.categoryDistribution),
                                                        datasets: [
                                                            {
                                                                data: Object.values(stats.categoryDistribution),
                                                                backgroundColor: [
                                                                    'rgba(99, 102, 241, 0.2)',   // indigo
                                                                    'rgba(34, 197, 94, 0.2)',    // emerald
                                                                    'rgba(234, 88, 12, 0.2)',    // orange
                                                                    'rgba(220, 38, 38, 0.2)',    // red
                                                                    'rgba(168, 85, 247, 0.2)',   // violet
                                                                    'rgba(236, 72, 153, 0.2)',   // pink
                                                                    'rgba(6, 182, 212, 0.2)',    // cyan
                                                                    'rgba(234, 179, 8, 0.2)',    // yellow
                                                                ],
                                                                borderColor: [
                                                                    'rgb(99, 102, 241)',    // indigo
                                                                    'rgb(34, 197, 94)',     // emerald
                                                                    'rgb(234, 88, 12)',     // orange
                                                                    'rgb(220, 38, 38)',     // red
                                                                    'rgb(168, 85, 247)',    // violet
                                                                    'rgb(236, 72, 153)',    // pink
                                                                    'rgb(6, 182, 212)',     // cyan
                                                                    'rgb(234, 179, 8)',     // yellow
                                                                ],
                                                                borderWidth: 2,
                                                                hoverOffset: 4,
                                                            },
                                                        ],
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        cutout: '60%',
                                                        plugins: {
                                                            legend: {
                                                                display: false
                                                            },
                                                            tooltip: {
                                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                                titleColor: '#1f2937',
                                                                bodyColor: '#4b5563',
                                                                borderColor: '#e5e7eb',
                                                                borderWidth: 1,
                                                                padding: 12,
                                                                boxPadding: 6,
                                                                usePointStyle: true,
                                                                callbacks: {
                                                                    label: function(context) {
                                                                        const label = context.label || '';
                                                                        const value = context.raw || 0;
                                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                        const percentage = Math.round((value / total) * 100);
                                                                        return `${label}: ${value} (${percentage}%)`;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                {Object.entries(stats.categoryDistribution).map(([category, count], index) => {
                                                    const percentage = Math.round((count / stats.totalProducts) * 100);
                                                    const colors = [
                                                        'bg-indigo-500',
                                                        'bg-emerald-500',
                                                        'bg-orange-500',
                                                        'bg-red-500',
                                                        'bg-violet-500',
                                                        'bg-pink-500',
                                                        'bg-cyan-500',
                                                        'bg-yellow-500'
                                                    ];
                                                    return (
                                                        <div key={category} className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                                                                <span className="text-sm font-medium text-gray-700">{category}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                <div className="w-24 bg-gray-100 rounded-full h-2">
                                                                    <div
                                                                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                                                                    {percentage}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expiring Products Alert */}
                                {stats.expiringProducts.length > 0 && (
                                    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                                        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-amber-100/50 border-b border-amber-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-amber-100 rounded-lg">
                                                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-amber-900">Expiring Products</h3>
                                                        <p className="text-sm text-amber-700">
                                                            {stats.expiringProducts.length} products expiring soon
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                                        {stats.expiringProducts.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {stats.expiringProducts.map((product) => {
                                                    const daysUntilExpiry = Math.ceil(
                                                        (new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                                                    );
                                                    const statusColor = daysUntilExpiry <= 3 ? 'red' : 
                                                                      daysUntilExpiry <= 7 ? 'orange' : 
                                                                      'amber';
                                                    return (
                                                        <div key={product._id} 
                                                            className="group relative bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
                                                            <div className="absolute top-0 right-0">
                                                                <div className={`px-2 py-1 rounded-bl-lg rounded-tr-lg text-xs font-medium ${
                                                                    statusColor === 'red' ? 'bg-red-50 text-red-700' :
                                                                    statusColor === 'orange' ? 'bg-orange-50 text-orange-700' :
                                                                    'bg-amber-50 text-amber-700'
                                                                }`}>
                                                                    {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'} left
                                                                </div>
                                                            </div>
                                                            <div className="p-4">
                                                                <div className="flex items-start space-x-4">
                                                                    <div className="flex-shrink-0">
                                                                        <div className="relative">
                                                                            <img
                                                                                className="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-100"
                                                                                src={product.image}
                                                                                alt={product.name}
                                                                            />
                                                                            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                                                                                statusColor === 'red' ? 'bg-red-500' :
                                                                                statusColor === 'orange' ? 'bg-orange-500' :
                                                                                'bg-amber-500'
                                                                            }`} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#2c8ba3] transition-colors duration-200">
                                                                            {product.name}
                                                                        </h4>
                                                                        <div className="mt-2 space-y-1">
                                                                            <div className="flex items-center text-sm text-gray-500">
                                                                                <span className="w-20 text-gray-400">Quantity</span>
                                                                                <span className="font-medium">{product.quantity}</span>
                                                                            </div>
                                                                            <div className="flex items-center text-sm text-gray-500">
                                                                                <span className="w-20 text-gray-400">Price</span>
                                                                                <span className="font-medium">{formatCurrency(product.price)}</span>
                                                                            </div>
                                                                            <div className="flex items-center text-sm text-gray-500">
                                                                                <span className="w-20 text-gray-400">Expires</span>
                                                                                <span className="font-medium">{formatDate(product.expiryDate)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Orders */}
                                <div className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                                            <button className="text-sm text-[#2c8ba3] hover:text-[#2c8ba3]/80 transition-colors duration-200">
                                                View all
                                            </button>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {stats.recentOrders.map((order) => (
                                            <div key={order._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                Order #{order._id.slice(-6)}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {order.contactInfo.name} - {formatCurrency(order.totalAmount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-2 flex-shrink-0">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
