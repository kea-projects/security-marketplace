import React from 'react';
import { Skeleton, Box, VStack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { UserBadge } from '../UserBadge';

interface UserCommentProps {
    isLoading: boolean;
    name: string;
    email: string;
    comment: string;
    userId: string;
}

export function UserComment({ isLoading = false, name, email, comment, userId }: UserCommentProps) {
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
                <Link to={`/profile/${userId}`}>
                    <UserBadge fullName={name} username={email} isLoading={isLoading} />
                </Link>
                <Box background="background" width="100%" height="fit-content" rounded="md" padding="10px">
                    <Text color="textDark">{comment}</Text>
                </Box>
            </VStack>
        </Skeleton>
    );
}
