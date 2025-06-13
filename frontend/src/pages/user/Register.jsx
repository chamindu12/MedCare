import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { validateEmail, validatePhone, validateRequired, validateMinLength, validateMaxLength, validateName } from '../../utils/validationUtils';

function Register() {
    const { register } = useUser();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        agreeToTerms: false
    });
    const [formErrors, setFormErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        agreeToTerms: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const calculateAge = (dateString) => {
        if (!dateString) return null;
        const today = new Date();
        const birthDate = new Date(dateString);
        if (isNaN(birthDate.getTime())) return null; // Invalid date string

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!validateRequired(formData.firstName)) {
            newErrors.firstName = 'First name is required';
        } else if (!validateName(formData.firstName)) {
            newErrors.firstName = 'First name can only contain letters and spaces';
        }

        // Last Name validation
        if (!validateRequired(formData.lastName)) {
            newErrors.lastName = 'Last name is required';
        } else if (!validateName(formData.lastName)) {
            newErrors.lastName = 'Last name can only contain letters and spaces';
        }

        // Validate email
        if (!validateRequired(formData.email)) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Validate password
        if (!validateRequired(formData.password)) {
            newErrors.password = 'Password is required';
        } else if (!validateMinLength(formData.password, 6)) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Validate confirm password
        if (!validateRequired(formData.confirmPassword)) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Validate terms agreement
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the Terms and Conditions';
        }

        // Validate phone (optional)
        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits and cannot contain letters or special characters';
        }

        // Validate Date of Birth
        if (!validateRequired(formData.dateOfBirth)) {
            newErrors.dateOfBirth = 'Date of birth is required';
        } else {
            const age = calculateAge(formData.dateOfBirth);
            if (age === null) {
                newErrors.dateOfBirth = 'Invalid date format.';
            } else if (age < 18) {
                newErrors.dateOfBirth = 'You must be at least 18 years old.';
            } else if (age > 120) { // Optional: reasonable upper age limit
                newErrors.dateOfBirth = 'Please enter a valid date of birth.';
            }
        }

        // Validate address 
        if (formData.address && !validateMaxLength(formData.address, 100) && !validateMinLength(formData.address, 5)) {
            newErrors.address = 'Address must be at least 5 characters long and less than 100 characters';
        } else if (formData.address && !validateRequired(formData.address)) {
            newErrors.address = 'Address is required';
        }

        setFormErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        // Clear error when user starts typing
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                throw new Error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
            }

        } catch (error) {
            setError(error.message);
            return;
        }

        if (!validateForm()) {
            return;
        }
        
        const age = calculateAge(formData.dateOfBirth);

        setLoading(true);
        const result = await register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            age: age,
            address: formData.address,
            userType: 'customer' // Always set as customer for public registration
        });

        if (!result.success) {
            setError(result.error);
        } else {
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-4xl font-extrabold text-gray-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-3 text-base text-gray-600">
                        Join our community and start your journey with us
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-600 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    First name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] sm:text-sm transition duration-150 ease-in-out ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {formErrors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Last name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] sm:text-sm transition duration-150 ease-in-out ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {formErrors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] sm:text-sm transition duration-150 ease-in-out ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] sm:text-sm transition duration-150 ease-in-out ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🔒' : '🔓'}
                                </button>
                                {formErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] sm:text-sm transition duration-150 ease-in-out ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone number (optional)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    autoComplete="tel"
                                    maxLength="10"
                                    minLength="10"
                                    pattern="^0[0-9]{9}$"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const re = /^[0-9\b]{0,10}$/;
                                        if (e.target.value === '' || re.test(e.target.value)) {
                                            if (e.target.value.length === 1 && e.target.value !== '0') {
                                                return;
                                            }
                                            handleChange(e);
                                        }
                                    }}
                                    className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] sm:text-sm transition duration-150 ease-in-out ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>
                            <div className="mt-1">
                                <input
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] sm:text-sm transition duration-150 ease-in-out ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.dateOfBirth && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Address (optional)
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] sm:text-sm transition duration-150 ease-in-out ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.address && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="agreeToTerms"
                                name="agreeToTerms"
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                className={`h-4 w-4 text-[#2c8ba3] focus:ring-2 focus:ring-[#2c8ba3] border-gray-300 rounded transition duration-150 ease-in-out ${formErrors.agreeToTerms ? 'border-red-500' : ''}`}
                            />
                            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                                I agree to the{' '}
                                <span
                                    onClick={() => setShowTermsModal(true)}
                                    className="cursor-pointer text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200"
                                >
                                    Terms and Conditions
                                </span>
                            </label>
                        </div>
                        {formErrors.agreeToTerms && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.agreeToTerms}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2c8ba3] to-[#1a6b7f] hover:from-[#1a6b7f] hover:to-[#2c8ba3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2c8ba3] transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create account'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {showTermsModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Terms and Conditions</h3>
                                <div className="mt-2 px-7 py-3 text-left">
                                    <p className="text-sm text-gray-500">
                                        <strong>Terms and Conditions</strong><br /><br />
                                        Welcome to MedCare! By creating an account, you agree to the following terms:<br /><br />
                                        <strong>1. Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. You agree to accept responsibility for all activities that occur under your account.<br /><br />
                                        <strong>2. Use of Service:</strong> You agree to use MedCare only for lawful purposes and in accordance with all applicable laws and regulations. You will not use the service for any fraudulent or harmful activity.<br /><br />
                                        <strong>3. Privacy:</strong> Your personal information will be handled in accordance with our Privacy Policy. We are committed to protecting your data and will not share your information with third parties without your consent, except as required by law.<br /><br />
                                        <strong>4. Medical Disclaimer:</strong> MedCare does not provide medical advice, diagnosis, or treatment. All information provided is for informational purposes only and should not be considered a substitute for professional medical advice.<br /><br />
                                        <strong>5. Termination:</strong> We reserve the right to suspend or terminate your account at our discretion if you violate these terms or engage in any activity that may harm the service or other users.<br /><br />
                                        <strong>6. Changes to Terms:</strong> We may update these Terms and Conditions from time to time. Continued use of the service after changes constitutes your acceptance of the new terms.<br /><br />
                                        If you have any questions about these Terms and Conditions, please contact our support team.
                                    </p>
                                </div>
                                <div className="items-center px-4 py-3">
                                    <button
                                        id="ok-btn"
                                        onClick={() => setShowTermsModal(false)}
                                        className="px-4 py-2 bg-[#2c8ba3] text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-[#1a6b7f] focus:outline-none focus:ring-2 focus:ring-[#2c8ba3]"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;