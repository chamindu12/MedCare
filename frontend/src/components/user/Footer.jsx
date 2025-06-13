import { Link } from 'react-router-dom';
import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaHeart,
    FaLinkedin
} from 'react-icons/fa';

function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            {/* Enhanced Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2c8ba3]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#2c8ba3]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2c8ba3]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <span className="text-4xl font-bold bg-gradient-to-r from-[#2c8ba3] via-[#2c8ba3]/90 to-[#2c8ba3]/80 bg-clip-text text-transparent group-hover:from-[#2c8ba3]/90 group-hover:to-[#2c8ba3]/70 transition-all duration-500">
                                MedCare
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your trusted partner in medical supplies and healthcare products. Providing quality medical products since 2024.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-[#2c8ba3] transform hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-[#2c8ba3]/20">
                                <FaFacebook className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#2c8ba3] transform hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-[#2c8ba3]/20">
                                <FaInstagram className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#2c8ba3] transform hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-[#2c8ba3]/20">
                                <FaTwitter className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#2c8ba3] transform hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-[#2c8ba3]/20">
                                <FaLinkedin className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h3 className="text-xl font-bold mb-8 relative inline-block group">
                            Quick Links
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#2c8ba3] to-[#2c8ba3]/80 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                        </h3>
                        <ul className="space-y-5">
                            {quickLinks.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.path}
                                        className="text-gray-400 hover:text-white flex items-center group transition-all duration-300 hover:translate-x-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2c8ba3] mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Products Column */}
                    <div>
                        <h3 className="text-xl font-bold mb-8 relative inline-block group">
                            Our Products
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#2c8ba3] to-[#2c8ba3]/80 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                        </h3>
                        <ul className="space-y-5">
                            {products.map((product) => (
                                <li key={product.name}>
                                    <Link
                                        to={product.path}
                                        className="text-gray-400 hover:text-white flex items-center group transition-all duration-300 hover:translate-x-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2c8ba3] mr-3 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                                        {product.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="text-xl font-bold mb-8 relative inline-block group">
                            Get in Touch
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#2c8ba3] to-[#2c8ba3]/80 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                        </h3>
                        <ul className="space-y-6">
                            <li className="flex items-start group">
                                <FaMapMarkerAlt className="h-5 w-5 text-[#2c8ba3] mt-1 mr-4 flex-shrink-0 group-hover:text-[#2c8ba3]/90 transition-colors duration-300" />
                                <span className="text-gray-400 group-hover:text-white transition-colors duration-300">
                                    80 Wattegedara Rd, Maharagama 10280
                                </span>
                            </li>
                            <li className="flex items-center group">
                                <FaPhoneAlt className="h-5 w-5 text-[#2c8ba3] mr-4 group-hover:text-[#2c8ba3]/90 transition-colors duration-300" />
                                <a href="tel:1234567890" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    0112356444
                                </a>
                            </li>
                            <li className="flex items-center group">
                                <FaEnvelope className="h-5 w-5 text-[#2c8ba3] mr-4 group-hover:text-[#2c8ba3]/90 transition-colors duration-300" />
                                <a href="mailto:info@medcare.com" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    info@medcare.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-16 pt-8 border-t border-gray-800/50">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} MedCare. All rights reserved.
                        </p>
                        <p className="text-gray-400 text-sm mt-4 md:mt-0 flex items-center">
                            Made with <FaHeart className="text-red-500 mx-1 animate-pulse" /> by MedCare Team
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/shop' },
    { name: 'Contact', path: '/contact' },
];

const products = [
    { name: 'Medicines', path: '/shop' },
    { name: 'Medical Devices', path: '/shop' },
    { name: 'First Aid', path: '/shop' },
    { name: 'Health Supplements', path: '/shop' },
];

export default Footer;