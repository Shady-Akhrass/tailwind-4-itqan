import React, { useState, useEffect } from 'react';
import { useHomeData, apiClient } from '../../../api/queries';
import { ArrowLeft, Save, Upload, Trash2, X, Image, Info, AlertTriangle, CheckCircle, Loader2, RefreshCcw } from 'lucide-react';
import { checkApiUrl } from '../../../hooks/checkApiUrl';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomeManagement = () => {
    const { data: homeData, isLoading, error: fetchError } = useHomeData();
    const [formData, setFormData] = useState({
        vision: '',
        mission: '',
        sliderImages: [],
        youtube: {
            main: '',
            secondary1: '',
            secondary2: ''
        },
        sound: {
            main: '',
            name: '',
            link: '',
            title: '',
            playlist: ''
        },
        status: 'active',
        achievements: {
            student_number: '',
            teacher_number: '',
            course_number: '',
            memorizing_number: '',
            contest_number: '',
            camp_number: '',
            lesson_number: '',
            celebration_number: ''
        }
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
            const data = homeData.youtubes[0];
            const sound = homeData.sound[0];
            const slider = homeData.images;

            setFormData({
                vision: home.vision || '',
                mission: home.mission || '',
                sliderImages: slider || [], // Directly use the slider array
                youtube: {
                    main: data?.main || '',
                    secondary1: data?.secondary1 || '',
                    secondary2: data?.secondary2 || ''
                },
                sound: {
                    main: sound?.main || '',
                    name: sound?.name || '',
                    link: sound?.link || '',
                    title: sound?.title || '',
                    playlist: sound?.playlist || ''
                },
                status: home.status || 'active',
                achievements: {
                    student_number: home.student_number || '',
                    teacher_number: home.teacher_number || '',
                    course_number: home.course_number || '',
                    memorizing_number: home.memorizing_number || '',
                    contest_number: home.contest_number || '',
                    camp_number: home.camp_number || '',
                    lesson_number: home.lesson_number || '',
                    celebration_number: home.celebration_number || ''
                }
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

    // Handle achievement input changes
    const handleAchievementChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            achievements: {
                ...prev.achievements,
                [name]: value
            }
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

    // Handle slider image click
    const handleSliderImageClick = (image) => {
        // Open modal or form to edit image details
        const newLink = prompt('Enter new link for this image (leave empty to remove):', image.link || '');
        if (newLink !== null) {
            setFormData(prev => ({
                ...prev,
                sliderImages: prev.sliderImages.map(img =>
                    img.id === image.id
                        ? { ...img, link: newLink }
                        : img
                )
            }));
            setFormTouched(true);
        }
    };

    // Handle YouTube input changes
    const handleYouTubeChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            youtube: {
                ...prev.youtube,
                [name]: value
            }
        }));
        setFormTouched(true);
    };

    // Handle sound input changes
    const handleSoundChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            sound: {
                ...prev.sound,
                [name]: value
            }
        }));
        setFormTouched(true);
    };

    // Slider settings
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        fade: true,
        pauseOnHover: true,
        customPaging: (i) => (
            <div className="w-2 h-2 bg-gray-300 rounded-full mx-1"></div>
        )
    };

    // Handle image replacement
    const handleImageReplace = (imageId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Here you would typically upload the new image
                // For now, we'll just update the UI
                setFormData(prev => ({
                    ...prev,
                    sliderImages: prev.sliderImages.map(img =>
                        img.id === imageId
                            ? { ...img, image: URL.createObjectURL(file) }
                            : img
                    )
                }));
                setFormTouched(true);
            }
        };
        input.click();
    };

    // Handle section-specific submissions
    const handleSectionSubmit = async (section, data) => {
        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await apiClient.put('/home/API', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            setSaving(false);
            setSuccess(true);
            setFormTouched(false);

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (error) {
            console.error(`Error saving ${section} data:`, error);
            setError(`فشل في حفظ بيانات ${section}`);
            setSaving(false);
        }
    };

    // Handle form submission for all sections
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            // Prepare the data for submission
            const submitData = {
                vision: formData.vision,
                mission: formData.mission,
                youtube: formData.youtube,
                sound: [formData.sound],
                status: formData.status,
                achievements: formData.achievements,
                images: formData.sliderImages
            };

            // Make the API call to update the home data
            await apiClient.put('/home/API', submitData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            // Handle image uploads if there are new images
            if (newImages.length > 0) {
                await uploadImages();
            }

            // Handle image deletions if there are images to delete
            if (imagesToDelete.length > 0) {
                await deleteImages();
            }

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
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">إدارة الصفحة الرئيسية</h1>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Vision, Mission & Numbers Section */}
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رؤيتنا
                                </label>
                                <textarea
                                    name="vision"
                                    value={formData.vision}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    dir="rtl"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رسالتنا
                                </label>
                                <textarea
                                    name="mission"
                                    value={formData.mission}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    dir="rtl"
                                ></textarea>
                            </div>
                        </div>

                        {/* Numbers Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">الإنجازات</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد الطلاب
                                    </label>
                                    <input
                                        type="number"
                                        name="student_number"
                                        value={formData.achievements.student_number}
                                        onChange={handleAchievementChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد المعلمين
                                    </label>
                                    <input
                                        type="number"
                                        name="teacher_number"
                                        value={formData.achievements.teacher_number}
                                        onChange={handleAchievementChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد الدورات
                                    </label>
                                    <input
                                        type="number"
                                        name="course_number"
                                        value={formData.achievements.course_number}
                                        onChange={handleAchievementChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد الحفظ
                                    </label>
                                    <input
                                        type="number"
                                        name="memorizing_number"
                                        value={formData.achievements.memorizing_number}
                                        onChange={handleAchievementChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد المسابقات
                                    </label>
                                    <input
                                        type="number"
                                        name="contest_number"
                                        value={formData.achievements.contest_number}
                                        onChange={handleAchievementChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد المخيمات
                                    </label>
                                    <input
                                        type="number"
                                        name="camp_number"
                                        value={formData.achievements.camp_number}
                                        onChange={handleAchievementChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد الدروس
                                    </label>
                                    <input
                                        type="number"
                                        name="lesson_number"
                                        value={formData.achievements.lesson_number}
                                        onChange={handleAchievementChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عدد الاحتفالات
                                    </label>
                                    <input
                                        type="number"
                                        name="celebration_number"
                                        value={formData.achievements.celebration_number}
                                        onChange={handleAchievementChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => handleSectionSubmit('الرؤية والرسالة والإنجازات', {
                                    vision: formData.vision,
                                    mission: formData.mission,
                                    achievements: formData.achievements
                                })}
                                disabled={saving}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ الرؤية والرسالة والإنجازات'}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-12"></div>

                    {/* YouTube Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">المكتبة المرئية</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الفيديو الرئيسي
                                </label>
                                <input
                                    type="text"
                                    name="main"
                                    value={formData.youtube.main}
                                    onChange={handleYouTubeChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="رابط الفيديو على يوتيوب"
                                    dir="ltr"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفيديو الفرعي الأول
                                    </label>
                                    <input
                                        type="text"
                                        name="secondary1"
                                        value={formData.youtube.secondary1}
                                        onChange={handleYouTubeChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="رابط الفيديو على يوتيوب"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفيديو الفرعي الثاني
                                    </label>
                                    <input
                                        type="text"
                                        name="secondary2"
                                        value={formData.youtube.secondary2}
                                        onChange={handleYouTubeChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="رابط الفيديو على يوتيوب"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => handleSectionSubmit('المكتبة المرئية', {
                                    youtube: formData.youtube
                                })}
                                disabled={saving}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ المكتبة المرئية'}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-12"></div>

                    {/* Sound Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">المكتبة الصوتية</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رابط SoundCloud
                                </label>
                                <input
                                    type="text"
                                    name="main"
                                    value={formData.sound.main}
                                    onChange={handleSoundChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="رابط المقطع الصوتي على SoundCloud"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم المقطع
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.sound.name}
                                    onChange={handleSoundChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="اسم المقطع الصوتي"
                                    dir="rtl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الرابط الخارجي
                                </label>
                                <input
                                    type="text"
                                    name="link"
                                    value={formData.sound.link}
                                    onChange={handleSoundChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="رابط خارجي (اختياري)"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    العنوان
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.sound.title}
                                    onChange={handleSoundChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="عنوان المقطع"
                                    dir="rtl"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    قائمة التشغيل
                                </label>
                                <input
                                    type="text"
                                    name="playlist"
                                    value={formData.sound.playlist}
                                    onChange={handleSoundChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="رابط قائمة التشغيل (اختياري)"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Section Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => handleSectionSubmit('المكتبة الصوتية', {
                                    sound: [formData.sound]
                                })}
                                disabled={saving}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ المكتبة الصوتية'}
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-12"></div>

                    {/* Slider Images Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">صور العرض</h2>

                        {/* Current Images */}
                        {formData.sliderImages.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">الصور الحالية (اضغط على الصورة لتعديلها أو تغيير الرابط)</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {formData.sliderImages.map((image) => (
                                        <div
                                            key={image.id}
                                            className={`relative group rounded-lg overflow-hidden border-2 ${imagesToDelete.includes(image.id)
                                                ? 'border-red-300 opacity-50'
                                                : 'border-gray-200 hover:border-green-300'
                                                } transition-all cursor-pointer`}
                                        >
                                            <div
                                                className="w-full h-48 relative"
                                                onClick={() => handleImageReplace(image.id)}
                                            >
                                                <img
                                                    src={checkApiUrl(image.image)}
                                                    alt={`Slide ${image.id}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSliderImageClick(image);
                                                            }}
                                                            className="p-1 bg-white rounded-full text-blue-600 hover:text-blue-800"
                                                            title="تعديل الرابط"
                                                        >
                                                            <Info className="w-5 h-5" />
                                                        </button>
                                                        {imagesToDelete.includes(image.id) ? (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    undoImageDeletion(image.id);
                                                                }}
                                                                className="p-1 bg-white rounded-full text-green-600 hover:text-green-800"
                                                                title="إلغاء الحذف"
                                                            >
                                                                <RefreshCcw className="w-5 h-5" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markImageForDeletion(image.id);
                                                                }}
                                                                className="p-1 bg-white rounded-full text-red-600 hover:text-red-800"
                                                                title="حذف الصورة"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {image.link && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                                    {image.link}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Button - Disabled */}
                        <div className="flex items-center justify-center w-full">
                            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-medium">اضغط على الصورة لتغييرها</span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF (الحد الأقصى: 10 ميجابايت لكل صورة)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => handleSectionSubmit('صور العرض', {
                                    images: formData.sliderImages
                                })}
                                disabled={saving}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ صور العرض'}
                            </button>
                        </div>
                    </div>

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

                    {/* Error message */}
                    {error && (
                        <div className="p-6 bg-red-50 rounded-lg mt-8">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-red-500 ml-3" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="p-6 bg-green-50 rounded-lg mt-8">
                            <div className="flex">
                                <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                                <p className="text-sm text-green-500">
                                    تم حفظ التغييرات بنجاح
                                </p>
                            </div>
                        </div>
                    )}


                </form>
            </div>
        </div>
    );
};

export default HomeManagement;