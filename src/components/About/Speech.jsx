import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';
import { useSpeech } from '../../api/queries';
import { checkApiUrl } from '../../hooks/checkApiUrl';
// Add this import at the top
// import backgroundPattern from '../../assets/images/islamic-pattern.jpg';

const Speech = () => {
    const { data: speechData, isLoading, error } = useSpeech();

    // Function to format image path


    if (isLoading) {
        return (
            <div className="min-h-screen mt-64 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-8">
                        <div className="skeleton-title w-1/3 mx-auto"></div>
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3 space-y-4">
                                    <div className="skeleton-image w-40 h-40 rounded-full mx-auto"></div>
                                    <div className="skeleton-text w-1/2 mx-auto"></div>
                                </div>
                                <div className="md:w-2/3 space-y-4">
                                    <div className="skeleton-text w-full"></div>
                                    <div className="skeleton-text w-5/6"></div>
                                    <div className="skeleton-text w-4/6"></div>
                                </div>
                            </div>
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

    if (!speechData || !speechData.directors[0]) {
        return (
            <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
                <p className="text-gray-600">لا توجد بيانات متاحة</p>
            </div>
        );
    }

    return (
        <>
            <title>كلمة المدير - دار الإتقان</title>
            <meta name="description" content="كلمة مدير دار الإتقان للتعليم والتدريب" />

            <div className="relative min-h-screen bg-warm-gray-50 py-24 px-4 sm:px-6 lg:px-8">
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                // style={{ backgroundImage: `url(${backgroundPattern})` }}
                ></div>

                <div className="max-w-7xl mx-auto">
                    <div className="mb-6" dir="rtl">
                        <nav className="flex items-center text-gray-600 text-sm">
                            <Link to="/" className="flex items-center hover:text-green-600">
                                <Home className="w-4 h-4 ml-1" />
                                الرئيسية
                            </Link>
                            <ChevronLeft className="w-4 h-4 mx-2" />
                            <span className="text-green-600">كلمة رئيس الدار</span>
                        </nav>
                    </div>

                    <div className="relative bg-white shadow-xl rounded-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-emerald-600 to-teal-600"></div>

                        <div className="text-center py-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                كلمة رئيس الدار
                            </h1>
                            <div className="w-32 h-1 bg-emerald-500 mx-auto"></div>
                        </div>

                        <div className="px-6 md:px-12 pb-16">
                            <div className="flex flex-col md:flex-row-reverse gap-12">
                                <div className="md:w-2/5">
                                    <div className="sticky top-8">
                                        <div className="relative">
                                            <div className="absolute inset-0 transform rotate-3 rounded-3xl"></div>

                                            <div className="relative p-6">
                                                <img
                                                    className="w-full h-96 object-cover rounded-2xl shadow-xl"
                                                    src={checkApiUrl(speechData.directors[0].image)}
                                                    alt={speechData.directors[0].name || 'رئيس الدار'}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                <div className="mt-6 text-center">
                                                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                                        {speechData.directors[0].name || 'رئيس الدار'}
                                                    </h2>
                                                    <p className="text-xl text-emerald-600 font-semibold">
                                                        {speechData.directors[0].postion || 'رئيس دار الإتقان'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:w-3/5" dir="rtl">
                                    <div className="prose prose-lg max-w-none">
                                        <h3 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-8">
                                            بسم الله الرحمن الرحيم
                                        </h3>
                                        <div className="space-y-6">
                                            {speechData.speechs[0].speech.split('\n').map((paragraph, index) => (
                                                <p key={index} className="text-xl leading-relaxed text-gray-700 dark:text-gray-200">
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Speech;