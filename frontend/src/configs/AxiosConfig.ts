import axios, { AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';
import { AuthApi } from '../api/AuthApi';
import { tokenIsExpired } from '../utils/Auth';
import { LocalStorage } from '../utils/LocalStorage';

/**
 * Gets the default Axios configuration.
 * @param url - Base url of the API.
 * @returns the default Axios configuration.
 */
const getConfig = (url: string): CreateAxiosDefaults => {
    return {
        baseURL: url,
        headers: {
            'Content-Type': 'application/json',
        },
    };
};

/**
 * Intercepts every request before it is being sent to its destination.
 * It checks if the user needs to refresh the token, or if they need to be logged out, and
 * performs the specific action.
 *
 * Otherwise, it will attempt to append the proper Authorization header with the token inside of it.
 * @param config
 */
const requestInterceptor = async (config: AxiosRequestConfig) => {
    let accessToken = LocalStorage.getUser().accessToken;
    const refreshToken = LocalStorage.getUser().refreshToken;
    const authHeader = config.headers?.Authorization;

    if (accessToken && refreshToken) {
        if (tokenIsExpired(accessToken) && !tokenIsExpired(refreshToken) && !authHeader) {
            console.log('Axios Config', 'Preparing to refresh token...');

            const { data } = await AuthApi.refresh();
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

/**
 * Intercepts every response before it is being received by the application.
 * @param response
 */
const responseInterceptor = (response: AxiosResponse) => {
    return response;
};

/**
 * Method that executes when an error response is intercepted coming from the API.
 * @param error
 */
const interceptorOnError = (error: Error) => {
    console.error(error);
    return Promise.reject(error);
};

// Configuring the Auth API.
export const authApi = axios.create(getConfig(process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8080'));
authApi.interceptors.request.use(requestInterceptor, interceptorOnError);
authApi.interceptors.response.use(responseInterceptor, interceptorOnError);

// Configuring the Listings API.
export const listingApi = axios.create(getConfig(process.env.REACT_APP_LISTING_SERVICE_URL || 'http://localhost:8081'));
listingApi.interceptors.request.use(requestInterceptor, interceptorOnError);
listingApi.interceptors.response.use(responseInterceptor, interceptorOnError);

// Configuring the User API.
export const userApi = axios.create(getConfig(process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8082'));
userApi.interceptors.request.use(requestInterceptor, interceptorOnError);
userApi.interceptors.response.use(responseInterceptor, interceptorOnError);
