import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../../api/queries';

const MessageSkeleton = () => (
    <section className="relative py-16 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
            {/* Title Skeleton */}
            <div className="flex items-center justify-center mb-16">
                <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16">
                {/* Mission Card Skeleton */}
                <div className="w-full lg:w-2/3 max-w-2xl">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/50 to-yellow-600/50 rounded-2xl transform -rotate-1"></div>
                        <div className="relative bg-white p-12 rounded-2xl shadow-lg">
                            <div className="flex items-center mb-6" dir='rtl'>
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vision Card Skeleton */}
                <div className="w-full lg:w-2/3 max-w-2xl">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/50 to-green-600/50 rounded-2xl transform rotate-1"></div>
                        <div className="relative bg-white p-12 rounded-2xl shadow-lg">
                            <div className="flex items-center mb-6" dir='rtl'>
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const MessageSection = () => {
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');
    const [activeCard, setActiveCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/home/API')
            .then((response) => {
                setVision(response.data.homes[0].vision);
                setMission(response.data.homes[0].mission);
            })
            .catch((error) => {
                console.error("Error fetching vision and mission:", error);
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <MessageSkeleton />;
    }

    const cardVariants = {
        hover: {
            scale: 1.05,
            transition: { duration: 0.3 }
        },
        tap: {
            scale: 0.95
        }
    };

    return (
        <>
            {/* <title>رؤيتنا ورسالتنا - دار الإتقان</title> */}
            <meta name="description" content="رؤية ورسالة دار الإتقان للتعليم والتدريب" />
            <meta name="keywords" content="رؤية, رسالة, دار الإتقان" />
            <meta property="og:title" content="رؤيتنا ورسالتنا - دار الإتقان" />
            <meta property="og:description" content="رؤية ورسالة دار الإتقان للتعليم والتدريب" />

            <section className="relative py-16  overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl font-bold text-center text-gray-800">
                        <span className="text-green-600">رؤيتنا</span> ورسالتنا
                    </h2>
                    <div className="w-24 h-1  my-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />

                    <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-16">
                        {/* Mission Card */}
                        <motion.div
                            className={`w-full lg:w-2/3 max-w-2xl ${activeCard === 'mission' ? 'z-20' : 'z-10'}`}
                            variants={cardVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setActiveCard('mission')}
                            role="button"
                            aria-pressed={activeCard === 'mission'}
                            tabIndex={0}
                            onKeyPress={(e) => e.key === 'Enter' && setActiveCard('mission')}
                        >
                            <div className="relative group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform"></div>
                                <div className="relative bg-white p-12 rounded-2xl shadow-lg">
                                    <div className="flex items-center mb-6" dir='rtl'>
                                        <span className="text-3xl text-yellow-500 mr-3">🚀</span>
                                        <h2 className="text-2xl font-bold text-gray-800" >رسالتنا</h2>
                                    </div>
                                    <p className="text-lg leading-relaxed text-gray-600" dir='rtl'>{mission}</p>
                                </div>
                            </div>
                        </motion.div>
                        {/* Vision Card */}
                        <motion.div
                            className={`w-full lg:w-2/3 max-w-2xl ${activeCard === 'vision' ? 'z-20' : 'z-10'}`}
                            variants={cardVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setActiveCard('vision')}
                            role="button"
                            aria-pressed={activeCard === 'vision'}
                            tabIndex={0}
                            onKeyPress={(e) => e.key === 'Enter' && setActiveCard('vision')}
                        >
                            <div className="relative group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
                                <div className="relative bg-white p-12 rounded-2xl shadow-lg">
                                    <div className="flex items-center mb-6" dir='rtl'>
                                        <span className="text-3xl text-green-500 mr-3" >🎯</span>
                                        <h2 className="text-2xl font-bold text-gray-800">رؤيتنا</h2>
                                    </div>
                                    <p className="text-lg leading-relaxed text-gray-600" dir='rtl'>{vision}</p>
                                </div>
                            </div>
                        </motion.div>


                    </div>
                </div>
            </section>
        </>
    );
};

export default MessageSection;
