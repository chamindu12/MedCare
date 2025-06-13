import { useState, useEffect } from 'react';
import { ShoppingCartIcon, StarIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { addToCart, getCartItems } from '../../utils/cartUtils';
import { useUser } from '../../context/UserContext';
import Swal from 'sweetalert2';
import axios from 'axios';

function Shop() {
    const { user } = useUser();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Load cart items on component mount
        setCartItems(getCartItems(user?._id));
        // Fetch products from backend
        fetchProducts();
    }, [user?._id]); // Reload cart when user changes

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/products');
            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                setError('Failed to fetch products');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
        return matchesCategory && matchesSearch && matchesPrice;
    });

    const handleAddToCart = (product) => {
        if (product.outOfStock) {
            Swal.fire({
                title: 'Out of Stock',
                text: 'This product is currently out of stock',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const updatedCart = addToCart(product, user?._id);
            setCartItems(updatedCart);

            Swal.fire({
                title: 'Added to Cart!',
                text: `${product.name} has been added to your cart`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                position: 'top-end',
                toast: true
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const isInCart = (productId) => {
        return cartItems.some(item => item._id === productId);
    };

    const toggleFavorite = (productId) => {
        console.log('Toggled favorite for product:', productId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

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

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto py-8 px-4">
                {/* Mobile Filter Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-lg shadow-sm"
                >
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                    Filters
                </button>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white p-4 rounded-lg shadow-sm`}>
                        <h2 className="text-lg font-semibold mb-4">Filters</h2>
                        
                        {/* Categories */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-2">Categories</h3>
                            <div className="space-y-2">
                                {['All', 'Medicines', 'Medical Devices', 'First Aid', 'Health Supplements', 'Medical Equipment'].map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedCategory === category
                                            ? 'bg-[#2c8ba3] text-white'
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {category === 'All' ? 'All Products' : category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-2">Price Range</h3>
                            <div className="space-y-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>LKR {priceRange.min}</span>
                                    <span>LKR {priceRange.max}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="group relative flex flex-col h-full bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                    {/* Badges Container */}
                                    <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                                        {/* New badge */}
                                        {product.isNew && (
                                            <span className="bg-[#2c8ba3] text-white text-xs font-bold px-2 py-1 rounded-full">
                                                NEW
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Badges Container */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                     

                                        {/* Out of Stock badge */}
                                        {product.outOfStock && (
                                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    {/* Image container with fixed aspect ratio */}
                                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4 relative">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className={`w-full h-full object-cover object-center transition-opacity duration-300 ${product.outOfStock ? 'opacity-50' : 'group-hover:opacity-90'
                                                }`}
                                        />
                                        {product.outOfStock && (
                                            <div className="absolute inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center">
                                                <span className="text-white text-sm font-medium bg-gray-900 bg-opacity-50 px-3 py-1 rounded-full">
                                                    Out of Stock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#2c8ba3] transition-colors duration-200">
                                            {product.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2 flex-grow">
                                            {product.description}
                                        </p>

                                        {/* Add Price Display */}
                                        <div className="mt-3">
                                            <span className="text-xl font-bold text-[#2c8ba3]">
                                                LKR {new Intl.NumberFormat().format(product.price)}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-sm text-gray-500">
                                                Expiry: {new Date(product.expiryDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                Available: {product.quantity} units
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isInCart(product._id) || product.outOfStock || product.quantity < 1}
                                            className={`mt-4 w-full ${isInCart(product._id)
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : product.outOfStock || product.quantity < 1
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-[#2c8ba3] hover:bg-[#2c8ba3]/90'
                                                } text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors duration-300`}
                                        >
                                            <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                            {isInCart(product._id)
                                                ? 'Added to Cart'
                                                : product.outOfStock || product.quantity < 1
                                                    ? 'Out of Stock'
                                                    : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                                <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Shop;