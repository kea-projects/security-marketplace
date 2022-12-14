import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SimpleGrid, Container } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { UserBadge } from '../components/UserBadge';
import { getUsers } from '../fake-api/api';
import { User } from '../fake-api/users';

export function UsersPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<User[] | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setUsers(await getUsers());
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const getGridItems = (users: User[] = [], isLoading = false) => {
        return users.map((user, index) => {
            return (
                <Container key={index}>
                    {/* TODO: link to individual profile page */}
                    <Link to="/profile">
                        <UserBadge
                            fullName={isLoading ? '' : user.fullName}
                            username={isLoading ? '' : user.username}
                            isLoading={isLoading}
                            showFull={true}
                        />
                    </Link>
                </Container>
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
                {isLoading ? getGridItems([...Array(5)], true) : getGridItems(users)}
            </SimpleGrid>
        </Layout>
    );
}
