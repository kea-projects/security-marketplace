import React, { useContext, useState } from 'react';
import { Center, Text, Link } from '@chakra-ui/react';
import { Link as Navigate } from 'react-router-dom';

import { Card } from '../components/themed/Card';
import { SignupForm, SignupFormFields } from '../components/auth/SignupForm';
import { AuthApi } from '../api/AuthApi';
import { UserContext } from '../context/UserContextProvider';
import { getTokenData } from '../utils/Auth';

export function SignupPage() {
    const { setUserData } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [signupError, setSignupError] = useState<string | undefined>(undefined);
    const authApi = new AuthApi();

    const submitSignup = async (formFields: SignupFormFields) => {
        setIsLoading(true);
        try {
            const { data } = await authApi.signup({
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
            // TODO: Discuss if we want to return this message or not.
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
