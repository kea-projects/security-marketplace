import { AxiosResponse } from 'axios';
import { userApi } from '../configs/AxiosConfig';

export interface UserResponse {
    userId: string;
    email: string;
    name: string;
    pictureUrl: string;
}

/**
 * API functions that call Users Service API endpoints.
 */
export class UserApi {
    public static async getUsers(): Promise<AxiosResponse<UserResponse[]>> {
        return userApi.get('/users');
    }

    public static async getUser(userId: string): Promise<AxiosResponse<UserResponse>> {
        return userApi.get(`/users/${userId}`);
    }

    public static async updateProfilePicture(userId: string, picture: File): Promise<AxiosResponse<UserResponse>> {
        return userApi.putForm(`/users/${userId}/pictures`, { file: picture });
    }
}
