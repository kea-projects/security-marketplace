import React, { useState, useEffect } from 'react';
import { HStack, Image, Text, VStack } from '@chakra-ui/react';
import { ListingResponse } from '../../api/ListingApi';
import { UserApi, UserResponse } from '../../api/UserApi';

import { Card } from '../themed/Card';
import { Listing } from './Listing';
import { hasUserPrivileges } from '../../utils/Auth';

interface MarketListingProps {
    parentIsLoading?: boolean;
    listing: ListingResponse;
}

/**
 * Creates a wrapped component for the `Listing` component.
 * It displays the `Listing` component, along with a header that contains information about
 * the author of the listing, as well as the listing's picture.
 *
 * Intended to be used on the home page.
 *
 * NOTE: It only displays the author information if the user is logged in.
 */
export function MarketListing({ parentIsLoading = false, listing }: MarketListingProps) {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [author, setAuthor] = useState<UserResponse | undefined>(undefined);

    // Fetch Listing author
    useEffect(() => {
        // Only fetches author information if user is logged in.
        if (!parentIsLoading && hasUserPrivileges()) {
            const fetchAuthor = async () => {
                setIsLoading(true);
                const { data } = await UserApi.getUser(listing.createdBy);
                setAuthor(data);
                setIsLoading(false);
            };

            fetchAuthor();
        }
    }, [parentIsLoading]);

    return (
        <Card backgroundColor="accent.500" width="fit-content" padding="0" variant="rounded">
            <VStack>
                {!isLoading && (
                    <HStack
                        height="fit-content"
                        width="100%"
                        justifyContent="space-between"
                        paddingX="10px"
                        paddingTop="5px"
                    >
                        {hasUserPrivileges() && <Text>Listed by: {author?.name}</Text>}
                        <Image
                            boxSize="128px"
                            objectFit="cover"
                            borderRadius="md"
                            src={listing?.imageUrl}
                            alt={listing?.name}
                        />
                    </HStack>
                )}
                <Listing isLoading={isLoading || parentIsLoading} listingData={listing} useStatusToggle={false} />
            </VStack>
        </Card>
    );
}
