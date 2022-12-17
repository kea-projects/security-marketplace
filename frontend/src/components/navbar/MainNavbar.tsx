import React, { useContext } from 'react';
import { Link as Navigate, useNavigate } from 'react-router-dom';
import { Link, Icon, Spacer } from '@chakra-ui/react';
import { BsGithub } from 'react-icons/bs';

import { Navbar } from '../themed/Navbar';
import { UserContext } from '../../context/UserContextProvider';
import { hasUserPrivileges } from '../../utils/Auth';

interface MainNavbarProps {
    isAdmin: boolean;
}

/**
 * Creates a `Navbar` component that displays the main navigation links.
 */
export function MainNavbar({ isAdmin }: MainNavbarProps) {
    // Context
    const { userData, setUserData } = useContext(UserContext);

    // Constants
    const navigate = useNavigate();

    // Handlers

    /**
     * Removes the local storage entry for user data when the user logs out.
     */
    const handleLogout = () => {
        setUserData({});
    };

    /**
     * Navigates to the user's profile.
     */
    const handleNavigateProfile = () => {
        navigate(`/profile/${userData?.userId}`);
        navigate(0);
    };

    return (
        <Navbar height="60px" minHeight="60px" fontSize="xl">
            <Link href="https://github.com/kea-projects/security-marketplace">
                <Icon as={BsGithub} /> Source Code
            </Link>
            <Spacer />

            {/* Only display the `Users` link for admins. */}
            {isAdmin && (
                <Link as={Navigate} to="/users">
                    Users
                </Link>
            )}

            <Link as={Navigate} to="/">
                Market
            </Link>

            {/* Only display the `Profile` link for logged in users. */}
            {hasUserPrivileges() && <Link onClick={handleNavigateProfile}>Profile</Link>}

            {/* Toggles the link to display either Login or Logout and redirect accordingly, 
            depending on whether the user is logged in or not. */}
            <Link as={Navigate} onClick={handleLogout} to={hasUserPrivileges() ? '/' : '/login'}>
                {hasUserPrivileges() ? 'Logout' : 'Login'}
            </Link>
        </Navbar>
    );
}
