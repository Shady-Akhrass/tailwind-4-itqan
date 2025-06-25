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
    LayoutDashboard,
    FileQuestion,
    Mic,
    UserCog
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, isOpen }) => (
    <Link
        to={to}
        className={`group flex items-center ${isOpen ? 'px-5 py-3 gap-3' : 'px-0 py-3 justify-center'} rounded-xl transition-all duration-300 relative overflow-hidden
            ${active ? 'bg-gradient-to-l from-green-100/80 to-emerald-50/80 dark:from-green-900/60 dark:to-emerald-900/60 text-green-700 dark:text-yellow-400 shadow-lg' : 'hover:bg-green-50/70 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-200'}
        `}
    >
        {/* Active bar */}
        {active && <span className="absolute right-0 top-2 bottom-2 w-1.5 rounded-full bg-gradient-to-b from-green-400 to-emerald-500 shadow-md" />}
        <Icon size={22} className={active ? 'text-green-600 dark:text-yellow-400' : 'text-gray-400 group-hover:text-green-500 dark:group-hover:text-yellow-300 transition-colors'} />
        {isOpen && <span className={`font-semibold text-base transition-colors duration-200`}>{label}</span>}
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
        { to: '/admin/donate', icon: Gift, label: 'التبرعات' },
        { to: '/admin/genius', icon: Award, label: 'النوابغ' },
        { to: '/admin/clues', icon: FileQuestion, label: 'الأدلة' },
        { to: '/admin/speech', icon: Mic, label: 'كلمة المدير' },
        { to: '/admin/directors', icon: UserCog, label: 'إدارة مجلس الإدارة' },
        // { to: '/admin/gallery', icon: Image, label: 'معرض الصور' },
        // { to: '/admin/users', icon: Users, label: 'المستخدمين' },
        // { to: '/admin/messages', icon: MessageSquare, label: 'الرسائل' },
    ];

    const sectionLinks = [
        // { to: '/admin/sections/memorization', icon: BookOpen, label: 'قسم التحفيظ' },
        // { to: '/admin/sections/courses', icon: Calendar, label: 'قسم الدورات' },
        // { to: '/admin/sections/activities', icon: Activity, label: 'قسم الأنشطة' },
        // { to: '/admin/sections/creative', icon: Gift, label: 'قسم الإبداع' },
        // { to: '/admin/sections/diwan', icon: Award, label: 'قسم الديوان' },
    ];

    // const otherLinks = [
    //     { to: '/admin/analytics', icon: BarChart2, label: 'الإحصائيات' },
    //     { to: '/admin/contact', icon: Mail, label: 'نماذج التواصل' },
    //     { to: '/admin/settings', icon: Settings, label: 'الإعدادات' },
    // ];

    const isLinkActive = (linkPath, exact = false) => {
        if (exact) return path === linkPath;
        return path.startsWith(linkPath);
    };

    return (
        <div
            className={`h-[calc(100vh-64px)] fixed top-16 right-0 pt-6 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-l-4 border-gradient-to-b from-green-400/60 to-emerald-500/30 overflow-y-auto z-20 ${isOpen ? 'w-72' : 'w-20'} rounded-l-3xl`}
            dir="rtl"
        >
            {/* Sidebar Header with logo */}
            {/* <div className={`flex items-center justify-center mb-6 relative ${isOpen ? 'px-4 h-20' : 'px-0 h-14'}`}>
                <img
                    src={Logo}
                    alt="دار الإتقان"
                    className={`transition-all duration-300 object-contain ${isOpen ? 'h-12 w-auto' : 'h-8 w-8'} mx-auto`}
                />
            </div> */}

            <div className="px-2 space-y-8">
                {/* Main Navigation */}
                <div className="space-y-2">
                    <h3 className={`text-xs uppercase font-semibold px-2 py-2 tracking-widest ${isOpen ? 'text-gray-400 dark:text-gray-500' : 'sr-only'}`}>القائمة الرئيسية</h3>
                    {mainLinks.map((link) => (
                        <SidebarLink
                            key={link.to}
                            to={link.to}
                            icon={link.icon}
                            label={link.label}
                            active={isLinkActive(link.to, link.exact)}
                            isOpen={isOpen}
                        />
                    ))}
                </div>
            </div>

            {/* Modern User Info Card at the bottom */}
            <div className={`absolute bottom-0 right-0 left-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-b-3xl shadow-lg transition-all duration-300 ${isOpen ? '' : 'flex flex-col items-center p-2'}`}>
                <div className="flex items-center gap-3 justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                        <Users size={22} className="text-white" />
                    </div>
                    {isOpen && (
                        <div className="space-y-0.5 text-right">
                            <p className="text-base font-bold text-gray-800 dark:text-gray-100">مرحبًا، المسؤول</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">آخر دخول: اليوم</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;