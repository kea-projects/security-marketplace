import React, { useContext, useState } from 'react';
import { Center, Text, Link } from '@chakra-ui/react';
import { Link as Navigate } from 'react-router-dom';

import { Card } from '../components/themed/Card';
import { SignupForm, SignupFormFields } from '../components/auth/SignupForm';
import { AuthApi } from '../api/AuthApi';
import { UserContext } from '../context/UserContextProvider';
import { getTokenData } from '../utils/Auth';

/**
 * Creates a `Page` component for the signup form.
 */
export function SignupPage() {
    // States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [signupError, setSignupError] = useState<string | undefined>(undefined);

    // Context
    const { setUserData } = useContext(UserContext);

    /**
     * Calls the Api and attempts to signup the user.
     * If it succeeds, it will set the user data in the local storage.
     * @param formFields
     */
    const submitSignup = async (formFields: SignupFormFields) => {
        setIsLoading(true);
        try {
            const { data } = await AuthApi.signup({
                email: formFields.username,
                password: formFields.password,
                name: formFields.fullName,
            });
            const tokenData = getTokenData(data.accessToken);
            setUserData({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                username: tokenData.sub,
                role: tokenData.role,
                userId: tokenData.userId,
            });
            setSignupError(undefined);
        } catch (error) {
            setSignupError('We encountered an error while creating your account.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Center width="100%" height="100vh">
            <Card variant="rounded" minWidth="300px" maxWidth="18vw">
                <Text fontSize="3xl">Signup</Text>

                <SignupForm onSubmit={submitSignup} isLoading={isLoading} error={signupError} />

                <Link as={Navigate} to={'/login'} color="link" href="#">
                    Already have an account? Click here.
                </Link>
            </Card>
        </Center>
    );
}
