import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, XCircleIcon, ChartBarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';
import { toast } from 'react-hot-toast';

function ProductManagement() {
    // State Management
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSupplierProductsModalOpen, setIsSupplierProductsModalOpen] = useState(false);
    const [selectedSupplierProducts, setSelectedSupplierProducts] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedSupplierProduct, setSelectedSupplierProduct] = useState(null);
    const [supplierProductQuantity, setSupplierProductQuantity] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        buyingPrice: '',
        image: '',
        category: 'Medicines',
        description: '',
        brand: '',
        expiryDate: '',
        prescriptionRequired: false,
        supplier: '',
        quantity: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showHidden, setShowHidden] = useState(true);
    const [errors, setErrors] = useState({});
    const [showSupplierProductsModal, setShowSupplierProductsModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [selectedProductForQuantity, setSelectedProductForQuantity] = useState(null);
    const [newQuantity, setNewQuantity] = useState(0);

    // PDF Report Filters
    const [pdfFilterCategory, setPdfFilterCategory] = useState('');
    const [pdfFilterBrand, setPdfFilterBrand] = useState('');
    const [pdfFilterSupplier, setPdfFilterSupplier] = useState('');
    const [pdfFilterExpiryDateStart, setPdfFilterExpiryDateStart] = useState('');
    const [pdfFilterExpiryDateEnd, setPdfFilterExpiryDateEnd] = useState('');
    const [pdfFilterMinQuantity, setPdfFilterMinQuantity] = useState('');
    const [pdfFilterMaxQuantity, setPdfFilterMaxQuantity] = useState('');
    const [reportPeriod, setReportPeriod] = useState('all');

    // Initial Data Loading
    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
    }, []);

    // Data Fetching Functions
    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await axios.get('http://localhost:5000/api/products/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                throw new Error(response.data.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2c8ba3',
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

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await axios.get('http://localhost:5000/api/suppliers', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                setSuppliers(response.data);
            } else {
                throw new Error('Failed to fetch suppliers');
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch suppliers';
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2c8ba3',
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

    // Form Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.buyingPrice || isNaN(formData.buyingPrice) || parseFloat(formData.buyingPrice) <= 0) {
            newErrors.buyingPrice = 'Valid buying price is required';
        }

        if (!formData.image.trim()) {
            newErrors.image = 'Image URL is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10 || formData.description.length > 500) {
            newErrors.description = 'Description must be between 10 and 500 characters';
        }

        if (!formData.brand.trim()) {
            newErrors.brand = 'Brand is required';
        }

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        }

        if (!formData.supplier) {
            newErrors.supplier = 'Supplier is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Product Management Functions
    const handleToggleVisibility = async (productId, currentVisibility) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await axios.put(
                `http://localhost:5000/api/products/admin/${productId}/visibility`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                Swal.fire({
                    title: 'Success',
                    text: `Product ${currentVisibility ? 'hidden' : 'shown'} in shop`,
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2c8ba3',
                    timer: 3000,
                    timerProgressBar: true,
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                });

                fetchProducts();
            } else {
                throw new Error(response.data.message || 'Failed to update product visibility');
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update product visibility';
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2c8ba3',
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

    // Report Generation Functions
    const handleDownloadReport = () => {
        const columns = [
            { header: 'Product Name', accessor: (product) => product.name },
            { header: 'Category', accessor: (product) => product.category },
            { header: 'Price (LKR)', accessor: (product) => `LKR ${new Intl.NumberFormat().format(product.price)}` },
            { header: 'Supplier', accessor: (product) => `${product.supplier?.firstName || ''} ${product.supplier?.lastName || ''}`.trim() || 'N/A' },
            { header: 'Expiry Date', accessor: (product) => new Date(product.expiryDate).toLocaleDateString() },
            { header: 'Quantity', accessor: (product) => product.quantity },
            { header: 'Status', accessor: (product) => product.isVisible ? 'Visible' : 'Hidden' }
        ];

        const productsForReport = applyPdfFilters(filteredProducts);

        if (productsForReport.length === 0) {
            toast.error('No products match the selected PDF filters. Report cannot be generated.');
            return;
        }

        generatePDF('Product Inventory Report', productsForReport, columns, 'product-inventory-report.pdf', 'products');
    };

    const handleDownloadAnalyticsReport = () => {
        // Calculate category statistics
        const productsForAnalytics = applyPdfFilters(filteredProducts);

        if (productsForAnalytics.length === 0) {
            toast.error('No products match the selected PDF filters. Analytics report cannot be generated.');
            return;
        }

        const categoryStats = productsForAnalytics.reduce((acc, product) => {
            if (!acc[product.category]) {
                acc[product.category] = {
                    totalProducts: 0,
                    totalValue: 0,
                    lowStockProducts: 0,
                    expiredProducts: 0,
                    visibleProducts: 0
                };
            }

            acc[product.category].totalProducts++;
            acc[product.category].totalValue += product.price * product.quantity;
            
            if (product.quantity <= 10) {
                acc[product.category].lowStockProducts++;
            }

            const expiryDate = new Date(product.expiryDate);
            const today = new Date();
            if (expiryDate <= today) {
                acc[product.category].expiredProducts++;
            }

            if (product.isVisible) {
                acc[product.category].visibleProducts++;
            }

            return acc;
        }, {});

        // Calculate overall statistics
        const totalInventoryValue = productsForAnalytics.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        const lowStockCount = productsForAnalytics.filter(product => product.quantity <= 10).length;
        const expiredCount = productsForAnalytics.filter(product => new Date(product.expiryDate) <= new Date()).length;
        const visibleCount = productsForAnalytics.filter(product => product.isVisible).length;

        // Prepare report data
        const analyticsData = [
            {
                section: 'Overall Statistics',
                totalProducts: productsForAnalytics.length,
                totalInventoryValue: `LKR ${new Intl.NumberFormat().format(totalInventoryValue)}`,
                lowStockProducts: lowStockCount,
                expiredProducts: expiredCount,
                visibleProducts: visibleCount
            },
            ...Object.entries(categoryStats).map(([category, stats]) => ({
                section: category,
                totalProducts: stats.totalProducts,
                totalInventoryValue: `LKR ${new Intl.NumberFormat().format(stats.totalValue)}`,
                lowStockProducts: stats.lowStockProducts,
                expiredProducts: stats.expiredProducts,
                visibleProducts: stats.visibleProducts
            }))
        ];

        const columns = [
            { header: 'Category', accessor: (data) => data.section },
            { header: 'Total Products', accessor: (data) => data.totalProducts },
            { header: 'Total Inventory Value', accessor: (data) => data.totalInventoryValue },
            { header: 'Low Stock Products', accessor: (data) => data.lowStockProducts },
            { header: 'Expired Products', accessor: (data) => data.expiredProducts },
            { header: 'Visible Products', accessor: (data) => data.visibleProducts }
        ];

        generatePDF('Product Analytics Report', analyticsData, columns, 'product-analytics-report.pdf', 'analytics');
    };

    // Product Filtering
    const filteredProducts = products.filter(product => {
        const searchLower = searchQuery.toLowerCase();
        const supplierName = `${product.supplier?.firstName || ''} ${product.supplier?.lastName || ''}`.toLowerCase();
        const matchesSearch = (
            product.name.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.brand.toLowerCase().includes(searchLower) ||
            supplierName.includes(searchLower)
        );

        const matchesVisibility = showHidden || product.isVisible;

        return matchesSearch && matchesVisibility;
    });

    // PDF Report Specific Filtering
    const applyPdfFilters = (productsToFilter) => {
        let currentlyFilteredProducts = [...productsToFilter];

        // Filter by Expiry Date Range
        if (pdfFilterExpiryDateStart) {
            const startDate = new Date(pdfFilterExpiryDateStart);
            startDate.setHours(0, 0, 0, 0); // Normalize to start of the day
            currentlyFilteredProducts = currentlyFilteredProducts.filter(p => {
                const expiryDate = new Date(p.expiryDate);
                return expiryDate >= startDate;
            });
        }
        if (pdfFilterExpiryDateEnd) {
            const endDate = new Date(pdfFilterExpiryDateEnd);
            endDate.setHours(23, 59, 59, 999); // Normalize to end of the day
            currentlyFilteredProducts = currentlyFilteredProducts.filter(p => {
                const expiryDate = new Date(p.expiryDate);
                return expiryDate <= endDate;
            });
        }

        // Placeholder for other PDF filters (Category, Brand, Supplier, Quantity)
        // if (pdfFilterCategory) { ... }
        // if (pdfFilterBrand) { ... }
        // if (pdfFilterSupplier) { ... }
        // if (pdfFilterMinQuantity) { ... }
        // if (pdfFilterMaxQuantity) { ... }

        return currentlyFilteredProducts;
    };

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'buyingPrice') {
            // Calculate selling price with 15% markup
            const buyingPrice = parseFloat(value) || 0;
            const sellingPrice = buyingPrice * 1.15; // 15% markup
            
            setFormData(prev => ({
                ...prev,
                buyingPrice: value,
                price: sellingPrice.toFixed(2) // Round to 2 decimal places
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // If the supplier dropdown changes, update selectedSupplier
        if (name === 'supplier') {
            const supplierObj = suppliers.find(s => s._id === value);
            setSelectedSupplier(supplierObj || null);
            setSelectedSupplierProducts([]); // Reset products
            setSelectedSupplierProduct(null); // Reset selected product
        }
    };

    // Product CRUD Operations
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please check all required fields and try again',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2c8ba3',
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
            if (!token) {
                Swal.fire({
                    title: 'Authentication Error',
                    text: 'Please login again to continue',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2c8ba3',
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

            // Ensure price is set based on buying price
            const buyingPrice = parseFloat(formData.buyingPrice) || 0;
            const sellingPrice = (buyingPrice * 1.15).toFixed(2);

            if (selectedSupplierProduct) {
                // Check if requested quantity is available
                if (parseInt(supplierProductQuantity) > selectedSupplierProduct.quantity) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Requested quantity exceeds supplier\'s available quantity',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#2c8ba3',
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

                // Show loading state
                const loadingToast = toast.loading('Transferring products from supplier to inventory...');

                // Prepare product data
                const productData = {
                    ...formData,
                    supplier: selectedSupplier._id,
                    quantity: parseInt(supplierProductQuantity),
                    name: selectedSupplierProduct.name,
                    price: sellingPrice, // Set the calculated selling price
                    category: selectedSupplierProduct.category,
                    brand: selectedSupplierProduct.brand,
                    image: selectedSupplierProduct.image || formData.image,
                    description: selectedSupplierProduct.description || formData.description,
                    reorderPoint: 5
                };

                try {
                    // Add product to inventory
                    const response = await axios.post('http://localhost:5000/api/products', productData, {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.data.success) {
                        throw new Error(response.data.message || 'Failed to add product');
                    }

                    // Update supplier's product quantity
                    const updatedProducts = selectedSupplier.products.map(p => {
                        if (p._id === selectedSupplierProduct._id) {
                            const newQuantity = p.quantity - parseInt(supplierProductQuantity);
                            return { ...p, quantity: newQuantity };
                        }
                        return p;
                    }).filter(p => p.quantity > 0); // Remove products with zero quantity

                    // Update supplier's products
                    const supplierResponse = await axios.put(`http://localhost:5000/api/suppliers/${selectedSupplier._id}/products`, {
                        products: updatedProducts
                    }, {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!supplierResponse.data.success) {
                        throw new Error('Failed to update supplier\'s product quantity');
                    }

                    // Update local state
                    setSelectedSupplierProducts(prev => 
                        prev.map(p => {
                            if (p._id === selectedSupplierProduct._id) {
                                const newQuantity = p.quantity - parseInt(supplierProductQuantity);
                                return { ...p, quantity: newQuantity };
                            }
                            return p;
                        }).filter(p => p.quantity > 0)
                    );

                    // Clear selected supplier product
                    setSelectedSupplierProduct(null);
                    setSupplierProductQuantity(0);

                    // Dismiss loading toast and show success
                    toast.dismiss(loadingToast);
                    toast.success(`Successfully transferred ${supplierProductQuantity} units from supplier to inventory`);

                    Swal.fire({
                        title: 'Success!',
                        html: `
                            <div class="text-left">
                                <p>Product has been successfully transferred from supplier to inventory:</p>
                                <ul class="mt-2 list-disc list-inside">
                                    <li>Product: ${selectedSupplierProduct.name}</li>
                                    <li>Quantity: ${supplierProductQuantity} units</li>
                                    <li>Supplier's remaining stock: ${selectedSupplierProduct.quantity - parseInt(supplierProductQuantity)} units</li>
                                </ul>
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#2c8ba3',
                        timer: 5000,
                        timerProgressBar: true,
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    });

                    setIsModalOpen(false);
                    resetForm();
                    fetchProducts();
                } catch (error) {
                    // Dismiss loading toast and show error
                    toast.dismiss(loadingToast);
                    toast.error('Failed to transfer products');
                    
                    console.error('Error details:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        headers: error.response?.headers
                    });
                    throw error;
                }
            } else {
                // Regular product addition logic (not from supplier)
                // Prepare product data for regular addition/update
                const productData = {
                    ...formData,
                    price: sellingPrice, // Set the calculated selling price
                    reorderPoint: 5
                };

                console.log('Submitting product data:', productData);

                try {
                    let response;
                    if (selectedProduct) {
                        // Update existing product
                        response = await axios.put(`http://localhost:5000/api/products/${selectedProduct}`, productData, {
                            headers: { 
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                    } else {
                        // Create new product
                        response = await axios.post('http://localhost:5000/api/products', productData, {
                            headers: { 
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                    }

                    console.log('Response:', response.data);

                    if (!response.data.success) {
                        throw new Error(response.data.message || 'Failed to save product');
                    }

                    Swal.fire({
                        title: 'Success!',
                        text: selectedProduct ? 'Product has been updated successfully' : 'Product has been added successfully',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#2c8ba3',
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
                    resetForm();
                    fetchProducts();
                } catch (error) {
                    console.error('Error details:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        headers: error.response?.headers
                    });
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error saving product:', error);
            if (error.response && error.response.status === 404) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Operation completed successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2c8ba3',
                    timer: 3000,
                    timerProgressBar: true,
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                });
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to save product';
                Swal.fire({
                    title: 'Error',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2c8ba3',
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
        }
    };

    // Supplier Product Management
    const handleViewSupplierProducts = async (supplierId) => {
        try {
            if (!supplierId) {
                toast.error('No supplier selected');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to view supplier products');
                return;
            }

            // Show loading state
            toast.loading('Loading supplier products...');

            const response = await fetch(`http://localhost:5000/api/products/supplier/${supplierId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch supplier products');
            }

            const data = await response.json();
            setSelectedSupplierProducts(data.products);
            setShowSupplierProductsModal(true);
            
            // Show success message
            toast.dismiss();
            toast.success('Supplier products loaded successfully');
        } catch (error) {
            console.error('Error fetching supplier products:', error);
            toast.dismiss();
            toast.error(error.message || 'Failed to fetch supplier products');
        }
    };

    const handleSupplierProductSelect = (product) => {
        if (!product || !product._id) {
            toast.error('Invalid product selected');
            return;
        }
        
        setSelectedSupplierProduct(product);
        const buyingPrice = parseFloat(product.buyingPrice) || 0;
        const sellingPrice = buyingPrice * 1.15; // 15% markup
        
        setFormData(prev => ({
            ...prev,
            name: product.name || '',
            buyingPrice: product.buyingPrice || '',
            price: sellingPrice.toFixed(2),
            category: product.category || 'Medicines',
            brand: product.brand || '',
            image: product.image || prev.image || '',
            description: product.description || prev.description || '',
            supplier: selectedSupplier._id
        }));

        // Show success message
        toast.success(`Selected product: ${product.name}`);
    };

    // Product Management Functions
    const handleEditProduct = async (product) => {
        try {
            // Calculate buying price from selling price
            const sellingPrice = parseFloat(product.price);
            const buyingPrice = (sellingPrice / 1.15).toFixed(2);
            
            // Set form data with the product details
            setFormData({
                name: product.name,
                buyingPrice: buyingPrice,
                price: product.price,
                image: product.image,
                category: product.category,
                description: product.description,
                brand: product.brand,
                expiryDate: new Date(product.expiryDate).toISOString().split('T')[0],
                prescriptionRequired: product.prescriptionRequired || false,
                supplier: product.supplier?._id || '',
                quantity: product.quantity
            });

            // Store the product ID for the update
            setSelectedProduct(product._id);
            
            // Open the modal
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error preparing product for edit:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to prepare product for editing',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2c8ba3',
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

    const handleDeleteProduct = async (productId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2c8ba3',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Product has been deleted.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#2c8ba3',
                    timer: 3000,
                    timerProgressBar: true,
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                });
                fetchProducts();
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to delete product',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2c8ba3',
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

    // Utility Functions
    const resetForm = () => {
        setFormData({
            name: '',
            buyingPrice: '',
            image: '',
            category: 'Medicines',
            description: '',
            brand: '',
            expiryDate: '',
            prescriptionRequired: false,
            supplier: '',
            quantity: 0
        });
        setSelectedSupplier(null);
        setSelectedSupplierProducts([]);
        setSelectedProduct(null);
        setErrors({});
    };

    const getQuantityColor = (quantity) => {
        if (quantity < 10) {
            return 'bg-red-100 text-red-800';
        } else if (quantity === 10) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-green-100 text-green-800';
        }
    };

    const handleUpdateQuantity = async (product) => {
        setSelectedProductForQuantity(product);
        setNewQuantity(product.quantity);
        setIsQuantityModalOpen(true);
    };

    const handleQuantitySubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue');
                return;
            }

            if (newQuantity < 0) {
                toast.error('Quantity cannot be negative');
                return;
            }

            const loadingToast = toast.loading('Updating product quantity...');

            const response = await axios.put(
                `http://localhost:5000/api/products/${selectedProductForQuantity._id}/quantity`,
                { quantity: parseInt(newQuantity) },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.dismiss(loadingToast);
                toast.success('Product quantity updated successfully');
                setIsQuantityModalOpen(false);
                fetchProducts();
            } else {
                throw new Error(response.data.message || 'Failed to update quantity');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update quantity');
            console.error('Error updating quantity:', error);
        }
    };

    // Generate supplier performance report
    const generateSupplierPerformanceReport = () => {
        const performanceData = suppliers.map(supplier => {
            const totalProducts = supplier.products?.length || 0;
            const totalValue = supplier.products?.reduce((sum, product) => 
                sum + (parseFloat(product.price) * parseFloat(product.quantity)), 0) || 0;
            const categories = [...new Set(supplier.products?.map(p => p.category) || [])];
            const brands = [...new Set(supplier.products?.map(p => p.brand) || [])];

            return {
                supplierId: `#${supplier._id.slice(-6)}`,
                name: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                totalProducts,
                totalValue: `LKR ${new Intl.NumberFormat().format(totalValue)}`,
                categories: categories.length,
                brands: brands.length,
                lastUpdated: formatDate(supplier.updatedAt || supplier.createdAt)
            };
        });

        const columns = [
            { header: 'Supplier ID', accessor: (item) => item.supplierId },
            { header: 'Name', accessor: (item) => item.name },
            { header: 'Company', accessor: (item) => item.company },
            { header: 'Total Products', accessor: (item) => item.totalProducts },
            { header: 'Total Value', accessor: (item) => item.totalValue },
            { header: 'Categories', accessor: (item) => item.categories },
            { header: 'Brands', accessor: (item) => item.brands },
            { header: 'Last Updated', accessor: (item) => item.lastUpdated }
        ];

        generatePDF('Supplier Performance Report', performanceData, columns, 'supplier-performance-report.pdf', 'suppliers');
    };

    // Generate supplier inventory report
    const generateSupplierInventoryReport = () => {
        const inventoryData = suppliers.flatMap(supplier => 
            (supplier.products || []).map(product => ({
                supplierId: `#${supplier._id.slice(-6)}`,
                supplierName: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                productName: product.name,
                category: product.category,
                brand: product.brand,
                quantity: product.quantity,
                price: `LKR ${parseFloat(product.price).toFixed(2)}`,
                totalValue: `LKR ${new Intl.NumberFormat().format(parseFloat(product.price) * parseFloat(product.quantity))}`
            }))
        );

        const columns = [
            { header: 'Supplier ID', accessor: (item) => item.supplierId },
            { header: 'Supplier Name', accessor: (item) => item.supplierName },
            { header: 'Company', accessor: (item) => item.company },
            { header: 'Product', accessor: (item) => item.productName },
            { header: 'Category', accessor: (item) => item.category },
            { header: 'Brand', accessor: (item) => item.brand },
            { header: 'Quantity', accessor: (item) => item.quantity },
            { header: 'Unit Price', accessor: (item) => item.price },
            { header: 'Total Value', accessor: (item) => item.totalValue }
        ];

        generatePDF('Supplier Inventory Report', inventoryData, columns, 'supplier-inventory-report.pdf', 'inventory');
    };

    // Add expiry report function
    const generateExpiryReport = () => {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiryData = products
            .filter(product => {
                const expiryDate = new Date(product.expiryDate);
                return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
            })
            .map(product => {
                const expiryDate = new Date(product.expiryDate);
                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                return {
                    productName: product.name,
                    category: product.category,
                    brand: product.brand,
                    quantity: product.quantity,
                    expiryDate: expiryDate.toLocaleDateString(),
                    daysUntilExpiry: daysUntilExpiry,
                    status: daysUntilExpiry <= 7 ? 'Critical' : daysUntilExpiry <= 15 ? 'Warning' : 'Notice',
                    supplier: product.supplier ? `${product.supplier.companyName} (${product.supplier.firstName} ${product.supplier.lastName})` : 'No Supplier'
                };
            })
            .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

        if (expiryData.length === 0) {
            toast.error('No products are expiring in the next 30 days.');
            return;
        }

        const columns = [
            { header: 'Product Name', accessor: (item) => item.productName },
            { header: 'Category', accessor: (item) => item.category },
            { header: 'Brand', accessor: (item) => item.brand },
            { header: 'Quantity', accessor: (item) => item.quantity },
            { header: 'Expiry Date', accessor: (item) => item.expiryDate },
            { header: 'Days Until Expiry', accessor: (item) => item.daysUntilExpiry },
            { header: 'Status', accessor: (item) => item.status },
            { header: 'Supplier', accessor: (item) => item.supplier }
        ];

        generatePDF('Product Expiry Report', expiryData, columns, 'product-expiry-report.pdf', 'expiry');
    };

    // Add this function to handle period selection
    const handlePeriodChange = (period) => {
        setReportPeriod(period);
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (period) {
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'all':
                startDate = '';
                endDate = '';
                break;
            default:
                break;
        }

        setPdfFilterExpiryDateStart(startDate ? startDate.toISOString().split('T')[0] : '');
        setPdfFilterExpiryDateEnd(endDate ? endDate.toISOString().split('T')[0] : '');
    };

    // Render Component
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Products</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{products.length}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <ChartBarIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Low Stock Items</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{products.filter(p => p.quantity <= 10).length}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <FunnelIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Categories</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{new Set(products.map(p => p.category)).size}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <FunnelIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Value</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">
                                LKR {new Intl.NumberFormat().format(products.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
                            </p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <ChartBarIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            resetForm();
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Add New Product</span>
                        <span className="sm:hidden">Add Product</span>
                    </button>
                </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
                        <p className="text-sm text-gray-500 mt-1">Generate detailed reports for inventory analysis</p>
                    </div>
                </div>

                {/* Report Period Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handlePeriodChange('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                reportPeriod === 'all'
                                    ? 'bg-[#2c8ba3] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => handlePeriodChange('week')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                reportPeriod === 'week'
                                    ? 'bg-[#2c8ba3] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => handlePeriodChange('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                reportPeriod === 'month'
                                    ? 'bg-[#2c8ba3] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Last 30 Days
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Inventory Report Card */}
                    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#2c8ba3] transition-all duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <ChartBarIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Inventory Report</h3>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Product Stock Levels
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Category Distribution
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Supplier Analysis
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadReport}
                                className="w-full bg-[#2c8ba3] text-white px-4 py-2.5 rounded-lg hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>Generate Inventory Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Analytics Report Card */}
                    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#2c8ba3] transition-all duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <FunnelIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Analytics Report</h3>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Stock Value Analysis
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Low Stock Alerts
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Category Performance
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadAnalyticsReport}
                                className="w-full bg-[#2c8ba3] text-white px-4 py-2.5 rounded-lg hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>Generate Analytics Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Expiry Report Card */}
                    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#2c8ba3] transition-all duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Expiry Report</h3>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                    30-Day Expiry Forecast
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                    Critical Stock Alerts
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                    Supplier Notifications
                                </div>
                            </div>
                            <button
                                onClick={generateExpiryReport}
                                className="w-full bg-[#2c8ba3] text-white px-4 py-2.5 rounded-lg hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>Generate Expiry Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buying Price (LKR)</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Selling Price (LKR)</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 flex-shrink-0">
                                                <img
                                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                                    src={product.image}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        LKR {new Intl.NumberFormat().format(product.buyingPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        LKR {new Intl.NumberFormat().format(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getQuantityColor(product.quantity)}`}>
                                            {product.quantity} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {product.supplier ? (
                                                <div>
                                                    <div className="font-semibold">{product.supplier.companyName}</div>
                                                    <div className="text-gray-500 text-xs">
                                                        {product.supplier.firstName} {product.supplier.lastName}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">No supplier</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(product.expiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleUpdateQuantity(product)}
                                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                                title="Update Quantity"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                                title="Edit Product"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                                title="Delete Product"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleVisibility(product._id, product.isVisible)}
                                                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                                                    product.isVisible ? 'text-green-600 hover:text-green-900' : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                                title={product.isVisible ? 'Hide Product' : 'Show Product'}
                                            >
                                                {product.isVisible ? (
                                                    <EyeIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                )}
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
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-8 border w-full max-w-4xl shadow-2xl rounded-2xl bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {selectedSupplier ? 'Add Product to Supplier' : 'Add New Product'}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">Fill in the product details below</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-500 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Supplier Selection */}
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Select Supplier</label>
                                    <div className="flex gap-3">
                                        <select
                                            name="supplier"
                                            value={formData.supplier}
                                            onChange={handleInputChange}
                                            className={`block w-full rounded-xl shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.supplier ? 'border-red-300' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select a supplier</option>
                                            {suppliers.map((supplier) => (
                                                <option key={supplier._id} value={supplier._id}>
                                                    {supplier.companyName} ({supplier.firstName} {supplier.lastName})
                                                </option>
                                            ))}
                                        </select>
                                        {formData.supplier && (
                                            <button
                                                type="button"
                                                onClick={() => handleViewSupplierProducts(formData.supplier)}
                                                className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-300 flex items-center transition-colors duration-200"
                                                title="View Supplier Products"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    {errors.supplier && <p className="mt-2 text-sm text-red-600">{errors.supplier}</p>}

                                    {/* Supplier Products Preview */}
                                    {formData.supplier && selectedSupplierProducts.length > 0 && (
                                        <div className="mt-6">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-sm font-semibold text-gray-700">Available Products from Supplier</h4>
                                                <span className="text-sm text-gray-500">{selectedSupplierProducts.length} products available</span>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buying Price</th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {selectedSupplierProducts.map((product) => {
                                                                const buyingPrice = parseFloat(product.price) || 0;
                                                                const sellingPrice = (buyingPrice * 1.15).toFixed(2);
                                                                return (
                                                                    <tr key={product._id} className={`hover:bg-gray-50 ${selectedSupplierProduct?._id === product._id ? 'bg-blue-50' : ''}`}>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">{product.category}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">LKR {new Intl.NumberFormat().format(buyingPrice)}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">LKR {new Intl.NumberFormat().format(sellingPrice)}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">{product.quantity}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                                {product.isVisible ? 'Visible' : 'Hidden'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.isSupplierProduct ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                                                {product.isSupplierProduct ? 'Supplier Product' : 'Main Product'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleSupplierProductSelect(product)}
                                                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                                                                                    selectedSupplierProduct?._id === product._id
                                                                                        ? 'bg-[#2c8ba3] text-white'
                                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                                }`}
                                                                            >
                                                                                {selectedSupplierProduct?._id === product._id ? 'Selected' : 'Select'}
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={selectedProduct || selectedSupplierProduct ? true : false}
                                                className={`mt-1 block w-full rounded-xl shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.name ? 'border-red-300' : 'border-gray-300'} ${(selectedProduct || selectedSupplierProduct) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            />
                                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                disabled={selectedProduct || selectedSupplierProduct ? true : false}
                                                className={`mt-1 block w-full rounded-xl shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.category ? 'border-red-300' : 'border-gray-300'} ${(selectedProduct || selectedSupplierProduct) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="Medicines">Medicines</option>
                                                <option value="Medical Devices">Medical Devices</option>
                                                <option value="First Aid">First Aid</option>
                                                <option value="Health Supplements">Health Supplements</option>
                                                <option value="Medical Equipment">Medical Equipment</option>
                                            </select>
                                            {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                                disabled={selectedProduct || selectedSupplierProduct ? true : false}
                                                className={`mt-1 block w-full rounded-xl shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.brand ? 'border-red-300' : 'border-gray-300'} ${(selectedProduct || selectedSupplierProduct) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            />
                                            {errors.brand && <p className="mt-2 text-sm text-red-600">{errors.brand}</p>}
                                        </div>

                                        {/* Price Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Buying Price (LKR)</label>
                                                <input
                                                    type="number"
                                                    name="buyingPrice"
                                                    value={formData.buyingPrice}
                                                    onChange={handleInputChange}
                                                    disabled={selectedSupplierProduct ? true : false}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${selectedSupplierProduct ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    required
                                                />
                                                {errors.buyingPrice && <p className="mt-1 text-sm text-red-600">{errors.buyingPrice}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Selling Price (LKR)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    disabled={selectedSupplierProduct ? true : false}
                                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${selectedSupplierProduct ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    required
                                                />
                                                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                                            <input
                                                type="date"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                                                className={`mt-1 block w-full rounded-xl shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.expiryDate ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="Select a date between today and 1 year from now"
                                            />
                                            {errors.expiryDate && <p className="mt-2 text-sm text-red-600">{errors.expiryDate}</p>}
                                            <p className="mt-2 text-sm text-gray-500">Select a date between today and 1 year from now</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                                            <input
                                                type="url"
                                                name="image"
                                                value={formData.image}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-xl shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.image ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="https://example.com/images/product.jpg"
                                            />
                                            {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
                                            <p className="mt-2 text-sm text-gray-500">Enter a valid image URL (must end with .jpg, .jpeg, .png, .gif, or .webp)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className={`mt-1 block w-full rounded-xl shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Enter a detailed description of the product (10-500 characters)"
                                    />
                                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                                    <p className="mt-2 text-sm text-gray-500">Enter a detailed description (10-500 characters)</p>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-[#2c8ba3] text-white rounded-xl hover:bg-[#2c8ba3]/90 shadow-sm transition-colors duration-200"
                                    >
                                        {selectedSupplier ? 'Add Product' : 'Add'} Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Supplier Products Modal */}
            {showSupplierProductsModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-8 border w-full max-w-4xl shadow-2xl rounded-2xl bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Supplier Products</h3>
                            <button
                                onClick={() => setShowSupplierProductsModal(false)}
                                className="text-gray-400 hover:text-gray-500 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-6">
                            {selectedSupplierProducts.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No products found for this supplier.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buying Price</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Selling Price</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedSupplierProducts.map((product) => {
                                                const buyingPrice = parseFloat(product.price) || 0;
                                                const sellingPrice = (buyingPrice * 1.15).toFixed(2);
                                                return (
                                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {new Intl.NumberFormat().format(buyingPrice)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {new Intl.NumberFormat().format(sellingPrice)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${product.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {product.isVisible ? 'Visible' : 'Hidden'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${product.isSupplierProduct ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                                {product.isSupplierProduct ? 'Supplier Product' : 'Main Product'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setShowSupplierProductsModal(false)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quantity Update Modal */}
            {isQuantityModalOpen && selectedProductForQuantity && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-8 border w-96 shadow-2xl rounded-2xl bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Update Product Quantity</h3>
                                    <p className="mt-2 text-sm text-gray-600">Update the quantity for {selectedProductForQuantity.name}</p>
                                </div>
                                <button
                                    onClick={() => setIsQuantityModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-500 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Quantity</label>
                                    <div className="mt-1 text-lg font-semibold text-gray-900">
                                        {selectedProductForQuantity.quantity} units
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Quantity</label>
                                    <div className="mt-1 flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            value={newQuantity}
                                            onChange={(e) => setNewQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="block w-full rounded-xl shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] border-gray-300 text-center"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewQuantity(newQuantity + 1)}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t">
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsQuantityModalOpen(false)}
                                            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleQuantitySubmit}
                                            className="px-6 py-3 bg-[#2c8ba3] text-white rounded-xl hover:bg-[#2c8ba3]/90 shadow-sm transition-colors duration-200"
                                        >
                                            Update Quantity
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductManagement;
