import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserData = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('token');
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            await fetchUserData(data.token);

            // Show success message based on user type
            const userType = data.userType;
            let message = 'Login successful!';
            
            if (userType === 'supplier') {
                message = 'Welcome to your supplier dashboard!';
            } else if (userType === 'admin') {
                message = 'Welcome to admin dashboard!';
            } else {
                message = 'Welcome back!';
            }

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });

            // Redirect based on user type
            switch (userType) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'supplier':
                    navigate('/supplier/dashboard');
                    break;
                default:
                    navigate('/');
            }

            return { success: true };
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.message || 'Failed to login. Please check your credentials.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const updateUser = async (userData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Update failed');
            }

            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const addPet = async (petData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/pets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(petData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add pet');
            }

            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updatePet = async (petId, petData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/auth/pets/${petId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(petData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update pet');
            }

            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deletePet = async (petId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (!result.isConfirmed) {
                return { success: false, error: 'Operation cancelled' };
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/auth/pets/${petId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete pet');
            }

            setUser(data);
            Swal.fire(
                'Deleted!',
                'Your pet has been removed.',
                'success'
            );
            return { success: true };
        } catch (error) {
            Swal.fire(
                'Error!',
                error.message || 'Failed to delete pet',
                'error'
            );
            return { success: false, error: error.message };
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUser,
            addPet,
            updatePet,
            deletePet
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 