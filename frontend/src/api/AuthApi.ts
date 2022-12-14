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

export class AuthApi {
    public async login(body: LoginRequestBody): Promise<AxiosResponse<TokenResponse>> {
        console.log('Auth Api', 'Requesting login...');
        return authApi.post('/auth/login', { ...body });
    }

    public async signup(body: SignupRequestBody): Promise<AxiosResponse<TokenResponse>> {
        console.log('Auth Api', 'Requesting signup...');
        return authApi.post('/auth/signup', { ...body });
    }

    public async refresh(): Promise<AxiosResponse<TokenResponse>> {
        console.log('Auth Api', 'Requesting refresh...');
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
}
