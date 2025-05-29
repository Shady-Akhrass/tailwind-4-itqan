import { Plus, X, Loader2, Upload, Image, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SectionModal = ({
  showModal,
  setShowModal,
  section,
  setSection,
  handleSubmit,
  isSubmitting,
  formError,
  handleFileChange,
  selectedFiles,
  mode = 'add' // 'add' or 'edit'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // Update image preview when section changes
  useEffect(() => {
    if (mode === 'edit' && section?.images) {
      setImagePreview(section.images);
    } else {
      setImagePreview([]);
    }
  }, [mode, section?.images]);

  // Remove the fetch section data effect since we're getting data from parent
  useEffect(() => {
    if (mode === 'edit' && section?.id) {
      // Update the section data
      setSection({
        name: section.name,
        description: section.description,
        id: section.id,
        images: section.images
      });
    }
  }, [mode, section?.id]);

  // Handle drag and drop
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
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      handleFileChange({ target: { files } });
      generateImagePreviews(files);
    }
  };

  const generateImagePreviews = (files) => {
    const previews = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({ file, url: e.target.result });
        setImagePreview([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (mode === 'add') {
      handleFileChange(e);
      if (files && files.length > 0) {
        generateImagePreviews(files);
      }
    } else {
      // In edit mode, replace the selected image
      if (files && files.length > 0) {
        const file = files[0]; // Take only the first file
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPreviews = [...imagePreview];
          if (selectedImageIndex !== null) {
            newPreviews[selectedImageIndex] = { file, url: e.target.result };
          } else if (newPreviews.length < 5) {
            newPreviews.push({ file, url: e.target.result });
          }
          setImagePreview(newPreviews);
          // Update the section's images array
          setSection(prev => ({
            ...prev,
            images: newPreviews
          }));
          setSelectedImageIndex(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageClick = (index) => {
    if (mode === 'edit') {
      setSelectedImageIndex(index);
      fileInputRef.current?.click();
    }
  };

  const removeImage = (index) => {
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImagePreview(newPreviews);
    // Update the section's images array
    setSection(prev => ({
      ...prev,
      images: newPreviews
    }));
    setSelectedImageIndex(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setImagePreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!showModal) return null;

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
                {mode === 'add' ? 'إضافة قسم جديد' : 'تعديل القسم'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {mode === 'add' ? 'أضف قسماً جديداً إلى المجموعة' : 'قم بتعديل بيانات القسم'}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {formError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">خطأ في النموذج</p>
                <p className="text-red-600 text-sm mt-1">{formError}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Section Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                اسم القسم *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={section.name}
                onChange={(e) => setSection({ ...section, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="أدخل اسم القسم"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Section Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                وصف القسم *
              </label>
              <textarea
                id="description"
                name="description"
                value={section.description}
                onChange={(e) => setSection({ ...section, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                placeholder="اكتب وصفاً موجزاً للقسم"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">اكتب وصفاً واضحاً يساعد المستخدمين على فهم محتوى القسم</p>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                الصور {mode === 'add' ? '(اختياري)' : ''}
              </label>

              {mode === 'add' ? (
                /* Drag and Drop Area for Add Mode */
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
                        اسحب الصور هنا أو انقر للاختيار
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        يمكنك اختيار حتى 5 صور (PNG, JPG, JPEG)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Image Grid for Edit Mode */
                <div className="grid grid-cols-5 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white text-gray-700 p-2 rounded-full shadow-md">
                          <Upload className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {imagePreview.length < 5 && (
                    <div
                      className="border-2 border-dashed rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-gray-50 transition-all duration-200"
                      onClick={() => {
                        setSelectedImageIndex(null);
                        fileInputRef.current?.click();
                      }}
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">إضافة صورة</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={mode === 'add'}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting}
              />

              {/* Image Previews for Add Mode */}
              {mode === 'add' && imagePreview.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        disabled={isSubmitting}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100">
          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !section.name?.trim() || !section.description?.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 ml-2" />
                  {mode === 'add' ? 'جارِ الإضافة...' : 'جارِ التحديث...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-2" />
                  {mode === 'add' ? 'إضافة القسم' : 'تحديث القسم'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionModal;