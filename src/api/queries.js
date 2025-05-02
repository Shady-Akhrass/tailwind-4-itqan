import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';

const API_BASE_URL = '/api';

// Create axios instance with retry logic
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://ditq.org',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    },
    // Removing withCredentials since the server doesn't support it properly
    timeout: 15000, // Increased timeout to 15 seconds
});

// Add retry interceptor with CORS handling
apiClient.interceptors.response.use(
    response => response,
    async (error) => {
        const { config } = error;
        const response = error.response || {};

        if (config && config._isRetry) {
            return Promise.reject(error);
        }

        const shouldRetry =
            !error.response ||
            response.status === 403 ||
            response.status === 429 || // Add rate limiting handling
            (response.status >= 500 && response.status <= 599);

        if (config && shouldRetry) {
            config._isRetry = true;
            config._retryCount = (config._retryCount || 0) + 1;

            if (config._retryCount >= 3) {
                return Promise.reject(error);
            }

            const delay = Math.min(1000 * (2 ** config._retryCount), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));

            return apiClient(config);
        }

        return Promise.reject(error);
    }
);

/**
 * Get properly formatted image URL based on environment
 * @param {string} path - The image path from the API
 * @returns {string} - Fully qualified URL for the image
 */
const getImageUrl = (path) => {
    if (!path) return '';

    // If it's already a full URL, return as is
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    // Clean up the path
    let cleanPath = path.replace(/^\/?api\//, '');

    // Handle storage paths
    if (cleanPath.includes('storage/')) {
        return `https://ditq.org/${cleanPath}`;
    }

    // If the path doesn't start with storage, add it to the API URL
    if (!cleanPath.startsWith('storage/') && !cleanPath.startsWith('http')) {
        cleanPath = `storage/${cleanPath}`;
    }

    // Always use the main domain for images
    return `https://ditq.org/${cleanPath}`;
};

/**
 * Recursively processes an object to transform image paths to URLs
 * @param {object} data - The API response data
 * @returns {object} - Processed data with image URLs
 */
const processImageUrls = (data) => {
    if (!data) return data;

    const processObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;

        // Handle arrays and objects
        const newObj = Array.isArray(obj) ? [...obj] : { ...obj };

        for (const key in newObj) {
            if (typeof newObj[key] === 'object' && newObj[key] !== null) {
                newObj[key] = processObject(newObj[key]);
            } else if (
                typeof newObj[key] === 'string' &&
                (key.toLowerCase().includes('image') ||
                    key.toLowerCase().includes('img') ||
                    key.toLowerCase().includes('photo') ||
                    key.toLowerCase().includes('thumbnail') ||
                    key.toLowerCase().includes('banner')) &&
                !newObj[key].startsWith('data:')
            ) {
                newObj[key] = getImageUrl(newObj[key]);
            }
        }

        return newObj;
    };

    return processObject(data);
};

// Query keys
export const queryKeys = {
    home: ['home'],
    news: ['news'],
    newsDetails: (identifier) => ['news', identifier],
    speech: ['speech'],
    clues: ['clues'],
};

// API Calls with enhanced error handling
export const useHomeData = () => {
    return useQuery({
        queryKey: queryKeys.home,
        queryFn: async () => {
            try {
                const { data } = await apiClient.get('/home/API');
                return processImageUrls(data);
            } catch (error) {
                console.error('Error fetching home data:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export const useAllNews = () => {
    return useQuery({
        queryKey: queryKeys.news,
        queryFn: async () => {
            try {
                const { data } = await apiClient.get('/news/API');
                return processImageUrls(data);
            } catch (error) {
                console.error('Error fetching news:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export const useNewsDetails = (identifier) => {
    return useQuery({
        queryKey: queryKeys.newsDetails(identifier),
        queryFn: async () => {
            try {
                const { data } = await apiClient.get(`/news/${encodeURIComponent(identifier)}/details/API`);
                return processImageUrls(data);
            } catch (error) {
                console.error('Error fetching news details:', error);
                throw error;
            }
        },
        enabled: !!identifier,
        staleTime: 1000 * 60 * 5,
        retry: 3,
    });
};

export const useNewsDetailsById = (id) => {
    return useQuery({
        queryKey: queryKeys.newsDetails(id),
        queryFn: async () => {
            try {
                const { data } = await apiClient.get(`/news/${id}/API`);
                return processImageUrls(data);
            } catch (error) {
                console.error('Error fetching news details:', error);
                throw error;
            }
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
        retry: 3,
    });
};

export const useSpeech = () => {
    return useQuery({
        queryKey: queryKeys.speech,
        queryFn: async () => {
            try {
                const { data } = await apiClient.get('/speech');
                return processImageUrls(data);
            } catch (error) {
                console.error('Error fetching speech data:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useClues = () => {
    return useQuery({
        queryKey: queryKeys.clues,
        queryFn: async () => {
            try {
                const { data } = await apiClient.get('/clues/API');
                return processImageUrls(data?.clues || []);
            } catch (error) {
                console.error('Error fetching clues:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useContactForm = () => {
    return useMutation({
        mutationFn: async (formData) => {
            try {
                const { data } = await apiClient.post('/contact', formData);
                return data;
            } catch (error) {
                console.error('Error submitting contact form:', error);
                throw error;
            }
        },
    });
};

export { getImageUrl };