import React, { useEffect, useState, useRef, memo, useCallback } from 'react';
import { apiClient } from '../../api/queries';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { checkApiUrl } from '../../hooks/checkApiUrl';

// Memoize the SkeletonCard component
const SkeletonCard = memo(() => (
    <motion.div
        className="flex flex-col md:flex-row items-stretch rounded-xl border-2 shadow-lg overflow-hidden w-full min-h-[500px] bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        {/* Image Skeleton */}
        <div className="relative w-full md:w-2/5 h-48 md:h-auto bg-gray-200 animate-pulse overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_2s_infinite]" />
        </div>

        {/* Navigation Dots */}
        <div className="flex md:flex-col justify-center gap-3 p-4 md:px-8">
            {[1, 2, 3].map((_, index) => (
                <div
                    key={index}
                    className={`w-2 md:w-3 h-2 md:h-3 rounded-full bg-gray-200 animate-pulse
                        ${index === 0 ? 'w-3 md:w-4 h-3 md:h-4' : ''}`}
                />
            ))}
        </div>

        {/* Content Skeleton */}
        <div className="flex-grow p-4 md:p-10">
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto space-y-6">
                {/* Title Skeleton */}
                <div className="w-3/4 h-8 bg-gray-200 rounded-lg animate-pulse" />

                {/* Description Lines */}
                <div className="space-y-4 w-full">
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-4/6 h-4 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Button Skeleton */}
                <div className="w-32 md:w-48 h-12 bg-gray-200 rounded-lg animate-pulse" />
            </div>
        </div>
    </motion.div>
));

// Add shimmer animation styles
const SkeletonStyles = () => (
    <style>
        {`
        @keyframes shimmer {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(100%);
            }
        }
        `}
    </style>
);

// Memoize the card content component
const GeniusCardContent = memo(({ genius, isExpanded, onExpand }) => (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto py-4 md:py-0 space-y-6 md:space-y-8 text-center">
        <h3 className="font-semibold text-xl md:text-3xl">
            {genius.name}
        </h3>
        <p className={`text-base md:text-lg text-gray-600 leading-relaxed max-w-screen-2xl ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {genius.details}
        </p>
        {!isExpanded && (
            <div className="w-32 md:w-48 bg-green-600 text-white text-center py-3 md:py-4 rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base">
                عرض القصة
            </div>
        )}
    </div>
));

const GeniusesSection = memo(() => {
    const [geniuses, setGeniuses] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGenius, setSelectedGenius] = useState(null);
    const timerRef = useRef(null);
    const observerRef = useRef(null);
    const sectionRef = useRef(null);

    // Optimized image loading with priority hints
    const preloadNextImage = useCallback((index) => {
        if (!geniuses[index]) return;
        const img = new Image();
        img.fetchPriority = "low";
        img.loading = "lazy";
        img.src = checkApiUrl(geniuses[index].image);
    }, [geniuses]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get('/home/API', {
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'max-age=300' // 5 minute cache
                    }
                });
                const geniusData = response?.data?.geniuses || [];
                setGeniuses(geniusData);

                // Preload next 2 images
                if (geniusData.length > 0) {
                    preloadNextImage(1);
                    preloadNextImage(2);
                }
            } catch (error) {
                console.error("Error fetching geniuses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [preloadNextImage]);

    // Optimized intersection observer setup
    useEffect(() => {
        if (!sectionRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    // Start timer only when visible
                    if (!timerRef.current && geniuses.length > 1) {
                        timerRef.current = setInterval(() => {
                            setCurrentIndex(prev => (prev + 1) % geniuses.length);
                        }, 5000);
                    }
                } else {
                    // Clear timer when not visible
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                }
            },
            { threshold: 0.1 }
        );

        observerRef.current.observe(sectionRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [geniuses.length]);

    // Memoized modal state management
    const handleModalOpen = useCallback((genius) => {
        setSelectedGenius(genius);
        // Pause rotation when modal is open
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleModalClose = useCallback(() => {
        setSelectedGenius(null);
        // Resume rotation when modal is closed
        if (!timerRef.current && geniuses.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % geniuses.length);
            }, 5000);
        }
    }, [geniuses.length]);

    if (isLoading) return (
        <section className="relative py-8 md:py-16 min-h-screen overflow-hidden">
            <SkeletonStyles />
            <div className="container mx-auto text-center relative px-4">
                <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto mb-8 md:mb-16" />
                <SkeletonCard />
            </div>
        </section>
    );

    const currentGenius = geniuses[currentIndex];

    return (
        <>
            {/* <title>نوابغ دار الإتقان</title> */}
            <meta name="description" content="تعرف على نوابغ دار الإتقان للتعليم والتدريب" />
            <meta name="keywords" content="نوابغ, دار الإتقان, طلاب متميزون" />
            <meta property="og:title" content="نوابغ دار الإتقان" />
            <meta property="og:description" content="تعرف على نوابغ دار الإتقان للتعليم والتدريب" />

            <section className="relative py-8 md:py-16 min-h-screen overflow-hidden" ref={sectionRef}>
                <div className="container mx-auto text-center relative px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center  text-gray-800">نوابغ الإتقان</h2>
                    <div className="w-24 h-1  my-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />
                    <div className="bg-white flex items-center justify-between w-full">
                        <motion.div
                            onClick={() => handleModalOpen(currentGenius)}
                            whileHover={{ scale: 1.02 }}
                            className="flex flex-col md:flex-row items-stretch rounded-xl border-2 shadow-lg overflow-hidden w-full min-h-[500px] cursor-pointer"
                        >
                            <div className="relative w-full md:w-2/5 h-48 md:h-auto overflow-hidden">
                                <img
                                    src={checkApiUrl(currentGenius?.image)}
                                    alt={currentGenius?.name}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    width="800"
                                    height="600"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-genius.jpg';
                                    }}
                                />
                            </div>

                            <div className="flex md:flex-col justify-center gap-3 p-4 md:px-8">
                                {geniuses.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentIndex(index);
                                        }}
                                        className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 
                                            ${currentIndex === index ? 'bg-green-500 w-3 md:w-4 h-3 md:h-4' : 'bg-green-100'}`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <div className="flex-grow p-4 md:p-10">
                                <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto">
                                    <h3 className="font-semibold text-xl md:text-3xl mb-4">{currentGenius?.name}</h3>
                                    <p className="text-base md:text-lg text-gray-600 leading-relaxed line-clamp-3 mb-6">
                                        {currentGenius?.details}
                                    </p>
                                    <div className="w-32 md:w-48 bg-green-600 text-white text-center py-3 md:py-4 rounded-lg 
                                        hover:bg-green-700 transition-colors text-sm md:text-base">
                                        عرض القصة
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {selectedGenius && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="bg-white rounded-2xl w-[95vw] md:w-[90vw] max-w-7xl h-[90vh] md:h-[80vh] overflow-hidden shadow-2xl"
                            >
                                <div className="relative h-full">
                                    <button
                                        onClick={handleModalClose}
                                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/70 text-white rounded-full hover:bg-black transition-colors z-10"
                                    >
                                        <X size={24} />
                                    </button>

                                    <div className="grid md:grid-cols-2 h-full">
                                        <div className="order-2 md:order-1 h-full">
                                            <motion.img
                                                src={checkApiUrl(selectedGenius.image)}
                                                alt={selectedGenius.name}
                                                className="w-full h-full object-cover"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-genius.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className="order-1 md:order-2 p-6 md:p-8 overflow-y-auto" dir="rtl">
                                            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto">
                                                <motion.h2
                                                    className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center"
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    {selectedGenius.name}
                                                </motion.h2>
                                                <motion.p
                                                    className="text-gray-600 text-base md:text-lg text-center"
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    {selectedGenius.details}
                                                </motion.p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </>
    );
});

export default GeniusesSection;