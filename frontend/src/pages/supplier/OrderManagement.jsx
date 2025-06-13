import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';

function SupplierOrderManagement() {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/orders/supplier/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data.orders);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch orders', 'error');
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire('Success', 'Order status updated successfully', 'success');
            fetchOrders();
        } catch (error) {
            Swal.fire('Error', 'Failed to update order status', 'error');
        }
    };

    const handleDownloadReport = () => {
        const columns = [
            { header: 'Order ID', accessor: (order) => order._id },
            { header: 'Customer', accessor: (order) => order.contactInfo.name },
            { header: 'Total Amount', accessor: (order) => `$${order.totalAmount}` },
            { header: 'Status', accessor: (order) => order.status },
            { header: 'Order Date', accessor: (order) => new Date(order.orderDate).toLocaleDateString() }
        ];

        generatePDF('Order Management Report', filteredOrders, columns, 'order-management-report.pdf', 'orders');
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = orders.filter(order => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            order._id.toLowerCase().includes(searchLower) ||
            order.contactInfo.name.toLowerCase().includes(searchLower) ||
            order.contactInfo.email.toLowerCase().includes(searchLower) ||
            order.status.toLowerCase().includes(searchLower);

        const matchesStatus = selectedStatus === 'all' || order.status.toLowerCase() === selectedStatus.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                        onClick={handleDownloadReport}
                        className="w-full sm:w-auto px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Download Report
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        #{order._id.slice(-6)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.contactInfo.name}</div>
                                        <div className="text-sm text-gray-500">{order.contactInfo.email}</div>
                                        <div className="text-sm text-gray-500">{order.contactInfo.phone}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {order.items.map(item => (
                                                <div key={item._id} className="mb-1">
                                                    {item.product.name} x {item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${order.totalAmount}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className="w-full sm:w-auto px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SupplierOrderManagement; 