import axios from "axios";
import { API_URL } from "../src/constants";
import { refreshToken } from "./routes/userRoutes";
import { getToken, setToken, isTokenExpired, removeToken } from "../src/utils/auth";

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true',
    }
})
api.interceptors.request.use(
    async (config) => {
        let token = getToken();
        
        if (token && isTokenExpired(token)) {
            const newToken = await refreshToken(token);
            if (newToken) {
                token = newToken;
                setToken(newToken);
            } else {
                removeToken();
                return Promise.reject(new Error('Token refresh failed'));
            }
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const oldToken = getToken();
            if (oldToken) {
                const newToken = await refreshToken(oldToken);
                if (newToken) {
                    setToken(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            }
            
            removeToken();
        }
        
        return Promise.reject(error);
    }
);
