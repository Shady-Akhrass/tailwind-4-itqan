import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useNewsDetailsById, getImageUrl, apiClient } from '../../../api/queries';
import { checkApiUrl } from '../../../hooks/checkApiUrl';
import {
    ArrowLeft,
    Save,
    AlertTriangle,
    CheckCircle,
    Loader2,
    RefreshCcw,
    ToggleRight,
    ToggleLeft,
    EyeOff,
    Eye,
    Lightbulb,
    Sparkles
} from 'lucide-react';
import AISuggestionModal from './AISuggestionModal';

const NewsEditForm = () => {
    const { newsId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = Boolean(newsId);

    // Use the useNewsDetails hook to fetch data
    const { data: newsData, isLoading, error: fetchError } = useNewsDetailsById(newsId);

    const [formData, setFormData] = useState({
        title: '',
        object: '',
        status: 'active'
    });
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loadingRetry, setLoadingRetry] = useState(false);
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [apiTestResult, setApiTestResult] = useState(null);
    const [apiTestError, setApiTestError] = useState(null);
    const [apiTesting, setApiTesting] = useState(false);
    const [mainImage, setMainImage] = useState(null); // For new main image file
    const [subImage, setSubImage] = useState(null); // For new sub image file
    const [formTouched, setFormTouched] = useState(false);

    // New state for AI Suggestion Modal
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiModalAction, setAiModalAction] = useState('');

    const fileInputMainImageRef = useRef(null); // Ref for main image input
    const fileInputSubImageRef = useRef(null); // Ref for sub image input

    // Process the news data when it's loaded
    useEffect(() => {
        if (isEditMode && newsData) {
            setFormData({
                title: newsData.title || '',
                object: newsData.object || '',
                status: newsData.status || 'active'
            });
            setMainImage(null); // Reset main image file on load
            setSubImage(null); // Reset sub image file on load
        }
    }, [newsData, isEditMode]);

    // Effect to handle updates coming back from AI suggestion page
    useEffect(() => {
        if (location.state?.selectedValue && location.state?.updatedField) {
            const { selectedValue, updatedField } = location.state;
            setFormData(prev => ({
                ...prev,
                [updatedField]: selectedValue
            }));
            setFormTouched(true);
            // Clear the state to prevent re-applying on refresh or other navigations
            navigate(location.pathname, { state: {}, replace: true });
        }
    }, [location.state, navigate, location.pathname]);

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

        // Validate required fields
        if (!formData.title?.trim()) {
            setError('حقل العنوان مطلوب');
            return;
        }

        if (!formData.object?.trim()) {
            setError('حقل المحتوى مطلوب');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // Get the token from localStorage or wherever it's stored
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            // Choose the appropriate endpoint based on whether we're creating or updating
            const endpoint = isEditMode ? `news/update/${newsId}/API` : 'news/store/API';

            // For PATCH requests with FormData in Axios, we need to be careful with the implementation
            // Let's try a different approach for PATCH specifically

            if (isEditMode) {
                // PATCH request handling
                // Prepare form data for submission
                const formDataToSubmit = new FormData();

                // Make sure to include the _method field for Laravel to recognize it as PATCH
                formDataToSubmit.append('_method', 'PATCH');

                // Add required fields
                formDataToSubmit.append('title', formData.title.trim());
                formDataToSubmit.append('object', formData.object.trim());
                formDataToSubmit.append('status', formData.status);

                // Add main image if changed
                if (mainImage) {
                    formDataToSubmit.append('image', mainImage);
                }

                // Add sub image if changed
                if (subImage) {
                    formDataToSubmit.append('subphotos1', subImage);
                }

                // Debug what's being sent
                console.log('Sending form data:');
                for (let [key, value] of formDataToSubmit.entries()) {
                    console.log(`${key}: ${value instanceof File ? value.name : value}`);
                }

                // Use POST method with _method field for Laravel
                const response = await apiClient({
                    method: 'post',
                    url: endpoint,
                    data: formDataToSubmit,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                        'X-HTTP-Method-Override': 'PATCH'
                    }
                });

                console.log('Server response:', response.data);

                setSaving(false);
                setSuccess(true);
                setFormTouched(false);

                // Navigate back after success
                setTimeout(() => {
                    navigate('/admin/news');
                }, 1500);
            } else {
                // For POST requests (create), use the original approach
                const formDataToSubmit = new FormData();
                formDataToSubmit.append('title', formData.title.trim());
                formDataToSubmit.append('object', formData.object.trim());
                formDataToSubmit.append('status', formData.status);

                // Add main image if provided
                if (mainImage) {
                    formDataToSubmit.append('image', mainImage);
                }

                // Add sub image if provided
                if (subImage) {
                    formDataToSubmit.append('subphotos1', subImage);
                }

                // Submit the form data with authorization header
                const response = await apiClient({
                    method: 'post',
                    url: endpoint,
                    data: formDataToSubmit,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Server response:', response.data);

                setSaving(false);
                setSuccess(true);
                setFormTouched(false);

                // Navigate back after success
                setTimeout(() => {
                    navigate('/admin/news');
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving news:', error);
            if (error.response?.data?.errors) {
                // Handle Laravel validation errors
                const errorMessages = Object.values(error.response.data.errors)
                    .flat()
                    .map(msg => msg.replace('The ', '').replace(' field', ''))
                    .join(', ');
                setError(errorMessages);
            } else if (error.response?.data?.message) {
                // Handle custom error message from the API
                setError(error.response.data.message);
            } else if (!error.response) {
                // Handle network/connection errors
                setError('فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك والمحاولة مرة أخرى');
            } else {
                // Handle generic error
                setError('فشل في حفظ الخبر. يرجى المحاولة مرة أخرى');
            }
            setSaving(false);
        }
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

    // Handle main image change
    const handleMainImageClick = () => {
        if (fileInputMainImageRef.current) fileInputMainImageRef.current.click();
    };

    const handleSubImageClick = () => {
        if (fileInputSubImageRef.current) fileInputSubImageRef.current.click();
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            setFormTouched(true);
        }
    };

    const handleSubImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSubImage(file);
            setFormTouched(true);
        }
    };

    // Helper function to get proper image URL
    const getProperImageUrl = (imagePath) => {
        if (!imagePath) return '';
        return checkApiUrl(getImageUrl(imagePath));
    };

    // Helper function to get main image preview
    const getMainImagePreview = () => {
        if (mainImage) return URL.createObjectURL(mainImage);
        if (newsData && newsData.image) return getProperImageUrl(newsData.image);
        return '/logo.png';
    };

    const getSubImagePreview = () => {
        if (subImage) return URL.createObjectURL(subImage);
        if (newsData && newsData.subphotos1) return getProperImageUrl(newsData.subphotos1);
        return '/logo.png';
    };

    // Direct API test function
    const testDirectApiCall = async () => {
        if (!newsId) return;

        setApiTesting(true);
        setApiTestResult(null);
        setApiTestError(null);

        try {
            // Get token from storage
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            const response = await apiClient.get(`/news/${newsId}/details/API`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Direct API call result:', response.data);
            setApiTestResult(response.data);
        } catch (error) {
            console.error('Direct API call error:', error);
            setApiTestError(error.message || 'Unknown error');
        } finally {
            setApiTesting(false);
        }
    };    // Function to open AI suggestion modal
    const goToAISuggestions = (actionType) => {
        setAiModalAction(actionType);
        setAiModalOpen(true);
    };

    // Handle AI suggestion selection
    const handleAiSuggestionSelect = (selectedValue) => {
        if (aiModalAction === 'suggestTitle') {
            setFormData(prev => ({
                ...prev,
                title: selectedValue
            }));
        } else if (aiModalAction === 'enhanceContent') {
            setFormData(prev => ({
                ...prev,
                object: selectedValue
            }));
        }
        setFormTouched(true);
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

    if (error && !formData.title && !location.state?.selectedValue) {
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

                            <h3 className="font-bold mb-2 mt-4">Images:</h3>
                            <pre>Main Image: {mainImage ? mainImage.name : 'None'}</pre>
                            <pre>Sub Image: {subImage ? subImage.name : 'None'}</pre>
                        </div>
                    )}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                {/* Main Image Preview & Change */}
                <div className="mb-6 flex flex-row items-start justify-center gap-6">
                    {/* Main Image */}
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الرئيسية</label>
                        <div className="relative group w-48 h-48 mb-2">
                            <img
                                src={getMainImagePreview()}
                                alt="Main Preview"
                                className="w-48 h-48 object-cover rounded-lg border border-gray-300 cursor-pointer"
                                onClick={handleMainImageClick}
                                title="اضغط لتغيير الصورة الرئيسية"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputMainImageRef}
                                style={{ display: 'none' }}
                                onChange={handleMainImageChange}
                            />
                            <span className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-700 group-hover:bg-green-100">
                                تغيير الصورة
                            </span>
                        </div>
                        {mainImage && <div className="text-xs text-green-600">تم اختيار صورة جديدة</div>}
                    </div>

                    {/* Sub Image */}
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الفرعية</label>
                        <div className="relative group w-48 h-48 mb-2">
                            <img
                                src={getSubImagePreview()}
                                alt="Sub Preview"
                                className="w-48 h-48 object-cover rounded-lg border border-gray-300 cursor-pointer"
                                onClick={handleSubImageClick}
                                title="اضغط لتغيير الصورة الفرعية"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputSubImageRef}
                                style={{ display: 'none' }}
                                onChange={handleSubImageChange}
                            />
                            <span className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-700 group-hover:bg-green-100">
                                تغيير الصورة
                            </span>
                        </div>
                        {subImage && <div className="text-xs text-green-600">تم اختيار صورة جديدة</div>}
                    </div>
                </div>

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
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            عنوان الخبر <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => goToAISuggestions('suggestTitle')}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            title="اقترح عنوانًا باستخدام الذكاء الاصطناعي (بناءً على المحتوى)"
                        >
                            <Lightbulb className="w-4 h-4" />
                            اقترح عنوان
                        </button>
                    </div>
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

                {/* Object - Content field */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="object" className="block text-sm font-medium text-gray-700">
                            محتوى الخبر <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => goToAISuggestions('enhanceContent')}
                            className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                            title="تحسين المحتوى باستخدام الذكاء الاصطناعي"
                        >
                            <Sparkles className="w-4 h-4" />
                            تحسين المحتوى
                        </button>
                    </div>
                    <textarea
                        id="object"
                        name="object"
                        value={formData.object}
                        onChange={handleInputChange}
                        rows={12}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        dir="rtl"
                    ></textarea>
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
                </div>            </form>

            {/* AI Suggestion Modal */}
            <AISuggestionModal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                initialContent={formData.object}
                initialTitle={formData.title}
                action={aiModalAction}
                onSelect={handleAiSuggestionSelect}
                mainImage={mainImage}
                subImage={subImage}
            />
        </div>
    );
};

export default NewsEditForm;