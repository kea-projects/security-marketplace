import { Box } from '@chakra-ui/react';
import React, { createContext, useState } from 'react';

import { AuthRoles } from '../utils/Auth';
import { LocalStorage } from '../utils/LocalStorage';

export interface UserData {
    accessToken?: string;
    refreshToken?: string;
    username?: string;
    role?: AuthRoles;
    userId?: string;
}

interface UserContextData {
    userData: UserData;
    setUserData: (userData: UserData) => void;
}

export const UserContext = createContext<UserContextData>({
    userData: {},
    setUserData: () => {
        return;
    },
});

interface UserContextProviderProps {
    userData: UserData;
    children: JSX.Element;
}

export function UserContextProvider({ userData, children }: UserContextProviderProps) {
    const [value, setValue] = useState<UserData>(userData);

    return (
        <UserContext.Provider
            value={{
                userData: value,
                setUserData: (value) => {
                    LocalStorage.setUser(value);
                    setValue(value);
                },
            }}
        >
            <Box key={value.userId}>{children}</Box>
        </UserContext.Provider>
    );
}
