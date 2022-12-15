import React from 'react';

import { HStack, Box, Skeleton, VStack, Button, Text, Image } from '@chakra-ui/react';

import { ListingResponse } from '../../api/ListingApi';

interface ListingDetailsProps {
    listing?: ListingResponse;
    onIsPublicToggle: () => void;
    isLoading?: boolean;
}

export function ListingDetails({ listing, onIsPublicToggle, isLoading = false }: ListingDetailsProps) {
    return (
        <HStack>
            <Box width="100%" display="flex" justifyContent="space-between">
                <Box height="15vh" width="20vw">
                    {isLoading ? (
                        <Skeleton height="200px" width="100%" rounded="md" />
                    ) : (
                        <VStack
                            height="fit-content"
                            background="accent.500"
                            boxShadow="md"
                            rounded="md"
                            padding="10px"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text>{listing?.name}</Text>
                            <Image
                                boxSize="xs"
                                objectFit="cover"
                                borderRadius="md"
                                src={listing?.imageUrl}
                                alt={listing?.name}
                            />
                        </VStack>
                    )}
                </Box>
                <Skeleton height="5vh" minWidth="15vw" rounded="md" isLoaded={!isLoading}>
                    <Button colorScheme="accent" variant="solid" onClick={onIsPublicToggle}>
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
        </HStack>
    );
}
