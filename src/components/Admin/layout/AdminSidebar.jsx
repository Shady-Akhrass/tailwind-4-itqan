import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    FileText,
    Image,
    Users,
    Settings,
    Mail,
    BarChart2,
    Calendar,
    MessageSquare,
    BookOpen,
    Activity,
    Layers,
    Award,
    Gift,
    LayoutDashboard
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center px-4 py-3 gap-2 rounded-lg transition-colors ${active ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100'
            }`}
    >
        <Icon size={20} className={active ? 'text-green-600' : 'text-gray-500'} />
        <span className={`${active ? 'font-medium text-green-600' : 'text-gray-700'}`}>{label}</span>
    </Link>
);

const AdminSidebar = ({ isOpen }) => {
    const location = useLocation();
    const path = location.pathname;

    const mainLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
        { to: '/admin/home', icon: Home, label: 'الصفحة الرئيسية' },
        { to: '/admin/sections', icon: Layers, label: 'الأقسام' },
        { to: '/admin/news', icon: FileText, label: 'الأخبار' },
        { to: '/admin/gallery', icon: Image, label: 'معرض الصور' },
        { to: '/admin/users', icon: Users, label: 'المستخدمين' },
        { to: '/admin/messages', icon: MessageSquare, label: 'الرسائل' },
    ];

    const sectionLinks = [
        { to: '/admin/sections/memorization', icon: BookOpen, label: 'قسم التحفيظ' },
        { to: '/admin/sections/courses', icon: Calendar, label: 'قسم الدورات' },
        { to: '/admin/sections/activities', icon: Activity, label: 'قسم الأنشطة' },
        { to: '/admin/sections/creative', icon: Gift, label: 'قسم الإبداع' },
        { to: '/admin/sections/diwan', icon: Award, label: 'قسم الديوان' },
    ];

    const otherLinks = [
        { to: '/admin/analytics', icon: BarChart2, label: 'الإحصائيات' },
        { to: '/admin/contact', icon: Mail, label: 'نماذج التواصل' },
        { to: '/admin/settings', icon: Settings, label: 'الإعدادات' },
    ];

    const isLinkActive = (linkPath, exact = false) => {
        if (exact) return path === linkPath;
        return path.startsWith(linkPath);
    };

    return (
        <div
            className={`h-screen fixed top-0 right-0 pt-4 transition-all duration-300 bg-white shadow-lg overflow-y-auto z-20 ${isOpen ? 'w-64' : 'w-0'
                }`}
            dir="rtl"
        >
            <div className="px-6 h-12 flex items-center mb-4">
                <h2 className="text-xl font-bold text-green-600">دار الإتقان</h2>
            </div>

            <div className="px-3 space-y-6">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <h3 className="text-xs uppercase text-gray-500 font-semibold px-4 py-2">القائمة الرئيسية</h3>
                    {mainLinks.map((link) => (
                        <SidebarLink
                            key={link.to}
                            to={link.to}
                            icon={link.icon}
                            label={link.label}
                            active={isLinkActive(link.to, link.exact)}
                        />
                    ))}
                </div>

                {/* Sections Navigation */}
                <div className="space-y-1">
                    <h3 className="text-xs uppercase text-gray-500 font-semibold px-4 py-2">الأقسام</h3>
                    {sectionLinks.map((link) => (
                        <SidebarLink
                            key={link.to}
                            to={link.to}
                            icon={link.icon}
                            label={link.label}
                            active={isLinkActive(link.to)}
                        />
                    ))}
                </div>

                {/* Other Links */}
                <div className="space-y-1">
                    <h3 className="text-xs uppercase text-gray-500 font-semibold px-4 py-2">إدارة</h3>
                    {otherLinks.map((link) => (
                        <SidebarLink
                            key={link.to}
                            to={link.to}
                            icon={link.icon}
                            label={link.label}
                            active={isLinkActive(link.to)}
                        />
                    ))}
                </div>
            </div>

            {/* Admin Info */}
            <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users size={18} className="text-green-600" />
                    </div>
                    <div className="space-y-0.5 text-right">
                        <p className="text-sm font-medium">مرحبًا، المسؤول</p>
                        <p className="text-xs text-gray-500">آخر دخول: اليوم</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;