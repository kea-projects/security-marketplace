import React, { useEffect, useState } from 'react';
import { SimpleGrid } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { ListingApi, ListingResponse } from '../api/ListingApi';
import { UserResponse } from '../api/UserApi';
import { MarketListing } from '../components/listings/MarketListing';

/**
 * Creates a `Page` component that displays the navbar and a list of all currently public listings.
 */
export function HomePage() {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [listings, setListings] = useState<ListingResponse[] | undefined>(undefined);
    const [displayListings, setDisplayListings] = useState<ListingResponse[] | undefined>(undefined);

    // Fetch listings.
    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            const { data } = await ListingApi.getListings();
            setListings(data);
            setDisplayListings(data);
            setIsLoading(false);
        };

        fetchListings();
    }, []);

    /**
     * Creates a `MarketListing` component for each listing.
     * @param listings
     */
    const getGridItems = (listings: ListingResponse[] = []) => {
        return listings.map((listing, index) => {
            return (
                <MarketListing
                    parentIsLoading={isLoading}
                    key={isLoading ? index : listing.listingId}
                    listing={listing}
                />
            );
        });
    };

    return (
        <Layout
            searchItems={listings}
            setSearchItems={setDisplayListings as (items: UserResponse[] | ListingResponse[]) => void}
        >
            <SimpleGrid
                minChildWidth="350px"
                spacing={10}
                width="100%"
                paddingTop="60px"
                paddingX="30px"
                overflowY="auto"
            >
                {isLoading ? getGridItems([...Array(5)]) : getGridItems(displayListings)}
            </SimpleGrid>
        </Layout>
    );
}
