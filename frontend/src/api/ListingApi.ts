import { AxiosResponse } from 'axios';
import { listingApi } from '../configs/AxiosConfig';

export interface CreateCommentRequestBody {
    comment: string;
    email: string;
    name: string;
    commentedOn: string;
    createdBy: string;
}

interface CreateListingRequestBody {
    name: string;
    description: string;
    file: File;
    createdBy: string;
    isPublic: boolean;
}

interface UpdateListingRequestBody {
    name?: string;
    description?: string;
    file?: File;
    isPublic?: boolean;
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
    createdAt: string;
    updatedAt: string;
}

export interface ListingByIdResponse {
    listing: ListingResponse;
    comments: CommentResponse[];
}

/**
 * API functions that call Listings Service API endpoints.
 */
export class ListingApi {
    // --- LISTINGS ---

    public static async getListings(): Promise<AxiosResponse<ListingResponse[]>> {
        console.log('Listing Api', 'Requesting all listings...');
        return listingApi.get('/listings');
    }

    public static async getUserListings(userId: string): Promise<AxiosResponse<ListingResponse[]>> {
        console.log('Listing Api', 'Requesting all user listings...');
        return listingApi.get(`/listings/user/${userId}`);
    }

    public static async getListingById(listingId: string): Promise<AxiosResponse<ListingByIdResponse>> {
        console.log('Listing Api', 'Requesting listing...');
        return listingApi.get(`/listings/${listingId}`);
    }

    public static async createListing(body: CreateListingRequestBody): Promise<AxiosResponse<ListingResponse>> {
        console.log('Listing Api', 'Requesting listing creation...');
        return listingApi.postForm('/listings', { ...body });
    }

    public static async updateListing(
        body: UpdateListingRequestBody,
        listingId: string,
    ): Promise<AxiosResponse<ListingResponse>> {
        console.log('Listing Api', 'Requesting listing update...');
        return listingApi.patch(`/listings/${listingId}`, body);
    }

    public static async deleteListing(listingId: string) {
        console.log('Listing Api', 'Requesting listing deletion...');
        return listingApi.delete(`/listings/${listingId}`);
    }

    // --- COMMENTS ---

    public static async createComment(body: CreateCommentRequestBody): Promise<AxiosResponse<CommentResponse>> {
        console.log('Listing Api', 'Requesting comment creation...');
        return listingApi.post('/comments', body);
    }
}
