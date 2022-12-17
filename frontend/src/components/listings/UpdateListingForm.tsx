import React from 'react';
import { useForm } from 'react-hook-form';
import { VStack, FormControl, FormLabel, FormErrorMessage, Input, Button, Textarea, Checkbox } from '@chakra-ui/react';
import { ListingResponse } from '../../api/ListingApi';

export interface UpdateListingFormFields {
    name: string;
    description: string;
    isPublic: boolean;
}

interface UpdateListingFormProps {
    onSubmit: (formFields: UpdateListingFormFields) => void;
    isLoading?: boolean;
    error?: string;
    listing?: ListingResponse;
}

/**
 * Creates a component with the form for updating a `Listing`.
 */
export function UpdateListingForm({ onSubmit, isLoading = false, error, listing }: UpdateListingFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UpdateListingFormFields>();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <VStack color="textDark">
                <FormControl isInvalid={!!errors.name}>
                    <FormLabel>Listing Name</FormLabel>
                    <Input
                        type="text"
                        placeholder={listing?.name}
                        _placeholder={{ color: 'textDark' }}
                        {...register('name', {
                            required: 'The name is required to post the listing.',
                            maxLength: { value: 150, message: 'Name cannot exceed 150 characters.' },
                        })}
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description}>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                        placeholder={listing?.description}
                        {...register('description', {
                            required: 'The description is required to post the listing.',
                            maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters.' },
                        })}
                    />
                    <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.isPublic}>
                    <FormLabel>Visibility</FormLabel>
                    <Checkbox {...register('isPublic')}>Public</Checkbox>
                    <FormErrorMessage>{errors.isPublic?.message}</FormErrorMessage>
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
                >
                    Update Listing
                </Button>
            </VStack>
        </form>
    );
}
