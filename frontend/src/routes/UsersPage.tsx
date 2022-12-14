import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SimpleGrid, Container } from '@chakra-ui/react';

import { Layout } from '../components/Layout';
import { UserBadge } from '../components/UserBadge';
import { UserApi, UserResponse } from '../api/UserApi';

export function UsersPage() {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<UserResponse[] | undefined>(undefined);

    // Constants
    const userApi = new UserApi();

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            const { data } = await userApi.getUsers();
            setUsers(data);
            setIsLoading(false);
        };

        fetchUsers();
    }, []);

    const getGridItems = (users: UserResponse[] = []) => {
        return users.map((user, index) => {
            return (
                <Container key={index}>
                    <Link to={`/profile/${user?.userId}`}>
                        <UserBadge fullName={user?.name} username={user?.email} isLoading={isLoading} showFull={true} />
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
                {isLoading ? getGridItems([...Array(5)]) : getGridItems(users)}
            </SimpleGrid>
        </Layout>
    );
}
