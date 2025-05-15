import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import { useHomeData, getImageUrl } from '../../api/queries';
import { checkApiUrl } from '../../hooks/checkApiUrl';
import { useQueryClient } from '@tanstack/react-query';

const ImageSlider = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useHomeData();
    const images = data?.images || [];

    // Prefetch next image
    const prefetchNextImage = (currentIndex) => {
        if (images.length > currentIndex + 1) {
            const nextImage = images[currentIndex + 1];
            const img = new Image();
            img.src = checkApiUrl(getImageUrl(nextImage.image));
        }
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: false,
        fade: true,
        pauseOnHover: false,
        draggable: false,
        touchMove: false,
        dotsClass: 'slick-dots custom-dots',
        customPaging: () => <div className="w-full h-[3px] bg-white/50 rounded-full"></div>,
        lazyLoad: 'progressive',
        beforeChange: (_, next) => prefetchNextImage(next)
    };

    // Add DNS prefetch and preconnect
    React.useEffect(() => {
        // Add preconnect for the API domain
        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = 'https://ditq.org';
        document.head.appendChild(preconnectLink);

        // Prefetch critical data
        queryClient.prefetchQuery(['home']);

        return () => {
            document.head.removeChild(preconnectLink);
        };
    }, [queryClient]);

    if (error) {
        return (
            <div className="w-full aspect-[4/3] md:aspect-[16/9] flex items-center justify-center bg-gray-100">
                <p className="text-red-500">حدث خطأ في تحميل الصور</p>
            </div>
        );
    }

    if (!isLoading && images.length === 0) {
        return (
            <div className="w-full aspect-[4/3] md:aspect-[16/9] flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">لا توجد صور متاحة</p>
            </div>
        );
    }

    const mobileImageHeight = "75vw";
    const desktopImageHeight = "100vh";

    return (
        <section className="relative w-full">
            {/* Mobile View - Reserve space with explicit dimensions */}
            <div
                className="block md:hidden w-full relative"
                style={{
                    aspectRatio: '4/3',
                    height: mobileImageHeight,
                    minHeight: '250px',
                    contain: 'layout size'
                }}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-full w-full bg-gray-300 animate-pulse"></div>
                ) : (
                    images[0] && (
                        <img
                            src={checkApiUrl(getImageUrl(images[0].image))}
                            alt="Featured"
                            className="w-full h-full object-cover"
                            loading="eager"
                            fetchpriority="high"
                            width="400"
                            height="300"
                            style={{
                                aspectRatio: '4/3',
                                contentVisibility: 'auto',
                                containIntrinsicSize: '100% 100%'
                            }}
                            onError={(e) => {
                                e.target.src = checkApiUrl(getImageUrl(images[0].image));
                                e.target.onerror = null;
                            }}
                        />
                    )
                )}
            </div>

            {/* Desktop View - Reserve space with explicit height */}
            <div
                className="hidden md:block w-full"
                style={{
                    height: desktopImageHeight,
                    minHeight: '500px',
                    maxHeight: '100vh',
                    contain: 'layout size'
                }}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-full w-full bg-gray-300 animate-pulse"></div>
                ) : (
                    <Slider {...settings} className="w-full h-full overflow-hidden">
                        {images.map((item) => (
                            <div
                                key={item.id}
                                className="w-full h-screen cursor-pointer"
                                onClick={() => item.link ? navigate(item.link) : null}
                                style={{ minHeight: '500px', maxHeight: '100vh' }}
                            >
                                <img
                                    src={checkApiUrl(getImageUrl(item.image))}
                                    alt={`Slide ${item.id}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    width="1920"
                                    height="1080"
                                    style={{
                                        aspectRatio: '16/9',
                                        height: '100%',
                                        width: '100%',
                                        minHeight: '500px'
                                    }}
                                    onError={(e) => {
                                        e.target.src = checkApiUrl(getImageUrl(item.image));
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                        ))}
                    </Slider>
                )}
            </div>
        </section>
    );
};

export default ImageSlider;