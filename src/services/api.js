// services/api.js

// Backend API configuration - use relative paths for Next.js API routes
const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : '';

// Token management
const getAccessToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('edu-access-token');
};

const setAccessToken = (token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('edu-access-token', token);
};

const removeAccessToken = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('edu-access-token');
};

const getRefreshToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('edu-refresh-token');
};

const setRefreshToken = (token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('edu-refresh-token', token);
};

// API request helper with token refresh
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAccessToken();

    // Don't set Content-Type for FormData - browser sets it automatically with boundary
    const isFormData = options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
        ...options,
        headers,
    });

    // If 401, try to refresh token
    if (response.status === 401 && token && getRefreshToken()) {
        try {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: getRefreshToken() }),
            });

            if (refreshResponse.ok) {
                const { accessToken } = await refreshResponse.json();
                setAccessToken(accessToken);

                // Retry original request with new token
                headers['Authorization'] = `Bearer ${accessToken}`;
                response = await fetch(url, {
                    ...options,
                    headers,
                });
            } else {
                // Refresh failed, logout
                removeAccessToken();
                localStorage.removeItem('edu-refresh-token');
                throw new Error('Session expired. Please login again.');
            }
        } catch (error) {
            removeAccessToken();
            localStorage.removeItem('edu-refresh-token');
            throw error;
        }
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            const errorText = await response.text().catch(() => 'Request failed');
            errorData = { message: errorText };
        }
        const error = new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.response = errorData;
        console.error('API request failed:', {
            url,
            status: response.status,
            statusText: response.statusText,
            error: errorData
        });
        throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return undefined;
    }

    return await response.json();
};

// --- AUTH ---
export const updateUserProfile = async (profileData) => {
    return await apiRequest('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
    });
};

// --- CLASSES ---
export const fetchClasses = async () => {
    return await apiRequest('/classes');
};

export const createClass = async (name) => {
    return await apiRequest('/classes', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
};

export const joinClass = async (code) => {
    return await apiRequest('/classes/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
};

export const updateClassName = async (classId, name) => {
    return await apiRequest(`/classes/${classId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    });
};

export const deleteClass = async (classId) => {
    return await apiRequest(`/classes/${classId}`, {
        method: 'DELETE',
    });
};

// --- CHAPTERS ---
export const fetchChapters = async () => {
    return await apiRequest('/chapters');
};

export const uploadChapter = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await apiRequest('/chapters/upload', {
        method: 'POST',
        body: formData,
    });
};

export const assignChapterToClasses = async (chapterId, classIds) => {
    return await apiRequest(`/chapters/${chapterId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ classIds }),
    });
};

export const deleteChapter = async (chapterId) => {
    return await apiRequest(`/chapters/${chapterId}`, {
        method: 'DELETE',
    });
};

// --- TESTS ---
export const fetchTests = async () => {
    return await apiRequest('/tests');
};

export const generateTestQuestions = async (chapterId, topics) => {
    return await apiRequest('/tests/generate', {
        method: 'POST',
        body: JSON.stringify({ chapterId, topics }),
    });
};

export const createTest = async (testData) => {
    return await apiRequest('/tests', {
        method: 'POST',
        body: JSON.stringify(testData),
    });
};

export const deleteTest = async (testId) => {
    return await apiRequest(`/tests/${testId}`, {
        method: 'DELETE',
    });
};

// --- ATTEMPTS ---
export const fetchAttempts = async () => {
    return await apiRequest('/attempts');
};

export const submitAttempt = async (testId, answers, score) => {
    return await apiRequest('/attempts', {
        method: 'POST',
        body: JSON.stringify({ testId, answers, score }),
    });
};

// --- ANALYSIS ---
export const fetchClassAnalysis = async (testId) => {
    return await apiRequest(`/analysis/class/${testId}`);
};

export const fetchStudentAnalysis = async (studentId) => {
    return await apiRequest(`/analysis/student/${studentId}`);
};

// Get current user profile
export const getCurrentUser = async () => {
    return await apiRequest('/users/me');
};

// Export token management functions for use in auth context
export const setAuthTokens = (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
};

export const clearAuthTokens = () => {
    removeAccessToken();
    localStorage.removeItem('edu-refresh-token');
};

