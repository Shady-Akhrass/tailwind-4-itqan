import React, { useEffect, useState, useRef } from 'react';
import { compressImage } from '../../utils/compressImage';

function CompressedImage({ src, quality = 0.1, onError, className = '', ...props }) {
  const [compressedSrc, setCompressedSrc] = useState(src);
  const [isCompressing, setIsCompressing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cleanup any blob URLs
      if (compressedSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(compressedSrc);
      }
    };
  }, []);

  useEffect(() => {
    if (!src) {
      setIsCompressing(false);
      return;
    }

    setIsCompressing(true);
    setHasError(false);

    const compress = async () => {
      try {
        const result = await compressImage(src, quality);
        if (mountedRef.current) {
          setCompressedSrc(result);
          setHasError(false);
        }
      } catch (error) {
        console.warn('Image compression failed:', error);
        if (mountedRef.current) {
          setCompressedSrc(src);
          setHasError(true);
          if (onError) {
            onError(error);
          }
        }
      } finally {
        if (mountedRef.current) {
          setIsCompressing(false);
        }
      }
    };

    compress();
  }, [src, quality, onError]);

  const handleImageError = (e) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
    // Fall back to original source if compressed version fails
    if (compressedSrc !== src) {
      setCompressedSrc(src);
    }
  };

  // Combine provided className with loading state class
  const imageClassName = `${className} ${isCompressing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`;

  return (
    <div className="relative">
      {isCompressing && props.loading !== 'eager' && (
        <div
          className="absolute inset-0 animate-pulse bg-gray-200"
          style={{
            aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : 'auto',
            width: '100%',
            height: '100%'
          }}
        />
      )}
      <img
        {...props}
        src={compressedSrc}
        className={imageClassName}
        onError={handleImageError}
        style={{
          ...props.style,
          visibility: isCompressing ? 'hidden' : 'visible'
        }}
      />
    </div>
  );
}

export default CompressedImage;
