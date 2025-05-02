import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';

const LoadingState = () => (
    <div className="min-h-screen mt-64 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
                <div className="skeleton-title w-1/3 mx-auto"></div>
                <div className="skeleton-card h-[500px]"></div>
                <div className="skeleton-text w-2/3 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton-card h-24"></div>
                    ))}
                </div>
            </div> 
        </div>
    </div>
);

const Branches = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    const branches = [
        'فرع غزة',
        'فرع الوسطى',
        'فرع الشمال',
        'فرع خانيونس',
        'فرع رفح'
    ];

    if (isLoading) return <LoadingState />;

    return (
        <>
            <title>فروع دار الإتقان</title>
            <meta name="description" content="فروع دار الإتقان للتعليم والتدريب في غزة" />
            <meta name="keywords" content="فروع, دار الإتقان, غزة" />
            <meta property="og:title" content="فروع دار الإتقان" />
            <meta property="og:description" content="فروع دار الإتقان للتعليم والتدريب في غزة" />

            <div className="relative min-h-screen bg-warm-gray-50 py-24 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 opacity-5 bg-[url('/path/to/islamic-pattern.svg')] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto">
                    <div className="mb-6" dir="rtl">
                        <nav className="flex items-center text-gray-600 text-sm">
                            <Link to="/" className="flex items-center hover:text-green-600">
                                <Home className="w-4 h-4 ml-1" />
                                الرئيسية
                            </Link>
                            <ChevronLeft className="w-4 h-4 mx-2" />
                            <span className="text-green-600">فروع الدار</span>
                        </nav>
                    </div>

                    <div className="relative bg-white shadow-xl rounded-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-emerald-600 to-teal-600"></div>

                        <div className="text-center py-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                فروع الدار
                            </h1>
                            <div className="w-32 h-1 bg-emerald-500 mx-auto"></div>
                        </div>

                        <div className="px-6 md:px-12 pb-16">
                            <div className="mb-12 rounded-xl overflow-hidden shadow-lg h-[500px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d727.4593171648501!2d34.46291217081485!3d31.51169914217265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x99e1d7ece5501508!2zMzHCsDMwJzQyLjEiTiAzNMKwMjcnNDQuNSJF!5e1!3m2!1sar!2s!4v1672570219244!5m2!1sar!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>

                            <div className="text-center mb-12" dir="rtl">
                                <h5 className="text-xl md:text-2xl font-semibold text-gray-800">
                                    تضم الدار أكثر من 150 حلقة و مركز موزعين في مناطق قطاع غزة
                                </h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
                                {branches.map((branch, index) => (
                                    <div
                                        key={index}
                                        className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 text-center">
                                            {branch}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Branches;
