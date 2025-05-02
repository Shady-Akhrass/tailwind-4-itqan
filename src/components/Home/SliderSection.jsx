import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import { useHomeData, getImageUrl } from '../../api/queries';
import { checkApiUrl } from '../../hooks/checkApiUrl';

const ImageSlider = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useHomeData();
    const images = data?.images || [];

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
    };

    if (error) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                <p className="text-red-500">حدث خطأ في تحميل الصور</p>
            </div>
        );
    }

    if (!isLoading && images.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">لا توجد صور متاحة</p>
            </div>
        );
    }

    return (
        <section className="relative w-full">
            {/* Mobile View */}
            <div className="block md:hidden w-full relative" style={{ aspectRatio: '4/3' }}>
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
                            style={{ contentVisibility: 'auto', containIntrinsicSize: '100vw' }}
                            onError={(e) => {
                                e.target.src = checkApiUrl(getImageUrl(images[0].image));
                                e.target.onerror = null;
                            }}
                        />
                    )
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block w-full h-screen overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full w-full bg-gray-300 animate-pulse"></div>
                ) : (
                    <Slider {...settings} className="w-full h-full overflow-hidden">
                        {images.map((item) => (
                            <div key={item.id} className="w-full h-screen cursor-pointer" onClick={() => item.link ? navigate(item.link) : null}>
                                <img
                                    src={checkApiUrl(getImageUrl(item.image))}
                                    alt={`Slide ${item.id}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
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