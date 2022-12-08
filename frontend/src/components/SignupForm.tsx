import React from 'react';
import { useForm } from 'react-hook-form';
import { VStack, FormControl, FormLabel, FormErrorMessage, Input, Button, Text } from '@chakra-ui/react';

export interface SignupFormFields {
    fullName: string;
    username: string;
    password: string;
}

interface SignupFormProps {
    onSubmit: (formFields: SignupFormFields) => void;
    isLoading?: boolean;
    error?: string;
}

export function SignupForm({ onSubmit, isLoading = false, error }: SignupFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormFields>();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <VStack>
                <FormControl isInvalid={!!errors.fullName}>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                        type="text"
                        placeholder="Bob 'the' Builder"
                        {...register('fullName', {
                            required: 'Full name is required to sign up.',
                            maxLength: { value: 60, message: 'Name cannot exceed 60 characters.' },
                        })}
                    />
                    <FormErrorMessage>{errors.fullName?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.username}>
                    <FormLabel>Username</FormLabel>
                    <Input
                        type="email"
                        placeholder="user@example.com"
                        {...register('username', {
                            required: 'Username is required to sign up.',
                            maxLength: { value: 320, message: 'Username cannot exceed 320 characters.' },
                        })}
                    />
                    <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <Input
                        type="password"
                        placeholder="*********"
                        {...register('password', {
                            required: 'Password is required to sign up.',
                            minLength: { value: 8, message: 'Password has to contain at least 8 characters.' },
                            maxLength: { value: 32, message: 'Password cannot exceed 32 characters.' },
                            pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    'Password must contain at least one lowercase character, one uppercase character, a symbol and one number',
                            },
                        })}
                    />
                    <FormErrorMessage>
                        <Text noOfLines={[1, 2, 3]}>{errors.password?.message}</Text>
                    </FormErrorMessage>
                </FormControl>

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
                    Submit
                </Button>
            </VStack>
        </form>
    );
}
