import React, { useState, useEffect } from 'react';

import { HStack, Box, Skeleton, VStack, Button, Text, Image, useDisclosure } from '@chakra-ui/react';

import { ListingResponse } from '../../api/ListingApi';
import { UserApi, UserResponse } from '../../api/UserApi';
import { useNavigate } from 'react-router-dom';
import { UpdateListingModal } from './UpdateListingModal';
import { hasAdminPrivileges, isOwnProfile } from '../../utils/Auth';

interface ListingDetailsProps {
    listing?: ListingResponse;
    setListing: (listing: ListingResponse | undefined) => void;
    onIsPublicToggle: () => void;
    parentIsLoading?: boolean;
}

export function ListingDetails({
    listing,
    setListing,
    onIsPublicToggle,
    parentIsLoading = false,
}: ListingDetailsProps) {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [author, setAuthor] = useState<UserResponse | undefined>(undefined);

    // Constants
    const userApi = new UserApi();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fetch author
    useEffect(() => {
        const fetchAuthor = async () => {
            setIsLoading(true);
            if (listing) {
                const { data } = await userApi.getUser(listing.createdBy);
                setAuthor(data);
                setIsLoading(false);
            }
        };

        fetchAuthor();
    }, [parentIsLoading]);

    // Handlers
    const handleVisitProfile = () => {
        if (author) {
            navigate(`/profile/${author.userId}`);
        }
    };

    return (
        <HStack width="100%" justifyContent="space-between" alignItems="flex-start" gap="25px">
            {/* Listing Image & Title */}
            {parentIsLoading ? (
                <Skeleton height="200px" width="250px" rounded="md" />
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

            {/* Listing Description */}
            <Skeleton
                width="100%"
                height="100%"
                isLoaded={!(parentIsLoading || isLoading)}
                alignSelf="start"
                rounded="md"
            >
                <Box
                    background="accent.500"
                    minHeight="10vh"
                    height="fit-content"
                    minWidth="250px"
                    width="100%"
                    rounded="md"
                    padding="10px"
                >
                    <HStack justifyContent="space-between" gap="30px">
                        <Text as="b" fontSize="lg">
                            Author: {author?.name}
                        </Text>
                        <Button colorScheme="layerBtn" variant="solid" onClick={handleVisitProfile}>
                            Visit Profile
                        </Button>
                    </HStack>

                    <Text fontSize="lg">Listing Description</Text>
                    <Text>{listing?.description}</Text>
                </Box>
            </Skeleton>

            {/* Listing Actions */}
            {((author?.userId && isOwnProfile(author?.userId)) || hasAdminPrivileges()) && (
                <VStack>
                    <Skeleton height="50px" minWidth="150px" rounded="md" isLoaded={!parentIsLoading}>
                        <Button colorScheme="accent" variant="solid" onClick={onIsPublicToggle}>
                            Status: {!parentIsLoading && (listing?.isPublic ? 'Public' : 'Private')}
                        </Button>
                    </Skeleton>
                    (
                    <Skeleton height="50px" minWidth="150px" rounded="md" isLoaded={!parentIsLoading}>
                        <Button colorScheme="accent" variant="solid" onClick={onOpen}>
                            Edit
                        </Button>

                        <UpdateListingModal
                            listing={listing}
                            setListing={setListing}
                            onClose={onClose}
                            isOpen={isOpen}
                        />
                    </Skeleton>
                    )
                </VStack>
            )}
        </HStack>
    );
}
