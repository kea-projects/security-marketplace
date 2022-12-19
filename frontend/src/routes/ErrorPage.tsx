import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Center, Text, VStack, Button, Card } from '@chakra-ui/react';

interface ErrorResponse {
    statusText: string;
    message: string;
}

/**
 * Creates a `Page` component that displays the error page in case an error occurs.
 */
export function ErrorPage() {
    const error = useRouteError() as ErrorResponse;
    const navigate = useNavigate();

    return (
        <Center width="100%" height="100vh">
            <Card id="error-page">
                <VStack>
                    <Text fontSize="xl" as="b">
                        Oops!
                    </Text>
                    <Text>Sorry, an unexpected error has occurred.</Text>
                    <Text fontSize="lg" as="i">
                        <i>{error.statusText || error.message}</i>
                    </Text>
                    <Button onClick={() => navigate('/')} colorScheme="accent" variant="solid">
                        Go Home
                    </Button>
                </VStack>
            </Card>
        </Center>
    );
}
