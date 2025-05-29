import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../../api/queries';
import soundCloud from '../../assets/images/image.png';

const SoundSkeleton = () => (
    <section className="relative py-16 min-h-screen overflow-hidden">
        <div className="container mx-auto text-center relative px-4">
            {/* Title Skeleton */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mb-16"
            >
                <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </motion.div>

            <div className="flex items-center justify-between w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-stretch rounded-xl border-2 border-gray-300 shadow-sm overflow-hidden w-full min-h-[450px]"
                >
                    {/* Left - SoundCloud Player Skeleton */}
                    <div className="w-3/5 flex-shrink-0 relative overflow-hidden">
                        <div className="w-full h-[450px] bg-gray-200 animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_2s_infinite]"></div>
                        </div>

                        {/* Fake Player Controls */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-100 p-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-2 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-2 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Image Skeleton */}
                    <div className="w-2/5 flex items-center justify-center p-8 bg-gray-50">
                        <div className="w-full h-full max-h-[450px] bg-gray-200 rounded-2xl animate-pulse"></div>
                    </div>
                </motion.div>
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

const SoundSection = () => {
    const [soundData, setSoundData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/home/API')
            .then((response) => {
                if (response.data && response.data.sound && response.data.sound.length > 0) {
                    setSoundData(response.data.sound[0]); // Get first item from array
                }
            })
            .catch((error) => {
                console.error("Error fetching sound data:", error);
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <SoundSkeleton />;
    }

    if (!soundData) return null;

    return (
        <section className="relative py-16 min-h-screen overflow-hidden" dir='rtl'>
            <div className="container mx-auto text-center relative px-4">
                <h2 className="text-4xl font-bold text-center  text-gray-800">{soundData.title}</h2>
                <div className="w-24 h-1  my-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />

                <div className="flex items-center justify-between w-full">
                    <div className="flex items-stretch rounded-xl border-2 border-gray-300 shadow-sm overflow-hidden w-full min-h-[450px]">
                        {/* Right - Image */}
                        <div className="w-2/5 flex items-center justify-center p-8 ">
                            <img
                                src={soundCloud}
                                alt="SoundCloud App"
                                className="max-w-full h-auto max-h-[450px] object-contain rounded-2xl shadow-md"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = soundCloud;
                                }}
                            />
                        </div>
                        {/* Left - SoundCloud Player */}
                        <div className="w-3/5 flex-shrink-0">
                            <iframe
                                title={soundData.name}
                                width="100%"
                                height="450"
                                scrolling="no"
                                frameBorder="no"
                                allow="autoplay"
                                src={soundData.main}
                                className="w-full h-full"
                            />
                        </div>


                    </div>
                </div>
            </div>
        </section>
    );
};

export default SoundSection;