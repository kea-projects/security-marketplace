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

/**
 * Creates a component that displays the comment list for a given listing.
 * It will render the list itself, along with with a box containing the comment form, to allow the user to post
 * their own comment.
 */
export function CommentList({ listingId, comments, setComments, parentIsLoading = false }: CommentListProps) {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [postCommentError, setPostCommentError] = useState<string | undefined>(undefined);

    // Context
    const { userData } = useContext(UserContext);

    // Handlers

    /**
     * Attempts to create the new comment, and display an error message if it fails.
     * @param formFields
     */
    const handlePostComment = async (formFields: CommentFormFields) => {
        setIsLoading(true);
        try {
            if (userData.userId && userData.username && listingId) {
                const userResponse = await UserApi.getUser(userData.userId);

                const { data } = await ListingApi.createComment({
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
            setPostCommentError('We encountered an error while posting your comment.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Generates `UserComment` components for each of the given comments.
     */
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
