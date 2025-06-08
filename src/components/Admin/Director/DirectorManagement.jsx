import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Save, X, Upload, Eye, ChevronDown, ChevronRight, Search, Filter, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/queries';
import AddEditModal from './AddEditModal';
import TreeView from './TreeView';
import TableView from './TableView';
import DeleteDirectorModal from './DeleteDirectorModal';
import SuccessMessage from './SuccessMessage';

const AdminDirectorsPage = () => {
    const [directors, setDirectors] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedDirector, setSelectedDirector] = useState(null);
    const [viewMode, setViewMode] = useState('tree');
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        parent_id: '',
        image: null
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // API configuration
    const API_BASE = '/directors';
    const getHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
    });

    const getFormHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
    });

    // Fetch directors data
    const fetchDirectors = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(API_BASE, {
                headers: getHeaders()
            });

            if (response.data.success) {
                setDirectors(response.data.data);
                setError(null);
            } else {
                setError('فشل في جلب بيانات مجلس الإدارة');
            }
        } catch (error) {
            setError('خطأ في جلب بيانات مجلس الإدارة');
        } finally {
            setLoading(false);
        }
    };

    // Fetch tree data
    const fetchTreeData = async () => {
        try {
            const response = await apiClient.get(`${API_BASE}/tree`, {
                headers: getHeaders()
            });

            if (response.data.success) {
                setTreeData(response.data.data);
                const rootIds = response.data.data.map(node => node.id);
                setExpandedNodes(new Set(rootIds));
            }
        } catch (error) {
            setError('خطأ في جلب بيانات الشجرة التنظيمية');
        }
    };

    useEffect(() => {
        fetchDirectors();
        fetchTreeData();
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setError(null);

        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('position', formData.position);
        if (formData.parent_id) {
            formDataObj.append('parent_id', formData.parent_id);
        }
        if (formData.image) {
            formDataObj.append('image', formData.image);
        }

        try {
            const url = modalMode === 'create' ? API_BASE : `${API_BASE}/${selectedDirector.id}`;

            if (modalMode === 'edit') {
                formDataObj.append('_method', 'PATCH');
            }

            const response = await apiClient.post(url, formDataObj, {
                headers: getFormHeaders()
            });

            if (response.data.success) {
                setSuccess(true);
                setSuccessMessage(modalMode === 'create' ? 'تم إضافة الموظف بنجاح' : 'تم تحديث بيانات الموظف بنجاح');
                fetchDirectors();
                fetchTreeData();
                handleCloseModal();
                setTimeout(() => {
                    setSuccess(false);
                    setSuccessMessage('');
                }, 3000);
            } else {
                if (response.data.errors) {
                    setErrors(response.data.errors);
                } else {
                    setError('فشلت العملية');
                }
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setError('حدث خطأ في الشبكة');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async (director) => {
        setIsDeleting(true);
        try {
            const response = await apiClient.delete(`${API_BASE}/${director.id}`, {
                headers: getHeaders()
            });

            if (response.data.success) {
                setSuccess(true);
                setSuccessMessage('تم حذف الموظف بنجاح');
                fetchDirectors();
                fetchTreeData();
                setShowDeleteModal(null);
                setTimeout(() => {
                    setSuccess(false);
                    setSuccessMessage('');
                }, 3000);
            } else {
                setError('فشل الحذف');
            }
        } catch (error) {
            setError('خطأ في حذف الموظف');
        } finally {
            setIsDeleting(false);
        }
    };

    // Modal handlers
    const handleOpenModal = (mode, director = null) => {
        setModalMode(mode);
        setSelectedDirector(director);
        setShowModal(true);
        setErrors({});

        if (mode === 'edit' && director) {
            setFormData({
                name: director.name,
                position: director.position,
                parent_id: director.parent_id || '',
                image: null
            });
        } else {
            setFormData({
                name: '',
                position: '',
                parent_id: '',
                image: null
            });
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDirector(null);
        setFormData({ name: '', position: '', parent_id: '', image: null });
        setErrors({});
    };

    // Tree node expansion
    const toggleNode = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    // Filter directors based on search term
    const filteredDirectors = directors.filter(director =>
        director.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        director.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDirectors.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDirectors.length / itemsPerPage);

    // Handle modal success
    const handleModalSuccess = (mode) => {
        setSuccess(true);
        setSuccessMessage(mode === 'create' ? 'تم إضافة الموظف بنجاح' : 'تم تحديث بيانات الموظف بنجاح');
        setTimeout(() => {
            setSuccess(false);
            setSuccessMessage('');
        }, 3000);
    };

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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => handleOpenModal('create')}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة موظف جديد
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">إدارة مجلس الإدارة</h1>
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">مجلس الإدارة النشطين</p>
                                <h3 className="text-2xl font-bold text-gray-800">{directors.filter(d => d.status === 'active').length}</h3>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-yellow-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">مجلس الإدارة غير النشطين</p>
                                <h3 className="text-2xl font-bold text-gray-800">{directors.filter(d => d.status === 'inactive').length}</h3>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-blue-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">إجمالي مجلس الإدارة</p>
                                <h3 className="text-2xl font-bold text-gray-800">{directors.length}</h3>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Filter className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="البحث عن مدراء..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'tree'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            عرض الشجرة
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            عرض القائمة
                        </button>
                    </div>
                </div>

                {/* Success message */}
                {success && <SuccessMessage message={successMessage} />}

                {/* Tree View */}
                {viewMode === 'tree' && !loading && (
                    <TreeView
                        treeData={treeData}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                        handleOpenModal={handleOpenModal}
                        handleDelete={(director) => setShowDeleteModal(director)}
                    />
                )}

                {/* List View */}
                {viewMode === 'list' && !loading && (
                    <TableView
                        currentItems={currentItems}
                        handleOpenModal={handleOpenModal}
                        handleDelete={(director) => setShowDeleteModal(director)}
                    />
                )}

                {/* Add/Edit Modal */}
                <AddEditModal
                    showModal={showModal}
                    handleCloseModal={handleCloseModal}
                    modalMode={modalMode}
                    selectedDirector={selectedDirector}
                    directors={directors}
                    onSuccess={() => {
                        fetchDirectors();
                        fetchTreeData();
                        handleModalSuccess(modalMode);
                    }}
                />

                {/* Delete Confirmation Modal */}
                <DeleteDirectorModal
                    showModal={showDeleteModal}
                    onClose={() => setShowDeleteModal(null)}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                />
            </div>
        </div>
    );
};

export default AdminDirectorsPage;