export const checkApiUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        const baseUrl = 'https://api.ditq.org';
        return baseUrl + parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    } catch (error) {
        console.error('Invalid URL passed to checkApiUrl:', url);
        return 'https://api.ditq.org/';
    }
};


