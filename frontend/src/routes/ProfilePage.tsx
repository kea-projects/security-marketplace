import React, { useEffect, useState } from 'react';
import { Text, Center, Skeleton, SimpleGrid, HStack, Container } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { getCurrentUser, getMarketEntries } from '../fake-api/api';
import { User } from '../fake-api/users';
import { MarketEntry } from '../fake-api/marketEntries';

export function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [entries, setEntries] = useState<MarketEntry[] | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setUser(await getCurrentUser());
            setEntries(await getMarketEntries());
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const getGridItems = (entries: MarketEntry[] = [], isLoading = false) => {
        return entries.map((entry, index) => {
            return (
                <Center key={index}>
                    {isLoading ? (
                        <Skeleton height="50px" width="100%" />
                    ) : (
                        <HStack background="primary" rounded="xl" spacing="0" padding="5px">
                            <Container background="accent.500" rounded="2xl">
                                {!isLoading && (
                                    <Text noOfLines={2} fontSize="2xl">
                                        {entry.title}
                                    </Text>
                                )}
                            </Container>
                            <Container>{!isLoading && <Text noOfLines={2}>{entry.content}</Text>}</Container>
                        </HStack>
                    )}
                </Center>
            );
        });
    };

    return (
        <Layout isAdmin={true} useProfilebar={true} user={user} isLoading={isLoading}>
            <SimpleGrid
                minChildWidth="350px"
                spacing={10}
                width="100%"
                paddingTop="60px"
                paddingX="30px"
                overflowY="auto"
            >
                {isLoading ? getGridItems([...Array(5)], true) : getGridItems(entries)}
            </SimpleGrid>
        </Layout>
    );
}
