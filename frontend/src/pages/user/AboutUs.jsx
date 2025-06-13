import { UserCircleIcon, HeartIcon, StarIcon, AcademicCapIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/solid';

function About() {
    return (
        <div className="bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
                {/* Hero Section */}
                <div className="text-center mb-20 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2c8ba3]/10 via-purple-100 to-[#2c8ba3]/10 opacity-40 rounded-3xl -z-10 transform -rotate-1"></div>
                    <h1 className="text-6xl font-bold text-gray-900 mb-6">
                        About <span className="text-[#2c8ba3]">MedCare</span> Pharmacy
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Your trusted neighborhood pharmacy, providing quality healthcare products and professional pharmaceutical services with care and expertise
                    </p>
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105">
                            <img
                                src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                                alt="Pharmacy counter"
                                className="object-cover h-56 w-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105">
                            <img
                                src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                                alt="Pharmacy consultation"
                                className="object-cover h-56 w-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105">
                            <img
                                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                                alt="Healthcare products"
                                className="object-cover h-56 w-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105">
                            <img
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                                alt="Medical supplies"
                                className="object-cover h-56 w-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="bg-gradient-to-r from-[#2c8ba3]/10 to-indigo-50 rounded-3xl p-12 mb-20 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 opacity-20">
                        <HeartIcon className="h-72 w-72 text-[#2c8ba3]" />
                    </div>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            To provide accessible, high-quality pharmaceutical care and healthcare products that improve the well-being of our community. We are committed to offering professional guidance, reliable prescription services, and a comprehensive range of healthcare solutions.
                        </p>
                    </div>
                </div>

                {/* Values Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="w-14 h-14 bg-[#2c8ba3]/10 rounded-xl flex items-center justify-center mb-6">
                            <ShieldCheckIcon className="h-8 w-8 text-[#2c8ba3]" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Care</h3>
                        <p className="text-gray-600">We maintain the highest standards in pharmaceutical care and product quality to ensure your health and safety.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="w-14 h-14 bg-[#2c8ba3]/10 rounded-xl flex items-center justify-center mb-6">
                            <UserCircleIcon className="h-8 w-8 text-[#2c8ba3]" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Guidance</h3>
                        <p className="text-gray-600">Our experienced pharmacists provide personalized advice and support for all your healthcare needs.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="w-14 h-14 bg-[#2c8ba3]/10 rounded-xl flex items-center justify-center mb-6">
                            <ClockIcon className="h-8 w-8 text-[#2c8ba3]" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Convenient Service</h3>
                        <p className="text-gray-600">We offer flexible hours and efficient service to make managing your healthcare needs easier.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;