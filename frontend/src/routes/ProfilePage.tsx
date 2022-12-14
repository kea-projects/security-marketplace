import React, { useEffect, useState } from 'react';
import { SimpleGrid } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { Listing } from '../components/Listing';
import { ListingApi, ListingResponse } from '../api/ListingApi';
import { useParams } from 'react-router-dom';

export function ProfilePage() {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [listings, setListings] = useState<ListingResponse[] | undefined>(undefined);

    // Path parameters
    const { userId } = useParams();

    // Constants
    const listingApi = new ListingApi();

    // Fetch user listings
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (userId) {
                const { data } = await listingApi.getUserListings(userId);
                setListings(data);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGridItems = (listings: ListingResponse[] = []) => {
        return listings.map((listing, index) => <Listing isLoading={isLoading} key={index} listing={listing} />);
    };

    return (
        <Layout useProfilebar={true} userId={userId}>
            <SimpleGrid
                minChildWidth="350px"
                spacing={10}
                width="100%"
                paddingTop="60px"
                paddingX="30px"
                overflowY="auto"
            >
                {isLoading ? getGridItems([...Array(5)]) : getGridItems(listings)}
            </SimpleGrid>
        </Layout>
    );
}
