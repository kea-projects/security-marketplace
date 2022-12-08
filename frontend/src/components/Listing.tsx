import React from 'react';
import { Center, Skeleton, Container, HStack, Text, VStack, Button } from '@chakra-ui/react';
import { MarketEntry } from '../fake-api/marketEntries';
import { useNavigate } from 'react-router-dom';

interface ListingProps {
    isLoading: boolean;
    // TODO: Replace with actual entity form the API
    marketEntry: MarketEntry;
}

export function Listing({ isLoading = false, marketEntry }: ListingProps) {
    const navigate = useNavigate();

    const handleSeeMore = () => {
        navigate(`/listing-details/${2}`);
    };

    return (
        <Center height="15vh" boxShadow="md" rounded="md">
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
                                    {marketEntry.title}
                                </Text>
                            )}
                        </Container>
                        <Container>{!isLoading && <Text noOfLines={2}>{marketEntry.content}</Text>}</Container>
                    </VStack>

                    <VStack paddingRight="10px">
                        <Button colorScheme="accent" variant="solid">
                            {!isLoading && (marketEntry.isPublic ? 'Public' : 'Private')}
                        </Button>
                        <Button colorScheme="accent" variant="solid" onClick={handleSeeMore}>
                            See More
                        </Button>
                    </VStack>
                </HStack>
            )}
        </Center>
    );
}
