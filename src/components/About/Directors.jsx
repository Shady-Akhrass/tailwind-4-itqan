import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Users, MapPin, Mail, Phone, Award, Star } from 'lucide-react';
import { apiClient } from '../../api/queries';

const Directors = () => {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [error, setError] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    useEffect(() => {
        fetchTreeData();
    }, []);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/directors/tree');
            if (response.data.success) {
                setTreeData(response.data.data);
                const rootIds = response.data.data.map(node => node.id);
                setExpandedNodes(new Set(rootIds));
            } else {
                setError('فشل في تحميل بيانات المدراء');
            }
        } catch (error) {
            console.error('Error fetching directors data:', error);
            setError('حدث خطأ في تحميل بيانات المدراء');
        } finally {
            setLoading(false);
        }
    };

    const toggleNode = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const getNodeColors = (level) => {
        const colors = [
            { bg: 'from-green-500 to-green-600', accent: 'green', border: 'border-green-200' },
            { bg: 'from-green-400 to-green-500', accent: 'green', border: 'border-green-200' },
            { bg: 'from-green-300 to-green-400', accent: 'green', border: 'border-green-200' },
            { bg: 'from-green-200 to-green-300', accent: 'green', border: 'border-green-200' }
        ];
        return colors[level % colors.length];
    };

    const renderConnectionLine = (level) => {
        if (level === 0) return null;

        return (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
            </div>
        );
    };

    const renderNode = (node, level = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isHovered = hoveredNode === node.id;
        const colors = getNodeColors(level);

        return (
            <div key={node.id} className="relative flex flex-col items-center">
                {renderConnectionLine(level)}

                {/* Node Card */}
                <div
                    className={`
                        group relative flex flex-col items-center p-8 mb-6 rounded-3xl transition-all duration-500 transform
                        ${level === 0
                            ? 'bg-white shadow-xl hover:shadow-2xl scale-105'
                            : 'bg-white shadow-lg hover:shadow-xl hover:scale-105'
                        }
                        ${hasChildren ? 'cursor-pointer' : ''}
                        ${colors.border}
                        border-2 hover:border-opacity-100 border-opacity-30
                        w-[320px] hover:-translate-y-2
                        ${isHovered ? 'ring-4 ring-opacity-30 ring-' + colors.accent + '-400' : ''}
                    `}
                    onClick={() => hasChildren && toggleNode(node.id)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                >
                    {/* Image Container with Enhanced Design */}
                    <div className="relative w-36 h-36 mb-6">
                        {node.image ? (
                            <div className={`relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-${colors.accent}-500/50 transition-all duration-500 transform group-hover:scale-110`}>
                                <img
                                    src={node.image}
                                    alt={node.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className={`w-full h-full rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center border-4 border-white shadow-xl group-hover:shadow-${colors.accent}-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3`}>
                                <Users className="w-20 h-20 text-white drop-shadow-lg" />
                            </div>
                        )}

                        {/* Achievement Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full p-2 shadow-lg">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Enhanced Info Container */}
                    <div className="text-center mb-4">
                        <h3 className={`text-2xl font-bold text-gray-900 mb-3 group-hover:text-${colors.accent}-600 transition-colors duration-300`}>
                            {node.name}
                        </h3>
                        <div className={`inline-block px-4 py-2 bg-gradient-to-r ${colors.bg} text-white rounded-full text-sm font-semibold shadow-lg mb-4`}>
                            {node.position}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2 text-sm text-gray-600 w-full">
                        {node.email && (
                            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse hover:text-green-600 transition-colors">
                                <Mail className="w-4 h-4" />
                                <span>{node.email}</span>
                            </div>
                        )}
                        {node.phone && (
                            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse hover:text-green-600 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span dir="ltr">{node.phone}</span>
                            </div>
                        )}
                        {node.location && (
                            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse hover:text-green-600 transition-colors">
                                <MapPin className="w-4 h-4" />
                                <span>{node.location}</span>
                            </div>
                        )}
                        {node.experience && (
                            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mt-3">
                                <Star className="w-4 h-4 text-green-500" />
                                <span className="font-semibold text-gray-700">{node.experience} خبرة</span>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Toggle Button */}
                    {hasChildren && (
                        <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${colors.bg} p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110`}>
                            {isExpanded ? (
                                <ChevronDown className="w-6 h-6 text-white transition-transform duration-300 hover:scale-110" />
                            ) : (
                                <ChevronRight className="w-6 h-6 text-white transition-transform duration-300 hover:scale-110" />
                            )}
                        </div>
                    )}
                </div>

                {/* Children Container with Connection Lines */}
                {hasChildren && isExpanded && (
                    <div className="relative">
                        {/* Horizontal Connection Line */}
                        {node.children.length > 1 && (
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent transform translate-y-4"></div>
                        )}

                        <div className="flex space-x-12 mt-8 rtl:space-x-reverse">
                            {node.children.map((child, index) => (
                                <div key={child.id} className="relative">
                                    {/* Vertical Connection Line */}
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-px h-4 bg-gray-300"></div>
                                    {renderNode(child, level + 1)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderSkeleton = () => {
        return (
            <div className="flex flex-col items-center">
                <div className="w-[320px] bg-white rounded-3xl shadow-xl p-8 mb-6">
                    {/* Image Skeleton */}
                    <div className="relative w-36 h-36 mx-auto mb-6">
                        <div className="w-full h-full rounded-full bg-gray-200 animate-pulse"></div>
                        {/* Badge Skeleton */}
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>

                    {/* Name Skeleton */}
                    <div className="w-48 h-8 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>

                    {/* Position Skeleton */}
                    <div className="w-32 h-6 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse"></div>

                    {/* Contact Info Skeletons */}
                    <div className="space-y-3 px-4">
                        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-32 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-32 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-32 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Toggle Button Skeleton */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 mt-12">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">هيكل الإدارة</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        تعرف على فريق الإدارة المتميز الذي يقود مسيرة التميز والنجاح في مؤسستنا
                    </p>
                </div>
                <div className="overflow-x-auto mt-8">
                    <div className="min-w-max px-4 flex justify-center">
                        <div className="flex space-x-12">
                            {[1, 2, 3].map((_, index) => renderSkeleton())}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchTreeData}
                        className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 mt-12">
            {/* Header */}
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">هيكل الإدارة</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    تعرف على فريق الإدارة المتميز الذي يقود مسيرة التميز والنجاح في مؤسستنا
                </p>
            </div>

            {/* Tree View */}
            <div className="overflow-x-auto mt-8">
                <div className="min-w-max px-4">
                    {treeData.map(node => renderNode(node))}
                </div>
            </div>
        </div>
    );
};

export default Directors;