import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">تأكيد الحذف</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                            disabled={isDeleting}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        <div>
                            <p className="text-gray-700 text-base font-medium">هل أنت متأكد أنك تريد حذف هذا التبرع؟</p>
                            <p className="text-sm text-gray-500 mt-1">لا يمكن التراجع عن هذا الإجراء.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100">
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                            disabled={isDeleting}
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4 ml-2" />
                                    جاري الحذف...
                                </>
                            ) : (
                                'حذف'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal; 