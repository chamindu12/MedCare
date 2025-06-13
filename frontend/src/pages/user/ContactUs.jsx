import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPrescriptionBottle } from 'react-icons/fa';
import Swal from 'sweetalert2';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        Swal.fire({
            icon: 'success',
            title: 'Message Sent!',
            text: 'Thank you for contacting MedCare Pharmacy. We will get back to you soon.',
            timer: 3000,
            showConfirmButton: false
        });
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-gradient-to-b from-white to-gray-50 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232c8ba3' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2c8ba3]/10 via-purple-100 to-[#2c8ba3]/10 opacity-40 rounded-3xl -z-10 transform -rotate-1 animate-pulse"></div>
                    <h1 className="text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
                        Contact <span className="text-[#2c8ba3] relative">
                            MedCare
                            <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#2c8ba3] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                        </span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
                        Have questions about your prescriptions or need healthcare advice? We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#2c8ba3]/10 rounded-xl flex items-center justify-center group-hover:bg-[#2c8ba3] transition-colors duration-300">
                                    <FaMapMarkerAlt className="h-6 w-6 text-[#2c8ba3] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Us</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        80 Wattegedara Rd, Maharagama 10280
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#2c8ba3]/10 rounded-xl flex items-center justify-center group-hover:bg-[#2c8ba3] transition-colors duration-300">
                                    <FaPhone className="h-6 w-6 text-[#2c8ba3] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Call: 0112386145
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#2c8ba3]/10 rounded-xl flex items-center justify-center group-hover:bg-[#2c8ba3] transition-colors duration-300">
                                    <FaEnvelope className="h-6 w-6 text-[#2c8ba3] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        info@medcare.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#2c8ba3]/10 rounded-xl flex items-center justify-center group-hover:bg-[#2c8ba3] transition-colors duration-300">
                                    <FaClock className="h-6 w-6 text-[#2c8ba3] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Working Hours</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Monday - Friday: 8:00 AM - 8:00 PM<br />
                                        Saturday: 9:00 AM - 6:00 PM<br />
                                        Sunday: 10:00 AM - 4:00 PM
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="group">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-[#2c8ba3] transition-colors duration-200">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 hover:border-[#2c8ba3]/50"
                                    required
                                />
                            </div>

                            <div className="group">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-[#2c8ba3] transition-colors duration-200">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 hover:border-[#2c8ba3]/50"
                                    required
                                />
                            </div>

                            <div className="group">
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-[#2c8ba3] transition-colors duration-200">
                                    Subject
                                </label>
                                <select
                                    name="subject"
                                    id="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 hover:border-[#2c8ba3]/50"
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    <option value="Product Information">Product Information</option>
                                    <option value="Pharmacy Services">Pharmacy Services</option>
                                    <option value="General Question">General Question</option>
                                    <option value="Feedback">Feedback</option>
                                </select>
                            </div>

                            <div className="group">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-[#2c8ba3] transition-colors duration-200">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    id="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2c8ba3] focus:border-[#2c8ba3] transition-all duration-200 hover:border-[#2c8ba3]/50 resize-none"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#2c8ba3] text-white py-3 px-6 rounded-xl hover:bg-[#2c8ba3]/90 focus:outline-none focus:ring-2 focus:ring-[#2c8ba3] focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d290.89876576388235!2d79.91730352480236!3d6.847692815237717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25a82c3f48ba9%3A0xe3dc7e4aa7ded576!2s82%20Wattegedara%20Rd%2C%20Maharagama%2010280!5e0!3m2!1sen!2slk!4v1746702738697!5m2!1sen!2slk"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-2xl"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

export default Contact;