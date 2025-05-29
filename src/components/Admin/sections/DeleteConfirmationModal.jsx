import { Trash2, Loader2 } from 'lucide-react';

const DeleteConfirmationModal = ({
  showConfirmDelete,
  setShowConfirmDelete,
  handleDeleteSection,
  isDeleting
}) => {
  return (
    showConfirmDelete && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">تأكيد الحذف</h3>
          <p className="text-gray-500 mb-6">
            هل أنت متأكد من رغبتك في حذف محتوى هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
              onClick={() => setShowConfirmDelete(null)}
              disabled={isDeleting}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none flex items-center mr-3"
              onClick={() => handleDeleteSection(showConfirmDelete.id, showConfirmDelete.isNew)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 ml-1" />
                  جارِ الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-1" />
                  حذف
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default DeleteConfirmationModal;