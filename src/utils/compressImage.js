import imageCompression from 'browser-image-compression';

export async function compressImage(imageUrl, quality = 0.7) {
    try {
        // Create an image element to load the image
        const img = new Image();
        img.crossOrigin = 'anonymous';  // This is important for CORS

        const imageLoadPromise = new Promise((resolve, reject) => {
            img.onload = () => {
                // Create a canvas to draw the image
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.95);
            };

            img.onerror = () => {
                // If loading fails with CORS, fall back to original URL
                reject(new Error('Image loading failed'));
            };
        });

        // Add cache buster to URL to prevent caching issues
        const urlWithCacheBuster = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;
        img.src = urlWithCacheBuster;

        // Wait for image to load and get blob
        const imageBlob = await imageLoadPromise.catch(() => {
            console.warn('Image loading failed, falling back to original URL');
            return null;
        });

        // If we couldn't get the blob, return original URL
        if (!imageBlob) {
            return imageUrl;
        }

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            initialQuality: quality,
            useWebWorker: true,
        };

        const compressedBlob = await imageCompression(imageBlob, options);
        return URL.createObjectURL(compressedBlob);
    } catch (error) {
        console.error('Compression failed:', error);
        return imageUrl; // Return original URL as fallback
    }
}
