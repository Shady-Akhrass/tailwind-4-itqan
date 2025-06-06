import React, { useState, useEffect } from 'react';
import { X, Save, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../../../api/queries';

const AddEditModal = ({ showModal, handleCloseModal, modalMode, selectedDirector, directors, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        parent_id: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // API configuration
    const API_BASE = '/directors';
    const getFormHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
    });

    // Initialize form data when modal opens or selectedDirector changes
    useEffect(() => {
        if (modalMode === 'edit' && selectedDirector) {
            setFormData({
                name: selectedDirector.name || '',
                position: selectedDirector.position || '',
                parent_id: selectedDirector.parent_id || '',
                image: null
            });
            // Set initial image preview if director has an image
            if (selectedDirector.image) {
                setImagePreview(selectedDirector.image);
            } else {
                setImagePreview(null);
            }
        } else {
            // Reset form data for create mode
            setFormData({
                name: '',
                position: '',
                parent_id: '',
                image: null
            });
            setImagePreview(null);
        }
        // Clear any previous errors when modal opens
        setErrors({});
    }, [modalMode, selectedDirector, showModal]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('position', formData.position);
        if (formData.parent_id) {
            formDataObj.append('parent_id', formData.parent_id);
        }
        if (formData.image) {
            formDataObj.append('image', formData.image);
        }

        try {
            const url = modalMode === 'create' ? API_BASE : `${API_BASE}/${selectedDirector.id}`;

            if (modalMode === 'edit') {
                formDataObj.append('_method', 'PATCH');
            }

            const response = await apiClient.post(url, formDataObj, {
                headers: getFormHeaders()
            });

            if (response.data.success) {
                onSuccess();
                handleCloseModal();
            } else {
                if (response.data.errors) {
                    setErrors(response.data.errors);
                }
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {modalMode === 'create' ? 'إضافة مدير جديد' : 'تعديل بيانات المدير'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {modalMode === 'create' ? 'أضف مديراً جديداً إلى الهيكل التنظيمي' : 'قم بتعديل بيانات المدير'}
                            </p>
                        </div>
                        <button
                            onClick={handleCloseModal}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                            disabled={loading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            الاسم <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                            required
                            dir="rtl"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.name[0]}
                            </p>
                        )}
                    </div>

                    {/* Position Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            المنصب <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${errors.position ? 'border-red-500' : 'border-gray-200'}`}
                            required
                            dir="rtl"
                        />
                        {errors.position && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.position[0]}
                            </p>
                        )}
                    </div>

                    {/* Parent Director Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            المدير المباشر
                        </label>
                        <select
                            name="parent_id"
                            value={formData.parent_id}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${errors.parent_id ? 'border-red-500' : 'border-gray-200'}`}
                            dir="rtl"
                        >
                            <option value="">-- اختر المدير المباشر (مستوى رئيسي) --</option>
                            {directors
                                .filter(d => modalMode === 'create' || d.id !== selectedDirector?.id)
                                .map(director => (
                                    <option key={director.id} value={director.id}>
                                        {director.name} - {director.position}
                                    </option>
                                ))}
                        </select>
                        {errors.parent_id && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.parent_id[0]}
                            </p>
                        )}
                    </div>

                    {/* Image Upload Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            الصورة الشخصية {modalMode === 'edit' && '(اختياري)'}
                        </label>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mb-4 relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setFormData(prev => ({ ...prev, image: null }));
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${imagePreview ? 'border-gray-200' : 'border-dashed border-gray-200'} rounded-xl hover:border-green-500 transition-colors duration-200`}>
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                                        <ImageIcon className="w-5 h-5" />
                                        <span>تم اختيار صورة</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                                            >
                                                <span>تحميل صورة</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={handleImageSelect}
                                                />
                                            </label>
                                            <p className="pr-1">أو اسحب وأفلت</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF حتى 10MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        {errors.image && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.image[0]}
                            </p>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                            <Save className="w-5 h-5" />
                            <span>{loading ? 'جاري الحفظ...' : 'حفظ'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditModal; 