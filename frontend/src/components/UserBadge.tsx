import React from 'react';
import {
    Avatar,
    Tag,
    TagLabel,
    Text,
    VStack,
    SkeletonCircle,
    SkeletonText,
    Hide,
    Show,
    Container,
} from '@chakra-ui/react';

interface UserBadgeProps {
    showFull?: boolean;
    isLoading: boolean;
    fullName?: string;
    username?: string;
    pictureUrl?: string;
}

export function UserBadge({ isLoading = false, fullName, username, pictureUrl, showFull = false }: UserBadgeProps) {
    // TODO: provide proper link to the image.
    return (
        <>
            <Hide below="md">
                <Tag
                    size="lg"
                    width="fit-content"
                    paddingY="3px"
                    paddingLeft="7px"
                    paddingRight="17px"
                    rounded="full"
                    colorScheme="accent"
                    color="textDark"
                    boxShadow="md"
                >
                    <SkeletonCircle size="fit-content" isLoaded={!isLoading}>
                        <Avatar size="lg" name={fullName} src={pictureUrl} />
                    </SkeletonCircle>

                    <SkeletonText noOfLines={2} minWidth="150px" width="fit-content" isLoaded={!isLoading}>
                        <TagLabel paddingY="3px" paddingX="5px" width="fit-content">
                            <VStack spacing="1px" alignItems="flex-start">
                                <Text fontSize="lg">{fullName}</Text>
                                <Text fontSize="md">{username}</Text>
                            </VStack>
                        </TagLabel>
                    </SkeletonText>
                </Tag>
            </Hide>
            <Show below="md">
                <Container display="flex" alignItems="center" boxShadow="md">
                    <SkeletonCircle
                        size="fit-content"
                        isLoaded={!isLoading}
                        border="2px"
                        margin="5px"
                        borderColor="background"
                    >
                        <Avatar size="lg" name={fullName} src="https://bit.ly/broken-link" />
                    </SkeletonCircle>
                    {showFull && (
                        <SkeletonText noOfLines={2} width="150px" isLoaded={!isLoading}>
                            <Tag
                                paddingY="3px"
                                paddingX="5px"
                                colorScheme="accent"
                                color="textDark"
                                w="fit-content"
                                maxW="fit-content"
                            >
                                <VStack spacing="1px" color="textDark">
                                    <Text fontSize="lg">{fullName}</Text>
                                    <Text fontSize="md">{username}</Text>
                                </VStack>
                            </Tag>
                        </SkeletonText>
                    )}
                </Container>
            </Show>
        </>
    );
}
