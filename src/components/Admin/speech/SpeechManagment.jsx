import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/queries';
import { Plus, Edit2, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';

const SpeechManagement = () => {
    const [speech, setSpeech] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        speech: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // Fetch speech on component mount
    useEffect(() => {
        fetchSpeech();
    }, []);

    const fetchSpeech = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await apiClient.get('/speech', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            // Extract speech from the response object
            let speechData = null;
            if (response.data && response.data.speechs && Array.isArray(response.data.speechs)) {
                // Get the first speech from the speechs array
                if (response.data.speechs.length > 0) {
                    speechData = response.data.speechs[0];
                }
            }

            setSpeech(speechData);
            setError(null);
        } catch (err) {
            // If 404 or no data, it means no speech exists yet
            if (err.response?.status === 404) {
                setSpeech(null);
                setError(null);
            } else {
                setError('فشل في جلب كلمة المدير');
                console.error('Error fetching speech:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const truncateText = (text, maxLength = 200) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({
            speech: ''
        });
        setValidationErrors({});
        setShowModal(true);
    };

    const openEditModal = () => {
        setIsEditing(true);
        setFormData({
            speech: speech?.speech || ''
        });
        setValidationErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            speech: ''
        });
        setValidationErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});
        setError(null);

        try {
            const token = getAuthToken();

            if (isEditing && speech?.id) {
                // Update existing speech
                await apiClient.patch(`/speech/${speech.id}/API`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Create new speech
                await apiClient.post('/speech/API', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
            }

            setSuccess(true);
            closeModal();
            fetchSpeech();

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            if (err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
                setError('يرجى تصحيح الأخطاء في النموذج');
            } else {
                setError('فشل في حفظ كلمة المدير');
            }
            console.error('Error saving speech:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                    <p className="mt-4 text-gray-600">جاري تحميل كلمة المدير...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    {!speech ? (
                        <button
                            onClick={openAddModal}
                            className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة خطبة جديدة
                        </button>
                    ) : (
                        <button
                            onClick={openEditModal}
                            className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md"
                        >
                            <Edit2 className="w-5 h-5" />
                            تعديل كلمة المدير
                        </button>
                    )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800">إدارة كلمة المدير</h1>
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

            {/* Speech Display */}
            {speech ? (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">كلمة المدير الحالية</h2>
                        <button
                            onClick={openEditModal}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-full transition-colors"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="prose max-w-none text-right" dir="rtl">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {speech.speech}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خطبة</h3>
                        <p className="text-gray-500 mb-6">لم يتم إضافة أي خطبة بعد. انقر على الزر أدناه لإضافة خطبة جديدة.</p>
                        <button
                            onClick={openAddModal}
                            className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة خطبة جديدة
                        </button>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {isEditing ? 'تعديل كلمة المدير' : 'إضافة خطبة جديدة'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isEditing ? 'قم بتعديل محتوى كلمة المدير' : 'أضف خطبة جديدة'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Speech Content */}
                                <div className="space-y-2">
                                    <label htmlFor="speech" className="block text-sm font-semibold text-gray-700">
                                        محتوى كلمة المدير *
                                    </label>
                                    <textarea
                                        id="speech"
                                        name="speech"
                                        value={formData.speech}
                                        onChange={(e) => setFormData(prev => ({ ...prev, speech: e.target.value }))}
                                        rows="12"
                                        className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none ${validationErrors.speech ? 'border-red-500' : ''}`}
                                        placeholder="اكتب محتوى كلمة المدير"
                                        required
                                        dir="rtl"
                                    />
                                    {validationErrors.speech && (
                                        <p className="text-sm text-red-600">هذا الحقل مطلوب</p>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100">
                            <div className="flex justify-end space-x-3 space-x-reverse">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!formData.speech?.trim()}
                                >
                                    {isEditing ? 'تحديث كلمة المدير' : 'إضافة كلمة المدير'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeechManagement;