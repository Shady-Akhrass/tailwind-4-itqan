import React, { useEffect, useState, memo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { apiClient } from '../../api/queries';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="py-4 px-4 text-center text-red-600">
                    Something went wrong loading the video section.
                </div>
            );
        }
        return this.props.children;
    }
}

const VideoFrame = memo(({ src, title, className }) => {
    // Add privacy-enhanced mode to YouTube URLs
    const getEnhancedPrivacyUrl = (url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Convert URL to embed format if it's not already
            const videoId = url.includes('embed')
                ? url.split('/').pop()
                : url.split('v=')[1]?.split('&')[0];

            return `https://www.youtube-nocookie.com/embed/${videoId}`;
        }
        return url;
    };

    return (
        <iframe
            className={className}
            src={getEnhancedPrivacyUrl(src)}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    );
});

const YouTubeSectionContent = memo(() => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchVideos = async () => {
            try {
                // Use apiClient instead of axios directly
                const response = await apiClient.get('/home/API');
                if (isMounted) {
                    setVideos(response.data.youtubes || []);
                    setError(null);
                }
            } catch (error) {
                if (isMounted) {
                    setError('Failed to load videos');
                    console.error("Error fetching videos:", error);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchVideos();
        return () => { isMounted = false; };
    }, []);

    if (error) {
        return (
            <div className="py-4 px-4 sm:px-6 lg:px-8 lg:mx-32 text-center text-red-600">
                {error}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="py-4 px-4 sm:px-6 lg:px-8 lg:mx-32" dir='rtl'>
                <Skeleton height={40} width={300} className="mb-16 mx-auto" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Skeleton height={400} />
                    </div>
                    <div className="md:col-span-1 grid grid-rows-2 gap-4">
                        <Skeleton height={200} />
                        <Skeleton height={200} />
                    </div>
                </div>
            </div>
        );
    }

    // Add a check for empty videos array
    if (!videos || videos.length === 0) {
        return (
            <div className="py-4 px-4 sm:px-6 lg:px-8 lg:mx-32 text-center text-gray-600">
                No videos available at the moment.
            </div>
        );
    }

    return (
        <div className="py-4 px-4 sm:px-6 lg:px-8 lg:mx-32">
            <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800">
                المكتبة المرئية
            </h2>
            <div className="w-24 h-1  my-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px] md:min-h-[600px]">
                <div className="md:col-span-1 grid grid-rows-2 gap-4 h-full">
                    <div className="w-full aspect-video">
                        <VideoFrame
                            className="w-full h-full rounded-lg"
                            src={videos[0].secondary1}
                            title="Secondary Video 1"
                        />
                    </div>
                    <div className="w-full aspect-video">
                        <VideoFrame
                            className="w-full h-full rounded-lg"
                            src={videos[0].secondary2}
                            title="Secondary Video 2"
                        />
                    </div>
                </div>
                <div className="md:col-span-2 aspect-[16/9]">
                    <VideoFrame
                        className="w-full h-full rounded-lg"
                        src={videos[0].main}
                        title="Main Video"
                    />
                </div>
            </div>
        </div>
    );
});

YouTubeSectionContent.displayName = 'YouTubeSectionContent';

const YouTubeSection = () => (
    <ErrorBoundary>
        <YouTubeSectionContent />
    </ErrorBoundary>
);

export default YouTubeSection;