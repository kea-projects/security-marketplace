import React from 'react';
import { Skeleton, Box, VStack, Text } from '@chakra-ui/react';

import { Comment } from '../fake-api/comments';
import { User } from '../fake-api/users';
import { UserBadge } from './UserBadge';

interface UserCommentProps {
    isLoading: boolean;
    user: User;
    comment: Comment;
}

export function UserComment({ isLoading = false, user, comment }: UserCommentProps) {
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
                <UserBadge fullName={user?.fullName} username={user?.username} isLoading={isLoading} />
                <Box background="background" width="100%" height="fit-content" rounded="md" padding="10px">
                    <Text color="textDark">{comment?.comment}</Text>
                </Box>
            </VStack>
        </Skeleton>
    );
}
