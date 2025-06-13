import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { EyeIcon, TruckIcon, CheckCircleIcon, XCircleIcon, PhoneIcon, MapPinIcon, ClockIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ChartBarIcon, ChartPieIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';

function OrderManagement() {
    // State management for orders and UI
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
    const [filterAmountRange, setFilterAmountRange] = useState({
        min: '',
        max: ''
    });
    const [formData, setFormData] = useState({
        status: '',
        deliveryNotes: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});
    const [reportType, setReportType] = useState('');
    const [reportPeriod, setReportPeriod] = useState('daily');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // API call to fetch all orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data.orders || []);
        } catch (error) {
            setError('Failed to fetch orders');
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // View order details
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
        setIsEditMode(false);
    };

    // Edit order details
    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setFormData({
            status: order.status || '',
            deliveryNotes: order.deliveryNotes || ''
        });
        setIsModalOpen(true);
        setIsEditMode(true);
    };

    // Update order status
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                text: `Order status has been updated to ${newStatus}`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
            fetchOrders();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to update order status',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
        }
    };

    // Delete order with confirmation
    const handleDeleteOrder = async (orderId) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Order',
                text: "Are you sure you want to delete this order? This action cannot be undone.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2c8ba3',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                const response = await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Order Deleted',
                        text: 'The order has been successfully deleted',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    });
                    fetchOrders();
                } else {
                    throw new Error(response.data.message || 'Failed to delete order');
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: error.response?.data?.message || error.message || 'Failed to delete order',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
        }
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.status) {
            newErrors.status = 'Status is required';
        }

        if (formData.deliveryNotes && formData.deliveryNotes.length > 500) {
            newErrors.deliveryNotes = 'Delivery notes cannot exceed 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission with validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please check all required fields and try again',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/${selectedOrder._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Order Updated',
                text: 'The order has been successfully updated',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });

            setIsModalOpen(false);
            fetchOrders();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to update order',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Get status color for UI
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Shipped':
                return 'bg-purple-100 text-purple-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon for UI
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return <ClockIcon className="h-5 w-5" />;
            case 'Processing':
                return <TruckIcon className="h-5 w-5" />;
            case 'Shipped':
                return <TruckIcon className="h-5 w-5" />;
            case 'Delivered':
                return <CheckCircleIcon className="h-5 w-5" />;
            case 'Cancelled':
                return <XCircleIcon className="h-5 w-5" />;
            default:
                return null;
        }
    };

    // Generate and download order report
    const handleDownloadReport = () => {
        const columns = [
            { header: 'Order ID', accessor: (order) => `#${order._id.slice(-6)}` },
            { header: 'Customer', accessor: (order) => order.contactInfo.name },
            { header: 'Total Amount (LKR)', accessor: (order) => `LKR ${new Intl.NumberFormat().format(order.totalAmount)}` },
            { header: 'Status', accessor: (order) => order.status },
            { header: 'Order Date', accessor: (order) => formatDate(order.createdAt) },
        ];

        generatePDF('Order Management Report', filteredOrders, columns, 'order-management-report.pdf', 'orders');
    };

    // Filter orders based on search and status
    const filteredOrders = orders.filter(order => {
        const searchLower = searchQuery.toLowerCase();
        const statusMatch = filterStatus === 'all' || order.status === filterStatus;
        const searchMatch =
            order.contactInfo?.name?.toLowerCase().includes(searchLower) ||
            order.contactInfo?.email?.toLowerCase().includes(searchLower) ||
            order.status?.toLowerCase().includes(searchLower) ||
            order.paymentMethod?.toLowerCase().includes(searchLower) ||
            order.items?.some(item => item.product?.name?.toLowerCase().includes(searchLower));

        return statusMatch && searchMatch;
    });

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Generate sales report
    const generateSalesReport = () => {
        const now = new Date();
        let startDate = new Date();
        
        // Set start date based on period
        switch (reportPeriod) {
            case 'weekly':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(now.getMonth() - 1);
                break;
            default: // daily
                startDate.setDate(now.getDate() - 1);
        }

        // Filter orders within the period
        const periodOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= now;
        });

        // Group orders by date
        const salesByDate = periodOrders.reduce((acc, order) => {
            const date = new Date(order.createdAt).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = {
                    total: 0,
                    count: 0,
                    orders: []
                };
            }
            acc[date].total += order.totalAmount;
            acc[date].count += 1;
            acc[date].orders.push(order);
            return acc;
        }, {});

        const columns = [
            { header: 'Date', accessor: (item) => item.date },
            { header: 'Total Sales (LKR)', accessor: (item) => `LKR ${new Intl.NumberFormat().format(item.total)}` },
            { header: 'Number of Orders', accessor: (item) => item.count },
            { header: 'Average Order Value', accessor: (item) => `LKR ${new Intl.NumberFormat().format(item.total / item.count)}` }
        ];

        const data = Object.entries(salesByDate).map(([date, data]) => ({
            date,
            total: data.total,
            count: data.count
        }));

        generatePDF(
            `${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Sales Report`,
            data,
            columns,
            `sales-report-${reportPeriod}.pdf`,
            'sales'
        );
    };

    // Generate product performance report
    const generateProductPerformanceReport = () => {
        // Get all products from orders
        const productSales = orders.reduce((acc, order) => {
            order.items.forEach(item => {
                const productId = item.product?._id;
                if (productId) {
                    if (!acc[productId]) {
                        acc[productId] = {
                            name: item.product.name,
                            totalQuantity: 0,
                            totalRevenue: 0,
                            orderCount: 0
                        };
                    }
                    acc[productId].totalQuantity += item.quantity;
                    acc[productId].totalRevenue += (item.product.price * item.quantity);
                    acc[productId].orderCount += 1;
                }
            });
            return acc;
        }, {});

        // Convert to array and sort by revenue
        const productPerformance = Object.values(productSales)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 20); // Top 20 products

        const columns = [
            { header: 'Product Name', accessor: (item) => item.name },
            { header: 'Total Quantity Sold', accessor: (item) => item.totalQuantity },
            { header: 'Total Revenue (LKR)', accessor: (item) => `LKR ${new Intl.NumberFormat().format(item.totalRevenue)}` },
            { header: 'Number of Orders', accessor: (item) => item.orderCount },
            { header: 'Average Order Value', accessor: (item) => `LKR ${new Intl.NumberFormat().format(item.totalRevenue / item.orderCount)}` }
        ];

        generatePDF(
            'Product Performance Report',
            productPerformance,
            columns,
            'product-performance-report.pdf',
            'products'
        );
    };

    // Handle report generation based on type
    const handleReportGeneration = () => {
        if (reportType === 'sales') {
            generateSalesReport();
        } else if (reportType === 'products') {
            generateProductPerformanceReport();
        }
    };

    // Calculate statistics for dashboard
    const calculateStats = () => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'Pending').length;
        const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
        const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;
        return { totalOrders, pendingOrders, deliveredOrders, cancelledOrders };
    };

    const stats = calculateStats();

    // Loading state UI
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

    // Error state UI
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

    // Main component render
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{stats.totalOrders}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <ChartBarIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Orders</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{stats.pendingOrders}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <ClockIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Delivered Orders</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{stats.deliveredOrders}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <CheckCircleIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Cancelled Orders</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{stats.cancelledOrders}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <XCircleIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                    <button
                        onClick={handleDownloadReport}
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Download Report</span>
                        <span className="sm:hidden">Report</span>
                    </button>
                </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
                        <p className="text-sm text-gray-500 mt-1">Generate detailed reports for order analysis</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={reportPeriod}
                            onChange={(e) => setReportPeriod(e.target.value)}
                            className="rounded-lg border-gray-200 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] bg-white py-2 px-4 text-sm"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sales Report Card */}
                    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#2c8ba3] transition-all duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <ChartBarIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Sales Report</h3>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Total Sales & Orders
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Daily/Weekly/Monthly Breakdown
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Average Order Value
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setReportType('sales');
                                    handleReportGeneration();
                                }}
                                className="w-full bg-[#2c8ba3] text-white px-4 py-2.5 rounded-lg hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>Generate Sales Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Product Performance Report Card */}
                    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#2c8ba3] transition-all duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <ChartPieIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Product Performance Report</h3>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Top Selling Products
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Revenue by Product
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Quantity Sold
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setReportType('products');
                                    handleReportGeneration();
                                }}
                                className="w-full bg-[#2c8ba3] text-white px-4 py-2.5 rounded-lg hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>Generate Product Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Preview Section */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Report Preview</h4>
                            <p className="text-xs text-gray-500 mt-1">Select a report type and period to generate</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Format:</span>
                            <select className="rounded-lg border-gray-200 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] bg-white py-1.5 px-3 text-sm">
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-100">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                            >
                                <option value="all">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setFilterStatus('all');
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2c8ba3]">
                                            #{order._id.slice(-6)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{order.contactInfo.name}</div>
                                            <div className="text-xs text-gray-500">{order.contactInfo.email}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            LKR {new Intl.NumberFormat().format(order.totalAmount)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span className="ml-1.5">{order.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2 sm:space-x-3">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditOrder(order)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                    title="Edit Order"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                {order.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'Processing')}
                                                            className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                            title="Mark as Processing"
                                                        >
                                                            <TruckIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                                            className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                            title="Cancel Order"
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {order.status === 'Processing' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                                                        className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                        title="Mark as Shipped"
                                                    >
                                                        <TruckIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {order.status === 'Shipped' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                                                        className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                        title="Mark as Delivered"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                                    title="Delete Order"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} results
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Order Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-4xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Order' : 'Order Details'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedOrder(null);
                                }}
                                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {isEditMode ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] py-2.5 ${
                                            errors.status ? 'border-red-300' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
                                    <textarea
                                        name="deliveryNotes"
                                        value={formData.deliveryNotes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className={`w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] py-2.5 ${
                                            errors.deliveryNotes ? 'border-red-300' : 'border-gray-200'
                                        }`}
                                    />
                                    {errors.deliveryNotes && (
                                        <p className="mt-2 text-sm text-red-600">{errors.deliveryNotes}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setErrors({});
                                        }}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 bg-[#2c8ba3] text-white rounded-lg hover:bg-[#2c8ba3]/90 transition-colors duration-200 shadow-sm"
                                    >
                                        Update Order
                                    </button>
                                </div>
                            </form>
                        ) : selectedOrder ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                            <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            Order Information
                                        </h4>
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-900">Date: {formatDate(selectedOrder.createdAt)}</p>
                                            <p className="text-sm text-gray-900">
                                                Status: <span className={`px-3 py-1.5 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                                    {selectedOrder.status}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-900">Total: LKR {new Intl.NumberFormat().format(selectedOrder.totalAmount)}</p>
                                            <p className="text-sm text-gray-900">Payment Method: {selectedOrder.paymentMethod}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                            <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            Customer Information
                                        </h4>
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-900">Name: {selectedOrder.contactInfo.name}</p>
                                            <p className="text-sm text-gray-900">Email: {selectedOrder.contactInfo.email}</p>
                                            <p className="text-sm text-gray-900">Phone: {selectedOrder.contactInfo.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                            <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            Shipping Information
                                        </h4>
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-900">Address: {selectedOrder.shippingAddress}</p>
                                            {selectedOrder.deliveryNotes && (
                                                <p className="text-sm text-gray-900">
                                                    Delivery Notes: {selectedOrder.deliveryNotes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 mb-4">Order Items</h4>
                                        <div className="space-y-3">
                                            {selectedOrder.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.product?.name || 'Product not available'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        LKR {new Intl.NumberFormat().format((item.product?.price || 0) * item.quantity)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No order details available</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderManagement;
