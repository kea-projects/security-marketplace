import axios, { AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';
import { AuthApi } from '../api/AuthApi';
import { tokenIsExpired } from '../utils/Auth';
import { LocalStorage } from '../utils/LocalStorage';

const getConfig = (url: string): CreateAxiosDefaults => {
    return {
        baseURL: url,
        headers: {
            'Content-Type': 'application/json',
        },
    };
};

const requestInterceptor = async (config: AxiosRequestConfig) => {
    let accessToken = LocalStorage.getUser().accessToken;
    const refreshToken = LocalStorage.getUser().refreshToken;
    const authHeader = config.headers?.Authorization;
    console.log('Axios Config', authHeader);

    if (accessToken && refreshToken && config.headers) {
        if (tokenIsExpired(accessToken) && !tokenIsExpired(refreshToken) && !authHeader) {
            console.log('Axios Config', 'Preparing to refresh token...');

            const { data } = await new AuthApi().refresh();
            LocalStorage.updateUser({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        } else if (tokenIsExpired(refreshToken)) {
            LocalStorage.setUser({});
        }
    }

    accessToken = LocalStorage.getUser().accessToken;
    config.headers = {
        Authorization: accessToken ? `Bearer ${accessToken}` : null,
        ...config.headers,
    };

    return config;
};
const responseInterceptor = (response: AxiosResponse) => {
    return response;
};
const interceptorOnError = (error: Error) => {
    console.error(error);
    return Promise.reject(error);
};

export const authApi = axios.create(getConfig(process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8080'));
authApi.interceptors.request.use(requestInterceptor, interceptorOnError);
authApi.interceptors.response.use(responseInterceptor, interceptorOnError);

export const listingApi = axios.create(getConfig(process.env.REACT_APP_LISTING_SERVICE_URL || 'http://localhost:8081'));
listingApi.interceptors.request.use(requestInterceptor, interceptorOnError);
listingApi.interceptors.response.use(responseInterceptor, interceptorOnError);

export const userApi = axios.create(getConfig(process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8082'));
userApi.interceptors.request.use(requestInterceptor, interceptorOnError);
userApi.interceptors.response.use(responseInterceptor, interceptorOnError);
