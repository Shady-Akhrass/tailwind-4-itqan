import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Copy, Facebook, Share2, Calendar, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useNewsDetails, useAllNews } from '../../api/queries';
import { motion } from 'framer-motion';

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
    background: transparent;
  }
  .carousel .slide img {
    max-height: 600px;
    object-fit: contain;
  }
`;

const NewsDetails = () => {
    const { title, id } = useParams();
    const identifier = id || title; // Use whichever parameter is available
    const navigate = useNavigate();
    const [copySuccess, setCopySuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasSubPhotos, setHasSubPhotos] = useState(false);
    const [prevNews, setPrevNews] = useState(null);
    const [nextNews, setNextNews] = useState(null);

    // Get all news for navigation
    const { data: allNews = [] } = useAllNews();

    // Use the identifier for the query
    const { data: newsItem, isLoading, error } = useNewsDetails(identifier);

    useEffect(() => {
        // Set visibility after component mounts
        setIsVisible(true);

        // Check if newsItem has subphotos
        if (newsItem && newsItem.subphotos1) {
            setHasSubPhotos(true);
        }

        // If using ID, redirect to title-based URL
        if (id && newsItem && newsItem.title) {
            const titleSlug = newsItem.title
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            navigate(`/news/${titleSlug}/details`, { replace: true });
        }

        // Initialize Facebook SDK
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
    }, [newsItem, id, navigate]);

    useEffect(() => {
        // Set up previous and next news navigation
        if (allNews.length > 0 && newsItem) {
            // Sort news by date (newest first)
            const sortedNews = [...allNews].sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );

            // Find current news index
            const currentIndex = sortedNews.findIndex(item => item.id === newsItem.id);

            if (currentIndex > 0) {
                setNextNews(sortedNews[currentIndex - 1]); // Next is newer (previous in the array)
            }

            if (currentIndex < sortedNews.length - 1 && currentIndex !== -1) {
                setPrevNews(sortedNews[currentIndex + 1]); // Prev is older (next in the array)
            }
        }
    }, [allNews, newsItem]);

    const generateNewsUrl = (newsItem) => {
        const titleSlug = newsItem.title
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        return `/news/${titleSlug}/details`;
    };

    const copyShortLink = () => {
        if (newsItem) {
            // Generate a URL that matches the format /news/{title}/details
            const titleSlug = newsItem.title
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            const shortUrl = `${window.location.origin}/news/${titleSlug}/details`;
            navigator.clipboard.writeText(shortUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        }
    };

    const handleShare = async () => {
        if (!newsItem) return;

        const shareData = {
            title: newsItem.title,
            text: newsItem.object ? newsItem.object.substring(0, 100) + '...' : '',
            url: window.location.href,
            files: []
        };

        try {
            if (navigator.share) {
                try {
                    const response = await fetch(newsItem.image);
                    const blob = await response.blob();
                    const file = new File([blob], 'news-image.jpg', { type: blob.type });
                    shareData.files = [file];
                } catch (error) {
                    console.warn('Error preparing image for share:', error);
                }
                await navigator.share(shareData);
            } else {
                copyShortLink();
            }
        } catch (error) {
            console.error('Error sharing:', error);
            copyShortLink();
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-PS', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto mb-6" dir="rtl">
                    <nav className="flex items-center text-gray-400 text-sm">
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="mx-2">{'>'}</div>
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="mx-2">{'>'}</div>
                        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </nav>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="sticky top-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="h-[500px] bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6" dir="rtl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-5 h-5 ml-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-28 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 w-3/4 rounded"></div>
                            </div>
                            <div className="flex justify-center items-center dark:bg-gray-900 h-[500px] p-4">
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 w-full rounded"></div>
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 w-5/6 rounded"></div>
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 w-4/5 rounded"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm h-24">
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 ml-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="flex-1">
                                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm h-24">
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                        <div className="w-5 h-5 mr-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">لم يتم العثور على الخبر</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">الرجاء التحقق من الرابط والمحاولة مرة أخرى</p>
                    <button
                        onClick={() => navigate('/news')}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        العودة للأخبار
                    </button>
                </div>
            </div>
        );
    }

    if (!newsItem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">لم يتم العثور على الخبر</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">الرجاء التحقق من الرابط والمحاولة مرة أخرى</p>
                    <button
                        onClick={() => navigate('/news')}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        العودة للأخبار
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <title>{newsItem.title || "أخبار DITQ - آخر الأخبار والمستجدات"}</title>
            <meta
                name="description"
                content={
                    newsItem.object
                        ? newsItem.object.substring(0, 160).trim()
                        : "اطلع على آخر الأخبار والمستجدات من DITQ. مصدرك الموثوق للأخبار والتحديثات."
                }
            />
            <meta property="og:title" content={newsItem.title || "أخبار DITQ - آخر الأخبار والمستجدات"} />
            <meta property="og:image" content={newsItem.image || "/default-og-image.jpg"} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={newsItem.title || "أخبار DITQ - آخر الأخبار والمستجدات"} />
            <meta name="twitter:image" content={newsItem.image || "/default-twitter-image.jpg"} />
            <meta property="article:published_time" content={newsItem.created_at || new Date().toISOString()} />
            <meta property="article:section" content="News" />

            <style>{carouselStyles}</style>

            <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8" >
                <div className="max-w-7xl mx-auto mb-6" dir="rtl">
                    <nav className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <Link to="/" className="flex items-center hover:text-green-600">
                            <Home className="w-4 h-4 ml-1" />
                            الرئيسية
                        </Link>
                        <ChevronLeft className="w-4 h-4 mx-2" />
                        <Link to="/news" className="hover:text-green-600">
                            كافة الأخبار
                        </Link>
                        <ChevronLeft className="w-4 h-4 mx-2" />
                        <span className="text-green-600 truncate max-w-[300px]">
                            {newsItem.title}
                        </span>
                    </nav>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
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

                    <div className="lg:col-span-3 order-1 lg:order-2" >
                        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6`} dir="rtl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-5 h-5 ml-2" />
                                    <span className="text-lg">{formatDate(newsItem.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={copyShortLink}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
                                            rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                                    >
                                        <Copy className="w-4 h-4" />
                                        <span>{copySuccess ? ' تم النسخ 👍' : 'نسخ الرابط'}</span>
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
                                            rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden" >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <p className="text-3xl font-bold text-right text-gray-900 dark:text-gray-100 leading-tight">
                                    {newsItem.title}
                                </p>
                            </div>

                            {hasSubPhotos ? (
                                <div className="relative bg-gray-50 dark:bg-gray-900">
                                    <Carousel
                                        showArrows={true}
                                        showStatus={false}
                                        infiniteLoop={true}
                                        autoPlay={true}
                                        interval={5000}
                                        showThumbs={false}
                                        className="news-carousel"
                                    >
                                        {/* Main Image */}
                                        {newsItem.image && (
                                            <div className="flex justify-center items-center h-[500px] p-4">
                                                <motion.img
                                                    src={newsItem.image}
                                                    alt={newsItem.title}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = '/default-news-image.jpg';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Additional Images */}
                                        {newsItem.subphotos1 && (
                                            <div className="flex justify-center items-center h-[500px] p-4">
                                                <img
                                                    src={newsItem.subphotos1}
                                                    alt={`${newsItem.title} - صورة إضافية 1`}
                                                    className="max-w-full max-h-full object-contain"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = '/default-news-image.jpg';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Carousel>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center dark:bg-gray-900 h-[500px] p-4">
                                    <motion.img
                                        src={newsItem.image}
                                        alt={newsItem.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = '/default-news-image.jpg';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="p-6">
                                <div className="max-w-none font-sans">
                                    {newsItem.object.split('\r\n\r\n').map((paragraph, index) => (
                                        <pre
                                            key={index}
                                            className="block w-full overflow-auto whitespace-pre-line my-4 rtl font-sans text-lg md:text-xl"
                                        >
                                            <p
                                                dir="rtl"
                                                className="text-gray-800 dark:text-gray-200 leading-relaxed font-sans"
                                            >
                                                {paragraph}
                                            </p>
                                        </pre>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                                {prevNews && (
                                    <Link
                                        to={generateNewsUrl(prevNews)}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-end group h-24"
                                    >
                                        <ChevronRight className="w-5 h-5 ml-2 text-green-600 transform group-hover:-translate-x-1 transition-transform" />

                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">الخبر السابق</p>
                                            <p className="text-gray-900 dark:text-gray-100 font-semibold truncate">
                                                {prevNews.title}
                                            </p>
                                        </div>
                                    </Link>
                                )}

                                {nextNews && (
                                    <Link
                                        to={generateNewsUrl(nextNews)}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center group h-24"
                                    >
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">الخبر التالي</p>
                                            <p className="text-gray-900 dark:text-gray-100 font-semibold truncate">
                                                {nextNews.title}
                                            </p>
                                        </div>
                                        <ChevronLeft className="w-5 h-5 mr-2 text-green-600 transform group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewsDetails;