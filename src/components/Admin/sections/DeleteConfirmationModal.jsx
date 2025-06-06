import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const DeleteConfirmationModal = ({
  showConfirmDelete,
  setShowConfirmDelete,
  handleDeleteSection,
  isDeleting
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showConfirmDelete) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [showConfirmDelete]);

  const handleClose = () => {
    if (!isDeleting) {
      setShowConfirmDelete(null);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isAnimating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              {/* Pulsing animation */}
              <div className="absolute inset-0 w-16 h-16 bg-red-100 rounded-full animate-ping opacity-25"></div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف محتوى هذا القسم؟
            </p>
            <p className="text-sm text-red-600 mt-2 font-medium">
              لا يمكن التراجع عن هذا الإجراء
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleClose}
              disabled={isDeleting}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => handleDeleteSection(showConfirmDelete.id, showConfirmDelete.isNew)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>جارِ الحذف...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-b-2xl"></div>
      </div>
    </div>
  );
};

// Demo component to show the modal
const Demo = () => {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id, isNew) => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setShowModal(false);
    console.log('Item deleted:', { id, isNew });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Enhanced Delete Modal</h1>
        <button
          onClick={() => setShowModal({ id: 1, isNew: false })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Show Delete Modal
        </button>
      </div>

      <DeleteConfirmationModal
        showConfirmDelete={showModal}
        setShowConfirmDelete={setShowModal}
        handleDeleteSection={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Demo;