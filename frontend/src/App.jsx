import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

// User components
import Navbar from './components/user/Navbar';
import Footer from './components/user/Footer';
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Profile from './pages/user/Profile';
import AboutUs from './pages/user/AboutUs';
import ContactUs from './pages/user/ContactUs';
import Shop from './pages/user/Shop';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import TermsAndConditions from './pages/user/TermsAndConditions';

// Admin components
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import PaymentManagement from './pages/admin/PaymentManagement';

// Supplier components
import SupplierLayout from './pages/supplier/SupplierLayout';
import SupplierDashboard from './pages/supplier/Dashboard';
import SupplierProductManagement from './pages/supplier/ProductManagement';
import SupplierOrderManagement from './pages/supplier/OrderManagement';
import SupplierManagement from './pages/admin/SupplierManagement';

// User Layout component
const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Routes with Layout */}
          <Route
            path="/*"
            element={
              <UserLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                </Routes>
              </UserLayout>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="suppliers" element={<SupplierManagement />} />
          </Route>

          {/* Supplier Routes */}
          <Route path="/supplier/*" element={
            <ProtectedRoute requireSupplier>
              <SupplierLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SupplierDashboard />} />
            <Route path="products" element={<SupplierProductManagement />} />
            <Route path="orders" element={<SupplierOrderManagement />} />
          </Route>
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;