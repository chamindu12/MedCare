import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiUser, FiMail, FiShoppingCart, FiPackage, FiMapPin, FiPhone, FiCalendar } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import Swal from 'sweetalert2';

function Profile() {
    const { user, updateUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Validation rules
    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!editData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (!/^[a-zA-Z\s]*$/.test(editData.firstName)) {
            newErrors.firstName = 'First name should only contain letters';
        }

        // Last Name validation
        if (!editData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (!/^[a-zA-Z\s]*$/.test(editData.lastName)) {
            newErrors.lastName = 'Last name should only contain letters';
        }

        // Phone validation
        if (editData.phone && !/^[0-9]{10}$/.test(editData.phone.replace(/[^0-9]/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        // Address validation
        if (!editData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        // Enhanced Date of Birth validation
        if (editData.dateOfBirth) {
            const birthDate = new Date(editData.dateOfBirth);
            const today = new Date();
            const age = calculateAge(editData.dateOfBirth);

            if (isNaN(birthDate.getTime())) {
                newErrors.dateOfBirth = 'Please enter a valid date';
            } else if (birthDate > today) {
                newErrors.dateOfBirth = 'Date of birth cannot be in the future';
            } else if (age < 18) {
                newErrors.dateOfBirth = 'You must be at least 18 years old';
            } else if (age > 120) {
                newErrors.dateOfBirth = 'Please enter a valid date of birth';
            }
        } else {
            newErrors.dateOfBirth = 'Date of birth is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (user) {
            setEditData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const saveProfile = async () => {
        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please check the form for errors'
            });
            return;
        }

        try {
            const result = await updateUser(editData);
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile has been updated successfully!',
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsEditing(false);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: result.error || 'Failed to update profile. Please try again.'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating your profile.'
            });
        }
    };

    const startEditing = () => {
        setEditData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            dateOfBirth: user.dateOfBirth || ''
        });
        setIsEditing(true);
    };

    const calculateProfileCompletion = () => {
        const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth'];
        const completedFields = fields.filter(field => user[field] && user[field].trim() !== '');
        return Math.round((completedFields.length / fields.length) * 100);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-[#2c8ba3] via-[#1a5f73] to-[#2c8ba3] px-8 py-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-white">My Profile</h1>
                            <button
                                onClick={startEditing}
                                className="bg-white/10 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2 text-white"
                            >
                                <FiEdit className="text-xl" />
                                <span className="font-medium">Edit Profile</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        {!isEditing ? (
                            <div className="space-y-8">
                                {/* Personal Information Section */}
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <FiUser className="text-[#2c8ba3] text-xl" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Full Name</p>
                                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <FiMail className="text-[#2c8ba3] text-xl" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email Address</p>
                                                    <p className="font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {user.phone && (
                                                <div className="flex items-center gap-3 text-gray-700">
                                                    <FiPhone className="text-[#2c8ba3] text-xl" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Phone Number</p>
                                                        <p className="font-medium">{user.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {user.dateOfBirth && (
                                                <div className="flex items-center gap-3 text-gray-700">
                                                    <FiCalendar className="text-[#2c8ba3] text-xl" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Date of Birth</p>
                                                        <p className="font-medium">{formatDate(user.dateOfBirth)} ({calculateAge(user.dateOfBirth)} years old)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Address Section */}
                                {user.address && (
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Address</h2>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <FiMapPin className="text-[#2c8ba3] text-xl" />
                                            <p className="font-medium">{user.address}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate('/shop')}
                                        className="bg-gradient-to-r from-[#2c8ba3] to-[#1a5f73] text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:from-[#1a5f73] hover:to-[#2c8ba3] transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                                    >
                                        <FiShoppingCart className="text-xl" />
                                        <span>Shop Now</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/orders')}
                                        className="bg-gradient-to-r from-[#2c8ba3] to-[#1a5f73] text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:from-[#1a5f73] hover:to-[#2c8ba3] transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                                    >
                                        <FiPackage className="text-xl" />
                                        <span>My Orders</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editData.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 ${errors.firstName ? 'border-red-500' : 'hover:border-gray-400'}`}
                                            placeholder="Enter your first name"
                                        />
                                        {errors.firstName && (
                                            <p className="text-sm text-red-600 animate-fade-in">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editData.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 ${errors.lastName ? 'border-red-500' : 'hover:border-gray-400'}`}
                                            placeholder="Enter your last name"
                                        />
                                        {errors.lastName && (
                                            <p className="text-sm text-red-600 animate-fade-in">{errors.lastName}</p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editData.email}
                                            disabled
                                            className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editData.phone}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 ${errors.phone ? 'border-red-500' : 'hover:border-gray-400'}`}
                                            placeholder="Enter your phone number"
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 animate-fade-in">{errors.phone}</p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={editData.dateOfBirth}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 ${errors.dateOfBirth ? 'border-red-500' : 'hover:border-gray-400'}`}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.dateOfBirth && (
                                            <p className="text-sm text-red-600 animate-fade-in">{errors.dateOfBirth}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={editData.address}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 ${errors.address ? 'border-red-500' : 'hover:border-gray-400'}`}
                                            placeholder="Enter your address"
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600 animate-fade-in">{errors.address}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4 pt-8">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveProfile}
                                        className="px-6 py-3 bg-gradient-to-r from-[#2c8ba3] to-[#1a5f73] text-white rounded-xl font-medium hover:from-[#1a5f73] hover:to-[#2c8ba3] transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;