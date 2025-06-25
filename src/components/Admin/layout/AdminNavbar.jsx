import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    User,
    X
} from 'lucide-react';
import Logo from '../../../../public/logo.png';


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
        <nav className="fixed top-0 right-0 left-0 w-full h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gradient-to-l from-green-400/30 to-emerald-500/20 px-6 py-3 flex items-center justify-between z-30 transition-all duration-300">
            {/* Left section: Sidebar toggle only */}
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleSidebar}
                    className="transition-colors"
                    aria-label={isOpen ? 'Shrink sidebar' : 'Expand sidebar'}
                >
                    <Menu size={24} />
                </button>

                <img src={Logo} alt="Logo" className="h-12 md:h-14 max-w-[150px] object-contain" style={{ maxHeight: '56px', minHeight: '40px' }} />

            </div>

            {/* Right section: User dropdown only */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 cursor-pointer focus:outline-none group"
                    >
                        <div className="hidden md:block text-right">
                            <p className="text-base font-bold text-gray-800 dark:text-gray-100">{user?.name || 'المسؤول'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'مدير النظام'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white ml-4 shadow-md border-2 border-white dark:border-gray-800 group-hover:scale-105 transition-transform">
                            <User size={22} />
                        </div>
                    </button>
                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute left-0 mt-3 w-56 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl py-2 z-40 text-right border border-green-100 dark:border-gray-800 animate-fade-in">
                            <Link
                                to="/admin/profile"
                                className="flex items-center px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 rounded-xl gap-2 transition-colors"
                            >
                                <User size={18} className="ml-2" /> الملف الشخصي
                            </Link>
                            <Link
                                to="/admin/settings"
                                className="flex items-center px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 rounded-xl gap-2 transition-colors"
                            >
                                <Settings size={18} className="ml-2" /> الإعدادات
                            </Link>
                            <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-5 py-3 text-base text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded-xl gap-2 transition-colors"
                            >
                                <LogOut size={18} className="ml-2" /> تسجيل الخروج
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;