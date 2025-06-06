import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAdminClues, useCreateClue, useUpdateClue } from '../../../api/queries';
import { Upload, X, Check, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';

const CluesManagementSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8 mx-auto" />
        <div className="space-y-4">
            {[1].map((item) => (
                <div key={item} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-[800px] bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    </div>
);

const UpdateForm = ({ isOpen, onClose, onSubmit, formData, setFormData, isEditing, loading }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [pdfPreview, setPdfPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Update PDF preview when formData or isEditing changes
    useEffect(() => {
        if (isOpen) { // Only update when modal is open
            if (isEditing && formData.pdf && typeof formData.pdf === 'string') {
                // Editing existing clue with a PDF
                setPdfPreview({
                    url: `https://api.ditq.org/storage/${formData.pdf}`,
                    isExisting: true
                });
            } else if (formData.pdf instanceof File) {
                // Adding new clue or selected a new PDF while editing
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPdfPreview({
                        url: e.target.result,
                        file: formData.pdf,
                        isExisting: false
                    });
                };
                reader.readAsDataURL(formData.pdf);
            } else {
                // No PDF (adding new or removed existing while editing)
                setPdfPreview(null);
            }
        }
    }, [isOpen, isEditing, formData.pdf]);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                pdf: acceptedFiles[0]
            }));
            setValidationErrors(prev => ({ ...prev, pdf: null }));
        }
    }, [setFormData]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        // Validation
        if (!isEditing && !formData.pdf) {
            setValidationErrors({ pdf: ['PDF file is required for new clue'] });
            return;
        }

        if (isEditing && !formData.pdf) {
            setValidationErrors({ pdf: ['Please select a PDF file to update'] });
            return;
        }

        try {
            await onSubmit(e);
        } catch (error) {
            if (error.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
            }
        }
    };

    const handleRemovePdf = () => {
        setFormData(prev => ({ ...prev, pdf: null }));
    };

    const closeModal = () => {
        setPdfPreview(null);
        setFormData({ pdf: null });
        setValidationErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {isEditing ? 'تحديث الدليل' : 'إضافة دليل جديد'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {isEditing ? 'قم بتحديث ملف الدليل' : 'أضف ملف دليل جديد'}
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* PDF Upload */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
                                ملف PDF *
                            </label>

                            {!pdfPreview ? (
                                // Upload area when no file is selected
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragging
                                        ? 'border-green-400 bg-green-50'
                                        : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                                        }`}
                                    {...getRootProps()}
                                >
                                    <div className="grid grid-cols-[auto_1fr] items-center gap-6">
                                        <div className="p-4 bg-gray-100 rounded-full">
                                            <Upload className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-medium text-gray-900">
                                                اسحب الملف هنا أو انقر للاختيار
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                PDF فقط (الحد الأقصى: 10 ميجابايت)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // File preview when a file is selected
                                <div className="relative group bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-black font-medium">
                                                {pdfPreview.isExisting ? 'الملف الحالي' : formData.pdf.name}
                                            </span>
                                            {!pdfPreview.isExisting && (
                                                <span className="text-gray-500 text-sm mr-2">
                                                    ({(formData.pdf.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemovePdf}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {validationErrors.pdf && (
                                <p className="text-sm text-red-500 mt-1">{validationErrors.pdf[0]}</p>
                            )}

                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => {
                                    if (e.target.files[0]) {
                                        setFormData(prev => ({
                                            ...prev,
                                            pdf: e.target.files[0]
                                        }));
                                        setValidationErrors(prev => ({ ...prev, pdf: null }));
                                    }
                                }}
                                className="hidden"
                                {...getInputProps()}
                            />
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
                            disabled={loading || !formData.pdf}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4 ml-2" />
                                    {isEditing ? 'جارِ التحديث...' : 'جارِ الإضافة...'}
                                </>
                            ) : (
                                <>
                                    {isEditing ? 'تحديث الدليل' : 'إضافة الدليل'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CluesManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingClueId, setEditingClueId] = useState(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const queryClient = useQueryClient();
    const { data: clues = [], isLoading, error: queryError } = useAdminClues();
    const createClue = useCreateClue();
    const updateClue = useUpdateClue();
    const [formData, setFormData] = useState({ pdf: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formDataToSend = new FormData();

            if (isEditing) {
                // PATCH request for updating existing clue
                if (!editingClueId) {
                    throw new Error("No clue ID specified for update");
                }

                if (!formData.pdf) {
                    throw new Error("Please select a PDF file to update");
                }

                formDataToSend.append('pdf', formData.pdf);

                console.log('Updating clue:', {
                    id: editingClueId,
                    formData: formDataToSend
                });

                const result = await updateClue.mutateAsync({
                    id: editingClueId,
                    formData: formDataToSend
                });

                console.log('Update result:', result);

            } else {
                // POST request for creating new clue
                if (!formData.pdf) {
                    throw new Error("PDF file is required for new clue");
                }

                formDataToSend.append('pdf', formData.pdf);

                console.log('Creating new clue:', formDataToSend);

                const result = await createClue.mutateAsync(formDataToSend);

                console.log('Create result:', result);
            }

            // Success handling
            await queryClient.invalidateQueries(['clues']);
            setSuccess(true);
            setShowModal(false);
            resetForm();

            // Hide success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (err) {
            console.error('Error submitting form:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.message || err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ pdf: null });
        setIsEditing(false);
        setEditingClueId(null);
        setError(null);
    };

    const openEditModal = (clue) => {
        setIsEditing(true);
        setEditingClueId(clue.id);
        setFormData({ pdf: null }); // User must select new PDF file
        setError(null);
        setShowModal(true);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    if (isLoading) return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <CluesManagementSkeleton />
        </div>
    );

    if (queryError) return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{queryError.message}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-black">إدارة الأدلة</h2>
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
                            <p className="text-sm text-green-500">
                                {isEditing ? 'تم تحديث الدليل بنجاح' : 'تم إضافة الدليل بنجاح'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Only show add option when no clues exist */}
                {clues.length === 0 && !isLoading && (
                    <div className="mb-8">
                        <div
                            onClick={openCreateModal}
                            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-gray-400 hover:bg-gray-50"
                        >
                            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-xl text-gray-600 mb-2 font-semibold">
                                لا توجد أدلة بعد
                            </p>
                            <p className="text-gray-500">
                                انقر هنا لإضافة دليل جديد
                            </p>
                        </div>
                    </div>
                )}

                {/* Clues list - Only show update option, no create when clues exist */}
                {clues.length > 0 && (
                    <div className="space-y-8">
                        {clues.map((clue) => (
                            <div key={clue.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-black">
                                            {clue.title || `الدليل رقم ${clue.id}`}
                                        </h3>
                                        <button
                                            onClick={() => openEditModal(clue)}
                                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Upload className="w-5 h-5 ml-2" />
                                            <span>تحديث الملف</span>
                                        </button>
                                    </div>
                                </div>
                                {clue.pdf && (
                                    <div className="relative">
                                        <iframe
                                            src={`https://api.ditq.org/storage/${clue.pdf}`}
                                            className="w-full h-[800px]"
                                            title={`Clue PDF ${clue.id}`}
                                            onError={(e) => {
                                                console.error('Error loading PDF:', e);
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="hidden w-full h-[800px] bg-gray-100 items-center justify-center">
                                            <div className="text-center">
                                                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600">تعذر تحميل ملف PDF</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <UpdateForm
                    isOpen={showModal}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={isEditing}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default CluesManagement;