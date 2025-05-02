import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNewsDetailsById, getImageUrl, apiClient } from '../../../api/queries';
import { checkApiUrl } from '../../../hooks/checkApiUrl';
import {
    ArrowLeft,
    Save,
    Upload,
    Trash2,
    X,
    Image,
    Info,
    AlertTriangle,
    CheckCircle,
    Loader2,
    RefreshCcw,
    ToggleRight,
    ToggleLeft,
    EyeOff,
    Eye
} from 'lucide-react';

const NewsEditForm = () => {
    const { newsId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(newsId);

    // Use the useNewsDetails hook to fetch data
    const { data: newsData, isLoading, error: fetchError } = useNewsDetailsById(newsId);

    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        content: '',
        images: [],
        status: 'active'
    });
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [formTouched, setFormTouched] = useState(false);
    const [loadingRetry, setLoadingRetry] = useState(false);
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [apiTestResult, setApiTestResult] = useState(null);
    const [apiTestError, setApiTestError] = useState(null);
    const [apiTesting, setApiTesting] = useState(false);

    // Process the news data when it's loaded
    useEffect(() => {
        if (isEditMode && newsData) {
            console.log('Loaded news data:', newsData);
            setFormData({
                title: newsData.title || '',
                subject: newsData.subject || newsData.object || '',
                content: newsData.content || newsData.object || newsData.subject || '',
                images: newsData.news_images || [],
                status: newsData.status || 'active'
            });
        }
    }, [newsData, isEditMode]);

    // Set error state if fetch fails
    useEffect(() => {
        if (fetchError) {
            setError('فشل في تحميل بيانات الخبر');
        }
    }, [fetchError]);

    // Monitor form changes to prompt before leaving
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (formTouched) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [formTouched]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Upload new images if any
            if (newImages.length > 0) {
                await uploadImages();
            }

            // Delete marked images if any
            if (imagesToDelete.length > 0) {
                await deleteImages();
            }

            // Submit the form data
            if (isEditMode) {
                // Update existing news
                // In a real implementation, use actual API
                // await apiClient.put(`/news/${newsId}`, formData);
                console.log('Updating news:', formData);
            } else {
                // Create new news
                // In a real implementation, use actual API
                // await apiClient.post('/news', formData);
                console.log('Creating news:', formData);
            }

            setSaving(false);
            setSuccess(true);
            setFormTouched(false);

            // Navigate back after success
            setTimeout(() => {
                navigate('/admin/news');
            }, 1500);
        } catch (error) {
            console.error('Error saving news:', error);
            setError('فشل في حفظ الخبر');
            setSaving(false);
        }
    };

    const uploadImages = async () => {
        setUploadingFiles(true);

        try {
            // Simulate progress
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress(i);
                await new Promise(r => setTimeout(r, 100));
            }

            // In a real implementation, upload the files
            // const formData = new FormData();
            // newImages.forEach(file => formData.append('images[]', file));
            // await apiClient.post(`/news/${newsId}/images`, formData);

            // For now, just simulate the upload
            const fakeUploadedImages = newImages.map((file, index) => ({
                id: `new_${Date.now()}_${index}`,
                image: URL.createObjectURL(file),
                news_id: newsId || 'new'
            }));

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...fakeUploadedImages]
            }));

            setNewImages([]);
            setUploadingFiles(false);
            setUploadProgress(0);
        } catch (error) {
            console.error('Error uploading images:', error);
            setError('فشل في رفع الصور');
            setUploadingFiles(false);
        }
    };

    const deleteImages = async () => {
        try {
            // In a real implementation, call API to delete images
            // await apiClient.delete(`/news/images`, { data: { image_ids: imagesToDelete } });

            // For now, just update the local state
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter(img => !imagesToDelete.includes(img.id))
            }));

            setImagesToDelete([]);
        } catch (error) {
            console.error('Error deleting images:', error);
            setError('فشل في حذف الصور');
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        setFormTouched(true);
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const markImageForDeletion = (id) => {
        setImagesToDelete(prev => [...prev, id]);
        setFormTouched(true);
    };

    const undoImageDeletion = (id) => {
        setImagesToDelete(prev => prev.filter(imgId => imgId !== id));
    };

    const openImagePreview = (image) => {
        setSelectedImage(image);
    };

    const handleRetryLoad = () => {
        if (isEditMode) {
            setLoadingRetry(true);
            // No need to refetch manually as useNewsDetails will handle retries
            setTimeout(() => {
                setLoadingRetry(false);
            }, 1000);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormTouched(true);
    };

    const toggleStatus = () => {
        setFormData(prev => ({
            ...prev,
            status: prev.status === 'active' ? 'inactive' : 'active'
        }));
        setFormTouched(true);
    };

    // Helper function to get proper image URL
    const getProperImageUrl = (imagePath) => {
        if (!imagePath) return '';
        return checkApiUrl(getImageUrl(imagePath));
    };

    // Direct API test function
    const testDirectApiCall = async () => {
        if (!newsId) return;

        setApiTesting(true);
        setApiTestResult(null);
        setApiTestError(null);

        try {
            const response = await apiClient.get(`/news/${newsId}/details/API`);
            console.log('Direct API call result:', response.data);
            setApiTestResult(response.data);
        } catch (error) {
            console.error('Direct API call error:', error);
            setApiTestError(error.message || 'Unknown error');
        } finally {
            setApiTesting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto" />
                            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !formData.title) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                            <div className="mt-4 text-red-500 font-medium">{error}</div>
                            <button
                                onClick={handleRetryLoad}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                disabled={loadingRetry}
                            >
                                {loadingRetry ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        جاري إعادة التحميل...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        إعادة المحاولة
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/admin/news')}
                    className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 border border-gray-300 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    العودة إلى قائمة الأخبار
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
                    {isEditMode ? 'تعديل خبر' : 'إضافة خبر جديد'}
                </h1>
            </div>

            {/* Debug Panel */}
            {isEditMode && (
                <div className="max-w-4xl mx-auto mb-4">
                    <button
                        onClick={() => setShowDebugInfo(!showDebugInfo)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                        {showDebugInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showDebugInfo ? 'إخفاء معلومات التصحيح' : 'عرض معلومات التصحيح'}
                    </button>

                    {showDebugInfo && (
                        <div className="bg-gray-100 p-4 rounded-lg mt-2 text-xs overflow-auto max-h-60">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold">API Response:</h3>
                                <button
                                    onClick={testDirectApiCall}
                                    disabled={apiTesting}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    {apiTesting ? 'Loading...' : 'Test Direct API Call'}
                                </button>
                            </div>
                            <pre>{JSON.stringify(newsData, null, 2)}</pre>

                            {apiTestResult && (
                                <>
                                    <h3 className="font-bold mb-2 mt-4">Direct API Test Result:</h3>
                                    <pre className="bg-green-50 p-2">{JSON.stringify(apiTestResult, null, 2)}</pre>
                                </>
                            )}

                            {apiTestError && (
                                <>
                                    <h3 className="font-bold mb-2 mt-4">Direct API Test Error:</h3>
                                    <pre className="bg-red-50 p-2 text-red-500">{apiTestError}</pre>
                                </>
                            )}

                            <h3 className="font-bold mb-2 mt-4">Form Data:</h3>
                            <pre>{JSON.stringify(formData, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                {/* Status Toggle */}
                <div className="mb-6 flex justify-end">
                    <button
                        type="button"
                        onClick={toggleStatus}
                        className={`flex items-center gap-2 text-sm rounded-full px-4 py-2 ${formData.status === 'active'
                            ? 'text-green-800 bg-green-100 hover:bg-green-200'
                            : 'text-red-800 bg-red-100 hover:bg-red-200'
                            }`}
                    >
                        {formData.status === 'active' ? (
                            <>
                                <ToggleRight className="w-5 h-5" />
                                الخبر نشط
                            </>
                        ) : (
                            <>
                                <ToggleLeft className="w-5 h-5" />
                                الخبر غير نشط
                            </>
                        )}
                    </button>
                </div>

                {/* Title */}
                <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        عنوان الخبر <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        dir="rtl"
                    />
                </div>

                {/* Subject */}
                <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        الموضوع <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        dir="rtl"
                    />
                </div>

                {/* Content */}
                <div className="mb-6">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        محتوى الخبر <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        dir="rtl"
                    ></textarea>
                </div>

                {/* Images */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">صور الخبر</label>

                    {/* Existing Images */}
                    {formData.images.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">الصور الحالية</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {formData.images.map((image) => (
                                    <div
                                        key={image.id}
                                        className={`relative group bg-gray-100 rounded-lg overflow-hidden aspect-square ${imagesToDelete.includes(image.id) ? 'opacity-40' : ''
                                            }`}
                                    >
                                        <img
                                            src={typeof image.image === 'string'
                                                ? getProperImageUrl(image.image)
                                                : URL.createObjectURL(image)}
                                            alt="News"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openImagePreview(image)}
                                                    className="p-1 bg-white rounded-full text-blue-600 hover:text-blue-800"
                                                >
                                                    <Image className="w-5 h-5" />
                                                </button>

                                                {imagesToDelete.includes(image.id) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => undoImageDeletion(image.id)}
                                                        className="p-1 bg-white rounded-full text-blue-600 hover:text-blue-800"
                                                    >
                                                        <RefreshCcw className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => markImageForDeletion(image.id)}
                                                        className="p-1 bg-white rounded-full text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Images */}
                    {newImages.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">الصور الجديدة</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {newImages.map((file, index) => (
                                    <div key={index} className="relative group">
                                        <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`New ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-600 hover:text-red-800 shadow-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploadingFiles && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-500">جاري رفع الصور...</span>
                                <span className="text-sm text-gray-500">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex items-center justify-center w-full">
                        <label
                            htmlFor="dropzone-file"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${uploadingFiles ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload
                                    className={`w-10 h-10 mb-3 ${uploadingFiles ? 'text-gray-400' : 'text-gray-500'}`}
                                />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-medium">اضغط لإضافة صور</span> أو قم بسحب الصور هنا
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF (الحد الأقصى: 10 ميجابايت لكل صورة)</p>
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingFiles}
                            />
                        </label>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-red-500 ml-3" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                        <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                            <p className="text-sm text-green-500">
                                {isEditMode ? 'تم تحديث الخبر بنجاح' : 'تم إضافة الخبر بنجاح'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={saving || success}
                        className={`px-6 py-3 rounded-lg text-white flex items-center gap-2 ${saving || success
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
                            }`}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                تم الحفظ
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                حفظ الخبر
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-1 max-w-3xl w-full max-h-[90vh] overflow-hidden">
                        <div className="relative">
                            <img
                                src={typeof selectedImage.image === 'string'
                                    ? getProperImageUrl(selectedImage.image)
                                    : URL.createObjectURL(selectedImage)}
                                alt="Preview"
                                className="w-full max-h-[80vh] object-contain"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-800 hover:text-red-600 shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsEditForm; 