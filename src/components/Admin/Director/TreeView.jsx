import { Users, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { checkApiUrl } from '../../../hooks/checkApiUrl';

const TreeView = ({ treeData, expandedNodes, toggleNode, handleOpenModal, handleDelete }) => {
    const renderTreeNode = (node) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id} className="flex flex-col items-center">
                <div className="flex items-center bg-white p-3 rounded-lg shadow-sm mb-2">
                    {node.image ? (
                        <img src={checkApiUrl(node.image)} alt={node.name} className="w-10 h-10 rounded-full ml-3 object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ml-3">
                            <Users size={20} className="text-gray-600" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{node.name}</h3>
                        <p className="text-sm text-gray-500">{node.position}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleOpenModal('edit', node)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(node)}
                            className="text-red-600 hover:text-red-900 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
                {hasChildren && (
                    <button
                        onClick={() => toggleNode(node.id)}
                        className="p-1 hover:bg-gray-100 rounded-full mb-2"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                    </button>
                )}
                {isExpanded && hasChildren && (
                    <div className="flex space-x-4 mt-2">
                        {node.children.map(child => renderTreeNode(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">الشجرة التنظيمية</h2>
            </div>
            <div className="p-6 overflow-x-auto">
                <div className="flex justify-start space-x-4 min-w-max">
                    {treeData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>لا يوجد مدراء. أضف أول مدير للبدء.</p>
                        </div>
                    ) : (
                        treeData.map(node => renderTreeNode(node))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreeView; 