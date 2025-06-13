import { FiUsers, FiCalendar, FiShoppingBag, FiDollarSign, FiEye, FiTruck, FiPrinter } from 'react-icons/fi';

const stats = [
    { name: 'Total Users', value: '2,345', change: '+12%', changeType: 'increase', icon: <FiUsers className="text-[#2c8ba3]" /> },
    { name: 'Total Appointments', value: '156', change: '+5%', changeType: 'increase', icon: <FiCalendar className="text-green-600" /> },
    { name: 'Total Orders', value: '89', change: '-3%', changeType: 'decrease', icon: <FiShoppingBag className="text-yellow-600" /> },
    { name: 'Revenue', value: '$12,345', change: '+24%', changeType: 'increase', icon: <FiDollarSign className="text-purple-600" /> },
];

const recentAppointments = [
    { pet: 'Max', service: 'Checkup', date: '2025-04-23', time: '10:00 AM' },
    { pet: 'Luna', service: 'Grooming', date: '2025-04-22', time: '03:00 PM' },
];

const recentOrders = [
    { orderId: '#00123', customer: 'Alice', total: '$45.00', status: 'Pending' },
    { orderId: '#00124', customer: 'Bob', total: '$32.00', status: 'Shipped' },
];

export default function Dashboard() {
    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white shadow rounded-2xl p-5 flex items-center space-x-4">
                        <div className="text-3xl bg-gray-100 p-3 rounded-full">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.name}</p>
                            <p className="text-xl font-semibold">{stat.value}</p>
                            <p className={`text-sm ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.changeType === 'increase' ? '+' : '-'}{stat.change}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <div className="bg-white shadow rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-gray-600 border-b">
                                <th className="py-2">Pet</th>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentAppointments.map((apt, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-2">{apt.pet}</td>
                                    <td>{apt.service}</td>
                                    <td>{apt.date}</td>
                                    <td>{apt.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Recent Orders */}
                <div className="bg-white shadow rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-gray-600 border-b">
                                <th className="py-2">Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-2">{order.orderId}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.total}</td>
                                    <td>{order.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
