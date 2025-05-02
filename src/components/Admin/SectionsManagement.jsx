import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/queries';
import { Edit, Trash2, Plus, Search, AlertTriangle, CheckCircle, Loader2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const SectionsManagement = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0 });
    const [showConfirmDelete, setShowConfirmDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const sectionsData = [
        { id: 'memorization', name: 'قسم التحفيظ', endpoint: '/memorization/API', icon: '📖' },
        { id: 'courses', name: 'قسم الدورات', endpoint: '/course/API', icon: '🎓' },
        { id: 'activities', name: 'قسم الأنشطة', endpoint: '/activity/API', icon: '🎪' },
        { id: 'creative', name: 'قسم الإبداع', endpoint: '/creative/API', icon: '🎨' },
        { id: 'diwan', name: 'قسم الديوان', endpoint: '/diwan/API', icon: '📝' }
    ];

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const sectionsWithData = await Promise.all(
                    sectionsData.map(async (section) => {
                        try {
                            const response = await apiClient.get(section.endpoint);
                            return {
                                ...section,
                                hasData: response.data && response.data.length > 0,
                                dataCount: response.data?.length || 0,
                                lastUpdated: new Date().toISOString(),
                                status: 'active'
                            };
                        } catch (error) {
                            console.error(`Error fetching ${section.name}:`, error);
                            return {
                                ...section,
                                hasData: false,
                                dataCount: 0,
                                lastUpdated: null,
                                status: 'active'
                            };
                        }
                    })
                );

                // Calculate stats
                const active = sectionsWithData.filter(s => s.status === 'active').length;
                const total = sectionsWithData.length;

                setStats({
                    active,
                    inactive: total - active,
                    total
                });

                setSections(sectionsWithData);
                setLoading(false);
            } catch (error) {
                setError('Failed to load sections data');
                setLoading(false);
            }
        };

        fetchSections();
    }, []);

    const handleDeleteSection = async (sectionId) => {
        setIsDeleting(true);
        try {
            // API call would go here
            // await apiClient.delete(`/sections/${sectionId}`);

            // For now, we'll just simulate success
            setTimeout(() => {
                const updatedSections = sections.map(section =>
                    section.id === sectionId
                        ? { ...section, hasData: false, dataCount: 0 }
                        : section
                );
                setSections(updatedSections);

                // Update stats
                const active = updatedSections.filter(s => s.status === 'active').length;
                const total = updatedSections.length;
                setStats({
                    active,
                    inactive: total - active,
                    total
                });

                setShowConfirmDelete(null);
                setIsDeleting(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to delete section:', error);
            setIsDeleting(false);
        }
    };

    // Filter sections based on search term
    const filteredSections = sections.filter(section =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSections.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSections.length / itemsPerPage);

    if (loading) {
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
            <div className="flex justify-center items-center h-screen">
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
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">

                <Link
                    to="/admin/sections/new"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    إضافة قسم جديد
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">إدارة الأقسام</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">الأقسام الفعالة</p>
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
                            <p className="text-gray-500 text-sm">الأقسام غير الفعالة</p>
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
                            <p className="text-gray-500 text-sm">إجمالي الأقسام</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Filter className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="search"
                    className="block w-full p-4 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-right"
                    placeholder="ابحث عن قسم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200" dir='rtl'>
                        <thead>
                            <tr className="bg-gray-50">
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    القسم
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    العناصر
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    آخر تحديث
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((section) => (
                                    <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <span className="text-2xl">{section.icon}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{section.name}</div>
                                                    <div className="text-xs text-gray-500">{section.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${section.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {section.status === 'active' ? 'مفعل' : 'غير مفعل'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {section.dataCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {section.lastUpdated ? new Date(section.lastUpdated).toLocaleDateString('ar-EG') : 'غير متوفر'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex gap-2 justify-end">
                                                <Link
                                                    to={`/admin/sections/edit/${section.id}`}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                {showConfirmDelete === section.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDeleteSection(section.id)}
                                                            disabled={isDeleting}
                                                            className="text-white bg-red-500 p-2 rounded-md hover:bg-red-600 transition-colors"
                                                        >
                                                            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowConfirmDelete(null)}
                                                            className="text-gray-500 bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors"
                                                        >
                                                            إلغاء
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowConfirmDelete(section.id)}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full transition-colors"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Search className="w-12 h-12 text-gray-300 mb-4" />
                                            <p className="text-lg mb-2">لا توجد نتائج</p>
                                            <p className="text-sm text-gray-400">جرب تغيير مصطلح البحث</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredSections.length > 0 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6" dir='rtl'>
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                التالي
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    عرض <span className="font-medium">{indexOfFirstItem + 1}</span> إلى <span className="font-medium">
                                        {Math.min(indexOfLastItem, filteredSections.length)}
                                    </span> من <span className="font-medium">{filteredSections.length}</span> نتيجة
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">السابق</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </button>

                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === index + 1
                                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">التالي</span>
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionsManagement; 