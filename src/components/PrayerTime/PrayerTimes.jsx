import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Search, Clock, Bell, Calendar, ChevronRight } from 'lucide-react';

const IslamicPrayerTimes = () => {
    // Initialize all state variables first
    const [currentTime, setCurrentTime] = useState(new Date());
    const [location, setLocation] = useState({ latitude: 31.5018, longitude: 34.4668 });
    const [city, setCity] = useState('غزة، فلسطين');
    const [searchCity, setSearchCity] = useState('');
    const [prayerCalendar, setPrayerCalendar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationMethod, setLocationMethod] = useState('default');
    const [calculationMethod, setCalculationMethod] = useState('4');
    const [selectedDayIdx, setSelectedDayIdx] = useState(0);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [timeToNext, setTimeToNext] = useState('');

    // SEO Meta Tags Effect
    useEffect(() => {
        // Update document title
        document.title = `مواقيت الصلاة في ${city} | Prayer Times`;

        // Define meta tags
        const metaTags = [
            { name: 'description', content: `مواقيت الصلاة في ${city} - اوقات الصلاة اليوم والايام القادمة، الفجر، الظهر، العصر، المغرب، العشاء` },
            { name: 'keywords', content: 'مواقيت الصلاة, prayer times, أوقات الصلاة, الفجر, الظهر, العصر, المغرب, العشاء, salah times, islamic prayer' },
            { property: 'og:title', content: `مواقيت الصلاة في ${city}` },
            { property: 'og:description', content: `مواقيت الصلاة في ${city} - اوقات الصلاة اليوم والايام القادمة` },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: `مواقيت الصلاة في ${city}` },
            { name: 'twitter:description', content: `مواقيت الصلاة في ${city} - اوقات الصلاة اليوم والايام القادمة` },
            { name: 'robots', content: 'index, follow' },
            { name: 'language', content: 'Arabic' },
            { name: 'author', content: ' دار الإتقان' },
            { property: 'og:locale', content: 'ar' },
            { property: 'og:site_name', content: 'دار الإتقان' }
        ];

        // Update or create meta tags
        metaTags.forEach(({ name, property, content }) => {
            let meta = document.querySelector(`meta[${name ? `name="${name}"` : `property="${property}"`}]`);
            if (!meta) {
                meta = document.createElement('meta');
                if (name) meta.name = name;
                if (property) meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.content = content;
        });

        // Schema.org structured data
        const schema = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `مواقيت الصلاة في ${city}`,
            "description": `مواقيت الصلاة في ${city} - اوقات الصلاة اليوم والايام القادمة`,
            "inLanguage": "ar",
            "isPartOf": {
                "@type": "WebSite",
                "name": "مسجد التقوى",
                "url": window.location.origin
            },
            "mainEntity": {
                "@type": "Thing",
                "name": `مواقيت الصلاة في ${city}`,
                "description": `جدول مواقيت الصلاة اليومي في ${city}`
            }
        };

        // Add schema.org script
        let scriptTag = document.querySelector('#prayer-times-schema');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'prayer-times-schema';
            scriptTag.type = 'application/ld+json';
            document.head.appendChild(scriptTag);
        }
        scriptTag.innerHTML = JSON.stringify(schema);

        // Cleanup function
        return () => {
            metaTags.forEach(({ name, property }) => {
                const selector = `meta[${name ? `name="${name}"` : `property="${property}"`}]`;
                const meta = document.querySelector(selector);
                if (meta) meta.remove();
            });
            const schemaScript = document.querySelector('#prayer-times-schema');
            if (schemaScript) schemaScript.remove();
        };
    }, [city]); // Re-run when city changes

   
    const prayerNamesArabic = {
        Fajr: 'الفجر',
        Sunrise: 'الشروق',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء',
    };

    const prayerIcons = {
        Fajr: '🌅',
        Sunrise: '☀️',
        Dhuhr: '🌞',
        Asr: '🌤️',
        Maghrib: '🌅',
        Isha: '🌙',
    };

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate next prayer and countdown
    useEffect(() => {
        if (prayerCalendar.length > 0 && selectedDayIdx >= 0) {
            calculateNextPrayer();
        }
    }, [currentTime, prayerCalendar, selectedDayIdx]);

    const calculateNextPrayer = () => {
        const today = prayerCalendar[selectedDayIdx];
        if (!today) return;

        const now = new Date();
        const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

        for (const prayer of prayers) {
            const prayerTime = today.timings[prayer]?.split(' ')[0];
            if (prayerTime) {
                const [hours, minutes] = prayerTime.split(':');
                const prayerDate = new Date();
                prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                if (prayerDate > now) {
                    setNextPrayer({
                        name: prayer,
                        arabicName: prayerNamesArabic[prayer],
                        time: prayerTime,
                        icon: prayerIcons[prayer]
                    });

                    const diff = prayerDate - now;
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    setTimeToNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                    return;
                }
            }
        }

        // If no prayer found today, check tomorrow
        if (selectedDayIdx < prayerCalendar.length - 1) {
            const tomorrow = prayerCalendar[selectedDayIdx + 1];
            if (tomorrow) {
                const fajrTime = tomorrow.timings.Fajr?.split(' ')[0];
                if (fajrTime) {
                    setNextPrayer({
                        name: 'Fajr',
                        arabicName: prayerNamesArabic.Fajr,
                        time: fajrTime,
                        icon: prayerIcons.Fajr
                    });

                    const [hours, minutes] = fajrTime.split(':');
                    const prayerDate = new Date();
                    prayerDate.setDate(prayerDate.getDate() + 1);
                    prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                    const diff = prayerDate - now;
                    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
                    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

                    setTimeToNext(`${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`);
                }
            }
        }
    };

    // Get location from IP address
    useEffect(() => {
        getLocationFromIP();
    }, []);

    const getLocationFromIP = async () => {
        try {
            setLoading(true);
            const ipResponse = await fetch('https://ipapi.co/json/');
            const ipData = await ipResponse.json();

            if (ipData.latitude && ipData.longitude) {
                setLocation({
                    latitude: ipData.latitude,
                    longitude: ipData.longitude
                });
                setCity(`${ipData.city}, ${ipData.country_name}`);
                setLocationMethod('ip');
            } else {
                setLocationMethod('default');
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                        setLocationMethod('gps');
                        getCityFromCoords(position.coords.latitude, position.coords.longitude);
                    },
                    () => { },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 300000
                    }
                );
            }

        } catch (error) {
            setLocationMethod('default');
        } finally {
            setTimeout(() => {
                fetchPrayerCalendar();
            }, 1000);
        }
    };

    useEffect(() => {
        if (location && (locationMethod === 'ip' || locationMethod === 'gps')) {
            fetchPrayerCalendar();
        }
    }, [location, locationMethod, calculationMethod]);

    const getCityFromCoords = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.address) {
                const cityName = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown City';
                const country = data.address.country || '';
                setCity(`${cityName}, ${country}`);
            }
        } catch {
            setCity('Current Location');
        }
    };

    const searchCityCoords = async (cityName) => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                setLocation({
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon)
                });
                setCity(result.display_name);
                setLocationMethod('search');
                setError(null);
            } else {
                setError('لم يتم العثور على المدينة.');
                setLoading(false);
            }
        } catch {
            setError('حدث خطأ أثناء البحث.');
            setLoading(false);
        }
    };

    const handleCitySearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            searchCityCoords(searchCity.trim());
            setSearchCity('');
        }
    };

    const fetchPrayerCalendar = async () => {
        try {
            setLoading(true);
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            const day = today.getDate();
            const timezoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const url = `https://api.aladhan.com/v1/calendar?latitude=${location.latitude}&longitude=${location.longitude}&method=${calculationMethod}&month=${month}&year=${year}&timezone=${timezoneString}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.code === 200) {
                const calendar = data.data.slice(day - 1, day - 1 + 20); // Show 20 days
                setPrayerCalendar(calendar);
                setSelectedDayIdx(0);
                setError(null);
            } else {
                setError('تعذر جلب مواقيت الصلاة.');
            }
            setLoading(false);
        } catch {
            setError('تعذر جلب مواقيت الصلاة.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <div className="text-center bg-white rounded-3xl p-8 shadow-2xl">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-gray-700 text-lg font-medium">جاري تحميل مواقيت الصلاة...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen mt-16" dir="rtl" itemScope itemType="https://schema.org/WebPage">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-emerald-800 dark:text-yellow-400 mb-2" itemProp="headline">مواقيت الصلاة</h1>
                    <div className="flex items-center justify-center text-emerald-700 dark:text-yellow-400 text-lg">
                        <MapPin className="w-5 h-5 ml-2" aria-hidden="true" />
                        <span itemProp="contentLocation">{city}</span>
                    </div>
                </header>

                {/* Search Bar */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCitySearch(e)}
                            placeholder="ابحث عن مدينة..."
                            className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-emerald-200 dark:border-yellow-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-yellow-400 focus:border-transparent text-emerald-900 dark:text-yellow-800 placeholder-emerald-400 dark:placeholder-yellow-300 shadow-lg"
                        />
                        <button
                            onClick={handleCitySearch}
                            className="absolute left-2 top-2 bg-emerald-600 dark:bg-yellow-500 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors duration-200"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="max-w-md mx-auto mb-6 p-4 bg-red-100 border border-red-300 rounded-2xl text-red-700 text-center">
                        {error}
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-stretch">

                    {/* Right Side - 10 Days Calendar */}
                    <div className="order-1 lg:order-2 lg:col-span-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-200 dark:border-yellow-700 overflow-hidden max-w-5xl mx-auto w-full">
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-emerald-800 text-center mb-6">
                                    مواقيت الصلاة لخمسة عشر يوماً
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-emerald-600 dark:bg-yellow-500 text-white">
                                                <th className="py-4 px-3 text-center">التاريخ الهجري</th>
                                                {Object.entries(prayerNamesArabic).map(([key, name]) => (
                                                    <th key={key} className={`py-4 px-3 text-center ${key === 'Isha' ? 'rounded-tl-xl' : ''}`}>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-lg mb-1">{prayerIcons[key]}</span>
                                                            <span>{name}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prayerCalendar.map((item, idx) => (
                                                <tr
                                                    key={idx}
                                                    className={`text-center cursor-pointer transition-all duration-200 ${idx === selectedDayIdx
                                                        ? 'bg-emerald-100 dark:bg-yellow-900/50 font-bold shadow-lg scale-[1.02]'
                                                        : 'hover:bg-emerald-50 dark:hover:bg-yellow-900/20'
                                                        }`}
                                                    onClick={() => setSelectedDayIdx(idx)}
                                                >

                                                    <td className="py-4 px-3 border-b border-emerald-100 dark:border-yellow-900">
                                                        {item.date.hijri.day} {item.date.hijri.month.ar} {item.date.hijri.year}
                                                    </td>
                                                    {Object.keys(prayerNamesArabic).map((prayer) => (
                                                        <td key={prayer} className="py-4 px-3 border-b border-emerald-100 dark:border-yellow-900 font-mono text-emerald-700 dark:text-yellow-400">
                                                            {item.timings[prayer]?.split(' ')[0]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Left Side - Current Time, Next Prayer, and Today's Prayers */}
                    <div className="order-2 lg:order-1 lg:col-span-1 flex flex-col gap-8">
                        {/* Current Time */}
                        <div className="flex-none">
                            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-emerald-200 dark:border-yellow-700 max-w-xs mx-auto flex flex-col justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-2"><Clock className="w-8 h-8 text-emerald-600 dark:text-yellow-400 mx-auto" /></div>
                                    <h2 className="text-xl font-bold text-emerald-800 dark:text-yellow-400 mb-2">الوقت الحالي</h2>
                                    <div className="text-3xl font-mono text-emerald-700 dark:text-yellow-400 mb-2">
                                        {currentTime.toLocaleTimeString('en-PS', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Next Prayer */}
                        {nextPrayer && (
                            <div className="flex-none">
                                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-emerald-200 dark:border-yellow-700 max-w-xs mx-auto flex flex-col justify-center">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2 text-emerald-600 dark:text-yellow-400">{nextPrayer.icon}</div>
                                        <h2 className="text-xl font-bold text-emerald-800 dark:text-yellow-400 mb-2">
                                            الصلاة القادمة: {nextPrayer.arabicName}
                                        </h2>
                                        <div className="text-2xl font-mono text-emerald-700 dark:text-yellow-400 mb-2">
                                            {nextPrayer.time}
                                        </div>
                                        <div className="text-emerald-600 dark:text-yellow-400 mb-2">الوقت المتبقي:</div>
                                        <div className="text-3xl font-bold text-emerald-800 dark:text-yellow-400 font-mono bg-emerald-100 dark:bg-yellow-900/50 rounded-xl py-2 px-4">
                                            {timeToNext}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Today's Prayers */}
                        {prayerCalendar[selectedDayIdx] && (
                            <div className="flex-none">
                                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-emerald-200 dark:border-yellow-700 max-w-xs mx-auto">
                                    <div className="text-center mb-4">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Calendar className="w-6 h-6 text-emerald-600 dark:text-yellow-400" />
                                            <h2 className="text-xl font-bold text-emerald-800 dark:text-yellow-400">
                                                مواقيت اليوم
                                            </h2>
                                        </div>
                                        <div className="text-emerald-700 dark:text-yellow-400 text-sm">
                                            {prayerCalendar[selectedDayIdx].date.hijri.day} {prayerCalendar[selectedDayIdx].date.hijri.month.ar} {prayerCalendar[selectedDayIdx].date.hijri.year}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(prayerNamesArabic).map(([prayer, name]) => (
                                            <div
                                                key={prayer}
                                                className="bg-emerald-50 dark:bg-yellow-900/50 rounded-xl p-3 text-center"
                                            >
                                                <div className="text-xl mb-1 text-emerald-600 dark:text-yellow-400">{prayerIcons[prayer]}</div>
                                                <div className="text-sm font-semibold text-emerald-800 dark:text-yellow-400 mb-1">{name}</div>
                                                <div className="text-base font-mono text-emerald-700 dark:text-yellow-400 font-bold">
                                                    {prayerCalendar[selectedDayIdx].timings[prayer]?.split(' ')[0]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default IslamicPrayerTimes;