import axios from "axios";

// Export the base instance
export const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
    // We will store the token in localStorage for the MVP frontend
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("hotroute_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle global errors (like 401s)
apiClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
            localStorage.removeItem("hotroute_token");
            // If not already on login, redirect
            if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                window.location.href = "/login";
            }
        }
    }
    return Promise.reject(error);
});
