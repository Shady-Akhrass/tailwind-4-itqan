import React, { useState, useEffect } from 'react';
import { useHomeData, apiClient } from '../../../api/queries';
import { Loader2, AlertTriangle } from 'lucide-react';
import VisionMissionSection from './VisionMissionSection';
import YouTubeSection from './YouTubeSection';
import SoundSection from './SoundSection';
import SliderSection from './SliderSection';
import SuccessMessage from './SuccessMessage';

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
    const [successMessage, setSuccessMessage] = useState('');
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
                sliderImages: slider || [],
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

    // Handle image selection
    const handleImageSelect = (imageId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                setFormData(prev => ({
                    ...prev,
                    sliderImages: prev.sliderImages.map(img =>
                        img.id === imageId
                            ? {
                                ...img,
                                image: previewUrl,
                                file: file,
                                previewUrl: previewUrl
                            }
                            : img
                    )
                }));
                setFormTouched(true);
            }
        };
        input.click();
    };

    // Handle slider image click
    const handleSliderImageClick = (image) => {
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

    // Mark image for deletion
    const markImageForDeletion = (id) => {
        setImagesToDelete(prev => [...prev, id]);
        setFormTouched(true);
    };

    // Undo image deletion
    const undoImageDeletion = (id) => {
        setImagesToDelete(prev => prev.filter(imgId => imgId !== id));
    };

    // Handle section-specific submissions
    const handleSectionSubmit = async (section, data) => {
        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (section === 'صور العرض') {
                for (const image of data.images) {
                    if (image.file) {
                        const formData = new FormData();
                        formData.append('image', image.file);
                        formData.append('_method', 'PATCH');

                        await apiClient.post(`/slider/${image.id}/API`, formData, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json',
                                'Content-Type': 'multipart/form-data'
                            }
                        });

                        setFormData(prev => ({
                            ...prev,
                            sliderImages: prev.sliderImages.map(img =>
                                img.id === image.id
                                    ? { ...img, file: undefined }
                                    : img
                            )
                        }));
                    }
                }
            } else if (section === 'المكتبة المرئية') {
                const method = homeData?.youtubes?.[0] ? 'patch' : 'post';
                const url = method === 'post'
                    ? '/youtube/API'
                    : `/youtube/${homeData.youtubes[0].id}/API`;

                await apiClient[method](url, data.youtube, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            } else {
                const submitData = {
                    vision: data.vision || formData.vision,
                    mission: data.mission || formData.mission,
                    student_number: data.achievements?.student_number || formData.achievements.student_number,
                    teacher_number: data.achievements?.teacher_number || formData.achievements.teacher_number,
                    course_number: data.achievements?.course_number || formData.achievements.course_number,
                    memorizing_number: data.achievements?.memorizing_number || formData.achievements.memorizing_number,
                    contest_number: data.achievements?.contest_number || formData.achievements.contest_number,
                    camp_number: data.achievements?.camp_number || formData.achievements.camp_number,
                    lesson_number: data.achievements?.lesson_number || formData.achievements.lesson_number,
                    celebration_number: data.achievements?.celebration_number || formData.achievements.celebration_number
                };

                await apiClient.patch(`/home/${homeData.homes[0].id}/API`, submitData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            }

            setSaving(false);
            setSuccess(true);
            setSuccessMessage(`تم حفظ ${section} بنجاح`);
            setFormTouched(false);

            setTimeout(() => {
                setSuccess(false);
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error(`Error saving ${section} data:`, error);
            setError(`فشل في حفظ بيانات ${section}`);
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

                {/* Success Message */}
                {success && <SuccessMessage message={successMessage} />}

                <form className="space-y-12">
                    {/* Vision, Mission & Numbers Section */}
                    <VisionMissionSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleAchievementChange={handleAchievementChange}
                        handleSectionSubmit={handleSectionSubmit}
                        saving={saving}
                    />

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-12"></div>

                    {/* YouTube Section */}
                    <YouTubeSection
                        formData={formData}
                        handleYouTubeChange={handleYouTubeChange}
                        handleSectionSubmit={handleSectionSubmit}
                        saving={saving}
                    />

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-12"></div>

                    {/* Sound Section */}
                    <SoundSection
                        formData={formData}
                        handleSoundChange={handleSoundChange}
                        handleSectionSubmit={handleSectionSubmit}
                        saving={saving}
                    />

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-12"></div>

                    {/* Slider Images Section */}
                    <SliderSection
                        formData={formData}
                        imagesToDelete={imagesToDelete}
                        handleImageSelect={handleImageSelect}
                        handleSliderImageClick={handleSliderImageClick}
                        markImageForDeletion={markImageForDeletion}
                        undoImageDeletion={undoImageDeletion}
                        handleSectionSubmit={handleSectionSubmit}
                        saving={saving}
                    />

                    {/* Error message */}
                    {error && (
                        <div className="p-6 bg-red-50 rounded-lg mt-8">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-red-500 ml-3" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default HomeManagement;