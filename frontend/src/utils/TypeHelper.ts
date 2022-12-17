import { ListingResponse } from '../api/ListingApi';
import { UserResponse } from '../api/UserApi';

export class TypeHelper {
    public static isUserResponse = (item: unknown): item is UserResponse => {
        return (
            (item as UserResponse).email !== undefined &&
            (item as UserResponse).name !== undefined &&
            (item as UserResponse).pictureUrl !== undefined &&
            (item as UserResponse).userId !== undefined
        );
    };

    public static isListingResponse = (item: unknown): item is ListingResponse => {
        return (
            (item as ListingResponse).createdBy !== undefined &&
            (item as ListingResponse).description !== undefined &&
            (item as ListingResponse).imageUrl !== undefined &&
            (item as ListingResponse).listingId !== undefined &&
            (item as ListingResponse).name !== undefined &&
            (item as ListingResponse).isPublic !== undefined
        );
    };
}
