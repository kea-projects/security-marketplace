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

export function MarketListing({ parentIsLoading = false, listing }: MarketListingProps) {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [author, setAuthor] = useState<UserResponse | undefined>(undefined);

    // Constants
    const userApi = new UserApi();

    // Fetch Listing author
    useEffect(() => {
        if (!parentIsLoading && hasUserPrivileges()) {
            const fetchAuthor = async () => {
                setIsLoading(true);
                const { data } = await userApi.getUser(listing.createdBy);
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
