import React, { useState } from 'react';
import { Center, Text, Link } from '@chakra-ui/react';
import { Link as Navigate, useNavigate } from 'react-router-dom';

import { Card } from '../components/Card';
import { SignupForm, SignupFormFields } from '../components/SignupForm';
import { signup } from '../fake-api/api';

export function SignupPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [signupError, setSignupError] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const submitSignup = async (formFields: SignupFormFields) => {
        setIsLoading(true);

        const response = await signup(formFields);
        console.log(response);
        // TODO: Refactor this after implementing the real API
        if (response !== true) {
            setSignupError(response);
            setIsLoading(false);
        } else {
            setSignupError(undefined);
            navigate('/login');
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
