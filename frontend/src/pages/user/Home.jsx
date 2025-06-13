import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import HeroImage from '../../assets/banner.png';
import { FaHospital, FaClock, FaUserMd, FaClinicMedical, FaPills, FaHeartbeat, FaShoppingCart, FaPrescriptionBottle, FaArrowRight } from 'react-icons/fa';
import { GiMedicinePills } from 'react-icons/gi';

function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                if (response.data.success) {
                    setFeaturedProducts(response.data.products.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="bg-gradient-to-b from-white to-blue-50">
            {/* Hero Section */}
            <section className="relative h-screen overflow-hidden">
                
                <img
                    src={HeroImage}
                    alt="MedCare Pharmacy"
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
                        
                        </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-50 to-transparent z-20"></div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative">
                <div className="absolute -top-10 left-0 right-0 flex justify-center">
                    <div className="w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-2 bg-[#2c8ba3]/10 text-[#2c8ba3] rounded-full font-medium mb-4">
                            Why Choose MedCare
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Your Trusted <span className="text-[#2c8ba3]">Healthcare Partner</span>
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            Experience the difference with our comprehensive healthcare solutions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
                            >
                                <div className="absolute -top-6 left-6 flex items-center justify-center h-14 w-14 rounded-xl bg-[#2c8ba3] text-white text-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="mt-8 text-2xl font-bold text-gray-900">{feature.title}</h3>
                                <p className="mt-4 text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop Preview Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-2 bg-[#2c8ba3]/10 text-[#2c8ba3] rounded-full font-medium mb-4">
                            Featured Products
                        </span>
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Premium <span className="text-[#2c8ba3]">Healthcare</span> Products
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover our carefully curated selection of premium healthcare products
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c8ba3]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuredProducts.map((product) => (
                                <div key={product._id} className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                    <div className="relative h-64 bg-gray-200 overflow-hidden">
                                        <img 
                                            src={product.image} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#2c8ba3] transition-colors duration-300">{product.name}</h3>
                                        <p className="mt-2 text-gray-600 line-clamp-2">{product.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-2xl font-bold text-[#2c8ba3]">${product.price.toFixed(2)}</span>
                                            <Link
                                                to="/shop"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[#2c8ba3] hover:bg-[#2c8ba3]/90 transform hover:scale-105 transition-all duration-300"
                                            >
                                                <FaShoppingCart className="mr-2" />
                                                Shop Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-16 text-center">
                        <Link
                            to="/shop"
                            className="inline-flex items-center px-8 py-4 border-2 border-[#2c8ba3] text-lg font-medium rounded-full text-[#2c8ba3] hover:bg-[#2c8ba3] hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                        >
                            View All Products
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-24 bg-[#2c8ba3] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
                            Ready to Experience Better Healthcare?
                        </h2>
                        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                            Join thousands of satisfied customers who trust MedCare for their healthcare needs.
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center px-8 py-4 text-lg font-medium text-[#2c8ba3] bg-white rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Get Started Today
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

const features = [
    {
        title: 'Quality Products',
        description: 'Wide range of authentic medical supplies and healthcare products.',
        icon: <FaPills />
    },
    {
        title: 'Expert Advice',
        description: 'Professional guidance from qualified pharmacists.',
        icon: <FaUserMd />
    },
    {
        title: 'Fast Delivery',
        description: 'Quick and reliable delivery to your doorstep.',
        icon: <FaClock />
    },
    {
        title: '24/7 Support',
        description: 'Round-the-clock customer service and support.',
        icon: <FaHeartbeat />
    }
];

export default Home;