import React from 'react';
import { VStack, StackProps } from '@chakra-ui/react';
import { User } from '../fake-api/users';
import { Profilebar } from './Profilebar';
import { Searchbar } from './Searchbar';
import { MainNavbar } from './MainNavbar';

interface LayoutProps {
    isLoading?: boolean;
    isAdmin?: boolean;
    user?: User;
    useSearchbar?: boolean;
    useProfilebar?: boolean;
}

// TODO: Replace isAdmin and user with UserDetails Context
export function Layout({
    isLoading = false,
    user = { fullName: '', username: '', password: '' },
    isAdmin = false,
    useSearchbar = true,
    useProfilebar = false,
    children,
    ...rest
}: StackProps & LayoutProps) {
    return (
        <VStack width="100%" height="100vh" spacing="0" {...rest}>
            <MainNavbar isAdmin={isAdmin} />
            {useProfilebar && <Profilebar user={user} isLoading={isLoading} />}
            {useSearchbar && <Searchbar />}

            {children}
        </VStack>
    );
}
