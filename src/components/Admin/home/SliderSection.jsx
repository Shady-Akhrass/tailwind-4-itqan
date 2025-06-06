import React from 'react';
import { Upload, Info, Trash2, RefreshCcw } from 'lucide-react';
import { checkApiUrl } from '../../../hooks/checkApiUrl';

const SliderSection = ({
    formData,
    imagesToDelete,
    handleImageSelect,
    handleSliderImageClick,
    markImageForDeletion,
    undoImageDeletion,
    handleSectionSubmit,
    saving
}) => {
    return (
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
                                    onClick={() => handleImageSelect(image.id)}
                                >
                                    <img
                                        src={image.previewUrl || checkApiUrl(image.image)}
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
    );
};

export default SliderSection; 