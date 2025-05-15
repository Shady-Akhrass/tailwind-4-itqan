import React, { useState, useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { checkApiUrl } from '../../hooks/checkApiUrl';

const generateBlurPlaceholder = (width, height) => {
    // Generate tiny placeholder SVG
    const svg = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <filter id="blur" x="0" y="0">
        <feGaussianBlur stdDeviation="10" />
      </filter>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const OptimizedImage = memo(({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    onError,
    loading = 'lazy',
    sizes = '100vw',
    quality = 75
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);
    const isInView = useInView(imgRef, { once: true, margin: '50px' });

    const processedSrc = checkApiUrl(src);
    const placeholderSrc = generateBlurPlaceholder(width || 100, height || 100);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = (e) => {
        setError(true);
        if (onError) {
            onError(e);
        }
    };

    // Dynamically generate srcset for responsive images
    const generateSrcSet = () => {
        if (!processedSrc) return '';
        const widths = [640, 750, 828, 1080, 1200, 1920, 2048];
        return widths
            .map((w) => `${processedSrc}?w=${w}&q=${quality} ${w}w`)
            .join(', ');
    };

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                width: width ? `${width}px` : '100%',
                height: height ? `${height}px` : 'auto'
            }}
        >
            {/* Blur Placeholder */}
            {!isLoaded && !error && (
                <div
                    className="absolute inset-0 bg-gray-100 animate-pulse"
                    style={{
                        backgroundImage: `url(${placeholderSrc})`,
                        backgroundSize: 'cover',
                        filter: 'blur(20px)',
                        transform: 'scale(1.1)'
                    }}
                />
            )}

            {/* Main Image */}
            {(isInView || priority) && (
                <motion.img
                    ref={imgRef}
                    src={processedSrc}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={priority ? 'eager' : loading}
                    onLoad={handleLoad}
                    onError={handleError}
                    sizes={sizes}
                    srcSet={generateSrcSet()}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{
                        aspectRatio: width && height ? `${width}/${height}` : 'auto',
                        objectFit: 'cover'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    fetchpriority={priority ? "high" : "auto"}
                    decoding={priority ? "sync" : "async"}
                />
            )}

            {/* Error Fallback */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Failed to load image</span>
                </div>
            )}
        </div>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;