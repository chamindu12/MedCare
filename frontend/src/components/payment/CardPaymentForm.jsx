import { useState, useEffect } from 'react';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';

function CardPaymentForm({ onCardDetailsChange, errors, setErrors }) {
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    const [cardType, setCardType] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        // Detect card type based on first digit
        const firstDigit = cardDetails.cardNumber.charAt(0);
        switch (firstDigit) {
            case '3':
                setCardType('amex');
                break;
            case '4':
                setCardType('visa');
                break;
            case '5':
                setCardType('mastercard');
                break;
            default:
                setCardType('');
        }
    }, [cardDetails.cardNumber]);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 3) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'expiryDate') {
            formattedValue = formatExpiryDate(value);
        }

        setCardDetails(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Clear error when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        // Validate and update parent component
        validateField(name, formattedValue);
    };

    const validateField = (name, value) => {
        let isValid = true;
        let errorMessage = '';

        switch (name) {
            case 'cardNumber':
                const cardNumber = value.replace(/\s/g, '');
                if (!/^\d{16}$/.test(cardNumber)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 16-digit card number';
                }
                break;
            case 'expiryDate':
                if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid expiry date (MM/YY)';
                } else {
                    const [month, year] = value.split('/');
                    const currentYear = new Date().getFullYear() % 100;
                    const currentMonth = new Date().getMonth() + 1;

                    if (parseInt(year) < currentYear ||
                        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                        isValid = false;
                        errorMessage = 'Card has expired';
                    }
                }
                break;
            case 'cvv':
                if (!/^\d{3,4}$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid CVV';
                }
                break;
            case 'cardHolderName':
                if (!value.trim()) {
                    isValid = false;
                    errorMessage = 'Please enter card holder name';
                }
                break;
            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: isValid ? '' : errorMessage
        }));

        onCardDetailsChange({
            ...cardDetails,
            [name]: value
        }, isValid);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Card Preview */}
            <div className="relative mb-8 perspective-1000">
                <div className={`transition-transform duration-500 transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front of card */}
                    <div className={`relative h-56 rounded-2xl p-6 shadow-xl ${!isFlipped ? 'block' : 'hidden'}`}
                        style={{
                            background: 'linear-gradient(135deg, #2c8ba3 0%, #1a5f73 100%)'
                        }}>
                        <div className="flex justify-between items-start">
                            <div className="text-white">
                                <h3 className="text-lg font-semibold mb-2">Credit Card</h3>
                                <p className="text-sm opacity-80">Enter your card details</p>
                            </div>
                            {cardType && (
                                <img
                                    src={`/card-icons/${cardType}.svg`}
                                    alt={cardType}
                                    className="h-8 w-auto"
                                />
                            )}
                        </div>
                        <div className="mt-8">
                            <p className="text-white text-xl tracking-wider font-mono">
                                {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                            </p>
                        </div>
                        <div className="mt-6 flex justify-between items-end">
                            <div>
                                <p className="text-white text-xs opacity-80">Card Holder</p>
                                <p className="text-white font-medium">
                                    {cardDetails.cardHolderName || 'YOUR NAME'}
                                </p>
                            </div>
                            <div>
                                <p className="text-white text-xs opacity-80">Expires</p>
                                <p className="text-white font-medium">
                                    {cardDetails.expiryDate || 'MM/YY'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back of card */}
                    <div className={`absolute top-0 left-0 w-full h-56 rounded-2xl p-6 shadow-xl bg-gray-800 ${isFlipped ? 'block' : 'hidden'}`}>
                        <div className="h-12 bg-black mt-4"></div>
                        <div className="mt-4 flex justify-end">
                            <div className="bg-white p-2 rounded">
                                <p className="text-black font-mono">{cardDetails.cvv || '•••'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
                    <div className="flex items-center space-x-2">
                        <LockClosedIcon className="h-5 w-5 text-[#2c8ba3]" />
                        <span className="text-sm text-gray-600">Secure Payment</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Card Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="cardNumber"
                                value={cardDetails.cardNumber}
                                onChange={handleChange}
                                maxLength="19"
                                placeholder="1234 5678 9012 3456"
                                className={`pl-12 block w-full rounded-lg border-gray-200 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 ${errors.cardNumber ? 'border-red-500' : ''}`}
                            />
                            <CreditCardIcon className={`h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.cardNumber ? 'text-red-500' : 'text-gray-400'}`} />
                        </div>
                        {errors.cardNumber && (
                            <p className="mt-2 text-sm text-red-600">{errors.cardNumber}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                name="expiryDate"
                                value={cardDetails.expiryDate}
                                onChange={handleChange}
                                maxLength="5"
                                placeholder="MM/YY"
                                className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 ${errors.expiryDate ? 'border-red-500' : ''}`}
                            />
                            {errors.expiryDate && (
                                <p className="mt-2 text-sm text-red-600">{errors.expiryDate}</p>
                            )}
                        </div>

                        {/* CVV */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="cvv"
                                    value={cardDetails.cvv}
                                    onChange={handleChange}
                                    onFocus={() => setIsFlipped(true)}
                                    onBlur={() => setIsFlipped(false)}
                                    maxLength="4"
                                    placeholder="123"
                                    className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 ${errors.cvv ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.cvv && (
                                <p className="mt-2 text-sm text-red-600">{errors.cvv}</p>
                            )}
                        </div>
                    </div>

                    {/* Card Holder Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Holder Name
                        </label>
                        <input
                            type="text"
                            name="cardHolderName"
                            value={cardDetails.cardHolderName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] transition-colors duration-200 ${errors.cardHolderName ? 'border-red-500' : ''}`}
                        />
                        {errors.cardHolderName && (
                            <p className="mt-2 text-sm text-red-600">{errors.cardHolderName}</p>
                        )}
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-[#2c8ba3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">Secure Payment</h3>
                            <div className="mt-1 text-sm text-gray-500">
                                <p>Your payment information is encrypted and secure. We never store your full card details.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardPaymentForm; 