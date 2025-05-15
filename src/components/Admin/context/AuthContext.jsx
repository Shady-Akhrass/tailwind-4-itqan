import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../../api/queries';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) :
                sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;

            if (token && storedUser) {
                setUser(storedUser);
                setIsAuthenticated(true);
                // Set the default Authorization header for all future requests
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (data, remember) => {
        const { user, token } = data;
        const storage = remember ? localStorage : sessionStorage;

        // Store user and token
        storage.setItem('user', JSON.stringify(user));
        storage.setItem('token', token);

        // Set auth state
        setUser(user);
        setIsAuthenticated(true);

        // Set the default Authorization header for all future requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                await apiClient.post('/logout', null, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clean up regardless of API success
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('token');
            delete apiClient.defaults.headers.common['Authorization'];
        }
    };

    const updateUser = (newUserData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newUserData };
            const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            loading,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);