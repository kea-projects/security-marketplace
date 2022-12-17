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

    public async createListing(body: CreateListingRequestBody): Promise<AxiosResponse<ListingResponse>> {
        console.log('Listing Api', 'Requesting listing creation...');
        return listingApi.postForm('/listings', { ...body });
    }

    public async updateListing(
        body: UpdateListingRequestBody,
        listingId: string,
    ): Promise<AxiosResponse<ListingResponse>> {
        console.log('Listing Api', 'Requesting listing update...');
        return listingApi.patch(`/listings/${listingId}`, body);
    }

    public async deleteListing(listingId: string) {
        console.log('Listing Api', 'Requesting listing deletion...');
        return listingApi.delete(`/listings/${listingId}`);
    }

    // --- COMMENTS ---

    public async createComment(body: CreateCommentRequestBody): Promise<AxiosResponse<CommentResponse>> {
        console.log('Listing Api', 'Requesting comment creation...');
        return listingApi.post('/comments', body);
    }
}
