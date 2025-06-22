import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../api/queries';
import { Edit, Trash2, Plus, Search, AlertTriangle, CheckCircle, Loader2, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import axios from 'axios';
import SectionModal from './AddSectionModal';
import toast, { Toaster } from 'react-hot-toast';

const SectionsManagement = () => {
    const [sections, setSections] = useState([]);
    const [newSections, setNewSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSectionsLoading, setNewSectionsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newSectionsError, setNewSectionsError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentSection, setCurrentSection] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);

    // const sectionsData = [
    //     { id: 'memorization', name: 'قسم التحفيظ', endpoint: '/memorization/API', icon: '📖' },
    //     { id: 'courses', name: 'قسم الدورات', endpoint: '/course/API', icon: '🎓' },
    //     { id: 'activities', name: 'قسم الأنشطة', endpoint: '/activity/API', icon: '🎪' },
    //     { id: 'creative', name: 'قسم الإبداع', endpoint: '/creative/API', icon: '🎨' },
    //     { id: 'diwan', name: 'قسم الديوان', endpoint: '/diwan/API', icon: '📝' }
    // ];

    const fetchNewSections = async () => {
        setNewSectionsLoading(true);
        setNewSectionsError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await apiClient.get('/sections/API', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            setNewSections(response.data);
        } catch (error) {
            console.error('Error fetching new sections:', error);
            setNewSectionsError(
                error.response?.data?.message ||
                'حدث خطأ أثناء تحميل الأقسام الجديدة. يرجى المحاولة مرة أخرى.'
            );
        } finally {
            setNewSectionsLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewSections();
        // const fetchSections = async () => {
        //     try {
        //         const sectionsWithData = await Promise.all(
        //             sectionsData.map(async (section) => {
        //                 try {
        //                     const response = await apiClient.get(section.endpoint);
        //                     return {
        //                         ...section,
        //                         hasData: response.data && response.data.length > 0,
        //                         dataCount: response.data?.length || 0,
        //                         lastUpdated: new Date().toISOString(),
        //                         status: 'active'
        //                     };
        //                 } catch (error) {
        //                     console.error(`Error fetching ${section.name}:`, error);
        //                     return {
        //                         ...section,
        //                         hasData: false,
        //                         dataCount: 0,
        //                         lastUpdated: null,
        //                         status: 'active'
        //                     };
        //                 }
        //             })
        //         );

        //         // Calculate stats
        //         const active = sectionsWithData.filter(s => s.status === 'active').length;
        //         const total = sectionsWithData.length;

        //         setStats({
        //             active,
        //             inactive: total - active,
        //             total
        //         });

        //         setSections(sectionsWithData);
        //         setLoading(false);
        //     } catch (error) {
        //         setError('Failed to load sections data');
        //         setLoading(false);
        //     }
        // };

        // fetchSections();
    }, []);

    // Recalculate stats whenever the list of sections changes
    useEffect(() => {
        const total = newSections.length;
        const active = newSections.filter(
            (s) => s.status === 1 || s.is_active === 1 || s.is_active === true || s.active === 1 || s.active === true
        ).length;
        setStats({ active, inactive: total - active, total });
    }, [newSections]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setFormError('يمكنك اختيار 5 صور كحد أقصى');
            return;
        }

        // Create preview URLs for the new files
        const newImages = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            originalPath: null // This is a new image
        }));

        if (modalMode === 'edit') {
            // In edit mode, we need to merge with existing images
            const existingImages = currentSection.images || [];
            const updatedImages = [...existingImages, ...newImages].slice(0, 5); // Keep max 5 images
            setCurrentSection(prev => ({
                ...prev,
                images: updatedImages
            }));
        } else {
            // In add mode, just set the new images
            setSelectedFiles(files);
            setImagePreview(newImages);
        }

        setFormError(null);
    };

    const handleEditClick = (section, isNewSection = false) => {
        setModalMode('edit');
        // Create images array from image1 to image5 fields
        const images = [];
        for (let i = 1; i <= 5; i++) {
            const imageKey = `image${i}`;
            if (section[imageKey]) {
                images.push({
                    url: `https://api.ditq.org/storage/${section[imageKey]}`,
                    file: null,
                    originalPath: section[imageKey] // Store the original path for reference
                });
            }
        }

        setCurrentSection({
            id: section.id,
            name: section.name,
            description: section.description || '',
            endpoint: section.endpoint,
            isNewSection,
            images: images
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        const toastId = toast.loading(modalMode === 'add' ? 'جاري إضافة القسم...' : 'جاري تحديث القسم...');

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            // Add required fields
            formData.append('name', currentSection.name.trim());
            formData.append('description', currentSection.description ? currentSection.description.trim() : '');

            // Handle images for both add and edit modes
            if (modalMode === 'edit') {
                // For edit mode, handle both existing and new images
                currentSection.images.forEach((image, index) => {
                    if (image.file) {
                        // This is a new image
                        formData.append(`images[${index}]`, image.file);
                    } else if (image.originalPath) {
                        // This is an existing image that wasn't changed
                        formData.append(`existing_images[${index}]`, image.originalPath);
                    }
                });
            } else {
                // For add mode, just append all selected files
                selectedFiles.forEach((file, index) => {
                    formData.append(`images[${index}]`, file);
                });
            }

            let response;
            if (modalMode === 'add') {
                // Add new section using POST
                response = await axios.post('/api/sections/API', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                });

                // Update new sections immediately
                setNewSections(prev => [...prev, response.data]);
                toast.success('تم إضافة القسم بنجاح', { id: toastId });
            } else {
                // Edit mode - use PATCH
                if (currentSection.isNewSection) {
                    // Edit new section
                    formData.append('_method', 'PATCH');
                    response = await axios.post(`/api/sections/${currentSection.id}/API`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json',
                            'X-Requested-Method': 'PATCH',
                            'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true
                    });

                    // Update new sections immediately
                    setNewSections(prev => prev.map(section =>
                        section.id === currentSection.id ? response.data : section
                    ));
                    toast.success('تم تحديث القسم بنجاح', { id: toastId });
                } else {
                    // Edit old section
                    formData.append('_method', 'PATCH');
                    response = await axios.post(`/api/sections/${currentSection.id}/API`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json',
                            'X-Requested-Method': 'PATCH',
                            'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true
                    });

                    // Update sections immediately with the response data
                    setSections(prev => prev.map(section =>
                        section.id === currentSection.id
                            ? {
                                ...section,
                                name: response.data.name,
                                description: response.data.description,
                                image1: response.data.image1,
                                image2: response.data.image2,
                                image3: response.data.image3,
                                image4: response.data.image4,
                                image5: response.data.image5,
                                lastUpdated: new Date().toISOString()
                            }
                            : section
                    ));

                    // Update stats
                    const updatedSections = sections.map(section =>
                        section.id === currentSection.id
                            ? {
                                ...section,
                                name: response.data.name,
                                description: response.data.description,
                                image1: response.data.image1,
                                image2: response.data.image2,
                                image3: response.data.image3,
                                image4: response.data.image4,
                                image5: response.data.image5,
                                lastUpdated: new Date().toISOString()
                            }
                            : section
                    );

                    const active = updatedSections.filter(s => s.status === 'active').length;
                    const total = updatedSections.length;
                    setStats({
                        active,
                        inactive: total - active,
                        total
                    });

                    toast.success('تم تحديث القسم بنجاح', { id: toastId });
                }
            }

            setShowModal(false);
            setCurrentSection({ name: '', description: '' });
            setSelectedFiles([]);
        } catch (error) {
            console.error('Error submitting section:', error);
            let errorMessage = 'حدث خطأ أثناء حفظ القسم. يرجى المحاولة مرة أخرى.';

            if (error.response?.data?.errors) {
                // Handle Laravel validation errors
                errorMessage = Object.values(error.response.data.errors)
                    .flat()
                    .map(msg => msg.replace('The ', '').replace(' field', ''))
                    .join(', ');
            } else if (error.response?.data?.message) {
                // Handle custom error message from the API
                errorMessage = error.response.data.message;
            } else if (!error.response) {
                // Handle network/connection errors
                errorMessage = 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك والمحاولة مرة أخرى';
            }

            setFormError(errorMessage);
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddClick = () => {
        setModalMode('add');
        setCurrentSection({ name: '', description: '' });
        setShowModal(true);
    };

    const handleDeleteClick = (section, isNewSection = false) => {
        setSectionToDelete({ ...section, isNewSection });
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!sectionToDelete) return;

        setIsDeleting(true);
        const toastId = toast.loading('جاري حذف القسم...');
        try {
            if (sectionToDelete.isNewSection) {
                await axios.delete(`/api/sections/${sectionToDelete.id}/API`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    withCredentials: true
                });
                const updatedNewSections = newSections.filter(section => section.id !== sectionToDelete.id);
                setNewSections(updatedNewSections);
                toast.success('تم حذف القسم بنجاح', { id: toastId });
            } else {
                const updatedSections = sections.map(section =>
                    section.id === sectionToDelete.id
                        ? { ...section, hasData: false, dataCount: 0 }
                        : section
                );
                setSections(updatedSections);

                const active = updatedSections.filter(s => s.status === 'active').length;
                const total = updatedSections.length;
                setStats({
                    active,
                    inactive: total - active,
                    total
                });
                toast.success('تم حذف القسم بنجاح', { id: toastId });
            }

            setShowDeleteModal(false);
            setSectionToDelete(null);
        } catch (error) {
            console.error('Failed to delete section:', error);
            const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حذف القسم. يرجى المحاولة مرة أخرى.';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredSections = sections.filter(section =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSections.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSections.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                    <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-50 p-6 rounded-lg text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-500 font-medium text-lg">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                    >
                        إعادة التحميل
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#333',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                    loading: {
                        iconTheme: {
                            primary: '#3B82F6',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={handleAddClick}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    إضافة قسم جديد
                </button>
                <h1 className="text-3xl font-bold text-gray-800">إدارة الأقسام</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">الأقسام الفعالة</p>
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
                            <p className="text-gray-500 text-sm">الأقسام غير الفعالة</p>
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
                            <p className="text-gray-500 text-sm">إجمالي الأقسام</p>
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
                    placeholder="بحث عن الأقسام..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Sections Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                القسم
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                عدد المحتويات
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                آخر تحديث
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الحالة
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الإجراءات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Old Sections */}
                        {currentItems.map((section) => (
                            <tr key={`old-${section.id}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-green-100 rounded-full text-lg">
                                            {section.icon}
                                        </div>
                                        <div className="mr-4">
                                            <div className="text-sm font-medium text-gray-900">{section.name}</div>
                                            <div className="text-sm text-gray-500">{section.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{section.dataCount}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {section.lastUpdated
                                            ? new Date(section.lastUpdated).toLocaleDateString('ar-EG')
                                            : 'لا يوجد'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${section.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {section.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                    <div className="flex space-x-2 justify-end">
                                        <button
                                            onClick={() => handleEditClick(section, false)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(section, false)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* New Sections */}
                        {newSectionsLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    <Loader2 className="w-6 h-6 text-green-500 animate-spin mx-auto" />
                                    <p className="mt-2 text-sm text-gray-500">جاري تحميل الأقسام الجديدة...</p>
                                </td>
                            </tr>
                        ) : newSectionsError ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
                                        <p className="text-sm text-red-500">{newSectionsError}</p>
                                        <button
                                            onClick={fetchNewSections}
                                            className="mt-2 text-sm text-green-600 hover:text-green-700"
                                        >
                                            إعادة المحاولة
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : newSections.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    <p className="text-sm text-gray-500">لا توجد أقسام جديدة</p>
                                </td>
                            </tr>
                        ) : (
                            newSections.map((section) => (
                                <tr key={`new-${section.id}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full text-lg">
                                                📄
                                            </div>
                                            <div className="mr-4">
                                                <div className="text-sm font-medium text-gray-900">{section.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                                    {section.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">-</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(section.created_at).toLocaleDateString('ar-EG')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            جديد
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex space-x-2 justify-end">
                                            <button
                                                onClick={() => handleEditClick(section, true)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(section, true)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
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

            {/* Modals */}
            <SectionModal
                showModal={showModal}
                setShowModal={setShowModal}
                section={currentSection}
                setSection={setCurrentSection}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                formError={formError}
                handleFileChange={handleFileChange}
                selectedFiles={selectedFiles}
                mode={modalMode}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">تأكيد الحذف</h3>
                        <p className="text-gray-600 mb-6">
                            هل أنت متأكد من حذف القسم "{sectionToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSectionToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                disabled={isDeleting}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <div className="flex items-center">
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        جاري الحذف...
                                    </div>
                                ) : (
                                    'حذف'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionsManagement;