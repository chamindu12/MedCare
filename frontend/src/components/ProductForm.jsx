import React, { useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

const ProductForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        price: '',
        image: '',
        category: 'Medicines',
        description: '',
        brand: '',
        expiryDate: '',
        prescriptionRequired: false,
        supplier: '',
        quantity: 0
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Product name must be at least 3 characters';
        }

        // Price validation
        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be a positive number';
        }

        // Image URL validation
        if (!formData.image.trim()) {
            newErrors.image = 'Image URL is required';
        } else if (!/^https?:\/\/.+/.test(formData.image)) {
            newErrors.image = 'Please enter a valid URL';
        }

        // Category validation
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        // Brand validation
        if (!formData.brand.trim()) {
            newErrors.brand = 'Brand is required';
        }

        // Expiry Date validation
        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {initialData ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-500"
                >
                    <XCircleIcon className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Product Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${
                                    errors.name ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter product name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${
                                    errors.category ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="Medicines">Medicines</option>
                                <option value="Medical Devices">Medical Devices</option>
                                <option value="First Aid">First Aid</option>
                                <option value="Health Supplements">Health Supplements</option>
                                <option value="Medical Equipment">Medical Equipment</option>
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Brand
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${
                                    errors.brand ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter brand name"
                            />
                            {errors.brand && (
                                <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Price (LKR)
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${
                                    errors.price ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter price"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${
                                    errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.expiryDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Image URL
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${
                                    errors.image ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter image URL"
                            />
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                min="0"
                                className="mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] border-gray-300"
                                placeholder="Enter quantity"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="prescriptionRequired"
                                checked={formData.prescriptionRequired}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-[#2c8ba3] focus:ring-[#2c8ba3] border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Requires Prescription
                            </label>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${
                            errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter product description"
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#2c8ba3] text-white rounded-lg hover:bg-[#2c8ba3]/90"
                    >
                        {initialData ? 'Update' : 'Add'} Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm; 