import React, { useContext } from 'react';
import { Link as Navigate } from 'react-router-dom';
import { Link, Icon, Spacer } from '@chakra-ui/react';
import { BsGithub } from 'react-icons/bs';

import { Navbar } from '../components/Navbar';
import { UserContext } from '../context/UserContextProvider';
import { hasUserPrivileges } from '../utils/Auth';

interface MainNavbarProps {
    isAdmin: boolean;
}

export function MainNavbar({ isAdmin }: MainNavbarProps) {
    const { userData, setUserData } = useContext(UserContext);

    const handleLogout = () => {
        setUserData({});
    };

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
            {hasUserPrivileges() && (
                <Link as={Navigate} to={`/profile/${userData.userId}`}>
                    Profile
                </Link>
            )}
            <Link as={Navigate} onClick={handleLogout} to={hasUserPrivileges() ? '/' : '/login'}>
                {hasUserPrivileges() ? 'Logout' : 'Login'}
            </Link>
        </Navbar>
    );
}
