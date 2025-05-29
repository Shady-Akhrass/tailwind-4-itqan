import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/queries';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { checkApiUrl } from '../../hooks/checkApiUrl';

// Project Skeleton Component
const ProjectSkeleton = () => (
    <section className="relative py-24 min-h-screen overflow-hidden">
        <div className="container mx-auto relative px-4">
            {/* Title Skeleton */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mb-12 md:mb-16"
            >
                <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </motion.div>

            <div className="relative h-[600px] flex flex-col items-center justify-center">
                <div className="w-full max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col-reverse md:flex-row-reverse h-[500px]"
                    >
                        {/* Content Skeleton */}
                        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center">
                            <div className="flex flex-col items-center justify-center h-full w-full space-y-6">
                                {/* Title Skeleton */}
                                <div className="w-3/4 h-8 bg-gray-200 rounded-lg animate-pulse"></div>

                                {/* Description Lines */}
                                <div className="space-y-4 w-full" dir='rtl'>
                                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="w-4/6 h-4 bg-gray-200 rounded animate-pulse"></div>
                                </div>

                                {/* Button Skeleton */}
                                <div className="w-32 md:w-48 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>

                        {/* Image Skeleton */}
                        <div className="md:w-1/2 relative overflow-hidden h-full">
                            <div className="w-full h-full bg-gray-200 animate-pulse">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_2s_infinite]"></div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                    </motion.div>
                </div>

                {/* Progress Dots Skeleton */}
                <div className="absolute bottom-[-40px] flex justify-center gap-3">
                    {[1, 2, 3].map((_, index) => (
                        <div
                            key={index}
                            className={`rounded-full bg-gray-200 animate-pulse
                                ${index === 0 ? 'w-3 md:w-4 h-3 md:h-4' : 'w-2 md:w-3 h-2 md:h-3'}`}
                        ></div>
                    ))}
                </div>
            </div>
        </div>

        {/* Add shimmer animation */}
        <style>{`
            @keyframes shimmer {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(100%);
                }
            }
        `}</style>
    </section>
);

const ProjectsSection = () => {
    const [projects, setProjects] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const getImageUrl = (image) => {
        if (!image) return '/placeholder-project.jpg';
        return image.startsWith('http') ? image : `https://api.ditq.org${image}`;
    };

    useEffect(() => {
        apiClient.get('/home/API', {
            headers: {
                'Accept': 'application/json'
            }
        })
            .then((response) => {
                const projectsData = response.data.donate || [];
                setProjects(projectsData);
            })
            .catch((error) => {
                console.error("Error fetching projects:", error);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [projects.length]);

    const openModal = (project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    if (isLoading) {
        return <ProjectSkeleton />;
    }

    if (!projects || projects.length === 0) return null;

    const currentProject = projects[currentIndex];

    return (
        <>
            <meta name="description" content="مشاريع باحاجة لدعمكم" />
            <meta name="keywords" content="مشاريع باحاجة لدعمكم" />
            <meta property="og:title" content="مشاريع باحاجة لدعمكم" />
            <meta property="og:description" content="مشاريع باحاجة لدعمكم" />

            <section className="relative py-24 min-h-screen overflow-hidden" dir='rtl'>
                <div className="container mx-auto relative px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-bold text-center text-gray-800"
                    >
                        مشاريع بحاجة لدعمكم
                    </motion.h2>
                    <div className="w-24 h-1  my-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />

                    <div className="relative h-[600px] flex flex-col items-center justify-center">
                        <AnimatePresence initial={false}>
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="absolute w-full max-w-5xl"
                            >
                                <motion.div
                                    whileHover={{
                                        scale: 1.02,
                                        boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.15)"
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col-reverse md:flex-row-reverse h-[500px]"
                                >
                                    <motion.div
                                        className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center"
                                        whileHover={{ backgroundColor: "#f8fafc" }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full w-full">
                                            <motion.h3
                                                className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800 text-center"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                {currentProject?.title}
                                            </motion.h3>

                                            <motion.p
                                                className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 text-center line-clamp-3"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                {currentProject?.details}
                                            </motion.p>

                                            <div className="flex justify-center">
                                                <motion.button
                                                    onClick={() => openModal(currentProject)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-32 md:w-48 bg-green-600 text-white text-center py-3 md:py-4 rounded-lg 
                                                        hover:bg-green-700 transition-all duration-300 transform hover:shadow-lg text-sm md:text-base"
                                                >
                                                    عرض التفاصيل
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div className="md:w-1/2 relative overflow-hidden group h-full">
                                        <motion.img
                                            src={checkApiUrl(getImageUrl(currentProject?.image))}
                                            alt={currentProject?.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-project.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Dots */}
                        <div className="absolute bottom-[-40px] flex justify-center gap-3">
                            {projects.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 
                                        ${currentIndex === index ? 'bg-green-500 w-3 md:w-4 h-3 md:h-4' : 'bg-green-100'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {isModalOpen && selectedProject && (
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
                                        onClick={closeModal}
                                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/70 text-white rounded-full hover:bg-black transition-colors z-10"
                                    >
                                        <X size={24} />
                                    </button>

                                    <div className="grid md:grid-cols-2 h-full">
                                        
                                        <div className="order-1 md:order-2 p-6 md:p-8 overflow-y-auto flex flex-col items-center justify-center" dir="rtl">
                                            <div className="flex flex-col items-center justify-center h-full max-w-lg w-full mx-auto">
                                                <motion.h2
                                                    className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 text-center"
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    {selectedProject.title}
                                                </motion.h2>
                                                <motion.p
                                                    className="text-gray-600 mb-6 text-base md:text-lg text-center"
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    {selectedProject.details}
                                                </motion.p>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-full md:w-48 bg-green-600 text-white text-center py-3 md:py-4 rounded-lg 
                                                        hover:bg-green-700 transition-all duration-300 hover:shadow-lg text-sm md:text-base"
                                                >
                                                    دعم المشروع
                                                </motion.button>
                                            </div>
                                        </div>
                                        <div className="order-2 md:order-1 h-full p-6 md:p-8 overflow-y-auto flex items-center justify-center">
                                            <motion.img
                                                src={checkApiUrl(getImageUrl(selectedProject.image))}
                                                alt={selectedProject.title}
                                                className="w-full h-auto max-h-full object-cover rounded-lg"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-project.jpg';
                                                }}
                                            />
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
};

export default ProjectsSection;