import React from 'react';
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
import { User } from '../fake-api/users';

interface ProfilebarProps {
    isLoading: boolean;
    user: User;
}

export function Profilebar({ user, isLoading }: ProfilebarProps) {
    return (
        <Navbar height="80px" minHeight="80px" variant="userDisplay" fontSize="lg">
            <UserBadge fullName={user.fullName} username={user.username} isLoading={isLoading} />
            <Spacer />
            {/* TODO: Discuss -> Perhaps we can have something like this */}
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

                        <PopoverHeader>{user.fullName}</PopoverHeader>
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
