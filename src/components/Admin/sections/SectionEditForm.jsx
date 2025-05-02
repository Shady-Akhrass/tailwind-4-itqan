import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/queries';
import { ArrowLeft, Save, Upload, Trash2, X, Image, Info, FileText, AlertTriangle, CheckCircle, Loader2, RefreshCcw } from 'lucide-react';
import { checkApiUrl } from '../../../hooks/checkApiUrl';

const SectionEditForm = ({ sectionId, sectionName, endpoint }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        about: '',
        images: [],
        status: 'active' // Default to active
    });
    const [loading, setLoading] = useState(true);
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

    // Replace useEffect and fetchSectionData with this approach
    useEffect(() => {
        setLoading(true);
        apiClient.get(endpoint)
            .then(response => {
                // Use the exact same approach as in DiwanSection
                const sectionData = Array.isArray(response.data) ? response.data : [response.data];
                console.log('Raw data from API:', sectionData);

                // Process data based on section type
                if (sectionData && sectionData.length > 0) {
                    const item = sectionData[0];

                    let aboutContent = '';
                    let imagesArray = [];

                    // Extract data based on section type
                    switch (sectionId) {
                        case 'memorization':
                            aboutContent = item.memorizations?.[0]?.about || '';
                            imagesArray = item.memorization_images || [];
                            break;
                        case 'courses':
                            aboutContent = item.courses?.[0]?.about || '';
                            imagesArray = item.course_images || [];
                            break;
                        case 'activities':
                            aboutContent = item.activities?.[0]?.about || '';
                            imagesArray = item.activities_images || [];
                            break;
                        case 'creative':
                            aboutContent = item.creatives?.[0]?.about || '';
                            imagesArray = item.creative_images || [];
                            break;
                        case 'diwan':
                            aboutContent = item.diwans?.[0]?.about || '';
                            imagesArray = item.diwan_images || [];
                            break;
                    }

                    // Set the form data
                    setFormData({
                        about: aboutContent,
                        images: imagesArray,
                        status: 'active' // Default to active as requested
                    });

                    console.log('Processed form data:', {
                        about: aboutContent,
                        imageCount: imagesArray.length,
                        status: 'active'
                    });
                }

                setLoading(false);
            })
            .catch(error => {
                console.error(`There was an error fetching the ${sectionId} content!`, error);
                setError(`فشل في تحميل بيانات ${sectionName}`);
                setLoading(false);
            });
    }, [endpoint, sectionId, sectionName]);

    // Monitor form changes
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
            // First, upload any new images
            if (newImages.length > 0) {
                await uploadImages();
            }

            // Then, delete any marked for deletion
            if (imagesToDelete.length > 0) {
                await deleteImages();
            }

            // Format the data according to the API expectations
            const formattedData = formatDataForSubmission(formData.about);
            console.log('Submitting data:', formattedData);

            // Update the section data
            await apiClient.put(endpoint, formattedData);

            setSaving(false);
            setSuccess(true);
            setFormTouched(false);

            // Show success message briefly before navigating away
            setTimeout(() => {
                navigate('/admin/sections');
            }, 1500);
        } catch (error) {
            console.error('Error updating section:', error);
            setError('فشل في حفظ التغييرات');
            setSaving(false);
        }
    };

    // Format data according to the API's expected structure
    const formatDataForSubmission = (aboutText) => {
        // Different sections may have different data structures
        const formattedData = {};

        switch (sectionId) {
            case 'memorization':
                formattedData.memorization = {
                    about: aboutText,
                    status: formData.status
                };
                break;
            case 'courses':
                formattedData.course = {
                    about: aboutText,
                    status: formData.status
                };
                break;
            case 'activities':
                formattedData.activity = {
                    about: aboutText,
                    status: formData.status
                };
                break;
            case 'creative':
                formattedData.creative = {
                    about: aboutText,
                    status: formData.status
                };
                break;
            case 'diwan':
                formattedData.diwan = {
                    about: aboutText,
                    status: formData.status
                };
                break;
            default:
                // Generic fallback
                formattedData.about = aboutText;
                formattedData.status = formData.status;
        }

        return formattedData;
    };

    const uploadImages = async () => {
        setUploadingFiles(true);

        try {
            // Simulate progress
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress(i);
                await new Promise(r => setTimeout(r, 200));
            }

            // In a real implementation, you would use FormData to upload files
            const formData = new FormData();

            // Add the section ID to identify which section these images belong to
            formData.append('section_id', sectionId);

            // Append each file to the form data
            newImages.forEach(file => {
                formData.append('images[]', file.file);
            });

            // The endpoint would be different based on the section
            const uploadEndpoint = `/admin/${sectionId}/upload-images`;

            // This is a simulated API call
            // await apiClient.post(uploadEndpoint, formData, {
            //     onUploadProgress: (progressEvent) => {
            //         const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            //         setUploadProgress(progress);
            //     }
            // });

            // Simulate new images added to the existing ones
            const fakeNewDbImages = newImages.map(img => ({
                id: img.id,
                image: img.preview, // In reality this would be a path from the server
                section_id: sectionId
            }));

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...fakeNewDbImages]
            }));

            setUploadingFiles(false);
            setUploadProgress(0);
            setNewImages([]);
        } catch (error) {
            setError('فشل في تحميل الصور');
            setUploadingFiles(false);
            throw error;
        }
    };

    const deleteImages = async () => {
        try {
            // In a real implementation, you would call an API to delete the images
            // const deleteEndpoint = `/admin/${sectionId}/delete-images`;
            // await apiClient.post(deleteEndpoint, {
            //    image_ids: imagesToDelete
            // });

            // Update the local state to remove deleted images
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter(img => !imagesToDelete.includes(img.id))
            }));

            setImagesToDelete([]);
        } catch (error) {
            setError('فشل في حذف الصور');
            throw error;
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Preview new images
        const newFileObjects = files.map(file => ({
            id: `new-${Date.now()}-${file.name}`,
            file,
            preview: URL.createObjectURL(file)
        }));

        setNewImages(prev => [...prev, ...newFileObjects]);
        setFormTouched(true);
    };

    const removeNewImage = (id) => {
        setNewImages(prev => prev.filter(img => img.id !== id));
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
        setLoadingRetry(true);
        setError(null);

        // Refetch using the same approach as in useEffect
        apiClient.get(endpoint)
            .then(response => {
                const sectionData = Array.isArray(response.data) ? response.data : [response.data];

                if (sectionData && sectionData.length > 0) {
                    const item = sectionData[0];

                    let aboutContent = '';
                    let imagesArray = [];

                    // Extract data based on section type
                    switch (sectionId) {
                        case 'memorization':
                            aboutContent = item.memorizations?.[0]?.about || '';
                            imagesArray = item.memorization_images || [];
                            break;
                        case 'courses':
                            aboutContent = item.courses?.[0]?.about || '';
                            imagesArray = item.course_images || [];
                            break;
                        case 'activities':
                            aboutContent = item.activities?.[0]?.about || '';
                            imagesArray = item.activities_images || [];
                            break;
                        case 'creative':
                            aboutContent = item.creatives?.[0]?.about || '';
                            imagesArray = item.creative_images || [];
                            break;
                        case 'diwan':
                            aboutContent = item.diwans?.[0]?.about || '';
                            imagesArray = item.diwan_images || [];
                            break;
                    }

                    setFormData({
                        about: aboutContent,
                        images: imagesArray,
                        status: 'active'
                    });
                }

                setLoadingRetry(false);
            })
            .catch(error => {
                console.error(`Error retrying fetch for ${sectionId}:`, error);
                setError(`فشل في إعادة تحميل بيانات ${sectionName}`);
                setLoadingRetry(false);
            });
    };

    if (loading || loadingRetry) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                    <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
                </div>
            </div>
        );
    }

    // Check if data is missing but not due to an error
    const hasNoData = !error && (!formData.about && formData.images.length === 0);

    return (
        <div className="container mx-auto px-4 py-8" dir='rtl'>
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={selectedImage.preview || checkApiUrl(selectedImage.image)}
                            alt="معاينة"
                            className="max-h-[80vh] max-w-full rounded-lg shadow-xl"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x600?text=صورة+غير+متوفرة';
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => {
                            if (formTouched && !window.confirm('هناك تغييرات لم يتم حفظها. هل أنت متأكد من الخروج؟')) {
                                return;
                            }
                            navigate('/admin/sections');
                        }}
                        className="bg-white text-gray-600 hover:text-gray-900 p-2 rounded-full shadow transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">تعديل {sectionName}</h1>
                </div>

                {error && (
                    <div className="bg-red-50 border-r-4 border-red-400 text-red-700 p-4 rounded mb-6 flex items-start">
                        <AlertTriangle className="w-6 h-6 mt-0.5 ml-3 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold">خطأ</p>
                            <p>{error}</p>
                            <button
                                onClick={handleRetryLoad}
                                className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                إعادة تحميل البيانات
                            </button>
                        </div>
                    </div>
                )}

                {hasNoData && !error && (
                    <div className="bg-yellow-50 border-r-4 border-yellow-400 text-yellow-700 p-4 rounded mb-6 flex items-start">
                        <Info className="w-6 h-6 mt-0.5 ml-3 flex-shrink-0" />
                        <div>
                            <p className="font-bold">تنبيه</p>
                            <p>لم يتم العثور على بيانات لهذا القسم. سيتم إنشاء بيانات جديدة عند الحفظ.</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-r-4 border-green-400 text-green-700 p-4 rounded mb-6 flex items-start">
                        <CheckCircle className="w-6 h-6 mt-0.5 ml-3 flex-shrink-0" />
                        <div>
                            <p className="font-bold">تم بنجاح</p>
                            <p>تم حفظ البيانات بنجاح!</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-medium text-gray-800">معلومات القسم</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-8">
                            {/* About section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        وصف القسم
                                    </label>
                                </div>
                                <textarea
                                    value={formData.about}
                                    onChange={(e) => {
                                        setFormData({ ...formData, about: e.target.value });
                                        setFormTouched(true);
                                    }}
                                    className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-right"
                                    placeholder="أدخل وصفاً للقسم..."
                                    required
                                    dir="rtl"
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    يظهر هذا الوصف على صفحة القسم في الموقع
                                </p>
                            </div>

                            {/* Status section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-gray-500" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        حالة القسم
                                    </label>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center">
                                        <input
                                            id="status-active"
                                            type="radio"
                                            name="status"
                                            value="active"
                                            checked={formData.status === 'active'}
                                            onChange={() => {
                                                setFormData({ ...formData, status: 'active' });
                                                setFormTouched(true);
                                            }}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                        />
                                        <label htmlFor="status-active" className="mr-2 block text-sm font-medium text-gray-700">
                                            مفعل
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="status-inactive"
                                            type="radio"
                                            name="status"
                                            value="inactive"
                                            checked={formData.status === 'inactive'}
                                            onChange={() => {
                                                setFormData({ ...formData, status: 'inactive' });
                                                setFormTouched(true);
                                            }}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                        <label htmlFor="status-inactive" className="mr-2 block text-sm font-medium text-gray-700">
                                            غير مفعل
                                        </label>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    يحدد ما إذا كان القسم مرئياً للزوار أم لا
                                </p>
                            </div>

                            {/* Images section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Image className="w-5 h-5 text-gray-500" />
                                        <label className="block text-sm font-medium text-gray-700">
                                            صور القسم
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {formData.images.length > 0 ?
                                            <>عدد الصور الحالية: <span className="font-medium">{formData.images.length}</span></> :
                                            'لا توجد صور حالياً'
                                        }
                                    </p>
                                </div>

                                {/* Image gallery */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                    {/* Existing images */}
                                    {formData.images.length > 0 ? formData.images.map((image) => (
                                        <div
                                            key={image.id}
                                            className={`relative group rounded-lg overflow-hidden border-2 ${imagesToDelete.includes(image.id)
                                                ? 'border-red-300 opacity-50'
                                                : 'border-gray-200 hover:border-green-300'
                                                } transition-all`}
                                        >
                                            <img
                                                src={typeof image.image === 'string' && image.image.startsWith('http')
                                                    ? image.image
                                                    : checkApiUrl(`https://api.ditq.org/storage/${image.image}`)}
                                                alt={`صورة ${image.id}`}
                                                className={`w-full h-36 object-cover cursor-pointer transition-transform ${!imagesToDelete.includes(image.id) && 'group-hover:scale-105'
                                                    }`}
                                                onClick={() => !imagesToDelete.includes(image.id) && openImagePreview(image)}
                                                onError={(e) => {
                                                    console.warn(`Failed to load image: ${image.image}`);
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=صورة+غير+متوفرة';
                                                }}
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {imagesToDelete.includes(image.id) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => undoImageDeletion(image.id)}
                                                        className="bg-white text-green-600 p-2 rounded-full hover:bg-green-50"
                                                    >
                                                        <CheckCircle className="w-6 h-6" />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => openImagePreview(image)}
                                                            className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 mr-2"
                                                        >
                                                            <Image className="w-6 h-6" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => markImageForDeletion(image.id)}
                                                            className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-6 h-6" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {imagesToDelete.includes(image.id) && (
                                                <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                                                    سيتم الحذف
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="col-span-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-200">
                                            <Image className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-gray-500 mb-1">لا توجد صور حالية لهذا القسم</p>
                                            <p className="text-sm text-gray-400">استخدم زر "تحميل الصور" لإضافة صور جديدة</p>
                                        </div>
                                    )}

                                    {/* New images */}
                                    {newImages.map((newImage) => (
                                        <div key={newImage.id} className="relative group rounded-lg overflow-hidden border-2 border-green-300">
                                            <img
                                                src={newImage.preview}
                                                alt="صورة جديدة"
                                                className="w-full h-36 object-cover cursor-pointer transition-transform group-hover:scale-105"
                                                onClick={() => openImagePreview(newImage)}
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => openImagePreview(newImage)}
                                                    className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 mr-2"
                                                >
                                                    <Image className="w-6 h-6" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(newImage.id)}
                                                    className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-6 h-6" />
                                                </button>
                                            </div>

                                            <div className="absolute top-2 right-2 bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
                                                جديد
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Upload area */}
                                <div className="relative">
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">انقر للتحميل</span> أو اسحب وأفلت
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF (الحد الأقصى: 5 ميجابايت لكل صورة)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingFiles}
                                        />
                                    </label>

                                    {uploadingFiles && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 rounded-lg">
                                            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-2" />
                                            <p className="text-sm font-medium text-gray-700">جاري تحميل الصور... {uploadProgress}%</p>
                                            <div className="w-64 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        {formData.images.length - imagesToDelete.length + newImages.length} صورة في المعرض
                                    </div>
                                    {imagesToDelete.length > 0 && (
                                        <div className="text-sm text-red-500">
                                            سيتم حذف {imagesToDelete.length} صورة
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/sections')}
                                className="bg-gray-100 text-gray-800 ml-4 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={saving}
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={saving || success}
                                className={`px-6 py-3 rounded-lg flex items-center gap-2 ${formTouched
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    } transition-colors`}
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
                                        حفظ التغييرات
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SectionEditForm; 