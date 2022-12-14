import React, { useEffect, useState } from 'react';
import { Box, Button, SimpleGrid, useDisclosure, VStack } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { Listing } from '../components/listings/Listing';
import { ListingApi, ListingResponse } from '../api/ListingApi';
import { useParams } from 'react-router-dom';
import { CreateListingModal } from '../components/listings/CreateListingModal';
import { hasAdminPrivileges, isOwnProfile } from '../utils/Auth';
import { UserResponse } from '../api/UserApi';

/**
 * Creates a `Page` component for a user's profile. It will display the navbar, along with the
 * given user's listings, and a button for creating a new listing.
 *
 * It requires the user to be logged in to access this page.
 *
 * NOTE: An admin account is allowed to manage and create new listings on this user's behalf.
 */
export function ProfilePage() {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [listings, setListings] = useState<ListingResponse[] | undefined>(undefined);
    const [displayListings, setDisplayListings] = useState<ListingResponse[] | undefined>(undefined);

    // Path parameters
    const { userId } = useParams();

    // Constants
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fetch user listings
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (userId) {
                const { data } = await ListingApi.getUserListings(userId);
                setListings(data);
                setDisplayListings(data);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    /**
     * Creates `Listing` components for each of the user's listings.
     */
    const getGridItems = (listings: ListingResponse[] = []) => {
        return listings.map((listing, index) => {
            return (
                <Listing
                    isLoading={isLoading}
                    key={isLoading ? index : listing.listingId}
                    listingData={{ ...listing }}
                />
            );
        });
    };

    return (
        <Layout
            useProfilebar={true}
            userId={userId}
            searchItems={listings}
            setSearchItems={setDisplayListings as (items: UserResponse[] | ListingResponse[]) => void}
        >
            <VStack width="100%" overflowY="auto">
                {((userId && isOwnProfile(userId)) || hasAdminPrivileges()) && (
                    <Box width="100%" paddingX="30px" display="flex" justifyContent="flex-end">
                        <Button
                            colorScheme="accent"
                            variant="solid"
                            roundedBottom="xl"
                            roundedTop="none"
                            onClick={onOpen}
                        >
                            Create new Listing
                        </Button>
                        <CreateListingModal
                            listings={listings}
                            setListings={setListings}
                            onClose={onClose}
                            isOpen={isOpen}
                            userId={userId}
                        />
                    </Box>
                )}
                <SimpleGrid minChildWidth="350px" spacing={10} width="100%" paddingTop="20px" paddingX="30px">
                    {isLoading ? getGridItems([...Array(5)]) : getGridItems(displayListings)}
                </SimpleGrid>
            </VStack>
        </Layout>
    );
}
