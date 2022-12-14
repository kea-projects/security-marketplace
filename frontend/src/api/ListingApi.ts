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

export interface CommentResponse {
    commentId: string;
    comment: string;
    email: string;
    name: string;
    commentedOn: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ListingByIdResponse {
    listing: ListingResponse;
    comments: CommentResponse[];
}

export class ListingApi {
    // --- LISTINGS ---

    public async getListings(): Promise<AxiosResponse<ListingResponse[]>> {
        console.log('Listing Api', 'Requesting all listings...');
        return listingApi.get('/listings');
    }

    public async getUserListings(userId: string): Promise<AxiosResponse<ListingResponse[]>> {
        console.log('Listing Api', 'Requesting all user listings...');
        return listingApi.get(`/listings/user/${userId}`);
    }

    public async getListingById(listingId: string): Promise<AxiosResponse<ListingByIdResponse>> {
        console.log('Listing Api', 'Requesting listing...');
        return listingApi.get(`/listings/${listingId}`);
    }

    public async createListing(body: CreateListingRequestBody) {
        console.log('Listing Api', 'Requesting listing creation...');
        return listingApi.postForm('/listings', { ...body });
    }

    // --- COMMENTS ---

    // public async get
}
