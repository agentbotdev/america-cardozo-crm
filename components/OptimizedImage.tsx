import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    fallback = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'
}) => {
    const [imageSrc, setImageSrc] = useState<string>(fallback);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        // Reset states when src changes
        setIsLoading(true);
        setHasError(false);

        if (!src || src === fallback) {
            setImageSrc(fallback);
            setIsLoading(false);
            return;
        }

        // Create an image to preload
        const img = new Image();

        const handleLoad = () => {
            setImageSrc(src);
            setIsLoading(false);
            setHasError(false);
        };

        const handleError = () => {
            console.warn('Image failed to load:', src);
            setImageSrc(fallback);
            setIsLoading(false);
            setHasError(true);
        };

        img.onload = handleLoad;
        img.onerror = handleError;

        // Add timeout for slow images
        const timeout = setTimeout(() => {
            if (isLoading) {
                console.warn('Image timeout:', src);
                handleError();
            }
        }, 10000); // 10 second timeout

        img.src = src;

        return () => {
            img.onload = null;
            img.onerror = null;
            clearTimeout(timeout);
        };
    }, [src, fallback]);

    return (
        <div className="relative w-full h-full">
            <img
                ref={imgRef}
                src={imageSrc}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
                loading="lazy"
                decoding="async"
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};
