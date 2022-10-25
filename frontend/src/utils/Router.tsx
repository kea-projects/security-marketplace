import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { ErrorPage } from '../routes/ErrorPage';
import { HomePage } from '../routes/HomePage';
import { LoginPage } from '../routes/LoginPage';
import { ProfilePage } from '../routes/ProfilePage';
import { SignupPage } from '../routes/SignupPage';
import { UsersPage } from '../routes/UsersPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
        errorElement: <ErrorPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/signup',
        element: <SignupPage />,
    },
    {
        path: '/profile',
        element: <ProfilePage />,
    },
    {
        path: '/users',
        element: <UsersPage />,
    },
]);
