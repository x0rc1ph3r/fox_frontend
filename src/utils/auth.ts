// utils/auth.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    publicKey: string;
    userId: string;
    exp: number;
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const bufferTime = 5 * 60;
        const isExpired = decoded.exp < (Date.now() / 1000) + bufferTime;
        console.log("isExpired", isExpired);
        return isExpired;
    } catch (error) {
        return true;
    }
};

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('token');
};