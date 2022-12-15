import { AxiosResponse } from 'axios';
import { userApi } from '../configs/AxiosConfig';

export interface UserResponse {
    userId: string;
    email: string;
    name: string;
    pictureUrl: string;
}

export class UserApi {
    public async getUsers(): Promise<AxiosResponse<UserResponse[]>> {
        console.log('User Api', 'Requesting all users...');
        return userApi.get('/users');
    }

    public async getUser(userId: string): Promise<AxiosResponse<UserResponse>> {
        console.log('User Api', 'Requesting user...');
        return userApi.get(`/users/${userId}`);
    }

    public async updateProfilePicture(userId: string, picture: File): Promise<AxiosResponse<UserResponse>> {
        console.log('User Api', 'Updating profile picture...');
        return userApi.putForm(`/users/${userId}/pictures`, { file: picture });
    }
}
