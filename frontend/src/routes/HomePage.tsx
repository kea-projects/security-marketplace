import React, { useEffect, useState } from 'react';
import { Text, SimpleGrid, Center, SkeletonText } from '@chakra-ui/react';

import { Card } from '../components/Card';
import { Layout } from '../components/Layout';
import { getMarketEntries } from '../fake-api/api';
import { MarketEntry } from '../fake-api/marketEntries';

export function HomePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [entries, setEntries] = useState<MarketEntry[] | undefined>(undefined);

    useEffect(() => {
        // TODO: replace this with actual implementation
        const fetchMarketEntries = async () => {
            setIsLoading(true);
            setEntries(await getMarketEntries());
            setIsLoading(false);
        };

        fetchMarketEntries();
    }, []);

    const getGridItems = (entries: MarketEntry[] = [], isLoading = false) => {
        return entries.map((entry, index) => {
            return (
                <Center key={index}>
                    <Card minWidth="300px" variant="rounded" background="accent.500">
                        {isLoading && <SkeletonText mt="4" noOfLines={5} spacing="10px" width="100%" />}
                        {!isLoading && (
                            <>
                                <Text fontSize="2xl">{entry.title}</Text>
                                <Text>{entry.content}</Text>
                            </>
                        )}
                    </Card>
                </Center>
            );
        });
    };

    return (
        <Layout>
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
