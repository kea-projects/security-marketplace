import React from 'react';
import { useForm } from 'react-hook-form';
import { HStack, FormControl, FormLabel, FormErrorMessage, Button, Textarea, BoxProps, Box } from '@chakra-ui/react';

export interface CommentFormFields {
    comment: string;
}

interface CommentFormProps {
    onFormSubmit: (formFields: CommentFormFields) => void;
    isLoading?: boolean;
    error?: string;
}

/**
 * Creates a component containing the form for posting a comment.
 */
export function CommentForm({ onFormSubmit, isLoading = false, error, ...rest }: BoxProps & CommentFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CommentFormFields>();

    return (
        <Box {...rest}>
            <form onSubmit={handleSubmit(onFormSubmit)} style={{ width: '100%' }}>
                <HStack width="fit-content" background="layer" height="fit-content" rounded="md" padding="10px">
                    <FormControl isInvalid={!!errors.comment}>
                        <FormLabel>Comment</FormLabel>
                        <Textarea
                            minWidth="400px"
                            placeholder="Write your comment here..."
                            {...register('comment', {
                                required: 'You need to write text in order to post a comment.',
                                maxLength: { value: 500, message: 'Comment cannot exceed 500 characters.' },
                            })}
                        />
                        <FormErrorMessage>{errors.comment?.message}</FormErrorMessage>
                    </FormControl>

                    {/* Api Error */}
                    <FormControl isInvalid={!!error}>
                        <FormErrorMessage>{error}</FormErrorMessage>
                    </FormControl>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Submitting"
                        colorScheme="accent"
                        variant="solid"
                        minWidth="min-content"
                    >
                        Post Comment
                    </Button>
                </HStack>
            </form>
        </Box>
    );
}
