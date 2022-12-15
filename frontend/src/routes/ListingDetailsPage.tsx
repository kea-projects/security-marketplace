import React, { useEffect, useState } from 'react';
import { VStack, Divider } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { useParams } from 'react-router-dom';
import { ListingApi, ListingResponse, CommentResponse } from '../api/ListingApi';
import { CommentList } from '../components/comments/CommentList';
import { ListingDetails } from '../components/listings/ListingDetails';

export function ListingDetailsPage() {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [listing, setListing] = useState<ListingResponse | undefined>(undefined);
    const [comments, setComments] = useState<CommentResponse[] | undefined>(undefined);

    // Path parameters
    const { listingId } = useParams();

    // Constants
    const listingApi = new ListingApi();

    // Fetch listing and its comments
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (listingId) {
                const { data } = await listingApi.getListingById(listingId);
                setListing(data.listing);
                setComments(data.comments);
                console.log(data);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handlers
    const handleIsPublicToggle = async () => {
        if (listing) {
            const { data } = await listingApi.updateListing(
                { ...listing, isPublic: !listing.isPublic },
                listing.listingId,
            );
            setListing(data);
        }
    };

    return (
        <Layout useSearchbar={false}>
            <VStack width="100%" paddingX="50px" paddingTop="60px" spacing="50px" overflowY="auto">
                {/* Listing Data */}
                <ListingDetails listing={listing} onIsPublicToggle={handleIsPublicToggle} isLoading={isLoading} />

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
