import { AxiosResponse } from 'axios';
import { authApi } from '../configs/AxiosConfig';
import { LocalStorage } from '../utils/LocalStorage';

interface LoginRequestBody {
    email: string;
    password: string;
}

interface SignupRequestBody {
    email: string;
    password: string;
    name: string;
}

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

/**
 * API functions that call Auth Service API endpoints.
 */
export class AuthApi {
    public static async login(body: LoginRequestBody): Promise<AxiosResponse<TokenResponse>> {
        return authApi.post('/auth/login', { ...body });
    }

    public static async signup(body: SignupRequestBody): Promise<AxiosResponse<TokenResponse>> {
        return authApi.post('/auth/signup', { ...body });
    }

    public static async refresh(): Promise<AxiosResponse<TokenResponse>> {
        return authApi.post(
            '/auth/refresh',
            {},
            {
                headers: {
                    Authorization: `Bearer ${LocalStorage.getUser().refreshToken}`,
                },
            },
        );
    }

    public static async logout(): Promise<AxiosResponse<TokenResponse>> {
        return authApi.post('/auth/logout', {});
    }
}
