import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { CreditCardIcon, BanknotesIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, ChartBarIcon, ChartPieIcon, ListBulletIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';
import Swal from 'sweetalert2';

function PaymentManagement() {
    // State management for payments, UI elements like loading/error states,
    // selected payment for details view, filters, search query, and report configurations.
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [filter, setFilter] = useState('all'); // all, completed, pending, failed, refunded
    const [searchQuery, setSearchQuery] = useState('');
    const [reportType, setReportType] = useState('');
    const [reportPeriod, setReportPeriod] = useState('daily');
    const [reportFormat, setReportFormat] = useState('table'); // 'table' or 'list'

    // Fetches all payments when the component is first mounted.
    useEffect(() => {
        fetchPayments();
    }, []);

    // Asynchronously fetches all payments from the API.
    // It handles loading states, authorization token, and potential errors.
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/payments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setPayments(response.data.payments);
            } else {
                setError('Failed to fetch payments');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching payments');
        } finally {
            setLoading(false);
        }
    };

    // Asynchronously updates the status of a specific payment.
    // It sends a PUT request to the API and updates the local state upon success.
    // Displays success or error notifications to the user.
    const updatePaymentStatus = async (paymentId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/payments/${paymentId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                // Update local state
                setPayments(prevPayments =>
                    prevPayments.map(payment =>
                        payment._id === paymentId
                            ? { ...payment, status: newStatus }
                            : payment
                    )
                );
                setSelectedPayment(null);

                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `Payment status has been updated to ${newStatus}`,
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
        } catch (error) {
            console.error('Error updating payment status:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to update payment status',
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

    // Generates and triggers the download of a PDF report for the currently filtered payments.
    // Defines the columns for the report and uses a utility function for PDF generation.
    // Displays success or error notifications.
    const handleDownloadReport = () => {
        try {
            const columns = [
                { header: 'Payment ID', accessor: (payment) => payment.paymentId },
                { header: 'Customer', accessor: (payment) => `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim() || 'N/A' },
                { header: 'Amount', accessor: (payment) => `LKR ${payment.amount.toFixed(2)}` },
                { header: 'Method', accessor: (payment) => payment.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery' },
                { header: 'Status', accessor: (payment) => payment.status },
                { header: 'Date', accessor: (payment) => format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm') }
            ];

            generatePDF('Payment Report', filteredPayments, columns, 'payment-report.pdf', 'payments');

            Swal.fire({
                icon: 'success',
                title: 'Report Generated',
                text: 'Payment report has been generated successfully',
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
        } catch (error) {
            console.error('Error generating report:', error);
            Swal.fire({
                icon: 'error',
                title: 'Report Generation Failed',
                text: 'Failed to generate payment report',
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

    // Generates a payment analytics report based on the selected period (daily, weekly, monthly)
    // and format (table or list).
    // It filters payments for the period, groups them by date, calculates various metrics
    // (total amount, count, success/failure/refund rates, average amount),
    // and then generates a PDF report.
    const generatePaymentAnalyticsReport = () => {
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

        // Filter payments within the period
        const periodPayments = payments.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= startDate && paymentDate <= now;
        });

        // Group payments by date
        const paymentsByDate = periodPayments.reduce((acc, payment) => {
            const date = format(new Date(payment.createdAt), 'MMM d, yyyy');
            if (!acc[date]) {
                acc[date] = {
                    total: 0,
                    count: 0,
                    successful: 0,
                    failed: 0,
                    refunded: 0,
                    averageAmount: 0,
                    transactions: []
                };
            }
            acc[date].total += payment.amount;
            acc[date].count += 1;
            acc[date].transactions.push(payment);
            switch (payment.status) {
                case 'completed':
                    acc[date].successful += 1;
                    break;
                case 'failed':
                    acc[date].failed += 1;
                    break;
                case 'refunded':
                    acc[date].refunded += 1;
                    break;
            }
            return acc;
        }, {});

        // Calculate averages and format data
        const data = Object.entries(paymentsByDate).map(([date, data]) => ({
            date,
            total: data.total,
            count: data.count,
            successful: data.successful,
            failed: data.failed,
            refunded: data.refunded,
            successRate: ((data.successful / data.count) * 100).toFixed(1),
            averageAmount: (data.total / data.count).toFixed(2),
            transactions: data.transactions
        }));

        if (reportFormat === 'table') {
            const columns = [
                { header: 'Date', accessor: (item) => item.date },
                { header: 'Total Amount (LKR)', accessor: (item) => `LKR ${item.total.toFixed(2)}` },
                { header: 'Total Transactions', accessor: (item) => item.count },
                { header: 'Successful', accessor: (item) => item.successful },
                { header: 'Failed', accessor: (item) => item.failed },
                { header: 'Refunded', accessor: (item) => item.refunded },
                { header: 'Success Rate', accessor: (item) => `${item.successRate}%` },
                { header: 'Average Amount', accessor: (item) => `LKR ${item.averageAmount}` }
            ];

            generatePDF(
                `${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Payment Analytics Report`,
                data,
                columns,
                `payment-analytics-${reportPeriod}.pdf`,
                'payments'
            );
        } else {
            // List format
            const listData = data.map(item => ({
                title: item.date,
                details: [
                    `Total Amount: LKR ${item.total.toFixed(2)}`,
                    `Total Transactions: ${item.count}`,
                    `Successful: ${item.successful}`,
                    `Failed: ${item.failed}`,
                    `Refunded: ${item.refunded}`,
                    `Success Rate: ${item.successRate}%`,
                    `Average Amount: LKR ${item.averageAmount}`,
                    'Transactions:',
                    ...item.transactions.map(t => 
                        `- ${t.paymentId}: LKR ${t.amount.toFixed(2)} (${t.status})`
                    )
                ]
            }));

            generatePDF(
                `${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Payment Analytics Report`,
                listData,
                null,
                `payment-analytics-${reportPeriod}-list.pdf`,
                'payments-list'
            );
        }
    };

    // Generates a report analyzing payment methods (Credit/Debit Card, Cash on Delivery).
    // It groups payments by method, calculates metrics similar to the analytics report
    // (total amount, count, success/failure/refund rates, average/highest/lowest amounts),
    // and generates a PDF report in either table or list format.
    const generatePaymentMethodReport = () => {
        // Group payments by payment method
        const methodAnalysis = payments.reduce((acc, payment) => {
            const method = payment.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery';
            if (!acc[method]) {
                acc[method] = {
                    total: 0,
                    count: 0,
                    successful: 0,
                    failed: 0,
                    refunded: 0,
                    averageAmount: 0,
                    highestAmount: 0,
                    lowestAmount: Infinity,
                    transactions: []
                };
            }
            acc[method].total += payment.amount;
            acc[method].count += 1;
            acc[method].transactions.push(payment);
            acc[method].highestAmount = Math.max(acc[method].highestAmount, payment.amount);
            acc[method].lowestAmount = Math.min(acc[method].lowestAmount, payment.amount);
            switch (payment.status) {
                case 'completed':
                    acc[method].successful += 1;
                    break;
                case 'failed':
                    acc[method].failed += 1;
                    break;
                case 'refunded':
                    acc[method].refunded += 1;
                    break;
            }
            return acc;
        }, {});

        // Calculate averages and format data
        const methodData = Object.entries(methodAnalysis).map(([method, data]) => ({
            method,
            total: data.total,
            count: data.count,
            successful: data.successful,
            failed: data.failed,
            refunded: data.refunded,
            successRate: ((data.successful / data.count) * 100).toFixed(1),
            averageAmount: (data.total / data.count).toFixed(2),
            highestAmount: data.highestAmount.toFixed(2),
            lowestAmount: data.lowestAmount === Infinity ? '0.00' : data.lowestAmount.toFixed(2),
            transactions: data.transactions
        }));

        if (reportFormat === 'table') {
            const columns = [
                { header: 'Payment Method', accessor: (item) => item.method },
                { header: 'Total Amount (LKR)', accessor: (item) => `LKR ${item.total.toFixed(2)}` },
                { header: 'Total Transactions', accessor: (item) => item.count },
                { header: 'Successful', accessor: (item) => item.successful },
                { header: 'Failed', accessor: (item) => item.failed },
                { header: 'Refunded', accessor: (item) => item.refunded },
                { header: 'Success Rate', accessor: (item) => `${item.successRate}%` },
                { header: 'Average Amount', accessor: (item) => `LKR ${item.averageAmount}` },
                { header: 'Highest Amount', accessor: (item) => `LKR ${item.highestAmount}` },
                { header: 'Lowest Amount', accessor: (item) => `LKR ${item.lowestAmount}` }
            ];

            generatePDF(
                'Payment Method Performance Report',
                methodData,
                columns,
                'payment-method-performance.pdf',
                'payments'
            );
        } else {
            // List format
            const listData = methodData.map(item => ({
                title: item.method,
                details: [
                    `Total Amount: LKR ${item.total.toFixed(2)}`,
                    `Total Transactions: ${item.count}`,
                    `Successful: ${item.successful}`,
                    `Failed: ${item.failed}`,
                    `Refunded: ${item.refunded}`,
                    `Success Rate: ${item.successRate}%`,
                    `Average Amount: LKR ${item.averageAmount}`,
                    `Highest Amount: LKR ${item.highestAmount}`,
                    `Lowest Amount: LKR ${item.lowestAmount}`,
                    'Recent Transactions:',
                    ...item.transactions.slice(0, 5).map(t => 
                        `- ${t.paymentId}: LKR ${t.amount.toFixed(2)} (${t.status}) - ${format(new Date(t.createdAt), 'MMM d, yyyy')}`
                    )
                ]
            }));

            generatePDF(
                'Payment Method Performance Report',
                listData,
                null,
                'payment-method-performance-list.pdf',
                'payments-list'
            );
        }
    };

    // Handles the generation of different types of reports (analytics or methods)
    // based on the 'reportType' state.
    // It calls the respective report generation function and shows notifications.
    const handleReportGeneration = () => {
        try {
            if (reportType === 'analytics') {
                generatePaymentAnalyticsReport();
                Swal.fire({
                    icon: 'success',
                    title: 'Analytics Report Generated',
                    text: 'Payment analytics report has been generated successfully',
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
            } else if (reportType === 'methods') {
                generatePaymentMethodReport();
                Swal.fire({
                    icon: 'success',
                    title: 'Method Report Generated',
                    text: 'Payment method report has been generated successfully',
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
        } catch (error) {
            console.error('Error generating report:', error);
            Swal.fire({
                icon: 'error',
                title: 'Report Generation Failed',
                text: error.response?.data?.message || 'Failed to generate report',
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

    // Filters the list of payments based on the current search query and status filter.
    // The search query checks against payment ID, customer name, email, status, and payment method.
    const filteredPayments = payments.filter(payment => {
        const searchLower = searchQuery.toLowerCase();
        const customerName = `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.toLowerCase();
        const matchesSearch = (
            payment.paymentId.toLowerCase().includes(searchLower) ||
            customerName.includes(searchLower) ||
            payment.user?.email?.toLowerCase().includes(searchLower) ||
            payment.status.toLowerCase().includes(searchLower) ||
            payment.paymentMethod.toLowerCase().includes(searchLower)
        );

        const matchesFilter = filter === 'all' || payment.status === filter;

        return matchesSearch && matchesFilter;
    });

    // Returns a Tailwind CSS class string for styling payment status badges based on the status value.
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Displays a loading spinner animation while data is being fetched.
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

    // Displays an error message if fetching data or another operation fails.
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

    // Renders the main UI of the PaymentManagement component.
    // This includes the page title, search bar, report generation controls,
    // status filters, the table of payments, and the payment details modal.
    return (
        <div className="bg-white min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Payment Management</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all payments in the system including their status, amount, and payment method.
                        </p>
                    </div>
                </div>

                {/* Search, Download, and Report Generation */}
                <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                        >
                            <option value="">Select Report</option>
                            <option value="analytics">Payment Analytics</option>
                            <option value="methods">Payment Methods</option>
                        </select>
                        {reportType === 'analytics' && (
                            <select
                                value={reportPeriod}
                                onChange={(e) => setReportPeriod(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        )}
                        <select
                            value={reportFormat}
                            onChange={(e) => setReportFormat(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3]"
                        >
                            <option value="table">Table Format</option>
                            <option value="list">List Format</option>
                        </select>
                        <button
                            onClick={handleReportGeneration}
                            disabled={!reportType}
                            className={`px-4 py-2 rounded-md flex items-center justify-center ${
                                reportType 
                                    ? 'bg-[#2c8ba3] text-white hover:bg-[#2c8ba3]/90' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {reportFormat === 'table' ? (
                                <TableCellsIcon className="h-5 w-5 mr-2" />
                            ) : (
                                <ListBulletIcon className="h-5 w-5 mr-2" />
                            )}
                            <span className="hidden sm:inline">Generate Report</span>
                            <span className="sm:hidden">Report</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-4 flex space-x-2">
                    {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${filter === status
                                ? 'bg-[#2c8ba3] text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Payment ID
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Customer
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Amount
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Method
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Date
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filteredPayments.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-4 sm:px-6 py-4 text-center text-gray-500">
                                                    No payments found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPayments.map((payment) => (
                                                <tr key={payment._id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        {payment.paymentId}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {payment.user?.firstName} {payment.user?.lastName}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        LKR {payment.amount.toFixed(2)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            {payment.paymentMethod === 'card' ? (
                                                                <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
                                                            ) : (
                                                                <BanknotesIcon className="h-5 w-5 mr-2 text-gray-400" />
                                                            )}
                                                            {payment.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(payment.status)}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            onClick={() => setSelectedPayment(payment)}
                                                            className="text-[#2c8ba3] hover:text-[#2c8ba3]/90"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Payment Information</h4>
                                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedPayment.paymentId}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                        <dd className="mt-1 text-sm text-gray-900">LKR {selectedPayment.amount.toFixed(2)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Method</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {selectedPayment.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="mt-1">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(selectedPayment.status)}`}>
                                                {selectedPayment.status}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {selectedPayment.paymentMethod === 'card' && selectedPayment.cardDetails && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Card Details</h4>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Card Holder</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{selectedPayment.cardDetails.cardHolderName}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Last 4 Digits</dt>
                                            <dd className="mt-1 text-sm text-gray-900">**** {selectedPayment.cardDetails.last4}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{selectedPayment.cardDetails.expiryDate}</dd>
                                        </div>
                                    </dl>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
                                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedPayment.user?.email}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                {selectedPayment.status === 'completed' && (
                                    <button
                                        onClick={() => updatePaymentStatus(selectedPayment._id, 'refunded')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Refund Payment
                                    </button>
                                )}
                                {selectedPayment.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => updatePaymentStatus(selectedPayment._id, 'completed')}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                        >
                                            Mark as Completed
                                        </button>
                                        <button
                                            onClick={() => updatePaymentStatus(selectedPayment._id, 'failed')}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                        >
                                            Mark as Failed
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentManagement; 