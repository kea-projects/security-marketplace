import React, { useEffect, useState } from 'react';
import { SimpleGrid } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { getCurrentUser, getMarketEntries } from '../fake-api/api';
import { User } from '../fake-api/users';
import { MarketEntry } from '../fake-api/marketEntries';
import { Listing } from '../components/Listing';

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
    //TODO: Make it so that the isPublic can ge toggled
    const getGridItems = (entries: MarketEntry[] = []) => {
        return entries.map((entry, index) => <Listing isLoading={isLoading} key={index} marketEntry={entry} />);
    };

    return (
        <Layout useProfilebar={true}>
            <SimpleGrid
                minChildWidth="350px"
                spacing={10}
                width="100%"
                paddingTop="60px"
                paddingX="30px"
                overflowY="auto"
            >
                {isLoading ? getGridItems([...Array(5)]) : getGridItems(entries)}
            </SimpleGrid>
        </Layout>
    );
}
