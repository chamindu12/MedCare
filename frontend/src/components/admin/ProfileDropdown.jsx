import { useState } from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative ml-3">
            <div>
                <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="sr-only">Open user menu</span>
                    <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="Admin profile"
                    />
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                    >
                        <FiUser className="mr-2" /> Your Profile
                    </a>
                    <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                    >
                        <FiSettings className="mr-2" /> Settings
                    </a>
                    <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                    >
                        <FiLogOut className="mr-2" /> Sign out
                    </a>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;