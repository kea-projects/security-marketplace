import React, { useEffect, useState } from 'react';
import { Container, Button, VStack, Text, Skeleton, Box, Divider } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { useParams } from 'react-router-dom';
import { UserComment } from '../components/UserComment';
import { ListingApi, ListingResponse, CommentResponse } from '../api/ListingApi';

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

    const getCommentList = (comments: CommentResponse[] = []) => {
        return comments.map((comment, index) => {
            return (
                <UserComment
                    key={index}
                    name={comment?.name}
                    email={comment?.email}
                    comment={comment?.comment}
                    isLoading={isLoading}
                />
            );
        });
    };

    return (
        <Layout useSearchbar={false}>
            <VStack width="100%" paddingX="50px" paddingTop="60px" spacing="50px" overflowY="auto">
                <Box width="100%" display="flex" justifyContent="space-between">
                    <Box height="15vh" width="20vw">
                        <Skeleton height="100%" width="100%" rounded="md" isLoaded={!isLoading}>
                            <Container height="100%" background="accent.500" boxShadow="md" rounded="md" padding="10px">
                                <Text>{listing?.name}</Text>
                            </Container>
                        </Skeleton>
                    </Box>
                    <Skeleton height="5vh" minWidth="15vw" rounded="md" isLoaded={!isLoading}>
                        <Button colorScheme="accent" variant="solid">
                            Status: {!isLoading && (listing?.isPublic ? 'Public' : 'Private')}
                        </Button>
                    </Skeleton>
                </Box>
                <Skeleton isLoaded={!isLoading} alignSelf="start" rounded="md">
                    <Box
                        background="accent.500"
                        minHeight="10vh"
                        height="fit-content"
                        minWidth="250px"
                        width="fit-content"
                        rounded="md"
                        padding="10px"
                    >
                        <Text>{listing?.description}</Text>
                    </Box>
                </Skeleton>
                <Divider borderWidth="1px" rounded="md" borderColor="layer" />
                {isLoading ? getCommentList([...Array(5)]) : getCommentList(comments)}
            </VStack>
        </Layout>
    );
}
