import React from 'react';

export const AchievementsSkeleton = () => {
    return (
        <section className="py-32">
            <div className="container mx-auto px-4">
                {/* Section Header Skeleton */}
                <div className="text-center mb-20">
                    <div className="inline-block">
                        <div className="h-12 w-64 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                        <div className="w-24 h-1 bg-gray-200 mx-auto rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                        <div key={index} className="group">
                            <div className="relative">
                                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    {/* Floating Icon Skeleton */}
                                    <div className="absolute -top-6 right-6 w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>

                                    {/* Card Content Skeleton */}
                                    <div className="pt-12 px-6 pb-6 text-center">
                                        {/* Title Skeleton */}
                                        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>

                                        <div className="space-y-4">
                                            {/* Counter Skeleton */}
                                            <div className="text-center">
                                                <div className="h-16 w-40 bg-gray-200 rounded animate-pulse mx-auto"></div>
                                            </div>

                                            {/* Progress Bar Skeleton */}
                                            <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="absolute left-0 top-0 h-full w-3/4 bg-gray-200 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Achievement Badge Skeleton */}
                                    <div className="absolute top-2 left-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AchievementsSkeleton;