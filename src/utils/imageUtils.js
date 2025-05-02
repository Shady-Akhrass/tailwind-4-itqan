import imageCompression from 'browser-image-compression';

export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';

    // Handle full URLs
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Remove any leading slashes
    const cleanPath = imagePath.replace(/^\/+/, '');

    // Use environment variable or fallback to production URL
    const baseUrl = process.env.REACT_APP_API_URL || 'https://api.ditq.org';

    return `${baseUrl}/storage/${cleanPath}`;
};

export const compressImage = async (imageFile, options = {}) => {
    const defaultOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        ...options
    };

    try {
        return await imageCompression(imageFile, defaultOptions);
    } catch (error) {
        console.error('Image compression failed:', error);
        return imageFile;
    }
};

export const generateImageSrcSet = async (imageUrl, sizes = [640, 768, 1024, 1280, 1536]) => {
    try {
        const response = await fetch(getImageUrl(imageUrl));
        const blob = await response.blob();
        const srcSet = await Promise.all(
            sizes.map(async (size) => {
                const compressed = await compressImage(blob, {
                    maxWidthOrHeight: size
                });
                const url = URL.createObjectURL(compressed);
                return `${url} ${size}w`;
            })
        );
        return srcSet.join(', ');
    } catch (error) {
        console.error('Error generating srcset:', error);
        return imageUrl;
    }
};

export const lazyLoadImage = (imageRef) => {
    if (!imageRef.current || 'loading' in HTMLImageElement.prototype) {
        return; // Return if ref not set or if native lazy loading is supported
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                observer.unobserve(img);
            }
        });
    });

    observer.observe(imageRef.current);
    return () => observer.disconnect();
};

export const optimizeImageLoading = async (imageUrl, alt = '', options = {}) => {
    const {
        lazy = true,
        sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
        className = '',
        priority = false
    } = options;

    const srcSet = await generateImageSrcSet(imageUrl);
    const optimizedSrc = getImageUrl(imageUrl);

    return {
        src: optimizedSrc,
        srcSet,
        alt,
        loading: lazy && !priority ? 'lazy' : 'eager',
        decoding: 'async',
        sizes,
        className: `${className} transition-opacity duration-300`,
        onLoad: (e) => {
            e.target.classList.remove('opacity-0');
            e.target.classList.add('opacity-100');
        },
        onError: (e) => {
            e.target.src = '/placeholder-image.jpg'; // Fallback image
            console.error('Image failed to load:', imageUrl);
        }
    };
};