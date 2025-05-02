import React from 'react';

const SectionSkeleton = () => {
    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-green-700 dark:[&::-webkit-scrollbar-thumb]:bg-yellow-400 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Navigation Path Skeleton */}
            <div className="max-w-7xl mx-auto mb-6" dir="rtl">
                <div className="flex items-center text-gray-600 text-sm">
                    <div className="flex items-center hover:text-green-600">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse ml-1"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mr-1"></div>
                    </div>
                    <div className="mx-2 h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Facebook Section Skeleton */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="sticky top-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-5 w-5 bg-blue-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="h-[500px] bg-gray-100 rounded animate-pulse">
                                    <div className="p-4 space-y-4">
                                        {[1, 2, 3, 4].map((index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                                </div>
                                                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                    <div className="text-center mb-8">
                        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </div>

                    {/* Content Cards Skeleton */}
                    {[1].map((index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                            {/* Carousel Skeleton */}
                            <div className="relative aspect-video bg-gray-200 animate-pulse">
                                {/* Carousel dots */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                                    {[1, 2, 3].map((dot) => (
                                        <div key={dot} className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Content Text Skeleton */}
                            <div className="p-6">
                                <div className="space-y-4" dir="rtl">
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SectionSkeleton;