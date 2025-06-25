import React, { useEffect, useRef, useState } from 'react';
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
    Layers,
    UserCheck,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    FileQuestion,
    Mic,
    UserCog,
    Newspaper,
    User,
    Star,
    Folder,
    UserPlus
} from 'lucide-react';
import { useVisitorsCount, useAdminAllNews, useHomeData, apiClient } from '../../../api/queries';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Sample data for charts
const visitorsData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
        {
            label: 'عدد الزوار',
            data: [1200, 1900, 3000, 5000, 6000, 4000],
            borderColor: 'rgb(34, 197, 94)',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
        },
    ],
};

// Animated Counter Hook
const useAnimatedCounter = (end, duration = 1000) => {
    const [count, setCount] = useState(0);
    const ref = useRef();
    useEffect(() => {
        let start = 0;
        let cancelled = false;
        if (typeof end !== 'number') return;
        const step = (timestamp) => {
            if (!ref.current) ref.current = timestamp;
            const progress = Math.min((timestamp - ref.current) / duration, 1);
            setCount(Math.floor(progress * (end - start) + start));
            if (progress < 1 && !cancelled) {
                requestAnimationFrame(step);
            } else {
                setCount(end);
            }
        };
        requestAnimationFrame(step);
        return () => { cancelled = true; };
    }, [end, duration]);
    return count;
};

// Stat card component with trend indicator
const StatCard = ({ icon: Icon, title, value, trend, color, animate }) => {
    const animatedValue = animate && typeof value === 'number' ? useAnimatedCounter(value) : value;
    const isPositive = trend > 0;

    return (
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:border-green-100 hover:-translate-y-1 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl ${color} shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                        <Icon className="text-white" size={22} />
                    </div>
                    {trend !== undefined && (
                        <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-gray-900 leading-none">
                        {animate && typeof value === 'number' ? animatedValue.toLocaleString('ar-EG') : value}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{title}</p>
                </div>
            </div>
        </div>
    );
};

// Quick access card component
const QuickAccessCard = ({ icon: Icon, title, description, to, color }) => {
    return (
        <Link
            to={to}
            className="group block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-green-100 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-green-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
                <div className={`p-3 rounded-xl ${color} w-12 h-12 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
        </Link>
    );
};

const Dashboard = () => {
    const { data: visitorsCount, isLoading: isLoadingVisitors } = useVisitorsCount();
    const { data: newsData } = useAdminAllNews();
    const { data: homeData } = useHomeData();
    const { user } = useAuth();
    const [donates, setDonates] = useState([]);
    const [geniuses, setGeniuses] = useState([]);
    const [sections, setSections] = useState([]);
    const [directors, setDirectors] = useState([]);

    useEffect(() => {
        apiClient.get('/donate/API').then(res => setDonates(res.data)).catch(() => setDonates([]));
        apiClient.get('/geniuse/API').then(res => setGeniuses(res.data)).catch(() => setGeniuses([]));
        apiClient.get('/sections/API').then(res => setSections(res.data)).catch(() => setSections([]));
        apiClient.get('/directors').then(res => setDirectors(res.data.data || [])).catch(() => setDirectors([]));
    }, []);

    // News
    const news = Array.isArray(newsData) ? newsData : (newsData ? [newsData] : []);
    const newsStats = {
        total: news.length,
        active: news.filter(n => n.status === 'active').length,
        inactive: news.filter(n => n.status !== 'active').length,
    };
    // Donations
    const donateStats = {
        total: donates.length,
        active: donates.filter(d => d.status === 'active').length,
        inactive: donates.filter(d => d.status !== 'active').length,
    };
    // Geniuses
    const geniusStats = {
        total: geniuses.length,
        active: geniuses.filter(g => g.status === 'active').length,
        inactive: geniuses.filter(g => g.status !== 'active').length,
    };
    // Sections
    const sectionStats = {
        total: sections.length,
        active: sections.filter(s => s.status === 1 || s.is_active === 1 || s.active === 1).length,
        inactive: sections.filter(s => !(s.status === 1 || s.is_active === 1 || s.active === 1)).length,
    };
    // Directors
    const directorStats = {
        total: directors.length,
        active: directors.filter(d => d.status === 'active').length,
        inactive: directors.filter(d => d.status !== 'active').length,
    };

    // Prepare data for 'أكثر الأخبار مشاهدة' (top 10 news by visitors)
    const topNews = [...news]
        .filter(n => n.status === 'active')
        .sort((a, b) => (b.visitors || 0) - (a.visitors || 0))
        .slice(0, 10);
    // Store both truncated and full titles
    const newsLabels = topNews.map(n => n.title.length > 20 ? n.title.substring(0, 20) + '…' : n.title);
    const newsFullTitles = topNews.map(n => n.title);
    const newsViewsData = {
        labels: newsLabels,
        datasets: [
            {
                label: 'المشاهدات',
                data: topNews.map(n => n.visitors || 0),
                backgroundColor: [
                    'rgba(34, 197, 94, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(5, 150, 105, 0.85)',
                    'rgba(4, 120, 87, 0.85)',
                    'rgba(6, 95, 70, 0.85)',
                    'rgba(6, 78, 59, 0.85)',
                    'rgba(20, 83, 45, 0.85)',
                    'rgba(22, 101, 52, 0.85)',
                    'rgba(34, 197, 94, 0.65)',
                    'rgba(16, 185, 129, 0.65)',
                ],
                borderRadius: 12,
                borderSkipped: false,
                maxBarThickness: 48,
                minBarLength: 4,
                hoverBackgroundColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(5, 150, 105, 1)',
                    'rgba(4, 120, 87, 1)',
                    'rgba(6, 95, 70, 1)',
                    'rgba(6, 78, 59, 1)',
                    'rgba(20, 83, 45, 1)',
                    'rgba(22, 101, 52, 1)',
                    'rgba(34, 197, 94, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                ],
            },
        ],
    };

    // Prepare data for 'توزيع المحتوى حسب الأقسام' (sections distribution)
    const sectionLabels = sections.map(s => s.name);
    const sectionCounts = sections.map(s => (s.dataCount || 1)); // fallback to 1 if no count
    const sectionsData = {
        labels: sectionLabels.length > 0 ? sectionLabels : ['لا يوجد أقسام'],
        datasets: [
            {
                data: sectionLabels.length > 0 ? sectionCounts : [1],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(5, 150, 105, 0.8)',
                    'rgba(4, 120, 87, 0.8)',
                    'rgba(6, 95, 70, 0.8)',
                    'rgba(6, 78, 59, 0.8)',
                    'rgba(20, 83, 45, 0.8)',
                    'rgba(22, 101, 52, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    // Prepare top news for the stat card
    const topNewsItem = topNews.length > 0 ? topNews[0] : null;
    const topNewsTitle = topNewsItem ? topNewsItem.title : 'لا يوجد أخبار';
    const topNewsViews = topNewsItem ? (topNewsItem.visitors || 0) : 0;

    // Visitors stat
    const visitorsNumber = isLoadingVisitors ? '...' : Number(visitorsCount?.visitors) || 0;

    const stats = [
        {
            icon: UserCheck,
            title: 'عدد الزوار',
            value: visitorsNumber,
            trend: undefined,
            color: 'bg-green-600',
            animate: true
        },
        {
            icon: Eye,
            title: `أكثر الأخبار مشاهدة: ${topNewsTitle}`,
            value: topNewsViews,
            trend: undefined,
            color: 'bg-emerald-600',
            animate: true
        },
        {
            icon: FileText,
            title: 'الأخبار المنشورة',
            value: newsStats.total,
            trend: undefined,
            color: 'bg-teal-600',
            animate: true
        },
        {
            icon: Gift,
            title: 'عدد منشورات التبرعات',
            value: donateStats.total,
            trend: undefined,
            color: 'bg-green-700',
            animate: true
        },
        {
            icon: Layers,
            title: 'عدد الأقسام',
            value: sectionStats.total,
            trend: undefined,
            color: 'bg-emerald-700',
            animate: true
        },
    ];

    const quickAccess = [
        {
            icon: Layers,
            title: 'الأقسام',
            description: 'إدارة أقسام الموقع المختلفة',
            to: '/admin/sections',
            color: 'bg-green-600'
        },
        {
            icon: FileText,
            title: 'الأخبار',
            description: 'إضافة وتعديل الأخبار',
            to: '/admin/news',
            color: 'bg-emerald-600'
        },
        {
            icon: Gift,
            title: 'التبرعات',
            description: 'إدارة التبرعات',
            to: '/admin/donate',
            color: 'bg-teal-600'
        },
        {
            icon: Award,
            title: 'النوابغ',
            description: 'إدارة قسم النوابغ',
            to: '/admin/genius',
            color: 'bg-green-700'
        },
        {
            icon: FileQuestion,
            title: 'الأدلة',
            description: 'إدارة الأدلة والإرشادات',
            to: '/admin/clues',
            color: 'bg-emerald-700'
        },
        {
            icon: UserCog,
            title: 'مجلس الإدارة',
            description: 'إدارة أعضاء مجلس الإدارة',
            to: '/admin/directors',
            color: 'bg-teal-700'
        }
    ];

    // Chart options
    const lineOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'إحصائيات الزوار',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#111',
                bodyColor: '#22c55e',
                borderColor: '#22c55e',
                borderWidth: 1,
                padding: 14,
                titleFont: { size: 16, weight: 'bold' },
                bodyFont: { size: 18, weight: 'bold' },
                callbacks: {
                    title: function (context) {
                        // Show the full news title on hover
                        const idx = context[0].dataIndex;
                        return newsFullTitles[idx] || '';
                    },
                    label: function (context) {
                        return ` المشاهدات: ${context.parsed.y.toLocaleString('ar-EG')}`;
                    }
                }
            },
        },
        layout: {
            padding: {
                top: 16,
                bottom: 16,
                left: 8,
                right: 8
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.04)',
                    drawBorder: false
                },
                ticks: {
                    color: '#6B7280',
                    font: { size: 14, weight: 'bold' },
                    padding: 8
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#374151',
                    font: { size: 13, weight: 'bold' },
                    maxRotation: 40,
                    minRotation: 0,
                    padding: 8
                }
            }
        },
        animation: {
            duration: 900,
            easing: 'easeOutQuart'
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'توزيع المحتوى حسب الأقسام',
                color: '#374151',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
        cutout: '60%',
    };

    // Home activities extraction
    let homeActivities = [];
    if (homeData && homeData.homes && homeData.homes[0]) {
        const home = homeData.homes[0];
        if (home.created_at) {
            homeActivities.push({
                type: 'home',
                title: 'الرؤية والرسالة',
                date: home.created_at,
                action: 'post',
                userName: user?.name || 'المسؤول',
            });
        }
        if (home.updated_at && home.updated_at !== home.created_at) {
            homeActivities.push({
                type: 'home',
                title: 'الرؤية والرسالة',
                date: home.updated_at,
                action: 'update',
                userName: user?.name || 'المسؤول',
            });
        }
        if (home.achievements_updated_at) {
            homeActivities.push({
                type: 'home',
                title: 'إنجازات الصفحة الرئيسية',
                date: home.achievements_updated_at,
                action: 'update',
                userName: user?.name || 'المسؤول',
            });
        }
    }
    if (homeData && homeData.youtubes && homeData.youtubes[0]) {
        const yt = homeData.youtubes[0];
        if (yt.created_at) {
            homeActivities.push({
                type: 'home',
                title: 'مكتبة الفيديو الرئيسية',
                date: yt.created_at,
                action: 'post',
                userName: user?.name || 'المسؤول',
            });
        }
        if (yt.updated_at && yt.updated_at !== yt.created_at) {
            homeActivities.push({
                type: 'home',
                title: 'مكتبة الفيديو الرئيسية',
                date: yt.updated_at,
                action: 'update',
                userName: user?.name || 'المسؤول',
            });
        }
    }
    if (homeData && homeData.sound && homeData.sound[0]) {
        const sound = homeData.sound[0];
        if (sound.created_at) {
            homeActivities.push({
                type: 'home',
                title: 'الصوتيات الرئيسية',
                date: sound.created_at,
                action: 'post',
                userName: user?.name || 'المسؤول',
            });
        }
        if (sound.updated_at && sound.updated_at !== sound.created_at) {
            homeActivities.push({
                type: 'home',
                title: 'الصوتيات الرئيسية',
                date: sound.updated_at,
                action: 'update',
                userName: user?.name || 'المسؤول',
            });
        }
    }
    if (homeData && homeData.images && Array.isArray(homeData.images)) {
        homeData.images.forEach(img => {
            if (img.created_at) {
                homeActivities.push({
                    type: 'home',
                    title: 'صورة عرض رئيسية',
                    date: img.created_at,
                    action: 'post',
                    userName: user?.name || 'المسؤول',
                });
            }
            if (img.updated_at && img.updated_at !== img.created_at) {
                homeActivities.push({
                    type: 'home',
                    title: 'صورة عرض رئيسية',
                    date: img.updated_at,
                    action: 'update',
                    userName: user?.name || 'المسؤول',
                });
            }
        });
    }

    const allActivities = [
        ...homeActivities,
        ...news.flatMap(n => [
            { type: 'news', title: n.title, date: n.created_at, action: 'post', userName: user?.name || 'المسؤول' },
            n.updated_at && n.updated_at !== n.created_at ? { type: 'news', title: n.title, date: n.updated_at, action: 'update', userName: user?.name || 'المسؤول' } : null
        ]).filter(Boolean),
        ...donates.flatMap(d => [
            { type: 'donate', title: d.title, date: d.date, action: 'post', userName: user?.name || 'المسؤول' },
            d.updated_at && d.updated_at !== d.date ? { type: 'donate', title: d.title, date: d.updated_at, action: 'update', userName: user?.name || 'المسؤول' } : null
        ]).filter(Boolean),
        ...geniuses.flatMap(g => [
            { type: 'genius', title: g.name, date: g.created_at, action: 'post', userName: user?.name || 'المسؤول' },
            g.updated_at && g.updated_at !== g.created_at ? { type: 'genius', title: g.name, date: g.updated_at, action: 'update', userName: user?.name || 'المسؤول' } : null
        ]).filter(Boolean),
        ...sections.flatMap(s => [
            { type: 'section', title: s.name, date: s.created_at, action: 'post', userName: user?.name || 'المسؤول' },
            s.updated_at && s.updated_at !== s.created_at ? { type: 'section', title: s.name, date: s.updated_at, action: 'update', userName: user?.name || 'المسؤول' } : null
        ]).filter(Boolean),
        ...directors.flatMap(d => [
            { type: 'director', title: d.name, date: d.created_at, action: 'post', userName: user?.name || 'المسؤول' },
            d.updated_at && d.updated_at !== d.created_at ? { type: 'director', title: d.name, date: d.updated_at, action: 'update', userName: user?.name || 'المسؤول' } : null
        ]).filter(Boolean),
    ]
        .filter(item => item.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter state for activities
    const [activityFilter, setActivityFilter] = useState('all');
    const filteredActivities = activityFilter === 'all'
        ? allActivities
        : allActivities.filter(item => item.type === activityFilter);
    const activitiesToShow = filteredActivities.slice(0, 20);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-12 mt-16">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                            <div className="mb-6 lg:mb-0">
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                                    لوحة التحكم
                                </h1>
                                <p className="text-lg text-gray-600">مرحباً بك في لوحة تحكم دار الإتقان</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 px-6 py-4 rounded-2xl">
                                <p className="text-green-800 font-semibold text-base">
                                    {new Date().toLocaleDateString('ar-EG', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>
                </div>

                {/* Charts Section */}
                <div className="mb-12">
                    <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-8 relative overflow-hidden group transition-all duration-300">
                        {/* Decorative gradient accent */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-green-50/80 via-white/0 to-emerald-50/60 opacity-80 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-green-600 rounded-xl shadow-sm">
                                    <BarChart2 className="text-white" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">أكثر الأخبار مشاهدة</h2>
                            </div>
                            <div className="h-96 w-full items-center justify-center text-center">
                                <Bar data={newsViewsData} options={barOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-green-100 rounded-xl">
                            <Activity className="text-green-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">الوصول السريع</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quickAccess.map((item, index) => (
                            <QuickAccessCard key={index} {...item} />
                        ))}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Sections Distribution Chart */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <BookOpen className="text-green-600" size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">توزيع المحتوى حسب الأقسام</h3>
                            </div>
                            <div className="h-80">
                                <Doughnut data={sectionsData} options={doughnutOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-3">
                        <div className="lg:col-span-3 mx-auto">
                            <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-8 h-full relative overflow-hidden group transition-all duration-300">
                                {/* Decorative gradient accent */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-green-50/80 via-white/0 to-emerald-50/60 opacity-80 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 bg-green-600 rounded-xl shadow-sm">
                                            <Calendar className="text-white" size={20} />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">النشاطات الأخيرة</h2>
                                    </div>
                                    {/* Filter Buttons */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {[
                                            { key: 'all', label: 'الكل', color: 'green' },
                                            { key: 'news', label: 'الأخبار', color: 'emerald' },
                                            { key: 'donate', label: 'التبرعات', color: 'teal' },
                                            { key: 'genius', label: 'النوابغ', color: 'green' },
                                            { key: 'section', label: 'الأقسام', color: 'emerald' },
                                            { key: 'director', label: 'مجلس الإدارة', color: 'teal' },
                                            { key: 'home', label: 'الصفحة الرئيسية', color: 'green' }
                                        ].map(filter => (
                                            <button
                                                key={filter.key}
                                                onClick={() => setActivityFilter(filter.key)}
                                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-green-400/30
                                                    ${activityFilter === filter.key
                                                        ? `bg-${filter.color}-600 text-white border-${filter.color}-600`
                                                        : `bg-white text-${filter.color}-700 border-${filter.color}-100 hover:bg-${filter.color}-50`}
                                                `}
                                            >
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Activities Timeline */}
                                    <div className="relative pr-6 pl-2 max-h-96 overflow-y-auto">
                                        {/* Vertical timeline line on the right */}
                                        <div className="absolute top-0 right-3 bottom-0 w-1 bg-gradient-to-b from-green-200 via-green-100 to-emerald-100 rounded-full" style={{ zIndex: 0 }} />
                                        {activitiesToShow.length === 0 && (
                                            <div className="py-12 text-center">
                                                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                                    <Calendar className="text-gray-400" size={24} />
                                                </div>
                                                <p className="text-gray-500 text-lg">لا يوجد نشاطات حديثة</p>
                                            </div>
                                        )}
                                        <ul className="space-y-6 relative z-10">
                                            {activitiesToShow.map((item, index) => (
                                                <li key={index} className="group flex flex-row-reverse items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative">
                                                    {/* Timeline dot/icon on the right */}
                                                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white absolute -right-7 top-4 z-20
                                                        ${item.type === 'news' ? 'bg-green-600' :
                                                            item.type === 'donate' ? 'bg-emerald-600' :
                                                                item.type === 'genius' ? 'bg-teal-600' :
                                                                    item.type === 'section' ? 'bg-emerald-700' :
                                                                        item.type === 'director' ? 'bg-teal-700' :
                                                                            item.type === 'home' ? 'bg-green-500' :
                                                                                'bg-gray-300'}
                                                    `}>
                                                        {item.type === 'news' && <Newspaper size={16} className="text-white" />}
                                                        {item.type === 'donate' && <Gift size={16} className="text-white" />}
                                                        {item.type === 'genius' && <Star size={16} className="text-white" />}
                                                        {item.type === 'section' && <Folder size={16} className="text-white" />}
                                                        {item.type === 'director' && <UserPlus size={16} className="text-white" />}
                                                        {item.type === 'home' && <BookOpen size={16} className="text-white" />}
                                                    </span>
                                                    <div className="flex-1 min-w-0 mr-2">
                                                        <p className="text-base font-semibold text-gray-800 truncate">
                                                            {item.title}
                                                            <span className="text-gray-400 font-normal ml-2">({{
                                                                home: item.action === 'update' ? 'تحديث الصفحة الرئيسية' : 'إضافة الصفحة الرئيسية',
                                                                news: item.action === 'update' ? 'تحديث خبر' : 'خبر جديد',
                                                                donate: item.action === 'update' ? 'تحديث تبرع' : 'تبرع جديد',
                                                                genius: item.action === 'update' ? 'تحديث نابغة' : 'نابغة جديد',
                                                                section: item.action === 'update' ? 'تحديث قسم' : 'قسم جديد',
                                                                director: item.action === 'update' ? 'تحديث مدير' : 'مدير جديد',
                                                            }[item.type]})</span>
                                                            <span className="text-green-600 font-normal ml-2">{item.userName}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;