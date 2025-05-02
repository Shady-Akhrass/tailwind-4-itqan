import React from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    MessageSquare,
    Eye,
    FileText,
    BarChart2,
    Activity,
    BookOpen,
    Calendar,
    Gift,
    Award,
    Layers
} from 'lucide-react';

// Stat card component
const StatCard = ({ icon: Icon, title, value, trend, color }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm mb-1">{title}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                    <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? `+${trend}%` : `${trend}%`} منذ الشهر الماضي
                    </p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="text-white" size={24} />
                </div>
            </div>
        </div>
    );
};

// Quick access card component
const QuickAccessCard = ({ icon: Icon, title, description, to, color }) => {
    return (
        <Link to={to} className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${color} w-12 h-12 flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
        </Link>
    );
};

const Dashboard = () => {
    // Sample data for demonstration
    const stats = [
        {
            icon: Users,
            title: 'المستخدمين النشطين',
            value: '2,452',
            trend: 12.5,
            color: 'bg-blue-500'
        },
        {
            icon: Eye,
            title: 'الزيارات اليومية',
            value: '1,257',
            trend: 8.2,
            color: 'bg-green-500'
        },
        {
            icon: MessageSquare,
            title: 'الرسائل الجديدة',
            value: '48',
            trend: -2.4,
            color: 'bg-yellow-500'
        },
        {
            icon: FileText,
            title: 'المحتوى المنشور',
            value: '132',
            trend: 4.6,
            color: 'bg-purple-500'
        },
    ];

    const quickAccess = [
        {
            icon: Layers,
            title: 'الأقسام',
            description: 'إدارة أقسام الموقع المختلفة',
            to: '/admin/sections',
            color: 'bg-green-500'
        },
        {
            icon: FileText,
            title: 'الأخبار',
            description: 'إضافة وتعديل الأخبار والتحديثات',
            to: '/admin/news',
            color: 'bg-blue-500'
        },
        {
            icon: Users,
            title: 'المستخدمون',
            description: 'إدارة حسابات المستخدمين',
            to: '/admin/users',
            color: 'bg-yellow-500'
        },
        {
            icon: MessageSquare,
            title: 'الرسائل',
            description: 'تصفح رسائل نموذج الاتصال',
            to: '/admin/messages',
            color: 'bg-purple-500'
        },
        {
            icon: BarChart2,
            title: 'الإحصائيات',
            description: 'عرض إحصائيات الموقع والزيارات',
            to: '/admin/analytics',
            color: 'bg-red-500'
        },
        {
            icon: BookOpen,
            title: 'قسم التحفيظ',
            description: 'إدارة محتوى قسم تحفيظ القرآن',
            to: '/admin/sections/memorization',
            color: 'bg-indigo-500'
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('ar-EG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Quick Access */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">الوصول السريع</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {quickAccess.map((item, index) => (
                    <QuickAccessCard key={index} {...item} />
                ))}
            </div>

            {/* Recent Activity */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">النشاطات الأخيرة</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <div className="divide-y">
                        {[1, 2, 3, 4, 5].map((_, index) => (
                            <div key={index} className="py-3 flex items-center gap-4">
                                <div className="p-2 rounded-full bg-gray-100">
                                    <Activity size={16} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm">
                                        <span className="font-medium">المستخدم {index + 1}</span> قام بتحديث محتوى
                                        <span className="text-green-600 font-medium"> قسم {index % 2 === 0 ? 'الديوان' : 'التحفيظ'}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">منذ {index + 1} ساعات</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 