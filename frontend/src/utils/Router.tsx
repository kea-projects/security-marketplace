import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { ErrorPage } from '../routes/ErrorPage';
import { HomePage } from '../routes/HomePage';
import { LoginPage } from '../routes/LoginPage';
import { ProfilePage } from '../routes/ProfilePage';
import { SignupPage } from '../routes/SignupPage';
import { UsersPage } from '../routes/UsersPage';
import { ListingDetailsPage } from '../routes/ListingDetailsPage';
import { RouterGuard } from '../components/RouterGuard';
import { isNotLoggedIn, hasUserPrivileges, hasAdminPrivileges } from './Auth';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        errorElement: <ErrorPage />,
    },
    {
        path: '/login',
        element: (
            <RouterGuard condition={isNotLoggedIn} redirectTo="/">
                <LoginPage />
            </RouterGuard>
        ),
    },
    {
        path: '/signup',
        element: (
            <RouterGuard condition={isNotLoggedIn} redirectTo="/">
                <SignupPage />
            </RouterGuard>
        ),
    },
    {
        path: '/profile',
        element: (
            <RouterGuard condition={hasUserPrivileges} redirectTo="/login">
                <ProfilePage />
            </RouterGuard>
        ),
    },
    {
        path: '/users',
        element: (
            <RouterGuard condition={hasAdminPrivileges} redirectTo="/login">
                <UsersPage />
            </RouterGuard>
        ),
    },
    {
        path: '/listing-details/:listingId',
        element: (
            <RouterGuard condition={hasUserPrivileges} redirectTo="/login">
                <ListingDetailsPage />
            </RouterGuard>
        ),
    },
]);
