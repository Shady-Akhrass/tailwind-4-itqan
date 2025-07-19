import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Users, MapPin, Mail, Phone, Award, Star } from 'lucide-react';
import { apiClient } from '../../api/queries';
import { checkApiUrl } from '../../hooks/checkApiUrl';

const Directors = () => {
    useEffect(() => {
        // Get all director names from treeData
        const getAllNames = (nodes) => {
            let names = [];
            nodes.forEach(node => {
                names.push(node.name);
                if (node.children && node.children.length > 0) {
                    names = names.concat(getAllNames(node.children));
                }
            });
            return names;
        };

        // SEO Meta Tags Implementation
        const orgName = 'دار الاتقان لتعليم القرآن وعلومه';
        const metaTags = {
            // Basic Meta Tags
            'title': `الهيكل الإداري | ${orgName}`,
            'description': `تعرف على القيادة المتميزة في ${orgName} - فريق من المدراء والإداريين المتميزين في تعليم القرآن وعلومه والتطوير التربوي`,
            'keywords': `${orgName}, هيكل الإدارة, مدراء الاتقان, قيادة تعليمية, إدارة تربوية, تطوير تعليمي, مؤسسات تعليمية فلسطينية, تعليم في فلسطين, تعليم القرآن, علوم القرآن, ${getAllNames(treeData).join(', ')}`,

            // Open Graph Tags
            'og:title': `الهيكل الإداري | ${orgName}`,
            'og:description': `اكتشف فريق القيادة المتميز في ${orgName} وتعرف على الهيكل الإداري المتكامل والكفاءات التعليمية في تعليم القرآن وعلومه`,
            'og:type': 'website',
            'og:locale': 'ar_PS',
            'og:site_name': orgName,

            // Twitter Card Tags
            'twitter:card': 'summary_large_image',
            'twitter:title': `الهيكل الإداري | ${orgName}`,
            'twitter:description': `تعرف على القيادة المتميزة في ${orgName} وفريق العمل المتخصص في تعليم القرآن وعلومه`,

            // Additional SEO Tags
            'robots': 'index, follow, max-snippet:-1, max-image-preview:large',
            'language': 'Arabic',
            'revisit-after': '3 days',
            'author': orgName,
            'coverage': 'Worldwide',
            'target': 'all',
            'rating': 'General',
            'category': 'education, management, academic, تعليم القرآن, علوم القرآن'
        };

        // Set document title
        document.title = metaTags.title;

        // Function to create or update meta tags
        const updateMetaTag = (name, content, attribute = 'name') => {
            let meta = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attribute, name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Create structured data for Organization and People
        const structuredData = {
            "@context": "https://schema.org",
            "@type": ["Organization", "EducationalOrganization"],
            "name": orgName,
            "description": "دار الاتقان لتعليم القرآن وعلومه، مؤسسة تعليمية رائدة متخصصة في تعليم القرآن الكريم وعلومه والتطوير التربوي في فلسطين.",
            "url": window.location.href,
            "areaServed": {
                "@type": "Country",
                "name": "Palestine"
            },
            "employee": treeData.map(director => ({
                "@type": "Person",
                "name": director.name,
                "jobTitle": director.position,
                "image": director.image ? checkApiUrl(director.image) : undefined,
                "worksFor": {
                    "@type": "EducationalOrganization",
                    "name": orgName
                }
            })),
            "knowsLanguage": ["ar", "en"],
            "parentOrganization": {
                "@type": "Organization",
                "name": orgName
            }
        };

        // Add structured data script
        let scriptTag = document.querySelector('#structured-data');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'structured-data';
            scriptTag.type = 'application/ld+json';
            document.head.appendChild(scriptTag);
        }
        scriptTag.textContent = JSON.stringify(structuredData);

        // Update all meta tags
        Object.entries(metaTags).forEach(([name, content]) => {
            if (name.startsWith('og:')) {
                updateMetaTag(name, content, 'property');
            } else if (name.startsWith('twitter:')) {
                updateMetaTag(name, content, 'name');
            } else {
                updateMetaTag(name, content);
            }
        });

        // Canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = window.location.href;

        // Cleanup function
        return () => {
            // Optionally remove tags on unmount if needed
            // scriptTag?.remove();
        };
    }, []);

    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [error, setError] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    useEffect(() => {
        fetchTreeData();
    }, []);

    const getAllNodeIds = (nodes) => {
        let ids = [];
        for (const node of nodes) {
            ids.push(node.id);
            if (node.children && node.children.length > 0) {
                ids = ids.concat(getAllNodeIds(node.children));
            }
        }
        return ids;
    };

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/directors/tree');
            if (response.data.success) {
                const nodes = response.data.data;
                setTreeData(nodes);
                const allIds = getAllNodeIds(nodes);
                setExpandedNodes(new Set(allIds));
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
                        group relative flex flex-col items-center p-4 mb-4 rounded-2xl transition-all duration-500 transform
                        bg-white shadow-md hover:shadow-lg hover:scale-105
                        ${hasChildren ? 'cursor-pointer' : ''}
                        ${colors.border}
                        border-2 hover:border-opacity-100 border-opacity-30
                        w-[240px] hover:-translate-y-1
                        ${isHovered ? 'ring-2 ring-opacity-30 ring-' + colors.accent + '-400' : ''}
                    `}
                    onClick={() => hasChildren && toggleNode(node.id)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                >
                    {/* Image Container with Enhanced Design */}
                    <div className="relative w-24 h-24 mb-4">

                        {node.image ? (
                            <div className={`relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-${colors.accent}-500/50 transition-all duration-500 transform group-hover:scale-110`}>
                                <img
                                    src={checkApiUrl(node.image)}
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
                        <h3 className={`text-lg font-bold text-gray-900 mb-2 group-hover:text-${colors.accent}-600 transition-colors duration-300`}>
                            {node.name}
                        </h3>

                        <div className={`inline-block px-4 py-2 bg-gradient-to-r ${colors.bg} text-white rounded-full text-sm font-semibold shadow-lg mb-4`}>
                            {node.position}
                        </div>
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
                <div className="min-w-max px-8 ">
                    {treeData.map(node => renderNode(node))}
                </div>
            </div>
        </div>
    );
};

export default Directors;