import React, { useEffect, useState, useRef, memo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion } from 'framer-motion';
import { useHomeData, getImageUrl } from '../../api/queries';
import { lazyLoadImage } from '../../utils/imageUtils';
import { Link } from 'react-router-dom';
import { checkApiUrl } from '../../hooks/checkApiUrl';
import { Calendar } from 'lucide-react';

// Memoized news card component
const NewsCard = memo(({ newsItem, imageUrl, newsRef }) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Check if dark mode is enabled
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(isDarkMode ? 'dark' : 'light');

        // Listen for changes in color scheme
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const generateDetailsUrl = (title) => {
        return `/news/${encodeURIComponent(title.replace(/\s+/g, '-'))}/details`;
    };

    return (
        <motion.article
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col min-w-[250px] 
                     h-[420px] sm:h-[450px] text-center items-center justify-between relative"
            whileHover={{
                scale: 1.03,
                boxShadow: "0 25px 30px -12px rgba(0, 0, 0, 0.2)"
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Link
                to={generateDetailsUrl(newsItem.title)}
                className="block h-full w-full"
                aria-label={`Read more about ${newsItem.title}`}
            >
                <div className="relative h-56 sm:h-60 overflow-hidden">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <motion.img
                        ref={newsRef}
                        src={imageUrl}
                        alt={newsItem.title}
                        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        onLoad={() => setIsLoading(false)}
                        animate={{ scale: isHovered ? 1.08 : 1 }}
                        transition={{ duration: 0.5 }}
                    />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                        animate={{ opacity: isHovered ? 0.8 : 0.4 }}
                        transition={{ duration: 0.3 }}
                    />
                    <motion.div
                        className="absolute bottom-4 left-4 flex items-center bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full shadow-md"
                        animate={{ y: isHovered ? 0 : 5, opacity: isHovered ? 1 : 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Calendar className="w-4 h-4 text-green-600 dark:text-yellow-600 mr-1" />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                            {new Date(newsItem.created_at).toLocaleDateString('en-PS')}
                        </p>
                    </motion.div>
                </div>
                <div className="p-5 flex flex-col justify-between h-[calc(100%-224px)] sm:h-[calc(100%-240px)]">
                    <div>
                        <motion.h3
                            className="text-lg font-bold text-black dark:text-white mb-3 line-clamp-2 sm:line-clamp-3 overflow-hidden text-center"
                            transition={{ duration: 0.3 }}
                            dir='rtl'
                        >
                            {newsItem.title}
                        </motion.h3>
                    </div>
                    <motion.div
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md w-full text-center mt-2"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                        dir='rtl'
                    >
                        <span>عرض الخبر كامل</span>
                    </motion.div>
                </div>
            </Link>
        </motion.article>
    );
});

const NewsSection = () => {
    const { data, isLoading, error } = useHomeData();
    const newsRefs = useRef({});
    const [renderedNews, setRenderedNews] = useState([]);

    // Process news data when it arrives
    useEffect(() => {
        if (data?.newss) {
            // Take latest 4 news items and reverse to show newest first
            const latestNews = [...data.newss].slice(-4).reverse();
            setRenderedNews(latestNews);
        }
    }, [data]);

    // Setup lazy loading for images once component is mounted
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            },
            { rootMargin: '100px' }
        );

        // Observe all image refs
        Object.values(newsRefs.current).forEach(ref => {
            if (ref) {
                observer.observe(ref);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [renderedNews]);

    if (isLoading) {
        return (
            <section className="py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
                        أخبار الدار 
                    </h2>


                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-lg overflow-hidden h-[420px]">
                                <Skeleton height={224} />
                                <div className="p-4">
                                    <Skeleton height={24} width="80%" />
                                    <Skeleton height={16} width="40%" className="mt-2" />
                                    <Skeleton height={48} className="mt-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
                        أخبار الدار
                    </h2>
                    <div className="p-4 text-center" dir="rtl">
                        <p className="text-red-600 bg-red-50 p-4 rounded-lg">
                            فشل تحميل الأخبار: {error.message || 'خطأ في الاتصال بالخادم'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // If no news items available
    if (!renderedNews || renderedNews.length === 0) {
        return (
            <section className="py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
                        أخبار الدار
                    </h2>
                    
                    <div className="p-4 text-center" dir="rtl">
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                            لا توجد أخبار متاحة حالياً
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-4 sm:py-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
                    أخبار الدار
                </h2>
                <div className="w-24 h-1  my-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {renderedNews.map((item) => {
                        const imageUrl = item.image ? checkApiUrl(getImageUrl(item.image)) : '/placeholder-news.jpg';

                        return (
                            <NewsCard
                                key={item.id || `news-${item.title}`}
                                newsItem={item}
                                imageUrl={imageUrl}
                                newsRef={el => newsRefs.current[item.id] = el}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default memo(NewsSection);