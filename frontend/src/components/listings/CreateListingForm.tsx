import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { VStack, FormControl, FormLabel, FormErrorMessage, Input, Button, Textarea, Checkbox } from '@chakra-ui/react';
import FilePicker from 'chakra-ui-file-picker';

export interface CreateListingFormFields {
    name: string;
    description: string;
    isPublic: boolean;
}

interface CreateListingFormProps {
    onSubmit: (formFields: CreateListingFormFields & { file: File }) => void;
    isLoading?: boolean;
    error?: string;
}

/**
 * Creates a component with the form for creating a new `Listing`.
 */
export function CreateListingForm({ onSubmit, isLoading = false, error }: CreateListingFormProps) {
    // States
    const [file, setFile] = useState<File | undefined>(undefined);
    const [fileError, setFileError] = useState<string | undefined>(undefined);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateListingFormFields>();

    return (
        <form
            onSubmit={handleSubmit((formFields) => {
                // Manually validate the file input, since it is not compatible with the useForm hook.
                if (file) {
                    if (file.size <= 50 * 1024 * 1024) {
                        setFileError(undefined);
                        onSubmit({ ...formFields, file });
                    }
                    setFileError('The Listing picture exceeds the maximum file size. (50MB)');
                } else {
                    setFileError('The Listing picture is required to post the listing.');
                }
            })}
        >
            <VStack color="textDark">
                <FormControl isInvalid={!!errors.name}>
                    <FormLabel>Listing Name</FormLabel>
                    <Input
                        type="text"
                        placeholder="Used Toyota"
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
                        placeholder="Write a description of the item."
                        {...register('description', {
                            required: 'The description is required to post the listing.',
                            maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters.' },
                        })}
                    />
                    <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.isPublic}>
                    <FormLabel>Visibility</FormLabel>
                    <Checkbox defaultChecked {...register('isPublic')}>
                        Public
                    </Checkbox>
                    <FormErrorMessage>{errors.isPublic?.message}</FormErrorMessage>
                </FormControl>

                <FilePicker
                    onFileChange={(files) => {
                        setFile(files[0]);
                    }}
                    placeholder="Upload listing picture"
                    multipleFiles={false}
                    accept={'image/png, image/jpg'}
                    hideClearButton={false}
                    clearButtonLabel="Clear"
                />
                <FormControl isInvalid={!!fileError}>
                    <FormErrorMessage>{fileError}</FormErrorMessage>
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
                    Create Listing
                </Button>
            </VStack>
        </form>
    );
}
