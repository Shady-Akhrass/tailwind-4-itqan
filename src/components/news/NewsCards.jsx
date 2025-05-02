import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChevronLeft, Home, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAllNews } from '../../api/queries';
import { checkApiUrl } from '../../hooks/checkApiUrl';

const NewsCard = React.memo(({ newsItem, generateDetailsUrl, newsRef }) => {
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

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    const handleImageLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

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
                to={generateDetailsUrl(newsItem)}
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
                        ref={el => newsRef.current = el}
                        src={imageError ? checkApiUrl(newsItem.image) : checkApiUrl(newsItem.image)}
                        alt={newsItem.title}
                        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        loading="lazy"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
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

const AllNewsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortedNews, setSortedNews] = useState([]);
    const [loadingStates, setLoadingStates] = useState({});
    const itemsPerPage = 12;
    const { data: news = [], isLoading, error } = useAllNews();
    const newsRefs = useRef([]);

    useEffect(() => {
        if (news.length > 0) {
            // Sort by date in descending order (latest first)
            const sorted = [...news].sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );
            setSortedNews(sorted);
        }
    }, [news]);

    const generateDetailsUrl = useCallback((newsItem) => {
        const slug = newsItem.title
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        return `/news/${slug}/details`;
    }, []);

    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const paginatedNews = sortedNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (isLoading) {
        return (
            <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(itemsPerPage)].map((_, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col min-w-[250px] h-[420px] sm:h-[450px]">
                                <div className="relative h-56 sm:h-60 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <Skeleton height="100%" />
                                </div>
                                <div className="p-5 flex flex-col justify-between h-[calc(100%-224px)] sm:h-[calc(100%-240px)]" dir='rtl'>
                                    <div>
                                        <Skeleton height={28} className="mb-3" />
                                        <Skeleton height={20} width={100} className="mb-4" />
                                    </div>
                                    <Skeleton height={50} className="rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <span className="text-red-600 dark:text-red-400 text-4xl">!</span>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">عذراً، حدث خطأ</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">لم نتمكن من تحميل الأخبار. الرجاء المحاولة مرة أخرى لاحقاً.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
            <title>أخبار دار الإتقان</title>
            <meta name="description" content="آخر أخبار وفعاليات دار الإتقان" />

            <div className="max-w-7xl mx-auto mb-8" dir="rtl">
                <nav className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                    <Link to="/" className="flex items-center hover:text-green-600 dark:hover:text-yellow-500 transition-colors">
                        <Home className="w-4 h-4 ml-1" />
                        الرئيسية
                    </Link>
                    <ChevronLeft className="w-4 h-4 mx-2" />
                    <span className="text-green-600 dark:text-yellow-500 font-medium">كافة الأخبار</span>
                </nav>

                <motion.h1
                    className="text-3xl sm:text-4xl font-bold text-black dark:text-white mt-6 text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    أخبار الدار
                </motion.h1>
            </div>

            <motion.div
                className="max-w-7xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {paginatedNews.map((newsItem, index) => {
                        newsRefs.current[index] = { current: null };
                        return (
                            <NewsCard
                                key={newsItem.id}
                                newsItem={newsItem}
                                generateDetailsUrl={generateDetailsUrl}
                                newsRef={newsRefs.current[index]}
                            />
                        );
                    })}
                </div>

                {news.length > itemsPerPage && (
                    <motion.div
                        className="mt-16 flex justify-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            aria-label="Previous page"
                        >
                            <IoChevronBackOutline className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                        </button>
                        {[...Array(Math.ceil(news.length / itemsPerPage))].map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handlePageChange(index + 1)}
                                className={`w-12 h-12 rounded-lg font-medium ${currentPage === index + 1
                                    ? 'bg-green-600 dark:bg-yellow-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                                    } transition-colors`}
                                aria-label={`Page ${index + 1}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                {index + 1}
                            </motion.button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === Math.ceil(news.length / itemsPerPage)}
                            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            aria-label="Next page"
                        >
                            <IoChevronForwardOutline className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default AllNewsPage;