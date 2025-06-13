import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const AdminSidebar = () => {
    const location = window.location;

    return (
        <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
                <Link
                    to="/admin/orders"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin/orders'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <ShoppingCartIcon className="mr-3 h-6 w-6" />
                    Orders
                </Link>

                <Link
                    to="/admin/payments"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin/payments'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <CreditCardIcon className="mr-3 h-6 w-6" />
                    Payments
                </Link>
            </nav>
        </div>
    );
};

export default AdminSidebar;
