import React, { useEffect, useState } from 'react';
import { VStack, Divider } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { useParams } from 'react-router-dom';
import { ListingApi, ListingResponse, CommentResponse } from '../api/ListingApi';
import { CommentList } from '../components/comments/CommentList';
import { ListingDetails } from '../components/listings/ListingDetails';

/**
 * Creates a `Page` component that displays the navbar, and a listing's details along with its comment list,
 * based on the `listingId` provided as a path parameter.
 */
export function ListingDetailsPage() {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [listing, setListing] = useState<ListingResponse | undefined>(undefined);
    const [comments, setComments] = useState<CommentResponse[] | undefined>(undefined);

    // Path parameters
    const { listingId } = useParams();

    // Fetch listing and its comments
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (listingId) {
                const { data } = await ListingApi.getListingById(listingId);
                setListing(data.listing);
                setComments(data.comments);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handlers

    /**
     * Toggles the visibility of the listing by toggling the boolean `isPublic`.
     */
    const handleIsPublicToggle = async () => {
        if (listing) {
            const { data } = await ListingApi.updateListing(
                { ...listing, isPublic: !listing.isPublic },
                listing.listingId,
            );
            setListing(data);
        }
    };

    return (
        <Layout useSearchbar={false}>
            <VStack
                width="100%"
                height="100%"
                paddingX="50px"
                paddingTop="60px"
                spacing="50px"
                overflowY="auto"
                overflowX="hidden"
            >
                {/* Listing Data */}
                <ListingDetails
                    listing={listing}
                    setListing={setListing}
                    onIsPublicToggle={handleIsPublicToggle}
                    parentIsLoading={isLoading}
                />

                <Divider borderWidth="1px" rounded="md" borderColor="layer" />

                {/* Comments list */}
                <CommentList
                    listingId={listingId}
                    comments={comments}
                    setComments={setComments}
                    parentIsLoading={isLoading}
                />
            </VStack>
        </Layout>
    );
}
