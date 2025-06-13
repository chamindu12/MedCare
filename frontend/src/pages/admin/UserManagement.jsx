import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { EyeIcon, UserPlusIcon, UserMinusIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, XCircleIcon, PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, FunnelIcon, ChartBarIcon, CalendarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';

// Component for managing users
function UserManagement() {
    // State variables for users, loading, error, modals, filters, form data, pagination
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterRole, setFilterRole] = useState('all');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        userType: 'customer'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        role: 'all',
        dateRange: '',
        status: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fetch users when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetches all users from the backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data || []);
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Opens the user details modal
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // Toggles the user type (admin/customer)
    const handleToggleUserType = async (userId, currentType) => {
        try {
            const newType = currentType === 'admin' ? 'customer' : 'admin';
            const result = await Swal.fire({
                title: 'Change User Role',
                text: `Are you sure you want to change this user's role to ${newType}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2c8ba3',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, change it',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:5000/api/auth/users/${userId}/role`, 
                    { userType: newType },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Role Updated',
                    text: `User role has been changed to ${newType}`,
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
                fetchUsers();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to update user role',
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

    // Validates the create user form data
    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        // Email validation (optional)
        if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        // Password validation (optional)
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Phone validation (optional)
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handles the creation of a new user
    const handleCreateUser = async (e) => {
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
            
            let payload = { ...formData };

            await axios.post('http://localhost:5000/api/auth/users', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'User Created',
                text: 'New user has been created successfully',
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

            setIsCreateModalOpen(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phone: '',
                address: '',
                userType: 'customer'
            });
            setErrors({});
            fetchUsers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.response?.data?.message || 'Failed to create user',
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

    // Handles input changes in the create user form
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handles the deletion of a user
    const handleDeleteUser = async (userId) => {
        try {
            const result = await Swal.fire({
                title: 'Delete User',
                text: "Are you sure you want to delete this user? This action cannot be undone.",
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
                await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire({
                    icon: 'success',
                    title: 'User Deleted',
                    text: 'The user has been successfully deleted',
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
                fetchUsers();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: error.response?.data?.message || 'Failed to delete user',
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

    // Returns Tailwind CSS classes for role-based color coding
    const getRoleColor = (userType) => {
        
        switch (userType) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'supplier':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    // Returns a display label for the user type
    const getRoleLabel = (userType) => {
        switch (userType) {
            case 'admin':
                return 'Admin';
            case 'supplier':
                return 'Supplier';
            default:
                return 'Customer';
        }
    };

    // Calculates user statistics
    const calculateStats = () => {
        return {
            totalUsers: users.length,
            adminUsers: users.filter(user => user.userType === 'admin').length,
            supplierUsers: users.filter(user => user.userType === 'supplier').length,
            customerUsers: users.filter(user => user.userType === 'customer').length
        };
    };

    // Memoized statistics object
    const stats = calculateStats();

    // Handles changes in filter inputs
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1);
    };

    // Filters users based on search query and filter criteria
    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
            (user.address && user.address.toLowerCase().includes(searchLower))
        );

        const matchesRole = filters.role === 'all' || user.userType === filters.role;
        const matchesStatus = filters.status === 'all' || user.status === filters.status;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Paginates the filtered users
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculates the total number of pages for pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Formats a date string into a readable format
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handles the download of a detailed PDF report of users
    const handleDownloadDetailedReport = () => {
        const columns = [
            { header: 'User ID', accessor: (user) => `#${user._id.slice(-6)}` },
            { header: 'Name', accessor: (user) => `${user.firstName} ${user.lastName}` },
            { header: 'Email', accessor: (user) => user.email },
            { header: 'Phone', accessor: (user) => user.phone || 'N/A' },
            { header: 'Address', accessor: (user) => user.address || 'N/A' },
            { header: 'Role', accessor: (user) => getRoleLabel(user.userType) },
            { header: 'Joined Date', accessor: (user) => formatDate(user.createdAt) }
        ];

        generatePDF('Detailed User Report', filteredUsers, columns, 'detailed-user-report.pdf', 'users');
    };

    // Handles the download of a summary PDF report of user statistics
    const handleDownloadSummaryReport = () => {
        // Calculate user statistics
        const totalUsers = filteredUsers.length;
        const adminCount = filteredUsers.filter(user => user.userType === 'admin').length;
        const supplierCount = filteredUsers.filter(user => user.userType === 'supplier').length;
        const customerCount = filteredUsers.filter(user => user.userType === 'customer').length;

        const summaryData = [
            { category: 'Total Users', count: totalUsers },
            { category: 'Admins', count: adminCount },
            { category: 'Suppliers', count: supplierCount },
            { category: 'Customers', count: customerCount }
        ];

        const columns = [
            { header: 'Category', accessor: (item) => item.category },
            { header: 'Count', accessor: (item) => item.count }
        ];

        generatePDF('User Summary Report', summaryData, columns, 'user-summary-report.pdf', 'summary');
    };

    // Displays a loading spinner while data is being fetched
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

    // Displays an error message if fetching data fails
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

    // Main JSX structure for the User Management page
    return (
        <div className="p-6 sm:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage and monitor all user accounts</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] shadow-sm"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="relative group">
                        <button
                            onClick={handleDownloadDetailedReport}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-[#2c8ba3] border border-[#2c8ba3] rounded-lg hover:bg-[#2c8ba3] hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            <span className="hidden sm:inline">Detailed Report</span>
                            <span className="sm:hidden">Detailed</span>
                        </button>
                    </div>
                    <div className="relative group">
                        <button
                            onClick={handleDownloadSummaryReport}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-[#2c8ba3] border border-[#2c8ba3] rounded-lg hover:bg-[#2c8ba3] hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            <span className="hidden sm:inline">Summary Report</span>
                            <span className="sm:hidden">Summary</span>
                        </button>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center shadow-sm"
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-[#2c8ba3] text-white rounded-lg hover:bg-[#2c8ba3]/90 transition-all duration-200 flex items-center justify-center shadow-sm"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Add New User</span>
                        <span className="sm:hidden">Add User</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <UserPlusIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Admin Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.adminUsers}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <UserPlusIcon className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Supplier Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.supplierUsers}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <UserPlusIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Customer Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.customerUsers}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <UserPlusIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow-lg mb-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                value={filters.role}
                                onChange={(e) => handleFilterChange('role', e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="supplier">Supplier</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <input
                                type="date"
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserPlusIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            User ID
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserPlusIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            Name
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center">
                                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            Email
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center">
                                            <ChartBarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            Role
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            Joined
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Cog6ToothIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            Actions
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2c8ba3]">
                                            <div className="flex items-center">
                                                <UserPlusIcon className="h-4 w-4 mr-2 text-[#2c8ba3]" />
                                                #{user._id.slice(-6)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                                    {user.phone && (
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <PhoneIcon className="h-4 w-4 mr-1" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.userType)}`}>
                                                    {getRoleLabel(user.userType)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200 p-1.5 hover:bg-[#2c8ba3]/10 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="text-red-500 hover:text-red-600 transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg"
                                                    title="Delete User"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} results
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* User Details Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-6 border w-[95%] sm:w-full max-w-2xl shadow-xl rounded-xl bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    User Details #{selectedUser._id.slice(-6)}
                                </h3>
                                <p className="text-gray-600 mt-1">View detailed information about this user</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-900">Name: {selectedUser.firstName} {selectedUser.lastName}</p>
                                        <p className="text-sm text-gray-900">Role: <span className={`px-2.5 py-1 rounded-full ${getRoleColor(selectedUser.userType)}`}>
                                            {getRoleLabel(selectedUser.userType)}
                                        </span></p>
                                        <p className="text-sm text-gray-900">Joined: {formatDate(selectedUser.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                        <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500" />
                                        Contact Information
                                    </h4>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-900">Email: {selectedUser.email}</p>
                                        {selectedUser.phone && (
                                            <p className="text-sm text-gray-900">Phone: {selectedUser.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                        <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                                        Address Information
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedUser.address ? (
                                            <p className="text-sm text-gray-900">Address: {selectedUser.address}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500">No address provided</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-6 border w-[95%] sm:w-full max-w-2xl shadow-xl rounded-xl bg-white">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Create New User</h3>
                                <p className="text-gray-600 mt-1">Add a new user to the system</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setErrors({});
                                }}
                                className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        First Name
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Enter first name"
                                            className={`w-full px-4 py-2.5 rounded-lg border ${errors.firstName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]'} shadow-sm transition-all duration-200 focus:shadow-md`}
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <XCircleIcon className="h-4 w-4 mr-1" />
                                                {errors.firstName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Last Name
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Enter last name"
                                            className={`w-full px-4 py-2.5 rounded-lg border ${errors.lastName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]'} shadow-sm transition-all duration-200 focus:shadow-md`}
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <XCircleIcon className="h-4 w-4 mr-1" />
                                                {errors.lastName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email Address
                                    <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]'} shadow-sm transition-all duration-200 focus:shadow-md`}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                    <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter password"
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]'} shadow-sm transition-all duration-200 focus:shadow-md`}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                            {errors.password}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">If provided, password must be at least 6 characters long</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                    <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]'} shadow-sm transition-all duration-200 focus:shadow-md`}
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Address
                                    <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter address"
                                        rows="3"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] shadow-sm transition-all duration-200 focus:shadow-md resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    User Type
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] shadow-sm transition-all duration-200 focus:shadow-md appearance-none bg-white"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="supplier">Supplier</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setErrors({});
                                    }}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#2c8ba3] text-white rounded-lg hover:bg-[#2c8ba3]/90 transition-all duration-200 shadow-sm font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:ring-offset-2"
                                >
                                    <UserPlusIcon className="h-5 w-5 mr-2" />
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
