import React from 'react';
import { Skeleton, Box, VStack, Text } from '@chakra-ui/react';

import { UserBadge } from './UserBadge';

interface UserCommentProps {
    isLoading: boolean;
    name: string;
    email: string;
    comment: string;
}

export function UserComment({ isLoading = false, name, email, comment }: UserCommentProps) {
    return (
        <Skeleton isLoaded={!isLoading} alignSelf="start" rounded="md">
            <VStack
                background="layer"
                minWidth="250px"
                width="fit-content"
                rounded="md"
                padding="10px"
                alignItems="flex-start"
            >
                <UserBadge fullName={name} username={email} isLoading={isLoading} />
                <Box background="background" width="100%" height="fit-content" rounded="md" padding="10px">
                    <Text color="textDark">{comment}</Text>
                </Box>
            </VStack>
        </Skeleton>
    );
}
