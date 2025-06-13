import { NavLink } from 'react-router-dom';
import {
    FiHome, FiUsers, FiCalendar, FiSettings,
    FiShoppingBag, FiPackage, FiMenu, FiX
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: FiHome },
        { name: 'User Management', href: '/admin/users', icon: FiUsers },
        { name: 'Appointments', href: '/admin/appointments', icon: FiCalendar },
        { name: 'Services', href: '/admin/services', icon: FiSettings },
        { name: 'Shop Products', href: '/admin/shop', icon: FiShoppingBag },
        { name: 'Orders', href: '/admin/orders', icon: FiPackage },
    ];

    return (
        <>
            {/* Mobile sidebar backdrop */}
            <div
                className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 z-50 w-64 bg-white shadow-lg transition duration-200 ease-in-out`}
            >
                <div className="flex items-center justify-between h-16 px-4 bg-indigo-600">
                    <span className="text-white font-semibold text-lg">PetCare Admin</span>
                    <button
                        className="md:hidden text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                <div className="h-full overflow-y-auto">
                    <nav className="px-2 py-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 ${location.pathname === item.href
                                            ? 'text-indigo-500'
                                            : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;