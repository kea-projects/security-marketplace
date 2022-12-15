import React, { useContext, useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { CommentResponse, ListingApi } from '../../api/ListingApi';
import { UserContext } from '../../context/UserContextProvider';
import { CommentForm, CommentFormFields } from './CommentForm';
import { UserComment } from './UserComment';
import { UserApi } from '../../api/UserApi';

interface CommentListProps {
    listingId?: string;
    comments?: CommentResponse[];
    setComments: (comments: CommentResponse[] | undefined) => void;
    parentIsLoading?: boolean;
}

export function CommentList({ listingId, comments, setComments, parentIsLoading = false }: CommentListProps) {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [postCommentError, setPostCommentError] = useState<string | undefined>(undefined);

    // Context
    const { userData } = useContext(UserContext);

    // Constants
    const listingApi = new ListingApi();
    const userApi = new UserApi();

    // Handlers
    const handlePostComment = async (formFields: CommentFormFields) => {
        setIsLoading(true);
        try {
            if (userData.userId && userData.username && listingId) {
                const userResponse = await userApi.getUser(userData.userId);

                const { data } = await listingApi.createComment({
                    comment: formFields.comment,
                    commentedOn: listingId,
                    createdBy: userData.userId,
                    email: userData.username,
                    name: userResponse.data.name,
                });
                comments?.push(data);
                setComments(comments);
                setPostCommentError(undefined);
            } else {
                setPostCommentError('We encountered an error while retrieving your user.');
            }
        } catch (error) {
            // TODO: Discuss if we want to return this message or not.
            setPostCommentError('We encountered an error while posting your comment.');
        } finally {
            setIsLoading(false);
        }
    };

    const getCommentList = (comments: CommentResponse[] = []) => {
        comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return comments.map((comment, index) => {
            return (
                <UserComment
                    key={comment?.commentId || index}
                    userId={comment?.createdBy}
                    name={comment?.name}
                    email={comment?.email}
                    comment={comment?.comment}
                    isLoading={parentIsLoading}
                />
            );
        });
    };

    return (
        <Box position="relative" width="100%">
            <CommentForm
                onFormSubmit={handlePostComment}
                error={postCommentError}
                isLoading={isLoading}
                position="absolute"
                right="10px"
            />
            <VStack>{parentIsLoading ? getCommentList([...Array(5)]) : getCommentList(comments)}</VStack>
        </Box>
    );
}
