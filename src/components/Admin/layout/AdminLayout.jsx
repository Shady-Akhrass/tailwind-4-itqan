import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (!isLoggedIn) {
            navigate('/admin/login', { replace: true });
        }
    }, [navigate]);

    // Close sidebar on mobile when navigating
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize(); // Initialize based on current screen size
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Close sidebar on navigation on mobile
    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50" dir="rtl">
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} />

            {/* Main content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:mr-64' : 'mr-0'}`}>
                <AdminNavbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />

                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    <Outlet />
                </main>

                {/* Footer */}
                {/* <footer className="py-4 px-6 bg-white border-t border-gray-200">
                    <div className="text-center text-gray-500 text-sm">
                        حقوق النشر © {new Date().getFullYear()} دار الإتقان. جميع الحقوق محفوظة.
                    </div>
                </footer> */}
            </div>
        </div>
    );
};

export default AdminLayout;