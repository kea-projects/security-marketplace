import React, { useEffect, useState } from 'react';
import { Text, SimpleGrid, Center, SkeletonText } from '@chakra-ui/react';

import { Card } from '../components/themed/Card';
import { Layout } from '../components/Layout';
import { ListingApi, ListingResponse } from '../api/ListingApi';

export function HomePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [listings, setListings] = useState<ListingResponse[] | undefined>(undefined);
    const listingApi = new ListingApi();

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            const { data } = await listingApi.getListings();
            setListings(data);
            setIsLoading(false);
        };

        fetchListings();
    }, []);

    const getGridItems = (listings: ListingResponse[] = [], isLoading = false) => {
        return listings.map((listing, index) => {
            return (
                <Center key={index}>
                    <Card minWidth="300px" variant="rounded" background="accent.500">
                        {isLoading && <SkeletonText mt="4" noOfLines={5} spacing="10px" width="100%" />}
                        {!isLoading && (
                            <>
                                <Text fontSize="2xl">{listing.name}</Text>
                                <Text>{listing.description}</Text>
                            </>
                        )}
                    </Card>
                </Center>
            );
        });
    };

    return (
        <Layout>
            <SimpleGrid
                minChildWidth="350px"
                spacing={10}
                width="100%"
                paddingTop="60px"
                paddingX="30px"
                overflowY="auto"
            >
                {isLoading ? getGridItems([...Array(5)], true) : getGridItems(listings)}
            </SimpleGrid>
        </Layout>
    );
}
