import React, { useEffect, useState, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import { Home, ChevronLeft, Facebook } from 'lucide-react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { apiClient } from '../../api/queries';
import SectionSkeleton from '../Skeleton/SectionSkeleton';

// A custom hook to manage the Facebook SDK script. This keeps the component clean.
const useFacebookSDK = () => {
    useEffect(() => {
        if (window.FB) {
            window.FB.XFBML.parse();
        } else {
            const script = document.createElement('script');
            script.src = "https://connect.facebook.net/ar_AR/sdk.js#xfbml=1&version=v19.0";
            script.async = true;
            script.defer = true;
            script.crossOrigin = "anonymous";
            document.body.appendChild(script);

            script.onload = () => {
                if (window.FB) {
                    window.FB.XFBML.parse();
                }
            };
        }
    }, []);
};

const carouselStyles = `
  .carousel .control-dots .dot { background: #22c55e !important; box-shadow: none !important; width: 10px !important; height: 10px !important; }
  .carousel .control-dots .dot.selected { background: #16a34a !important; }
  .carousel .slide { transition: opacity 0.5s ease-in-out !important; }
`;

const DynamicSection = () => {
    const { title } = useParams();
    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useFacebookSDK(); // Load the Facebook SDK

    useEffect(() => {
        const decodedTitle = decodeURIComponent(title).replace(/-/g, ' ');

        apiClient.get(`/sections/${decodedTitle}/API`)
            .then(response => {
                setSection(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('There was an error fetching the section content!', error);
                setError('Failed to load section content. Please try again later.');
                setLoading(false);
            });
    }, [title]);

    // Helper function to get all valid images from the section object
    const getSectionImages = (sec) => {
        if (!sec) return [];
        const images = [];
        for (let i = 1; i <= 5; i++) {
            if (sec[`image${i}`]) {
                images.push({
                    id: i,
                    url: `https://api.ditq.org/storage/${sec[`image${i}`]}`
                });
            }
        }
        return images;
    };

    if (loading) return <SectionSkeleton />;
    if (error) return <div className="text-center py-40 text-red-500">{error}</div>;
    if (!section) return <div className="text-center py-40">No section content found.</div>;

    // --- SEO Variables ---
    const pageUrl = `https://www.ditq.org/sections/${title}`;
    const metaDescription = section.description ? section.description.substring(0, 160).trim() : `تعرف على ${section.name} في دار الإتقان.`;
    const sectionImages = getSectionImages(section);
    const primaryImage = sectionImages.length > 0 ? sectionImages[0].url : 'https://www.ditq.org/default-image.jpg';
    const publishedDate = section.created_at || new Date().toISOString();

    // --- Structured Data (JSON-LD) ---
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': pageUrl,
        },
        'headline': section.name,
        'description': metaDescription,
        'image': sectionImages.map(img => img.url),
        'author': {
            '@type': 'Organization',
            'name': 'دار الإتقان',
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'دار الإتقان',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://www.ditq.org/logo.png',
            },
        },
        'datePublished': publishedDate,
        'dateModified': publishedDate,
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'الرئيسية',
                'item': 'https://www.ditq.org/',
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': section.name,
                'item': pageUrl,
            },
        ],
    };

    return (
        <>
            {/* SEO Meta Tags (NewsDetails style, using DynamicSection variables) */}
            <title>{section.name ? `${section.name} - دار الإتقان` : "أقسام دار الإتقان"}</title>
            <meta
                name="description"
                content={metaDescription}
            />
            <meta property="og:title" content={section.name ? `${section.name} - دار الإتقان` : "أقسام دار الإتقان"} />
            <meta property="og:image" content={primaryImage} />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:type" content="article" />
            <meta property="og:description" content={metaDescription} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={section.name ? `${section.name} - دار الإتقان` : "أقسام دار الإتقان"} />
            <meta name="twitter:image" content={primaryImage} />
            <meta name="twitter:description" content={metaDescription} />
            <meta property="article:published_time" content={publishedDate} />
            <meta property="article:section" content="Section" />
            <link rel="canonical" href={pageUrl} />
            <style>{carouselStyles}</style>
            <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

            <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
                {/* Navigation Path */}
                <div className="max-w-7xl mx-auto mb-6" dir="rtl">
                    <nav className="flex items-center text-gray-600 text-sm">
                        <Link to="/" className="flex items-center hover:text-green-600">
                            <Home className="w-4 h-4 ml-1" />
                            الرئيسية
                        </Link>
                        <ChevronLeft className="w-4 h-4 mx-2" />
                        <span className="text-green-600">{section.name}</span>
                    </nav>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Facebook Section */}
                    <aside className="lg:col-span-1 order-2 lg:order-1">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">آخر المنشورات</h2>
                                        <Facebook className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <div className="p-4 bg-white">
                                    <div id="fb-root"></div>
                                    <div
                                        className="fb-page"
                                        data-href="https://www.facebook.com/dar.etqan.gaza"
                                        data-tabs="timeline"
                                        data-width="450"
                                        data-height="500"
                                        data-small-header="true"
                                        data-adapt-container-width="true"
                                        data-hide-cover="false"
                                        data-show-facepile="false"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Section Content */}
                    <main className="lg:col-span-3 order-1 lg:order-2">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <h1 className="text-3xl font-bold p-6 text-center text-black dark:text-white">{section.name}</h1>
                            {sectionImages.length > 0 && (
                                <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows autoPlay interval={5000} className="aspect-video">
                                    {sectionImages.map(image => (
                                        <div key={image.id} className="relative aspect-video">
                                            <img
                                                src={image.url}
                                                alt={`${section.name} - صورة ${image.id}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            )}
                            <div className="p-6">
                                <p className="text-gray-800 text-right leading-relaxed whitespace-pre-line">
                                    {section.description}
                                </p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default DynamicSection;