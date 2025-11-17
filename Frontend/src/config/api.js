// API Configuration for Production
const API_BASE_URL = import.meta.env.PROD 
    ? 'https://enquiry.thumbeja.com/spring'
    : 'http://localhost:8080';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
        STATUS: `${API_BASE_URL}/api/auth/status`,
    },
    EMAILS: {
        LIST: `${API_BASE_URL}/api/emails`,
        DELETE: `${API_BASE_URL}/api/contactdelete`,
    },
    CONTACT: {
        SUBMIT: `${API_BASE_URL}/api/contact`,
    }
};

export default API_ENDPOINTS;
