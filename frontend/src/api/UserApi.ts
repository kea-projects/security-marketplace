import { AxiosResponse } from 'axios';
import { userApi } from '../configs/AxiosConfig';

export interface UserResponse {
    userId: string;
    email: string;
    name: string;
    pictureUrl: string;
}

export class UserApi {
    public async getUser(id: string): Promise<AxiosResponse<UserResponse>> {
        console.log('User Api', 'Requesting all listings...');
        return userApi.get(`/users/${id}`);
    }
}
