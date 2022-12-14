import React, { useEffect, useState } from 'react';
import { Container, Button, VStack, Text, Skeleton, Box, Divider } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { getMarketEntryById, getUserComments, getUsers } from '../fake-api/api';
import { MarketEntry } from '../fake-api/marketEntries';
import { useParams } from 'react-router-dom';
import { User } from '../fake-api/users';
import { UserComment } from '../components/UserComment';
import { Comment } from '../fake-api/comments';

export function ListingDetailsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [listing, setListing] = useState<MarketEntry | undefined>(undefined);
    const [comments, setComments] = useState<Comment[] | undefined>(undefined);
    const [users, setUsers] = useState<User[] | undefined>(undefined);

    const { listingId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (listingId) {
                const listing = await getMarketEntryById(listingId);
                const comments = await getUserComments();
                const users = await getUsers();
                setListing(listing);
                setComments(comments);
                setUsers(users);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getCommentList = (comments: Comment[] = [], users: User[] = []) => {
        return comments.map((comment, index) => {
            return <UserComment key={index} user={users[index]} comment={comment} isLoading={isLoading} />;
        });
    };

    return (
        <Layout useSearchbar={false}>
            <VStack width="100%" paddingX="50px" paddingTop="60px" spacing="50px" overflowY="auto">
                <Box width="100%" display="flex" justifyContent="space-between">
                    <Box height="15vh" width="20vw">
                        <Skeleton height="100%" width="100%" rounded="md" isLoaded={!isLoading}>
                            <Container height="100%" background="accent.500" boxShadow="md" rounded="md" padding="10px">
                                <Text>{listing?.title}</Text>
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
                        <Text>{listing?.content}</Text>
                    </Box>
                </Skeleton>
                <Divider borderWidth="1px" rounded="md" borderColor="layer" />
                {isLoading ? getCommentList([...Array(5)]) : getCommentList(comments, users)}
            </VStack>
        </Layout>
    );
}
