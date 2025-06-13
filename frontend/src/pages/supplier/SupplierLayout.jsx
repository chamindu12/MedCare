import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import {
    HomeIcon,
    ShoppingBagIcon,
    ClipboardDocumentListIcon,
    Bars3Icon,
    XMarkIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

function SupplierLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: []
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
            const [productsRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products/supplier/products', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const products = productsRes.data.products || [];
            const orders = ordersRes.data.orders || [];
            const supplierOrders = orders.filter(order =>
                order.items.some(item =>
                    products.some(product => product._id === item.product._id)
                )
            );

            setStats({
                totalProducts: products.length || 0,
                totalOrders: supplierOrders.length || 0,
                totalRevenue: supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0),
                recentOrders: supplierOrders.slice(0, 5)
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2c8ba3',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        });
    };

    const navigation = [
        { name: 'Dashboard', to: '/supplier/dashboard', icon: HomeIcon },
        { name: 'Products', to: '/supplier/products', icon: ShoppingBagIcon },
        { name: 'Orders', to: '/supplier/orders', icon: ClipboardDocumentListIcon },
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <XMarkIcon className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-4">
                            <h2 className="text-xl font-semibold text-gray-900">Supplier Panel</h2>
                        </div>
                        <nav className="mt-5 px-2 space-y-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                                            isActive
                                                ? 'bg-[#2c8ba3]/10 text-[#2c8ba3]'
                                                : 'text-gray-600 hover:bg-[#2c8ba3]/5 hover:text-[#2c8ba3]'
                                        }`
                                    }
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon
                                        className={`mr-4 h-6 w-6 flex-shrink-0 ${
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
                                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-900"
                            >
                                <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6 flex-shrink-0 text-red-400 group-hover:text-red-500" />
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
                    <div className="flex h-16 items-center px-4">
                        <h2 className="text-xl font-semibold text-gray-900">Supplier Panel</h2>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                        isActive
                                            ? 'bg-[#2c8ba3]/10 text-[#2c8ba3]'
                                            : 'text-gray-600 hover:bg-[#2c8ba3]/5 hover:text-[#2c8ba3]'
                                    }`
                                }
                            >
                                <item.icon
                                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
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
                            className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-900"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 flex-shrink-0 text-red-400 group-hover:text-red-500" />
                            Logout
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2c8ba3] lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1">
                            <h1 className="text-2xl font-semibold text-gray-900 self-center">
                                {navigation.find(item => item.to === location.pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>
                        <div className="ml-4 flex items-center md:ml-6">
                            <div className="flex items-center">
                                <div className="text-right mr-4">
                                    <p className="text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-gray-500">Supplier</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-[#2c8ba3]/10 flex items-center justify-center">
                                    <span className="text-lg font-bold text-[#2c8ba3]">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {location.pathname === '/supplier/dashboard' ? (
                            <div className="space-y-6">
                                {/* Welcome Section */}
                                <div className="bg-white shadow rounded-lg overflow-hidden">
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
                                                    <p className="text-sm text-white/90">Role</p>
                                                    <p className="text-lg font-semibold text-white">Supplier</p>
                                                </div>
                                                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                                    <span className="text-xl font-bold text-white">
                                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* Total Products */}
                                    <div className="bg-white overflow-hidden shadow rounded-lg">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                                        <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Revenue */}
                                    <div className="bg-white overflow-hidden shadow rounded-lg">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Orders */}
                                    <div className="bg-white overflow-hidden shadow rounded-lg">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                                        <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Orders</h3>
                                    </div>
                                    <div className="border-t border-gray-200">
                                        <ul className="divide-y divide-gray-200">
                                            {stats.recentOrders.map((order) => (
                                                <li key={order._id} className="px-4 py-4 sm:px-6">
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
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                                    order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                            'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
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

export default SupplierLayout; 