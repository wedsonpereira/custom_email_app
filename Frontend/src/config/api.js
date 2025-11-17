// API Configuration
const API_BASE_URL = import.meta.env.BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
    BASE: API_BASE_URL,
    EMAILS: `${API_BASE_URL}/api/emails`,
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
        STATUS: `${API_BASE_URL}/api/auth/status`,
    },
    CONTACT: {
        DELETE: `${API_BASE_URL}/api/contactdelete`,
    },
};

export default API_BASE_URL;
