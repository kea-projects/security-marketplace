import { AxiosResponse } from 'axios';
import { listingApi } from '../configs/AxiosConfig';

interface CreateListingRequestBody {
    name: string;
    description: string;
    imageUrl: string;
    createdBy: string;
    isPublic: boolean;
}

export interface ListingResponse {
    listingId: string;
    name: string;
    description: string;
    imageUrl: string;
    createdBy: string;
    isPublic: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ListingApi {
    public async getListings(): Promise<AxiosResponse<ListingResponse[]>> {
        console.log('Listing Api', 'Requesting all listings...');
        return listingApi.get('/listings');
    }

    public async getUserListings(userId: string): Promise<AxiosResponse<ListingResponse[]>> {
        console.log('Listing Api', 'Requesting all user listings...');
        return listingApi.get(`/listings/user/${userId}`);
    }

    public async createListing(body: CreateListingRequestBody) {
        console.log('Listing Api', 'Requesting listing creation...');
        return listingApi.postForm('/listings', { ...body });
    }
}
