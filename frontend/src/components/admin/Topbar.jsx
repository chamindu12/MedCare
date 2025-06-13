import { FiBell, FiSearch, FiMenu } from 'react-icons/fi';
import { useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

const Topbar = ({ setSidebarOpen }) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="bg-white shadow-sm z-40">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                <button
                    type="button"
                    className="md:hidden text-gray-500 hover:text-gray-600"
                    onClick={() => setSidebarOpen(true)}
                >
                    <span className="sr-only">Open sidebar</span>
                    <FiMenu className="h-6 w-6" />
                </button>

                {/* Search bar */}
                <div className="flex-1 max-w-md ml-4 md:ml-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <span className="sr-only">View notifications</span>
                        <FiBell className="h-6 w-6" />
                    </button>

                    <ProfileDropdown />
                </div>
            </div>
        </header>
    );
};

export default Topbar;