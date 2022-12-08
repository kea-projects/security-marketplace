import React from 'react';
import { Link as Navigate } from 'react-router-dom';
import { Link, Icon, Spacer } from '@chakra-ui/react';
import { BsGithub } from 'react-icons/bs';

import { Navbar } from '../components/Navbar';

interface MainNavbarProps {
    isAdmin: boolean;
}

export function MainNavbar({ isAdmin }: MainNavbarProps) {
    return (
        <Navbar height="60px" minHeight="60px" fontSize="xl">
            <Link href="https://github.com/kea-projects">
                <Icon as={BsGithub} /> Source Code
            </Link>
            <Spacer />
            {isAdmin && (
                <Link as={Navigate} to="/users">
                    Users
                </Link>
            )}
            <Link as={Navigate} to="/">
                Market
            </Link>
            <Link as={Navigate} to="/profile">
                Profile
            </Link>
        </Navbar>
    );
}
