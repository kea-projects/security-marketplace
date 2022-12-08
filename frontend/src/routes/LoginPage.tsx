import React, { useState } from 'react';
import { Center, Text, Link } from '@chakra-ui/react';
import { Link as Navigate, useNavigate } from 'react-router-dom';

import { Card } from '../components/Card';
import { LoginForm, LoginFormFields } from '../components/LoginForm';
import { login } from '../fake-api/api';

export function LoginPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const submitLogin = async (formFields: LoginFormFields) => {
        setIsLoading(true);

        const response = await login(formFields);
        // TODO: Refactor this after implementing the real API
        if (response !== true) {
            setLoginError(response);
            setIsLoading(false);
        } else {
            setLoginError(undefined);
            navigate('/');
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
