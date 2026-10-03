import axios from 'axios';
import { auth } from '@/configs/firebaseConfig';

// Wait for Firebase to restore the session, then return the user's ID token as an auth header
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
    await auth.authStateReady();
    const token = await auth.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Axios instance that sends the signed-in user's token with every request
export const api = axios.create();
api.interceptors.request.use(async (config) => {
    const headers = await getAuthHeaders();
    if (headers.Authorization) config.headers.Authorization = headers.Authorization;
    return config;
});

export const getApiError = (e: unknown, fallback = 'Something went wrong. Please try again.') =>
    axios.isAxiosError(e) ? (e.response?.data?.error ?? fallback) : fallback;
