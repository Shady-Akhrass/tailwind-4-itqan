import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Bell,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    User,
    X
} from 'lucide-react';

const AdminNavbar = ({ toggleSidebar, isOpen }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        // Here you would implement actual dark mode toggle functionality
    };

    return (
        <nav className="bg-white shadow-md px-4 py-2 flex items-center justify-between sticky top-0 z-10">
            {/* Left section: Logo and toggle */}
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <Link to="/admin" className="mx-4 flex items-center">
                    <span className="text-xl font-bold text-green-600">لوحة الإدارة</span>
                </Link>
            </div>

            {/* Right section: Actions and profile */}
            <div className="flex items-center">
                {/* Dark mode toggle */}
                {/* <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button> */}

                {/* Notifications */}
                {/* <button
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors mx-2 relative"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        3
                    </span>
                </button> */}

                {/* User dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 cursor-pointer focus:outline-none"
                    >
                        
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium">{user?.name || 'المسؤول'}</p>
                            <p className="text-xs text-gray-500">{user?.role || 'مدير النظام'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white ml-10">
                            <User size={20} />
                        </div>
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 text-right">
                            <Link
                                to="/admin/profile"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <User size={16} className="ml-2" />
                                الملف الشخصي
                            </Link>
                            <Link
                                to="/admin/settings"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Settings size={16} className="ml-2" />
                                الإعدادات
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                <LogOut size={16} className="ml-2" />
                                تسجيل الخروج
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;