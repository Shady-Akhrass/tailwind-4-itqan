import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/queries';
import { Link, useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import { Home, ChevronLeft, Facebook } from 'lucide-react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import SectionSkeleton from '../Skeleton/SectionSkeleton';

const carouselStyles = `
  .carousel .control-dots .dot {
    background: #22c55e !important;
    box-shadow: none !important;
    width: 10px !important;
    height: 10px !important;
  }
  .carousel .control-dots .dot.selected {
    background: #16a34a !important;
  }
  .carousel .slide {
    transition: opacity 0.5s ease-in-out !important;
  }
`;

const DynamicSection = () => {
    const { id } = useParams();
    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiClient.get(`/sections/${id}/API`)
            .then(response => {
                setSection(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('There was an error fetching the section content!', error);
                setError('Failed to load section content');
                setLoading(false);
            });

        if (window.FB) {
            window.FB.XFBML.parse();
        } else {
            const script = document.createElement('script');
            script.src = "https://connect.facebook.net/ar_AR/sdk.js#xfbml=1&version=v18.0";
            script.async = true;
            script.defer = true;
            script.crossOrigin = "anonymous";
            document.body.appendChild(script);
        }
    }, [id]);

    const getMetaDescription = () => {
        if (section?.description) {
            return section.description.substring(0, 160) + '...';
        }
        return `${section?.name || 'Section'} - دار الإتقان`;
    };

    // Function to get all images from the section
    const getSectionImages = () => {
        if (!section) return [];

        const images = [];
        for (let i = 1; i <= 5; i++) {
            const imageKey = `image${i}`;
            if (section[imageKey]) {
                images.push({
                    id: i,
                    image: section[imageKey]
                });
            }
        }
        return images;
    };

    if (loading) return <SectionSkeleton />;
    if (error) return <div>{error}</div>;
    if (!section) return <div>No section content found</div>;

    const metaDescription = getMetaDescription();
    const sectionImages = getSectionImages();

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <title>{section.name} - دار الإتقان</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={`${section.name}, دار الإتقان`} />
            <meta property="og:title" content={`${section.name} - دار الإتقان`} />
            <meta property="og:description" content={metaDescription} />
            <style>{carouselStyles}</style>

            {/* Navigation Path */}
            <div className="max-w-7xl mx-auto mb-6" dir="rtl">
                <nav className="flex items-center text-gray-600 text-sm">
                    <Link to="/" className="flex items-center hover:text-green-600">
                        <Home className="w-4 h-4 ml-1" />
                        الرئيسية
                    </Link>
                    <ChevronLeft className="w-4 h-4 mx-2" />
                    <span className="text-green-600">
                        {section.name}
                    </span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Facebook Section */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="sticky top-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">آخر المنشورات</h2>
                                    <Facebook className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="p-4 bg-white overflow-hidden">
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
                </div>

                {/* Section Content */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                    <h2 className="text-3xl font-bold mb-8 text-center">{section.name}</h2>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        {sectionImages.length > 0 && (
                            <Carousel
                                showThumbs={false}
                                showStatus={false}
                                infiniteLoop
                                useKeyboardArrows
                                autoPlay
                                interval={5000}
                                transitionTime={500}
                                stopOnHover
                                swipeable
                                emulateTouch
                                className="aspect-video"
                            >
                                {sectionImages.map(image => (
                                    <div key={image.id} className="relative aspect-video">
                                        <img
                                            src={`https://api.ditq.org/storage/${image.image}`}
                                            alt={section.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </Carousel>
                        )}
                        <div className="p-6">
                            <p className="text-gray-800 text-right leading-relaxed">
                                {section.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicSection; 