import React, { useContext, useState } from 'react';
import { Center, Text, Link } from '@chakra-ui/react';
import { Link as Navigate } from 'react-router-dom';

import { Card } from '../components/themed/Card';
import { LoginForm, LoginFormFields } from '../components/auth/LoginForm';
import { AuthApi } from '../api/AuthApi';
import { getTokenData } from '../utils/Auth';
import { UserContext } from '../context/UserContextProvider';

/**
 * Creates a `Page` component for the login form.
 */
export function LoginPage() {
    // States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<string | undefined>(undefined);

    // Context
    const { setUserData } = useContext(UserContext);

    /**
     * Calls the Api and attempts to log the user in.
     * If it succeeds, it will set the user data in the local storage.
     * @param formFields
     */
    const submitLogin = async (formFields: LoginFormFields) => {
        setIsLoading(true);

        try {
            const { data } = await AuthApi.login({
                email: formFields.username,
                password: formFields.password,
            });
            const tokenData = getTokenData(data.accessToken);
            setUserData({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                username: tokenData.sub,
                role: tokenData.role,
                userId: tokenData.userId,
            });
            setLoginError(undefined);
        } catch (error) {
            // TODO: Discuss if we want to return this message or not.
            setLoginError('Wrong credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Center width="100%" height="100vh">
            <Card variant="rounded" minWidth="300px" maxWidth="18vw">
                <Text fontSize="3xl">Login</Text>

                <LoginForm onSubmit={submitLogin} isLoading={isLoading} error={loginError} />

                <Link as={Navigate} to={'/signup'} color="link">
                    Not signed up yet? Click here.
                </Link>
            </Card>
        </Center>
    );
}
