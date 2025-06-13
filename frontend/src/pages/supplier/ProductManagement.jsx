import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Modal, Button } from 'react-bootstrap';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function SupplierProductManagement() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: '',
        category: 'Medicines',
        description: '',
        quantity: '',
        brand: '',
        expiryDate: '',
        prescriptionRequired: false
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/products/supplier/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch products');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }

        if (!formData.image.trim()) {
            newErrors.image = 'Image URL is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
            newErrors.quantity = 'Valid quantity is required';
        }

        if (!formData.brand.trim()) {
            newErrors.brand = 'Brand is required';
        }

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        } else {
            const expiryDate = new Date(formData.expiryDate);
            const today = new Date();
            if (expiryDate <= today) {
                newErrors.expiryDate = 'Expiry date must be in the future';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/products', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Product added successfully');
            setIsModalOpen(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error.response?.data?.message || 'Failed to add product');
        }
    };

    const handleEditProduct = (product) => {
        setFormData({
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description,
            quantity: product.quantity,
            brand: product.brand,
            expiryDate: new Date(product.expiryDate).toISOString().split('T')[0],
            prescriptionRequired: product.prescriptionRequired
        });
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            image: '',
            category: 'Medicines',
            description: '',
            quantity: '',
            brand: '',
            expiryDate: '',
            prescriptionRequired: false
        });
        setErrors({});
    };

    const filteredProducts = products.filter(product => {
        const searchLower = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.brand.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your products and inventory</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] shadow-sm"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            resetForm();
                        }}
                        className="w-full sm:w-auto bg-[#2c8ba3] text-white px-4 py-2.5 rounded-lg hover:bg-[#2c8ba3]/90 flex items-center justify-center shadow-sm"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (LKR)</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                                                    src={product.image}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        LKR {new Intl.NumberFormat().format(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                            product.quantity <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {product.quantity} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 p-1 rounded-lg hover:bg-gray-100"
                                                title="Edit Product"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-gray-100"
                                                title="Delete Product"
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

            {/* Add/Edit Product Modal */}
            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add New Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.category ? 'border-red-300' : 'border-gray-300'}`}
                                    >
                                        <option value="Medicines">Medicines</option>
                                        <option value="Medical Devices">Medical Devices</option>
                                        <option value="First Aid">First Aid</option>
                                        <option value="Health Supplements">Health Supplements</option>
                                        <option value="Medical Equipment">Medical Equipment</option>
                                    </select>
                                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.brand ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (LKR)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.price ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.expiryDate ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.image ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
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
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" className="bg-[#2c8ba3] hover:bg-[#2c8ba3]/90">
                                Add Product
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default SupplierProductManagement; 