import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';

const API_BASE_URL = '/api';

// Debounce utility function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Create axios instance with optimized configuration
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minute cache
    },
});

// Automatically attach Authorization header from localStorage or sessionStorage
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            // Ensure headers exist before assignment
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Debounced request function
const debouncedRequest = debounce(async (config) => {
    return apiClient(config);
}, 300); // 300ms debounce delay

// Optimized retry logic with debouncing
apiClient.interceptors.response.use(
    response => {
        // Cache successful responses in memory
        if (response.config.method === 'get') {
            const cacheKey = `${response.config.url}`;
            sessionStorage.setItem(cacheKey, JSON.stringify({
                data: response.data,
                timestamp: Date.now()
            }));
        }
        return response;
    },
    async (error) => {
        const { config } = error;
        const response = error.response || {};

        // Check cache on error for GET requests
        if (config.method === 'get') {
            const cacheKey = `${config.url}`;
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                // Use cache if it's less than 5 minutes old
                if (Date.now() - timestamp < 300000) {
                    return Promise.resolve({ data });
                }
            }
        }

        if (config && config._isRetry) {
            return Promise.reject(error);
        }

        const shouldRetry =
            !error.response ||
            response.status === 403 ||
            response.status === 429 ||
            (response.status >= 500 && response.status <= 599);

        if (config && shouldRetry && !config._isRetry) {
            config._isRetry = true;
            config._retryCount = (config._retryCount || 0) + 1;

            if (config._retryCount >= 2) {
                return Promise.reject(error);
            }

            const delay = Math.min(1000 * (2 ** config._retryCount), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Use debounced request for retries
            return debouncedRequest(config);
        }

        return Promise.reject(error);
    }
);

// Override the request method to use debouncing
const originalRequest = apiClient.request;
apiClient.request = function (config) {
    // Don't debounce POST, PUT, DELETE requests
    if (config.method !== 'get') {
        return originalRequest.call(this, config);
    }
    return debouncedRequest(config);
};

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
    cluesPdf: ['cluesPdf'],
    visitors: ['visitors'],
    sections: ['sections'],
    genius: ['genius'],
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
export const useAdminAllNews = () => {
    return useQuery({
        queryKey: queryKeys.news,
        queryFn: async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const { data } = await apiClient.get('/news/API/admin', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
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
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
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
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
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
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export const useAdminSpeech = () => {
    return useQuery({
        queryKey: queryKeys.speech,
        queryFn: async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const { data } = await apiClient.get('/speech/API', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                return processImageUrls(data);
            } catch (error) {
                console.error('Error fetching speech data:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export const useCreateSpeech = () => {
    return useMutation({
        mutationFn: async (formData) => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const { data } = await apiClient.post('/speech/API', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                return data;
            } catch (error) {
                console.error('Error creating speech:', error);
                throw error;
            }
        }
    });
};

export const useUpdateSpeech = () => {
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const { data } = await apiClient.patch(`/speech/${id}/API`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                return data;
            } catch (error) {
                console.error('Error updating speech:', error);
                throw error;
            }
        }
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
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export const useAdminClues = () => {
    return useQuery({
        queryKey: queryKeys.clues,
        queryFn: async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const { data } = await apiClient.get('/clues/API', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                return processImageUrls(data?.clues || []);
            } catch (error) {
                console.error('Error fetching clues:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export const useCreateClue = () => {
    return useMutation({
        mutationFn: async (formData) => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const { data } = await apiClient.post('/clue/API', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return data;
            } catch (error) {
                console.error('Error creating clue:', error);
                throw error;
            }
        }
    });
};

export const useUpdateClue = () => {
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                // Add _method field for Laravel to recognize it as PATCH
                formData.append('_method', 'PATCH');

                const { data } = await apiClient.post(`/clue/${id}/API`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                        'X-HTTP-Method-Override': 'PATCH'
                    }
                });
                return data;
            } catch (error) {
                console.error('Error updating clue:', error);
                throw error;
            }
        }
    });
};

// export const useCluesPdf = () => {
//     return useQuery({
//         queryKey: queryKeys.cluesPdf,
//         queryFn: async () => {
//             try {
//                 const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//                 const { data } = await apiClient.get('/clue/API', {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Accept': 'application/json'
//                     }
//                 });
//                 return data;
//             } catch (error) {
//                 console.error('Error fetching clues PDF:', error);
//                 throw error;
//             }
//         },
//         staleTime: 1000 * 60 * 5,
//     });
// };

// export const useUpdateCluesPdf = () => {
//     return useMutation({
//         mutationFn: async (formData) => {
//             try {
//                 const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//                 const { data } = await apiClient.post('/clue/API', formData, {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Accept': 'application/json',
//                         'Content-Type': 'multipart/form-data'
//                     }
//                 });
//                 return data;
//             } catch (error) {
//                 console.error('Error updating clues PDF:', error);
//                 throw error;
//             }
//         }
//     });
// };

// export const usePatchCluesPdf = () => {
//     return useMutation({
//         mutationFn: async ({ id, formData }) => {
//             try {
//                 const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//                 const { data } = await apiClient.patch(`/clue/${id}/API`, formData, {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Accept': 'application/json',
//                         'Content-Type': 'multipart/form-data'
//                     }
//                 });
//                 return data;
//             } catch (error) {
//                 console.error('Error patching clues PDF:', error);
//                 throw error;
//             }
//         }
//     });
// };

export const useIncrementVisitors = () => {
    return useMutation({
        mutationFn: async () => {
            try {
                const { data } = await apiClient.post('/home/visitors/API');
                return data;
            } catch (error) {
                console.error('Error incrementing visitors:', error);
                throw error;
            }
        }
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

export const useVisitorsCount = () => {
    return useQuery({
        queryKey: queryKeys.visitors,
        queryFn: async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const { data } = await apiClient.get('/home/visitors/API', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                return data;
            } catch (error) {
                console.error('Error fetching visitors count:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export const useSections = () => {
    return useQuery({
        queryKey: queryKeys.sections,
        queryFn: async () => {
            try {
                const { data } = await apiClient.get('get/sections/API');
                return processImageUrls(data);
            } catch (error) {
                console.error('Error fetching sections:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export const useGeniuses = () => {
    return useQuery({
        queryKey: queryKeys.genius,
        queryFn: async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const { data } = await apiClient.get('/genius/API', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                return processImageUrls(data);
            } catch (error) {
                console.error('Error fetching geniuses:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000),
    });
};

export { getImageUrl };