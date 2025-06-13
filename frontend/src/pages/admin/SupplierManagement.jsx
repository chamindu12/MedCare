import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { EyeIcon, UserPlusIcon, XCircleIcon, PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, PencilIcon, FunnelIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';
import { validateName } from '../../utils/validationUtils';

function SupplierManagement() {
    // State management for suppliers data and UI controls
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Form data state for creating new supplier
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        companyName: '',
        categories: [],
        brands: [],
        products: [{ name: '', category: '', brand: '', buyingPrice: '', sellingPrice: '' }]
    });

    // Form data state for editing existing supplier
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        companyName: '',
        categories: [],
        brands: [],
        products: [{ name: '', category: '', brand: '', buyingPrice: '', sellingPrice: '' }]
    });

    // Search and validation state
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});

    // Filter and pagination state
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        company: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [nameFilter, setNameFilter] = useState('');

    // Add new state for category filter
    const [categoryFilter, setCategoryFilter] = useState('');

    // Predefined categories and brands for dropdowns
    const availableCategories = [
        'Medicines',
        'Medical Devices',
        'First Aid',
        'Health Supplements',
        'Medical Equipment'
    ];

    const availableBrands = [
        'Pfizer',
        'Johnson & Johnson',
        'Novartis',
        'Roche',
        'Merck',
        'GSK',
        'AstraZeneca',
        'Sanofi',
        'Bayer',
        'Abbott',
        'Eli Lilly',
        'Bristol-Myers Squibb',
        'Amgen',
        'Biogen',
        'Celgene'
    ];

    // New state for report generation
    const [reportType, setReportType] = useState('');
    const [reportPeriod, setReportPeriod] = useState('monthly');
    const [profitReportData, setProfitReportData] = useState([]);

    // Add new state for advanced report filters
    const [reportFilters, setReportFilters] = useState({
        dateRange: {
            start: '',
            end: ''
        },
        minProfit: '',
        maxProfit: '',
        minProducts: '',
        category: '',
        brand: '',
        sortBy: 'profit',
        sortOrder: 'desc'
    });

    // Add new function for trend analysis report
    const generateTrendAnalysisReport = () => {
        const trendData = filteredSuppliers.map(supplier => {
            const monthlyRevenue = supplier.products?.reduce((acc, product) => {
                const revenue = parseFloat(product.sellingPrice || 0) * (product.quantity || 0);
                return acc + revenue;
            }, 0) || 0;

            const monthlyGrowth = supplier.previousMonthRevenue ? 
                ((monthlyRevenue - supplier.previousMonthRevenue) / supplier.previousMonthRevenue) * 100 : 0;

            return {
                supplierId: `#${supplier._id.slice(-6)}`,
                name: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                monthlyRevenue: `LKR ${new Intl.NumberFormat().format(monthlyRevenue)}`,
                monthlyGrowth: `${monthlyGrowth.toFixed(2)}%`,
                productCount: supplier.products?.length || 0,
                averageOrderValue: `LKR ${new Intl.NumberFormat().format(monthlyRevenue / (supplier.totalOrders || 1))}`,
                lastUpdated: formatDate(supplier.updatedAt || supplier.createdAt)
            };
        });

        const columns = [
            { header: 'Supplier ID', accessor: (item) => item.supplierId },
            { header: 'Name', accessor: (item) => item.name },
            { header: 'Company', accessor: (item) => item.company },
            { header: 'Monthly Revenue', accessor: (item) => item.monthlyRevenue },
            { header: 'Growth Rate', accessor: (item) => item.monthlyGrowth },
            { header: 'Product Count', accessor: (item) => item.productCount },
            { header: 'Avg Order Value', accessor: (item) => item.averageOrderValue },
            { header: 'Last Updated', accessor: (item) => item.lastUpdated }
        ];

        generatePDF('Supplier Trend Analysis Report', trendData, columns, 'supplier-trend-report.pdf', 'trend');
    };

    // Add new function for product analysis report
    const generateProductAnalysisReport = () => {
        const productData = filteredSuppliers.flatMap(supplier => 
            (supplier.products || []).map(product => ({
                supplierId: `#${supplier._id.slice(-6)}`,
                supplierName: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                productName: product.name,
                category: product.category,
                brand: product.brand,
                quantity: product.quantity || 0,
                buyingPrice: `LKR ${parseFloat(product.buyingPrice || 0).toFixed(2)}`,
                sellingPrice: `LKR ${parseFloat(product.sellingPrice || 0).toFixed(2)}`,
                profitPerUnit: `LKR ${(parseFloat(product.sellingPrice || 0) - parseFloat(product.buyingPrice || 0)).toFixed(2)}`,
                totalProfit: `LKR ${((parseFloat(product.sellingPrice || 0) - parseFloat(product.buyingPrice || 0)) * (product.quantity || 0)).toFixed(2)}`,
                stockStatus: (product.quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'
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
            { header: 'Buying Price', accessor: (item) => item.buyingPrice },
            { header: 'Selling Price', accessor: (item) => item.sellingPrice },
            { header: 'Profit/Unit', accessor: (item) => item.profitPerUnit },
            { header: 'Total Profit', accessor: (item) => item.totalProfit },
            { header: 'Stock Status', accessor: (item) => item.stockStatus }
        ];

        generatePDF('Product Analysis Report', productData, columns, 'product-analysis-report.pdf', 'product');
    };

    // Add new function for financial metrics report
    const generateFinancialMetricsReport = () => {
        const financialData = filteredSuppliers.map(supplier => {
            const totalRevenue = supplier.products?.reduce((acc, product) => {
                return acc + (parseFloat(product.sellingPrice || 0) * (product.quantity || 0));
            }, 0) || 0;

            const totalCost = supplier.products?.reduce((acc, product) => {
                return acc + (parseFloat(product.buyingPrice || 0) * (product.quantity || 0));
            }, 0) || 0;

            const profit = totalRevenue - totalCost;
            const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
            const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

            return {
                supplierId: `#${supplier._id.slice(-6)}`,
                name: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                totalRevenue: `LKR ${new Intl.NumberFormat().format(totalRevenue)}`,
                totalCost: `LKR ${new Intl.NumberFormat().format(totalCost)}`,
                profit: `LKR ${new Intl.NumberFormat().format(profit)}`,
                profitMargin: `${profitMargin.toFixed(2)}%`,
                roi: `${roi.toFixed(2)}%`,
                averageOrderValue: `LKR ${new Intl.NumberFormat().format(totalRevenue / (supplier.totalOrders || 1))}`,
                lastUpdated: formatDate(supplier.updatedAt || supplier.createdAt)
            };
        });

        const columns = [
            { header: 'Supplier ID', accessor: (item) => item.supplierId },
            { header: 'Name', accessor: (item) => item.name },
            { header: 'Company', accessor: (item) => item.company },
            { header: 'Total Revenue', accessor: (item) => item.totalRevenue },
            { header: 'Total Cost', accessor: (item) => item.totalCost },
            { header: 'Profit', accessor: (item) => item.profit },
            { header: 'Profit Margin', accessor: (item) => item.profitMargin },
            { header: 'ROI', accessor: (item) => item.roi },
            { header: 'Avg Order Value', accessor: (item) => item.averageOrderValue },
            { header: 'Last Updated', accessor: (item) => item.lastUpdated }
        ];

        generatePDF('Financial Metrics Report', financialData, columns, 'financial-metrics-report.pdf', 'financial');
    };

    // Update price analysis report function to remove profit margin
    const generatePriceAnalysisReport = () => {
        const priceData = filteredSuppliers.flatMap(supplier => 
            (supplier.products || []).map(product => {
                const buyingPrice = parseFloat(product.buyingPrice || 0);
                const sellingPrice = parseFloat(product.sellingPrice || 0);

                return {
                    supplierId: `#${supplier._id.slice(-6)}`,
                    supplierName: `${supplier.firstName} ${supplier.lastName}`,
                    company: supplier.companyName,
                    productName: product.name,
                    category: product.category,
                    brand: product.brand,
                    buyingPrice: `LKR ${buyingPrice.toFixed(2)}`,
                    sellingPrice: `LKR ${sellingPrice.toFixed(2)}`,
                    priceDifference: `LKR ${(sellingPrice - buyingPrice).toFixed(2)}`,
                    lastUpdated: formatDate(supplier.updatedAt || supplier.createdAt)
                };
            })
        );

        const columns = [
            { header: 'Supplier ID', accessor: (item) => item.supplierId },
            { header: 'Supplier Name', accessor: (item) => item.supplierName },
            { header: 'Company', accessor: (item) => item.company },
            { header: 'Product', accessor: (item) => item.productName },
            { header: 'Category', accessor: (item) => item.category },
            { header: 'Brand', accessor: (item) => item.brand },
            { header: 'Buying Price', accessor: (item) => item.buyingPrice },
            { header: 'Selling Price', accessor: (item) => item.sellingPrice },
            { header: 'Price Difference', accessor: (item) => item.priceDifference },
            { header: 'Last Updated', accessor: (item) => item.lastUpdated }
        ];

        generatePDF('Supplier Price Analysis Report', priceData, columns, 'supplier-price-analysis-report.pdf', 'price');
    };

    // Update handleReportGeneration to include price analysis report
    const handleReportGeneration = () => {
        if (reportType === 'performance') {
            generateSupplierPerformanceReport();
        } else if (reportType === 'price') {
            generatePriceAnalysisReport();
        }
    };

    // Add filter change handler
    const handleReportFilterChange = (name, value) => {
        setReportFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fetch suppliers data on component mount
    useEffect(() => {
        fetchSuppliers();
    }, []);

    // API call to fetch all suppliers
    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/suppliers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const suppliers = response.data.filter(user => user.userType === 'supplier');
            setSuppliers(suppliers || []);
        } catch (error) {
            setError('Failed to fetch suppliers');
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    // View supplier details handler
    const handleViewSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    // Edit supplier handler
    const handleEditSupplier = (supplier) => {
        // Calculate selling prices for existing products
        const productsWithSellingPrice = supplier.products.map(product => ({
            ...product,
            sellingPrice: product.sellingPrice || (parseFloat(product.buyingPrice || 0) * 1.15).toFixed(2)
        }));

        setEditFormData({
            firstName: supplier.firstName,
            lastName: supplier.lastName,
            email: supplier.email,
            phone: supplier.phone || '',
            address: supplier.address || '',
            companyName: supplier.companyName || '',
            categories: supplier.categories || [],
            brands: supplier.brands || [],
            products: productsWithSellingPrice
        });
        setSelectedSupplier(supplier);
        setIsEditModalOpen(true);
    };

    // Product management handlers for edit form
    const handleEditProductChange = (index, field, value) => {
        const updatedProducts = [...editFormData.products];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: value
        };
        
        // If buying price is changed, automatically calculate selling price
        if (field === 'buyingPrice' && value) {
            const buyingPrice = parseFloat(value);
            if (!isNaN(buyingPrice)) {
                const sellingPrice = (buyingPrice * 1.15).toFixed(2); // Add 15% markup
                updatedProducts[index].sellingPrice = sellingPrice;
            }
        }
        
        setEditFormData(prev => ({
            ...prev,
            products: updatedProducts
        }));
    };

    const addEditProduct = () => {
        setEditFormData(prev => ({
            ...prev,
            products: [...prev.products, { name: '', category: '', brand: '', buyingPrice: '', sellingPrice: '' }]
        }));
    };

    const removeEditProduct = (index) => {
        setEditFormData(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }));
    };

    // Form validation functions
    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (!validateName(formData.firstName)) {
            newErrors.firstName = 'First name can only contain letters and spaces';
        }

        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (!validateName(formData.lastName)) {
            newErrors.lastName = 'Last name can only contain letters and spaces';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address,email must be in the format example@gmail.com';
        }

        // Company Name validation
        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        // Phone validation
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number , phone number must be starting with 0';
        }

        // Product validation
        const productErrors = [];
        formData.products.forEach((product, index) => {
            const productError = {};
            
            if (!product.name.trim()) {
                productError.name = 'Product name is required';
            }

            if (!product.category) {
                productError.category = 'Category is required';
            }

            if (!product.brand) {
                productError.brand = 'Brand is required';
            }

            if (!product.buyingPrice || isNaN(product.buyingPrice) || parseFloat(product.buyingPrice) <= 0) {
                productError.buyingPrice = 'Valid buying price is required';
            }

            if (!product.sellingPrice || isNaN(product.sellingPrice) || parseFloat(product.sellingPrice) <= 0) {
                productError.sellingPrice = 'Valid selling price is required';
            }

            if (parseFloat(product.sellingPrice) <= parseFloat(product.buyingPrice)) {
                productError.sellingPrice = 'Selling price must be greater than buying price';
            }

            if (Object.keys(productError).length > 0) {
                productErrors[index] = productError;
            }
        });

        if (productErrors.length > 0) {
            newErrors.products = productErrors;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Edit form validation
    const validateEditForm = () => {
        const newErrors = {};

        // First Name validation
        if (!editFormData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (!validateName(editFormData.firstName)) {
            newErrors.firstName = 'First name can only contain letters and spaces';
        }

        // Last Name validation
        if (!editFormData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (!validateName(editFormData.lastName)) {
            newErrors.lastName = 'Last name can only contain letters and spaces';
        }

        // Email validation
        if (!editFormData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editFormData.email)) {
            newErrors.email = 'Invalid email address,Email must be in the format example@gmail.com';
        }

        // Company Name validation
        if (!editFormData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        // Phone validation
        if (editFormData.phone && !/^\+?[\d\s-]{10,}$/.test(editFormData.phone)) {
            newErrors.phone = 'Only numbers are allowed';
        }

        // Product validation
        const productErrors = [];
        editFormData.products.forEach((product, index) => {
            const productError = {};
            
            if (!product.name.trim()) {
                productError.name = 'Product name is required';
            }

            if (!product.category) {
                productError.category = 'Category is required';
            }

            if (!product.brand) {
                productError.brand = 'Brand is required';
            }

            if (!product.buyingPrice || isNaN(product.buyingPrice) || parseFloat(product.buyingPrice) <= 0) {
                productError.buyingPrice = 'Valid buying price is required';
            }

            if (!product.sellingPrice || isNaN(product.sellingPrice) || parseFloat(product.sellingPrice) <= 0) {
                productError.sellingPrice = 'Valid selling price is required';
            }

            if (parseFloat(product.sellingPrice) <= parseFloat(product.buyingPrice)) {
                productError.sellingPrice = 'Selling price must be greater than buying price';
            }

            if (Object.keys(productError).length > 0) {
                productErrors[index] = productError;
            }
        });

        if (productErrors.length > 0) {
            newErrors.products = productErrors;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Create new supplier with validation
    const handleCreateSupplier = async (e) => {
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
            
            // Calculate selling prices before sending to backend
            const productsWithSellingPrice = formData.products.map(product => ({
                ...product,
                sellingPrice: (parseFloat(product.buyingPrice || 0) * 1.15).toFixed(2)
            }));

            const supplierData = {
                ...formData,
                products: productsWithSellingPrice,
                userType: 'supplier',
                companyName: formData.companyName,
                categories: formData.categories,
                brands: formData.brands
            };

            await axios.post('http://localhost:5000/api/suppliers/register', supplierData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Supplier Created',
                text: 'New supplier has been created successfully',
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
                phone: '',
                address: '',
                companyName: '',
                categories: [],
                brands: [],
                products: [{ name: '', category: '', brand: '', buyingPrice: '', sellingPrice: '' }]
            });
            setErrors({});
            fetchSuppliers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.response?.data?.message || 'Failed to create supplier',
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

    // Form input change handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: value
        };
        
        // If buying price is changed, automatically calculate selling price
        if (field === 'buyingPrice' && value) {
            const buyingPrice = parseFloat(value);
            if (!isNaN(buyingPrice)) {
                const sellingPrice = (buyingPrice * 1.15).toFixed(2); // Add 15% markup
                updatedProducts[index].sellingPrice = sellingPrice;
            }
        }
        
        setFormData(prev => ({
            ...prev,
            products: updatedProducts
        }));
    };

    const addProduct = () => {
        setFormData(prev => ({
            ...prev,
            products: [...prev.products, { name: '', category: '', brand: '', buyingPrice: '', sellingPrice: '' }]
        }));
    };

    const removeProduct = (index) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Delete supplier with confirmation
    const handleDeleteSupplier = async (supplierId) => {
        try {
            // Find the supplier to check their products
            const supplier = suppliers.find(s => s._id === supplierId);
            
            if (supplier && supplier.products && supplier.products.length > 0) {
                Swal.fire({
                    title: 'Cannot Delete Supplier',
                    html: `
                        <div class="text-left">
                            <p class="mb-4">This supplier cannot be deleted because they have products:</p>
                            <ul class="list-disc pl-5 mb-4">
                                ${supplier.products.map(product => `<li>${product.name}</li>`).join('')}
                            </ul>
                            <p>Please remove all products from this supplier before deleting.</p>
                        </div>
                    `,
                    icon: 'warning',
                    confirmButtonColor: '#2c8ba3',
                    confirmButtonText: 'OK'
                });
                return;
            }

            const result = await Swal.fire({
                title: 'Delete Supplier',
                text: "Are you sure you want to delete this supplier? This action cannot be undone.",
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
                await axios.delete(`http://localhost:5000/api/suppliers/${supplierId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Supplier Deleted',
                    text: 'The supplier has been successfully deleted',
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
                fetchSuppliers();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: error.response?.data?.message || 'Failed to delete supplier',
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

    // Update supplier with validation
    const handleUpdateSupplier = async (e) => {
        e.preventDefault();

        if (!validateEditForm()) {
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
            
            // Calculate selling prices before sending to backend
            const productsWithSellingPrice = editFormData.products.map(product => ({
                ...product,
                sellingPrice: (parseFloat(product.buyingPrice || 0) * 1.15).toFixed(2)
            }));

            const supplierData = {
                ...editFormData,
                products: productsWithSellingPrice,
                userType: 'supplier'
            };

            await axios.put(`http://localhost:5000/api/suppliers/${selectedSupplier._id}`, supplierData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'Supplier Updated',
                text: 'The supplier has been successfully updated',
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

            setIsEditModalOpen(false);
            fetchSuppliers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to update supplier',
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

    // Filter suppliers based on search query
    const filteredSuppliers = suppliers.filter(supplier => {
        const searchLower = searchQuery.toLowerCase();
        const nameFilterLower = nameFilter.toLowerCase();
        const fullName = `${supplier.firstName} ${supplier.lastName}`.toLowerCase();
        
        const matchesSearch = (
            supplier.firstName.toLowerCase().includes(searchLower) ||
            supplier.lastName.toLowerCase().includes(searchLower) ||
            supplier.email.toLowerCase().includes(searchLower) ||
            supplier.companyName.toLowerCase().includes(searchLower) ||
            (supplier.phone && supplier.phone.toLowerCase().includes(searchLower)) ||
            (supplier.address && supplier.address.toLowerCase().includes(searchLower))
        );

        const matchesName = nameFilter === '' || fullName.includes(nameFilterLower);
        const matchesCompany = filters.company === '' || supplier.companyName.toLowerCase().includes(filters.company.toLowerCase());
        const matchesCategory = categoryFilter === '' || supplier.products?.some(product => product.category === categoryFilter);
        
        return matchesSearch && matchesName && matchesCompany && matchesCategory;
    });

    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Generate supplier performance report
    const generateSupplierPerformanceReport = () => {
        const performanceData = filteredSuppliers.map(supplier => {
            const totalProducts = supplier.products?.length || 0;
            const categories = [...new Set(supplier.products?.map(p => p.category) || [])];
            const brands = [...new Set(supplier.products?.map(p => p.brand) || [])];

            return {
                supplierId: `#${supplier._id.slice(-6)}`,
                name: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                totalProducts,
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
            { header: 'Number of Categories', accessor: (item) => item.categories },
            { header: 'Number of Brands', accessor: (item) => item.brands },
            { header: 'Last Updated', accessor: (item) => item.lastUpdated }
        ];

        generatePDF('Supplier Performance Report', performanceData, columns, 'supplier-performance-report.pdf', 'suppliers');
    };

    // Generate supplier inventory report
    const generateSupplierInventoryReport = () => {
        const inventoryData = filteredSuppliers.flatMap(supplier => 
            (supplier.products || []).map(product => ({
                supplierId: `#${supplier._id.slice(-6)}`,
                supplierName: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                productName: product.name,
                category: product.category,
                brand: product.brand,
                quantity: product.quantity,
                price: `LKR ${parseFloat(product.buyingPrice).toFixed(2)}`,
                totalValue: `LKR ${new Intl.NumberFormat().format(parseFloat(product.buyingPrice) * parseFloat(product.quantity))}`
            }))
        );

        const columns = [
            { header: 'Supplier ID', accessor: (item) => item.supplierId },
            { header: 'Supplier Name', accessor: (item) => item.supplierName },
            { header: 'Company', accessor: (item) => item.company },
            { header: 'Product', accessor: (item) => item.productName },
            { header: 'Category', accessor: (item) => item.category },
            { header: 'Brand', accessor: (item) => item.brand },
            { header: 'Unit Price', accessor: (item) => item.price },
            { header: 'Total Value', accessor: (item) => item.totalValue }
        ];

        generatePDF('Supplier Inventory Report', inventoryData, columns, 'supplier-inventory-report.pdf', 'inventory');
    };

    // Generate supplier activity report
    const generateSupplierActivityReport = () => {
        const activityData = filteredSuppliers.map(supplier => {
            const lastOrderDate = supplier.lastOrderDate || 'No orders yet';
            const totalOrders = supplier.totalOrders || 0;
            const averageOrderValue = supplier.averageOrderValue || 0;
            const responseTime = supplier.averageResponseTime || 'N/A';
            const rating = supplier.rating || 'Not rated';

            return {
                supplierId: `#${supplier._id.slice(-6)}`,
                name: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                lastOrderDate,
                totalOrders,
                averageOrderValue: `LKR ${new Intl.NumberFormat().format(averageOrderValue)}`,
                responseTime,
                rating,
                status: supplier.isActive ? 'Active' : 'Inactive'
            };
        });

        const columns = [
            { header: 'Supplier ID', accessor: (item) => item.supplierId },
            { header: 'Name', accessor: (item) => item.name },
            { header: 'Company', accessor: (item) => item.company },
            { header: 'Last Order Date', accessor: (item) => item.lastOrderDate },
            { header: 'Total Orders', accessor: (item) => item.totalOrders },
            { header: 'Avg Order Value', accessor: (item) => item.averageOrderValue },
            { header: 'Response Time', accessor: (item) => item.responseTime },
            { header: 'Rating', accessor: (item) => item.rating },
            { header: 'Status', accessor: (item) => item.status }
        ];

        generatePDF('Supplier Activity Report', activityData, columns, 'supplier-activity-report.pdf', 'activity');
    };

    // Add new function for profit report generation
    const generateSupplierProfitReport = () => {
        const profitData = filteredSuppliers.map(supplier => {
            const totalProducts = supplier.products?.length || 0;
            const totalRevenue = supplier.products?.reduce((acc, product) => {
                const revenue = parseFloat(product.sellingPrice || 0) * (product.quantity || 0);
                return acc + revenue;
            }, 0) || 0;
            
            const totalCost = supplier.products?.reduce((acc, product) => {
                const cost = parseFloat(product.buyingPrice || 0) * (product.quantity || 0);
                return acc + cost;
            }, 0) || 0;
            
            const profit = totalRevenue - totalCost;
            const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0;

            return {
                supplierId: `#${supplier._id.slice(-6)}`,
                name: `${supplier.firstName} ${supplier.lastName}`,
                company: supplier.companyName,
                totalProducts,
                totalRevenue: `LKR ${new Intl.NumberFormat().format(totalRevenue)}`,
                totalCost: `LKR ${new Intl.NumberFormat().format(totalCost)}`,
                profit: `LKR ${new Intl.NumberFormat().format(profit)}`,
                profitMargin: `${profitMargin.toFixed(2)}%`,
                lastUpdated: formatDate(supplier.updatedAt || supplier.createdAt)
            };
        });

        const columns = [
            { header: 'Supplier ID', accessor: (item) => item.supplierId },
            { header: 'Name', accessor: (item) => item.name },
            { header: 'Company', accessor: (item) => item.company },
            { header: 'Total Products', accessor: (item) => item.totalProducts },
            { header: 'Total Revenue', accessor: (item) => item.totalRevenue },
            { header: 'Total Cost', accessor: (item) => item.totalCost },
            { header: 'Profit', accessor: (item) => item.profit },
            { header: 'Profit Margin', accessor: (item) => item.profitMargin },
            { header: 'Last Updated', accessor: (item) => item.lastUpdated }
        ];

        generatePDF('Supplier Profit Report', profitData, columns, 'supplier-profit-report.pdf', 'profit');
    };

    // Pagination logic
    const paginatedSuppliers = filteredSuppliers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

    // Filter change handler
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Calculate statistics
    const calculateStats = () => {
        return {
            totalSuppliers: suppliers.length,
            activeProducts: suppliers.reduce((acc, s) => acc + (s.products?.length || 0), 0),
            totalCategories: availableCategories.length,
            totalBrands: availableBrands.length
        };
    };

    const stats = calculateStats();

    // Get unique supplier names
    const getUniqueSupplierNames = () => {
        const names = suppliers.map(supplier => `${supplier.firstName} ${supplier.lastName}`);
        return [...new Set(names)].filter(Boolean).sort();
    };

    // Get unique company names from suppliers
    const getUniqueCompanies = () => {
        const companies = suppliers.map(supplier => supplier.companyName);
        return [...new Set(companies)].filter(Boolean).sort();
    };

    // Add new function to handle product deletion
    const handleDeleteProduct = async (supplierId, productIndex) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Product',
                text: "Are you sure you want to delete this product? This action cannot be undone.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2c8ba3',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('token');
                const supplier = suppliers.find(s => s._id === supplierId);
                const updatedProducts = [...supplier.products];
                updatedProducts.splice(productIndex, 1);

                await axios.put(`http://localhost:5000/api/suppliers/${supplierId}`, {
                    ...supplier,
                    products: updatedProducts
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Product Deleted',
                    text: 'The product has been successfully deleted',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });

                // Update the selected supplier in the modal
                setSelectedSupplier(prev => ({
                    ...prev,
                    products: updatedProducts
                }));
                
                // Refresh suppliers list
                fetchSuppliers();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: error.response?.data?.message || 'Failed to delete product',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }
    };

    // Loading state UI
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
            </div>
        );
    }

    // Error state UI
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

    // Main component render
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Suppliers</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{stats.totalSuppliers}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <UserPlusIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Products</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{stats.activeProducts}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <ChartBarIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Categories</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{stats.totalCategories}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <FunnelIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Brands</p>
                            <p className="text-2xl font-bold text-[#2c8ba3]">{stats.totalBrands}</p>
                        </div>
                        <div className="p-3 bg-[#2c8ba3]/10 rounded-full">
                            <ChartBarIcon className="h-6 w-6 text-[#2c8ba3]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Supplier Management</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Add New Supplier</span>
                        <span className="sm:hidden">Add Supplier</span>
                    </button>
                </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
                        <p className="text-sm text-gray-500 mt-1">Generate reports for supplier analysis</p>
                    </div>
                    <div className="flex items-center space-x-4">
                       
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Performance Report Card */}
                    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#2c8ba3] transition-all duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <ChartBarIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Performance Report</h3>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Total Products & Value
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Category Distribution
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Brand Coverage
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setReportType('performance');
                                    handleReportGeneration();
                                }}
                                className="w-full bg-[#2c8ba3] text-white px-4 py-2.5 rounded-lg hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>Generate Performance Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Price Analysis Report Card */}
                    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#2c8ba3] transition-all duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <ChartBarIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Price Analysis Report</h3>
                                </div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Individual Product Prices
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Price Differences
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Category & Brand Analysis
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setReportType('price');
                                    handleReportGeneration();
                                }}
                                className="w-full bg-[#2c8ba3] text-white px-4 py-2.5 rounded-lg hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>Generate Price Analysis Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Preview Section */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Report Preview</h4>
                            <p className="text-xs text-gray-500 mt-1">Select a report type and period to generate</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Format:</span>
                            <select className="rounded-lg border-gray-200 shadow-sm focus:border-[#2c8ba3] focus:ring-[#2c8ba3] bg-white py-1.5 px-3 text-sm">
                                <option value="pdf">PDF</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow-lg mb-6 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <select
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                            >
                                <option value="">All Names</option>
                                {getUniqueSupplierNames().map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <select
                                value={filters.company}
                                onChange={(e) => handleFilterChange('company', e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                            >
                                <option value="">All Companies</option>
                                {getUniqueCompanies().map(company => (
                                    <option key={company} value={company}>{company}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                            >
                                <option value="">All Categories</option>
                                {availableCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                            <select
                                value={filters.brand}
                                onChange={(e) => handleFilterChange('brand', e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                            >
                                <option value="">All Brands</option>
                                {availableBrands.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setNameFilter('');
                                    setCategoryFilter('');
                                    setFilters({
                                        category: '',
                                        brand: '',
                                        company: ''
                                    });
                                }}
                                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suppliers Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <UserPlusIcon className="h-4 w-4 text-gray-400" />
                                            <span>Supplier ID</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <UserPlusIcon className="h-4 w-4 text-gray-400" />
                                            <span>Name</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <ChartBarIcon className="h-4 w-4 text-gray-400" />
                                            <span>Company</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>Email</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>Phone</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Address</span>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Actions</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedSuppliers.map((supplier) => (
                                    <tr key={supplier._id} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-[#2c8ba3]/10 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-[#2c8ba3]">#{supplier._id.slice(-6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-[#2c8ba3]/10 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-[#2c8ba3]">
                                                            {supplier.firstName.charAt(0)}{supplier.lastName.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{supplier.firstName} {supplier.lastName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{supplier.companyName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-900">{supplier.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-sm text-gray-900">{supplier.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-sm text-gray-900">{supplier.address || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleViewSupplier(supplier)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200 bg-[#2c8ba3]/10 p-2 rounded-full hover:bg-[#2c8ba3]/20"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSupplier(supplier)}
                                                    className="text-[#2c8ba3] hover:text-[#2c8ba3]/90 transition-colors duration-200 bg-[#2c8ba3]/10 p-2 rounded-full hover:bg-[#2c8ba3]/20"
                                                    title="Edit Supplier"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSupplier(supplier._id)}
                                                    className="text-red-500 hover:text-red-600 transition-colors duration-200 bg-red-50 p-2 rounded-full hover:bg-red-100"
                                                    title="Delete Supplier"
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSuppliers.length)} of {filteredSuppliers.length} results
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

            {/* Supplier Details Modal */}
            {isModalOpen && selectedSupplier && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-4xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                Supplier Details #{selectedSupplier._id.slice(-6)}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Information</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-900">Name: {selectedSupplier.firstName} {selectedSupplier.lastName}</p>
                                        <p className="text-sm text-gray-900">Joined: {formatDate(selectedSupplier.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Business Information</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-900">Company: {selectedSupplier.companyName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-900">Email: {selectedSupplier.email}</p>
                                        {selectedSupplier.phone && (
                                            <p className="text-sm text-gray-900">Phone: {selectedSupplier.phone}</p>
                                        )}
                                        {selectedSupplier.address && (
                                            <p className="text-sm text-gray-900">Address: {selectedSupplier.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supplied Products Table */}
                        <div className="mt-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Supplied Products</h4>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Brand
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Buying Price (LKR)
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Selling Price (LKR)
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedSupplier.products && selectedSupplier.products.length > 0 ? (
                                                selectedSupplier.products.map((product, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {product.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {product.category}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {product.brand}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            Rs. {parseFloat(product.buyingPrice || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            Rs. {parseFloat(product.sellingPrice || (parseFloat(product.buyingPrice || 0) * 1.15)).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <button
                                                                onClick={() => handleDeleteProduct(selectedSupplier._id, index)}
                                                                className="text-red-500 hover:text-red-600 transition-colors duration-200"
                                                                title="Delete Product"
                                                            >
                                                                <XCircleIcon className="h-5 w-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No products supplied yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Supplier Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-4xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Create New Supplier</h3>
                                <p className="mt-1 text-sm text-gray-500">Fill in the details to add a new supplier to the system</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setErrors({});
                                }}
                                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSupplier} className="space-y-6">
                            {/* Personal Information Section */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="Enter first name"
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="Enter last name"
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="Enter phone number"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                        placeholder="Enter full address"
                                    />
                                </div>
                            </div>

                            {/* Business Information Section */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.companyName ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="Enter company name"
                                        />
                                        {errors.companyName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                                        )}
                                    </div>
                                   
                                </div>
                            </div>

                            {/* Products Section */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">Products</h4>
                                        <p className="mt-1 text-sm text-gray-500">Add products that this supplier will provide</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addProduct}
                                        className="px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Add Product
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.products.map((product, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <h5 className="text-sm font-medium text-gray-900">Product {index + 1}</h5>
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProduct(index)}
                                                        className="text-red-500 hover:text-red-600 transition-colors duration-200"
                                                    >
                                                        <XCircleIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                    <select
                                                        value={product.category}
                                                        onChange={(e) => handleProductChange(index, 'category', e.target.value)}
                                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.products?.[index]?.category ? 'border-red-300' : 'border-gray-300'}`}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {availableCategories.map((category) => (
                                                            <option key={category} value={category}>
                                                                {category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.products?.[index]?.category && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.products[index].category}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                                    <select
                                                        value={product.brand}
                                                        onChange={(e) => handleProductChange(index, 'brand', e.target.value)}
                                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.products?.[index]?.brand ? 'border-red-300' : 'border-gray-300'}`}
                                                    >
                                                        <option value="">Select Brand</option>
                                                        {availableBrands.map((brand) => (
                                                            <option key={brand} value={brand}>
                                                                {brand}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.products?.[index]?.brand && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.products[index].brand}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                                <input
                                                    type="text"
                                                    value={product.name}
                                                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.products?.[index]?.name ? 'border-red-300' : 'border-gray-300'}`}
                                                    placeholder="Enter product name"
                                                />
                                                {errors.products?.[index]?.name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.products[index].name}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buying Price (LKR)</label>
                                                    <div className="mt-1 relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">Rs.</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={product.buyingPrice}
                                                            onChange={(e) => handleProductChange(index, 'buyingPrice', e.target.value)}
                                                            className={`block w-full pl-7 rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.products?.[index]?.buyingPrice ? 'border-red-300' : 'border-gray-300'}`}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    {errors.products?.[index]?.buyingPrice && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.products[index].buyingPrice}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (LKR)</label>
                                                    <div className="mt-1 relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-gray-500 sm:text-sm">Rs.</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={product.sellingPrice}
                                                            readOnly
                                                            className="block w-full pl-7 rounded-md shadow-sm bg-gray-50 border-gray-300"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">Automatically calculated (Buying Price + 15%)</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setErrors({});
                                    }}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200"
                                >
                                    Create Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Supplier Modal */}
            {isEditModalOpen && selectedSupplier && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-4xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Edit Supplier</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSupplier} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={editFormData.firstName}
                                        onChange={handleEditInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editFormData.lastName}
                                        onChange={handleEditInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={editFormData.companyName}
                                    onChange={handleEditInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.companyName ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.companyName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editFormData.phone}
                                    onChange={handleEditInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleEditInputChange}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3]"
                                />
                            </div>

                            {/* Products Section in Edit Modal */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-medium text-gray-900">Products</h4>
                                    <button
                                        type="button"
                                        onClick={addEditProduct}
                                        className="px-3 py-1 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200 flex items-center"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Product
                                    </button>
                                </div>

                                {editFormData.products.map((product, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h5 className="text-sm font-medium text-gray-700">Product {index + 1}</h5>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeEditProduct(index)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                                <input
                                                    type="text"
                                                    value={product.name}
                                                    onChange={(e) => handleEditProductChange(index, 'name', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.products?.[index]?.name ? 'border-red-300' : 'border-gray-300'}`}
                                                />
                                                {errors.products?.[index]?.name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.products[index].name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Buying Price (LKR)</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 sm:text-sm">Rs.</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={product.buyingPrice}
                                                        onChange={(e) => handleEditProductChange(index, 'buyingPrice', e.target.value)}
                                                        className={`block w-full pl-7 rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.products?.[index]?.buyingPrice ? 'border-red-300' : 'border-gray-300'}`}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.products?.[index]?.buyingPrice && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.products[index].buyingPrice}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                                <select
                                                    value={product.category}
                                                    onChange={(e) => handleEditProductChange(index, 'category', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.products?.[index]?.category ? 'border-red-300' : 'border-gray-300'}`}
                                                >
                                                    <option value="">Select Category</option>
                                                    {availableCategories.map((category) => (
                                                        <option key={category} value={category}>
                                                            {category}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.products?.[index]?.category && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.products[index].category}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Brand</label>
                                                <select
                                                    value={product.brand}
                                                    onChange={(e) => handleEditProductChange(index, 'brand', e.target.value)}
                                                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2c8ba3] focus:border-[#2c8ba3] ${errors.products?.[index]?.brand ? 'border-red-300' : 'border-gray-300'}`}
                                                >
                                                    <option value="">Select Brand</option>
                                                    {availableBrands.map((brand) => (
                                                        <option key={brand} value={brand}>
                                                            {brand}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.products?.[index]?.brand && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.products[index].brand}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Selling Price (LKR)</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 sm:text-sm">Rs.</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={product.sellingPrice}
                                                        readOnly
                                                        className="block w-full pl-7 rounded-md shadow-sm bg-gray-50 border-gray-300"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">Automatically calculated (Buying Price + 15%)</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#2c8ba3] text-white rounded-md hover:bg-[#2c8ba3]/90 transition-colors duration-200"
                                >
                                    Update Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SupplierManagement; 