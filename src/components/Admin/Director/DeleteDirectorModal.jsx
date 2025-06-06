import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const DeleteDirectorModal = ({
    showModal,
    onClose,
    onConfirm,
    isDeleting
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (showModal) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 200);
        }
    }, [showModal]);

    const handleClose = () => {
        if (!isDeleting) {
            onClose();
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
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isAnimating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
                }`}
            onClick={handleBackdropClick}
        >
            <div
                className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-200 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
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

                {/* Modal content */}
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <h3 className="text-xl font-semibold text-gray-900">تأكيد الحذف</h3>
                    </div>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">
                        هل أنت متأكد من رغبتك في حذف {showModal?.name}؟ هذا الإجراء لا يمكن التراجع عنه.
                    </p>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={() => onConfirm(showModal)}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    جاري الحذف...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    تأكيد الحذف
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteDirectorModal; 