import React, { useState } from 'react';
// import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';

const ContactSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="lg:w-3/5 p-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg w-full"></div>
                ))}
                <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
            </div>
        </div>
        <div className="lg:w-2/5 bg-green-600 p-8">
            <div className="space-y-8">
                <div className="h-8 bg-green-500 rounded w-2/3"></div>
                <div className="h-24 bg-green-500 rounded w-full"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-6 bg-green-500 rounded w-3/4"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('api.ditq.org/contact-us/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('تم إرسال رسالتك بنجاح');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            } else {
                throw new Error(data.message || 'حدث خطأ ما');
            }
        } catch (error) {
            toast.error(error.message || 'حدث خطأ في إرسال الرسالة');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <title>اتصل بنا - دار الإتقان</title>
            <meta name="description" content="تواصل مع دار الإتقان للتعليم والتدريب" />
            <meta name="keywords" content="اتصل بنا, دار الإتقان, تواصل" />
            <meta property="og:title" content="اتصل بنا - دار الإتقان" />
            <meta property="og:description" content="تواصل مع دار الإتقان للتعليم والتدريب" />

            <section className="py-16 " dir="rtl">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center mb-16 text-gray-800">نسعد بتواصلك</h1>

                    {isLoading ? (
                        <ContactSkeleton />
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Contact Form */}
                            <div className="lg:w-3/5 p-8">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-800">اتصل بنا</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="الاسم"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="البريد الإلكتروني"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="رقم الجوال"
                                            required
                                            dir='rtl'
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                                            onChange={handleChange}
                                        />
                                        <input
                                            type="text"
                                            name="subject"
                                            placeholder="العنوان"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                                            onChange={handleChange}
                                        />
                                        <textarea
                                            name="message"
                                            placeholder="نص الرسالة"
                                            rows="4"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg font-semibold disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'جاري الإرسال...' : 'إرسال'}
                                    </button>
                                </form>
                            </div>

                            {/* Contact Information */}
                            <div className="lg:w-2/5 bg-green-600 p-8 text-white flex items-center">
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-semibold mb-4 text-white">كن على تواصل دائمًا معنا</h2>
                                    <p className="leading-relaxed">
                                        دار الإتقان لتعليم القرآن مؤسسة قرآنية تشرف على مراكز تعليم القرآن من خلال برامج تربوية
                                        وتعليمية متميزة ومناهج متطورة وكادر كفء
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>المقر - فلسطين - قطاع غزة</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span dir="ltr">+972 59-288-9891</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>daretqan@gmail.com</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default ContactSection;
