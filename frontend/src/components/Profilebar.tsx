import React, { useContext, useEffect, useState } from 'react';
import {
    Text,
    Button,
    IconButton,
    Spacer,
    Badge,
    Hide,
    Show,
    Popover,
    PopoverTrigger,
    PopoverArrow,
    PopoverHeader,
    PopoverBody,
    PopoverContent,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Navbar } from '../components/Navbar';
import { UserBadge } from './UserBadge';
import { UserContext } from '../context/UserContextProvider';
import { UserApi, UserResponse } from '../api/UserApi';

export function Profilebar() {
    // States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [user, setUser] = useState<UserResponse | undefined>(undefined);

    // Contexts
    const { userData } = useContext(UserContext);

    // Constants
    const userApi = new UserApi();

    // Fetching user
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            if (userData.userId) {
                const { data } = await userApi.getUser(userData.userId);
                setUser(data);
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <Navbar height="80px" minHeight="80px" variant="userDisplay" fontSize="lg">
            <UserBadge fullName={user?.name} username={user?.email} isLoading={isLoading} />
            <Spacer />

            {/* Desktop */}
            <Hide below="md">
                <Text fontSize="sm" maxWidth="100px">
                    Extra User Information <Badge colorScheme="yellow">TBD</Badge>
                </Text>
                <Text>
                    Total listings <Badge colorScheme="yellow">{50}</Badge>
                </Text>
                <Text>
                    Sales <Badge colorScheme="yellow">{18}</Badge>
                </Text>
            </Hide>

            {/* Mobile */}
            <Popover>
                <Show below="md">
                    <PopoverTrigger>
                        <IconButton colorScheme="accent" aria-label="More Info" icon={<HamburgerIcon />} />
                    </PopoverTrigger>
                    <PopoverContent color="textDark">
                        <PopoverArrow />

                        <PopoverHeader>{user?.email}</PopoverHeader>
                        <PopoverBody>
                            <Text fontSize="sm">
                                Extra User Information <Badge colorScheme="yellow">TBD</Badge>
                            </Text>
                            <Text fontSize="sm">
                                Total listings <Badge colorScheme="yellow">{50}</Badge>
                            </Text>
                            <Text fontSize="sm">
                                Sales <Badge colorScheme="yellow">{18}</Badge>
                            </Text>
                        </PopoverBody>
                    </PopoverContent>
                </Show>
            </Popover>

            <Button colorScheme="accent" variant="solid">
                Hide all Listings
            </Button>
        </Navbar>
    );
}
