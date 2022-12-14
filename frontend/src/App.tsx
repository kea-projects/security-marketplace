import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { UserContextProvider } from './context/UserContextProvider';
import { LocalStorage } from './utils/LocalStorage';

import { router } from './utils/Router';

export function App() {
    return (
        <UserContextProvider userData={LocalStorage.getUser()}>
            <RouterProvider router={router} />
        </UserContextProvider>
    );
}
