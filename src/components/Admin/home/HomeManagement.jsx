import React, { useState, useEffect } from 'react';
import { useHomeData, apiClient } from '../../../api/queries';
import { ArrowLeft, Save, Upload, Trash2, X, Image, Info, AlertTriangle, CheckCircle, Loader2, RefreshCcw } from 'lucide-react';
import { checkApiUrl } from '../../../hooks/checkApiUrl';

const HomeManagement = () => {
    const { data: homeData, isLoading, error: fetchError } = useHomeData();
    const [formData, setFormData] = useState({
        vision: '',
        mission: '',
        sliderImages: [],
        youtubeMain: '',
        youtubeSecondary1: '',
        youtubeSecondary2: '',
        soundCloudUrl: '',
        status: 'active'
    });

    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [newImages, setNewImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [formTouched, setFormTouched] = useState(false);
    const [loadingRetry, setLoadingRetry] = useState(false);

    // Process home data when it's loaded
    useEffect(() => {
        if (homeData?.homes?.[0]) {
            const home = homeData.homes[0];
            setFormData({
                vision: home.vision || '',
                mission: home.mission || '',
                sliderImages: home.images || [],
                youtubeMain: home.youtubes?.[0]?.main || '',
                youtubeSecondary1: home.youtubes?.[0]?.secondary1 || '',
                youtubeSecondary2: home.youtubes?.[0]?.secondary2 || '',
                soundCloudUrl: home.sound?.[0]?.main || '',
                status: 'active'
            });
        }
    }, [homeData]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormTouched(true);
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        setFormTouched(true);
    };

    // Remove new image
    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    // Mark image for deletion
    const markImageForDeletion = (id) => {
        setImagesToDelete(prev => [...prev, id]);
        setFormTouched(true);
    };

    // Undo image deletion
    const undoImageDeletion = (id) => {
        setImagesToDelete(prev => prev.filter(imgId => imgId !== id));
    };

    // Upload images
    const uploadImages = async () => {
        setUploadingFiles(true);
        try {
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress(i);
                await new Promise(r => setTimeout(r, 100));
            }

            const fakeUploadedImages = newImages.map((file, index) => ({
                id: `new_${Date.now()}_${index}`,
                image: URL.createObjectURL(file),
                type: 'slider'
            }));

            setFormData(prev => ({
                ...prev,
                sliderImages: [...prev.sliderImages, ...fakeUploadedImages]
            }));

            setNewImages([]);
        } catch (error) {
            console.error('Error uploading images:', error);
            setError('فشل في رفع الصور');
        } finally {
            setUploadingFiles(false);
            setUploadProgress(0);
        }
    };

    // Delete marked images
    const deleteImages = async () => {
        try {
            setFormData(prev => ({
                ...prev,
                sliderImages: prev.sliderImages.filter(img => !imagesToDelete.includes(img.id))
            }));
            setImagesToDelete([]);
        } catch (error) {
            console.error('Error deleting images:', error);
            setError('فشل في حذف الصور');
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (newImages.length > 0) {
                await uploadImages();
            }

            if (imagesToDelete.length > 0) {
                await deleteImages();
            }

            // Here you would make the API call to save the data
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            setSaving(false);
            setSuccess(true);
            setFormTouched(false);

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error saving home data:', error);
            setError('فشل في حفظ البيانات');
            setSaving(false);
        }
    };

    if (isLoading || loadingRetry) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                    <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة الصفحة الرئيسية</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vision & Mission Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                رؤيتنا
                            </label>
                            <textarea
                                name="vision"
                                value={formData.vision}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                dir="rtl"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                رسالتنا
                            </label>
                            <textarea
                                name="mission"
                                value={formData.mission}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                dir="rtl"
                            ></textarea>
                        </div>
                    </div>

                    {/* YouTube Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">المكتبة المرئية</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الفيديو الرئيسي
                            </label>
                            <input
                                type="text"
                                name="youtubeMain"
                                value={formData.youtubeMain}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="رابط الفيديو على يوتيوب"
                                dir="ltr"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    الفيديو الفرعي الأول
                                </label>
                                <input
                                    type="text"
                                    name="youtubeSecondary1"
                                    value={formData.youtubeSecondary1}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="رابط الفيديو على يوتيوب"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    الفيديو الفرعي الثاني
                                </label>
                                <input
                                    type="text"
                                    name="youtubeSecondary2"
                                    value={formData.youtubeSecondary2}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="رابط الفيديو على يوتيوب"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sound Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">المكتبة الصوتية</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                رابط SoundCloud
                            </label>
                            <input
                                type="text"
                                name="soundCloudUrl"
                                value={formData.soundCloudUrl}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="رابط المقطع الصوتي على SoundCloud"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Slider Images Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">صور العرض</h2>

                        {/* Current Images */}
                        {formData.sliderImages.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">الصور الحالية</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {formData.sliderImages.map((image) => (
                                        <div
                                            key={image.id}
                                            className={`relative group rounded-lg overflow-hidden border-2 ${imagesToDelete.includes(image.id)
                                                    ? 'border-red-300 opacity-50'
                                                    : 'border-gray-200 hover:border-green-300'
                                                } transition-all`}
                                        >
                                            <img
                                                src={typeof image.image === 'string'
                                                    ? checkApiUrl(image.image)
                                                    : URL.createObjectURL(image)}
                                                alt="Slider"
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                {imagesToDelete.includes(image.id) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => undoImageDeletion(image.id)}
                                                        className="p-1 bg-white rounded-full text-green-600 hover:text-green-800"
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
                                            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
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
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${uploadingFiles
                                        ? 'border-gray-300 bg-gray-50'
                                        : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload
                                        className={`w-10 h-10 mb-3 ${uploadingFiles ? 'text-gray-400' : 'text-gray-500'
                                            }`}
                                    />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-medium">اضغط لإضافة صور</span> أو قم بسحب الصور هنا
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF (الحد الأقصى: 10 ميجابايت لكل صورة)
                                    </p>
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
                        <div className="p-4 bg-red-50 rounded-lg">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-red-500 ml-3" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex">
                                <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                                <p className="text-sm text-green-500">
                                    تم حفظ التغييرات بنجاح
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
                                    حفظ التغييرات
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HomeManagement;