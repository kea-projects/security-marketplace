import React from 'react';
import { Avatar, Tag, TagLabel, Text, VStack, SkeletonCircle, SkeletonText, Hide, Show } from '@chakra-ui/react';

interface UserBadgeProps {
    showFull?: boolean;
    isLoading: boolean;
    fullName: string;
    username: string;
}

export function UserBadge({ isLoading = false, fullName, username, showFull = false }: UserBadgeProps) {
    // TODO: provide proper link to the image.
    return (
        <>
            <Hide below="md">
                <Tag size="lg" paddingY="3px" paddingX="7px" rounded="full" colorScheme="accent" color="textDark">
                    <SkeletonCircle size="fit-content" isLoaded={!isLoading}>
                        <Avatar size="lg" name={fullName} src="https://bit.ly/broken-link" />
                    </SkeletonCircle>

                    <SkeletonText noOfLines={2} width="150px" isLoaded={!isLoading}>
                        <TagLabel paddingY="3px" paddingX="5px">
                            <VStack spacing="1px">
                                <Text fontSize="lg">{fullName}</Text>
                                <Text fontSize="md">{username}</Text>
                            </VStack>
                        </TagLabel>
                    </SkeletonText>
                </Tag>
            </Hide>
            <Show below="md">
                <SkeletonCircle size="fit-content" isLoaded={!isLoading} border="2px" borderColor="background">
                    <Avatar size="lg" name={fullName} src="https://bit.ly/broken-link" />
                </SkeletonCircle>
                {showFull && (
                    <SkeletonText noOfLines={2} width="150px" isLoaded={!isLoading}>
                        <VStack spacing="1px" color="textDark">
                            <Text fontSize="lg">{fullName}</Text>
                            <Text fontSize="md">{username}</Text>
                        </VStack>
                    </SkeletonText>
                )}
            </Show>
        </>
    );
}
