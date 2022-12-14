import React from 'react';
import { VStack, StackProps } from '@chakra-ui/react';
import { Profilebar } from './Profilebar';
import { Searchbar } from './Searchbar';
import { MainNavbar } from './MainNavbar';
import { hasAdminPrivileges } from '../utils/Auth';

interface LayoutProps {
    useSearchbar?: boolean;
    useProfilebar?: boolean;
    userId?: string;
}

export function Layout({
    useSearchbar = true,
    useProfilebar = false,
    userId,
    children,
    ...rest
}: StackProps & LayoutProps) {
    return (
        <VStack width="100%" height="100vh" spacing="0" {...rest}>
            <MainNavbar isAdmin={hasAdminPrivileges()} />
            {useProfilebar && <Profilebar userId={userId} />}
            {useSearchbar && <Searchbar />}

            {children}
        </VStack>
    );
}
