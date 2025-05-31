import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/queries';
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, CheckCircle, Search, ChevronLeft, ChevronRight, Filter, ToggleLeft, ToggleRight } from 'lucide-react';
import DonateForm from './DonateForm';
import DeleteConfirmModal from './DeleteConfirmModal';

const DonateManagement = () => {
    const [donates, setDonates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        title: '',
        details: '',
        date: '',
        image: null,
        status: 'active'
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // Calculate stats
    const stats = {
        active: donates.filter(d => d.status === 'active').length,
        inactive: donates.filter(d => d.status === 'inactive').length,
        total: donates.length
    };

    // Fetch donates on component mount
    useEffect(() => {
        fetchDonates();
    }, []);

    const fetchDonates = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await apiClient.get('/donate/API', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            setDonates(response.data);
            setError(null);
        } catch (err) {
            setError('فشل في جلب التبرعات');
            console.error('Error fetching donates:', err);
        } finally {
            setLoading(false);
        }
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({
            title: '',
            details: '',
            date: '',
            image: null,
            status: 'active'
        });
        setValidationErrors({});
        setShowModal(true);
    };

    const openEditModal = (donate) => {
        setIsEditing(true);
        setCurrentId(donate.id);
        setFormData({
            title: donate.title,
            details: donate.details,
            date: donate.date,
            image: donate.image,
            status: donate.status
        });
        setValidationErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            title: '',
            details: '',
            date: '',
            image: null,
            status: 'active'
        });
        setValidationErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});
        setError(null);

        try {
            const token = getAuthToken();
            const formDataToSend = new FormData();

            // Add all form fields to FormData
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // For PATCH requests (editing), explicitly add _method=PATCH
            if (isEditing) {
                formDataToSend.append('_method', 'PATCH');
            }

            if (isEditing) {
                // Use POST method with _method=PATCH for reliable FormData handling on backend
                await apiClient.post(`/donate/${currentId}/API`, formDataToSend, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // For new donations (POST), ensure status is 'active' and send directly
                formDataToSend.set('status', 'active');
                await apiClient.post('/donate/API', formDataToSend, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            setSuccess(true);
            closeModal();
            fetchDonates();

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            if (err.response?.data?.errors) {
                // Handle validation errors
                setValidationErrors(err.response.data.errors);
                setError('يرجى تصحيح الأخطاء في النموذج');
            } else {
                setError('فشل في حفظ التبرع');
            }
            console.error('Error saving donate:', err);
            throw err; // Re-throw to let the form component handle loading state
        }
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const token = getAuthToken();
            await apiClient.delete(`/donate/${deletingId}/API`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            fetchDonates();
            setSuccess(true);
            setShowDeleteModal(false);
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError('فشل في حذف التبرع');
            console.error('Error deleting donate:', err);
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
        setDeletingId(null);
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            const token = getAuthToken();
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            await apiClient.patch(`/donate/status/${id}/API`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state
            setDonates(prevDonates =>
                prevDonates.map(donate =>
                    donate.id === id
                        ? { ...donate, status: newStatus }
                        : donate
                )
            );

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError('فشل في تحديث حالة التبرع');
            console.error('Error updating status:', err);
        }
    };

    // Filter donates based on search term
    const filteredDonates = donates.filter(donate =>
        donate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donate.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDonates.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDonates.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                    <p className="mt-4 text-gray-600">جاري تحميل التبرعات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={openAddModal}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    إضافة تبرع جديد
                </button>
                <h1 className="text-3xl font-bold text-gray-800">إدارة التبرعات</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">التبرعات النشطة</p>
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
                            <p className="text-gray-500 text-sm">التبرعات غير النشطة</p>
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
                            <p className="text-gray-500 text-sm">إجمالي التبرعات</p>
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
                    type="text"
                    className="block w-full p-4 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
                    placeholder="بحث عن التبرعات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Error message */}
            {error && (
                <div className="p-4 mb-4 bg-red-50 rounded-lg">
                    <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-500 ml-2" />
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="p-4 mb-4 bg-green-50 rounded-lg">
                    <div className="flex">
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                        <p className="text-sm text-green-500">تمت العملية بنجاح</p>
                    </div>
                </div>
            )}

            {/* Donations Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">العنوان</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">التفاصيل</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">التاريخ</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">الصورة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">الحالة</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((donate) => (
                            <tr key={donate.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 text-right">{donate.title}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-md text-right">
                                        <p className="text-sm text-gray-900">{truncateText(donate.details)}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 text-right">{donate.date}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {donate.image && (
                                        <div className="relative group flex justify-end">
                                            <img
                                                src={`https://api.ditq.org/storage/${donate.image}`}
                                                alt={donate.title}
                                                className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded"></div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleStatusToggle(donate.id, donate.status)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${donate.status === 'active'
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                        >
                                            {donate.status === 'active' ? (
                                                <>
                                                    <ToggleRight className="w-4 h-4" />
                                                    نشط
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft className="w-4 h-4" />
                                                    غير نشط
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2 justify-end">
                                        <button
                                            onClick={() => openEditModal(donate)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(donate.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

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
            </div>

            {/* Form Modal */}
            <DonateForm
                isOpen={showModal}
                onClose={closeModal}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                isEditing={isEditing}
                validationErrors={validationErrors}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={handleDeleteModalClose}
                onConfirm={handleDeleteConfirm}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default DonateManagement; 