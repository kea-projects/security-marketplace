import React, { useState, useEffect } from 'react';
import { Center, Skeleton, Container, HStack, Text, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ListingApi, ListingResponse } from '../../api/ListingApi';
import { hasAdminPrivileges, isOwnProfile, hasUserPrivileges } from '../../utils/Auth';

export interface ListingProps {
    isLoading: boolean;
    listingData: ListingResponse;
    useStatusToggle?: boolean;
}

/**
 * Creates a component that displays the listing data.
 */
export function Listing({ isLoading = false, listingData, useStatusToggle = true }: ListingProps) {
    // States
    const [listing, setListing] = useState<ListingResponse | undefined>(undefined);

    // Constants
    const navigate = useNavigate();

    // Set listing data
    useEffect(() => {
        if (!isLoading) {
            setListing(listingData);
        }
    }, [isLoading]);

    // Handlers

    /**
     * Takes the user to the `ListingDetails` page for the specific listing.
     */
    const handleSeeMore = () => {
        navigate(`/listing-details/${listing?.listingId}`);
    };

    /**
     * Toggles the visibility of the listing by toggling the boolean `isPublic`.
     */
    const handleToggleIsPublic = async () => {
        if (listing) {
            const { data } = await ListingApi.updateListing(
                { ...listing, isPublic: !listing.isPublic },
                listing.listingId,
            );
            setListing(data);
        }
    };

    return (
        <Center height="15vh" boxShadow="md" rounded="md" width="100%">
            {/* Displays a "Skeleton Component" while the data is loading. */}
            {isLoading ? (
                <Skeleton height="100%" width="100%" rounded="md" />
            ) : (
                <HStack background="primary" height="100%" width="100%" rounded="md" spacing="auto" padding="0">
                    <VStack paddingY="10px" height="100%" spacing="auto" alignItems="flex-start">
                        <Container
                            background="accent.500"
                            width="fit-content"
                            rounded="md"
                            margin="0"
                            marginLeft="10px"
                        >
                            {!isLoading && (
                                <Text noOfLines={2} fontSize="xl">
                                    {listing?.name}
                                </Text>
                            )}
                        </Container>
                        <Container>{!isLoading && <Text noOfLines={2}>{listing?.description}</Text>}</Container>
                    </VStack>

                    <VStack paddingRight="10px">
                        {/* Only allow visibility to be toggled by the listing's author or an admin. */}
                        {((useStatusToggle && listing?.createdBy && isOwnProfile(listing?.createdBy)) ||
                            hasAdminPrivileges()) && (
                            <Button colorScheme="accent" variant="solid" onClick={handleToggleIsPublic}>
                                {!isLoading && (listing?.isPublic ? 'Public' : 'Private')}
                            </Button>
                        )}

                        {/* Only allow to see details about the listing if the user is logged in. */}
                        {hasUserPrivileges() && (
                            <Button colorScheme="accent" variant="solid" onClick={handleSeeMore}>
                                See More
                            </Button>
                        )}
                    </VStack>
                </HStack>
            )}
        </Center>
    );
}
