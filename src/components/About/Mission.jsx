import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';
import { useHomeData } from '../../api/queries';

const MessageSection = () => {
    const { data: homeData, isLoading, error } = useHomeData();
    const [activeCard, setActiveCard] = useState(null);

    const vision = homeData?.homes?.[0]?.vision || '';
    const mission = homeData?.homes?.[0]?.mission || '';

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        },
        hover: {
            scale: 1.02,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transition: { duration: 0.3 }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen mt-64 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-8">
                        <div className="skeleton-title w-1/3 mx-auto"></div>
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="skeleton-card h-64 backdrop-blur-sm"></div>
                            <div className="skeleton-card h-64 backdrop-blur-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <p className="text-red-600">عذراً، حدث خطأ أثناء تحميل البيانات</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <title>رؤيتنا ورسالتنا - دار الإتقان</title>
            <meta name="description" content="رؤية ورسالة دار الإتقان للتعليم والتدريب" />

            <div className="relative min-h-screen bg-gradient-to-b from-warm-gray-50 to-white py-24 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 opacity-5 bg-[url('/../../assets')] bg-repeat pointer-events-none"></div>

                <motion.div
                    className="max-w-7xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <div className="mb-6" dir="rtl">
                        <nav className="flex items-center text-gray-600 text-sm">
                            <Link to="/" className="flex items-center hover:text-green-600">
                                <Home className="w-4 h-4 ml-1" />
                                الرئيسية
                            </Link>
                            <ChevronLeft className="w-4 h-4 mx-2" />
                            <span className="text-green-600">رؤيتنا ورسالتنا</span>
                        </nav>
                    </div>

                    <div className="relative bg-white shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/90">
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600"></div>

                        <motion.div
                            className="text-center py-16"
                            variants={cardVariants}
                        >
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                رؤيتنا ورسالتنا
                            </h1>
                            <div className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
                        </motion.div>

                        <div className="px-6 md:px-12 pb-16">
                            <div className="grid gap-12 md:grid-cols-2" dir="rtl">
                                {/* Vision Card */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover="hover"
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 transform rotate-1 rounded-2xl transition-all duration-300 group-hover:rotate-2 group-hover:scale-105"></div>
                                    <div className="relative bg-white/95 dark:bg-gray-800/95 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
                                        <div className="flex items-center mb-6">
                                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                                                <span className="text-2xl">🎯</span>
                                            </div>
                                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">رؤيتنا</h2>
                                        </div>
                                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-200 pr-4 border-r-2 border-emerald-500">{vision}</p>
                                    </div>
                                </motion.div>

                                {/* Mission Card */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover="hover"
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40 transform -rotate-1 rounded-2xl transition-all duration-300 group-hover:-rotate-2 group-hover:scale-105"></div>
                                    <div className="relative bg-white/95 dark:bg-gray-800/95 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
                                        <div className="flex items-center mb-6">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                                                <span className="text-2xl">🚀</span>
                                            </div>
                                            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-500 bg-clip-text text-transparent">رسالتنا</h2>
                                        </div>
                                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-200 pr-4 border-r-2 border-yellow-500">{mission}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default MessageSection;
