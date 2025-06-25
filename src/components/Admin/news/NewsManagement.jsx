import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAllNews, getImageUrl } from '../../../api/queries';
import { checkApiUrl } from '../../../hooks/checkApiUrl';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/queries';
import {
    Edit,
    Trash2,
    Plus,
    Search,
    AlertTriangle,
    CheckCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
    Eye,
    Image,
    ToggleRight,
    ToggleLeft
} from 'lucide-react';

const NewsManagement = () => {
    const queryClient = useQueryClient();
    const { data: newsData, isLoading, error: fetchError } = useAdminAllNews();
    const [news, setNews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0 });
    const [showConfirmDelete, setShowConfirmDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [error, setError] = useState(null); useEffect(() => {
        if (newsData) {
            let processedNewsData = Array.isArray(newsData) ? newsData : [newsData];

            // Sort news by date in descending order (latest first)
            processedNewsData.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateB - dateA;
            });

            setNews(processedNewsData);

            // Update stats
            const active = processedNewsData.filter(item => item.status === 'active').length;
            const total = processedNewsData.length;
            setStats({
                active,
                inactive: total - active,
                total
            });
        }
    }, [newsData]);

    useEffect(() => {
        if (fetchError) {
            setError('فشل في تحميل الأخبار');
        }
    }, [fetchError]); const handleDeleteNews = async (newsId) => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            await apiClient.delete(`/news/delete/${newsId}/API`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            // Invalidate and refetch news data
            await queryClient.invalidateQueries(['news']);

            setShowConfirmDelete(null);
            setIsDeleting(false);
        } catch (error) {
            console.error('Failed to delete news:', error);
            setError(error.response?.data?.message || 'فشل في حذف الخبر');
            setIsDeleting(false);
        }
    };

    const toggleNewsStatus = async (newsId, currentStatus) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            await apiClient.patch(`/news/status/${newsId}/API`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

            // Invalidate and refetch news data
            await queryClient.invalidateQueries(['news']);
        } catch (error) {
            console.error('Failed to update news status:', error);
            setError('فشل في تحديث حالة الخبر');
        }
    };

    // Filter news based on search term
    const filteredNews = news.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

    // Helper function to truncate text
    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Helper function to get the first image from news item
    const getNewsImage = (newsItem) => {
        if (newsItem.news_images && newsItem.news_images.length > 0) {
            return checkApiUrl(getImageUrl(newsItem.news_images[0].image));
        } else if (newsItem.image) {
            return checkApiUrl(getImageUrl(newsItem.image));
        }
        return '/placeholder-image.jpg'; // Default placeholder
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                    <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center ه-screen">
                <div className="bg-red-50 p-6 rounded-lg text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-500 font-medium text-lg">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                    >
                        إعادة التحميل
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 mt-20">
            <div className="flex justify-between items-center mb-6">
                <Link
                    to="/admin/news/new"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    إضافة خبر جديد
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">إدارة الأخبار</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">الأخبار النشطة</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.active}</h3>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-yellow-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">الأخبار غير النشطة</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.inactive}</h3>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">إجمالي الأخبار</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Filter className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="البحث عن أخبار..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                <button className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 border border-gray-300 transition-colors">
                    <Filter size={18} />
                    تصفية
                </button>
            </div>

            {/* News Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>

                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    العنوان
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الموضوع
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    المشاهدات
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الصورة
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    إجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {truncateText(item.title, 50)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">
                                                {truncateText(item.object, 60)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Eye size={14} className="ml-1" />
                                                {item.visitors || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                                                <img
                                                    src={getNewsImage(item)}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleNewsStatus(item.id, item.status)}
                                                className={`flex items-center gap-1 text-sm rounded-full px-3 py-1 ${item.status === 'active'
                                                    ? 'text-green-800 bg-green-100 hover:bg-green-200'
                                                    : 'text-red-800 bg-red-100 hover:bg-red-200'
                                                    }`}
                                            >
                                                {item.status === 'active' ? (
                                                    <>
                                                        <ToggleRight size={14} />
                                                        نشط
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft size={14} />
                                                        غير نشط
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/news/edit/${item.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => setShowConfirmDelete(item.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        لا توجد أخبار لعرضها
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md ${currentPage === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronRight size={20} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-md ${currentPage === i + 1
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md ${currentPage === totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </nav>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full" dir="rtl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">تأكيد الحذف</h3>
                        <p className="text-gray-600 mb-6">
                            هل أنت متأكد من رغبتك في حذف هذا الخبر؟ هذا الإجراء لا يمكن التراجع عنه.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDelete(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => handleDeleteNews(showConfirmDelete)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        جاري الحذف...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        تأكيد الحذف
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsManagement;