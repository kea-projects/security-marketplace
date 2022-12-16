import React, { useContext } from 'react';
import { Link as Navigate, useNavigate } from 'react-router-dom';
import { Link, Icon, Spacer, Button } from '@chakra-ui/react';
import { BsGithub } from 'react-icons/bs';

import { Navbar } from '../themed/Navbar';
import { UserContext } from '../../context/UserContextProvider';
import { hasUserPrivileges } from '../../utils/Auth';

interface MainNavbarProps {
    isAdmin: boolean;
}

export function MainNavbar({ isAdmin }: MainNavbarProps) {
    // Context
    const { userData, setUserData } = useContext(UserContext);

    // Constants
    const navigate = useNavigate();

    // Handlers
    const handleLogout = () => {
        setUserData({});
    };

    const handleNavigateProfile = () => {
        navigate(`/profile/${userData?.userId}`);
        navigate(0);
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
            {hasUserPrivileges() && <Link onClick={handleNavigateProfile}>Profile</Link>}
            <Link as={Navigate} onClick={handleLogout} to={hasUserPrivileges() ? '/' : '/login'}>
                {hasUserPrivileges() ? 'Logout' : 'Login'}
            </Link>
        </Navbar>
    );
}
