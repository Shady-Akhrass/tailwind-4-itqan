import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Upload, AlertCircle } from 'lucide-react';

const DonateForm = ({ isOpen, onClose, onSubmit, formData, setFormData, isEditing, validationErrors }) => {
    const [loading, setLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Update image preview when formData or isEditing changes
    useEffect(() => {
        if (isOpen) { // Only update when modal is open
            if (isEditing && formData.image && typeof formData.image === 'string') {
                // Editing existing donation with an image
                setImagePreview({
                    url: `https://api.ditq.org/storage/${formData.image}`,
                    isExisting: true
                });
            } else if (formData.image instanceof File) {
                // Adding new donation or selected a new image while editing
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview({
                        url: e.target.result,
                        file: formData.image,
                        isExisting: false
                    });
                };
                reader.readAsDataURL(formData.image);
            } else {
                // No image (adding new or removed existing while editing)
                setImagePreview(null);
            }
        }
    }, [isOpen, isEditing, formData.image]); // Depend on isOpen, isEditing, and formData.image

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageChange({ target: { files: [file] } });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Set the file in form data immediately
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            // The useEffect will handle setting the imagePreview for display
        } else {
            // If file selection is cancelled
            // If editing and there was an existing image, revert to it
            if (isEditing && typeof formData.image === 'string') {
                // Do nothing, keep the existing image in formData
            } else {
                // Otherwise, set image to null
                setFormData(prev => ({
                    ...prev,
                    image: null
                }));
            }
            // useEffect will handle updating imagePreview
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        // useEffect will set imagePreview to null
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(e);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setImagePreview(null); // Clear preview on close
        setFormData({ // Reset form data
            title: '',
            details: '',
            date: '',
            image: null,
            status: 'active'
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {isEditing ? 'تعديل التبرع' : 'إضافة تبرع جديد'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {isEditing ? 'قم بتعديل بيانات التبرع' : 'أضف تبرعاً جديداً'}
                            </p>
                        </div>
                        <button
                            onClick={closeModal}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                            disabled={loading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-red-800 font-medium">خطأ في النموذج</p>
                                <p className="text-red-600 text-sm mt-1">يرجى تصحيح الأخطاء في النموذج</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                                العنوان *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.title ? 'border-red-500' : ''
                                    }`}
                                placeholder="أدخل عنوان التبرع"
                                required
                                disabled={loading}
                                dir="rtl"
                            />
                            {validationErrors.title && (
                                <p className="text-sm text-red-600">هذا الحقل مطلوب</p>
                            )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                            <label htmlFor="details" className="block text-sm font-semibold text-gray-700">
                                التفاصيل *
                            </label>
                            <textarea
                                id="details"
                                name="details"
                                value={formData.details}
                                onChange={handleInputChange}
                                rows="4"
                                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none ${validationErrors.details ? 'border-red-500' : ''
                                    }`}
                                placeholder="اكتب تفاصيل التبرع"
                                required
                                disabled={loading}
                                dir="rtl"
                            />
                            {validationErrors.details && (
                                <p className="text-sm text-red-600">هذا الحقل مطلوب</p>
                            )}
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                                التاريخ *
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${validationErrors.date ? 'border-red-500' : ''
                                    }`}
                                required
                                disabled={loading}
                            />
                            {validationErrors.date && (
                                <p className="text-sm text-red-600">هذا الحقل مطلوب</p>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                الصورة {isEditing ? '(اختياري)' : '*'}
                            </label>

                            {!imagePreview ? (
                                // Upload area when no image is selected
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragOver
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="grid grid-cols-[auto_1fr] items-center gap-6">
                                        <div className="p-4 bg-gray-100 rounded-full">
                                            <Upload className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-medium text-gray-900">
                                                اسحب الصورة هنا أو انقر للاختيار
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                PNG, JPG, JPEG (الحد الأقصى: 2 ميجابايت)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Image preview when an image is selected (new or existing)
                                <div className="relative group aspect-video max-w-md">
                                    <img
                                        src={imagePreview.url}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    />
                                    {/* Overlay and Remove Button */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                            disabled={loading}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {/* Upload icon overlay - only visible on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                        <div className="bg-white text-gray-700 p-3 rounded-full shadow-md ">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                disabled={loading}
                                // Key prop to reset input when image is removed
                                key={formData.image || 'no-image'}
                            />

                            {validationErrors.image && (
                                <p className="text-sm text-red-600">خطأ في الصورة</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <input
                                type="checkbox"
                                id="status"
                                name="status"
                                checked={formData.status === 'active'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    status: e.target.checked ? 'active' : 'inactive'
                                }))}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                disabled={loading}
                            />
                            <label htmlFor="status" className="text-sm font-medium text-gray-700">
                                نشط
                            </label>
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
                            disabled={loading}
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !formData.title?.trim() || !formData.details?.trim() || !formData.date}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4 ml-2" />
                                    {isEditing ? 'جارِ التحديث...' : 'جارِ الإضافة...'}
                                </>
                            ) : (
                                <>
                                    {isEditing ? 'تحديث التبرع' : 'إضافة التبرع'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonateForm; 