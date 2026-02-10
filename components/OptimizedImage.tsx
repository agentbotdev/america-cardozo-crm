import React, { useState, useEffect } from 'react';

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

    useEffect(() => {
        if (!src) {
            setImageSrc(fallback);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const img = new Image();

        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
        };

        img.onerror = () => {
            console.warn('Failed to load image:', src);
            setImageSrc(fallback);
            setIsLoading(false);
        };

        img.src = src;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, fallback]);

    return (
        <div className="relative w-full h-full bg-slate-100 overflow-hidden">
            <img
                src={imageSrc}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                loading="lazy"
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};
