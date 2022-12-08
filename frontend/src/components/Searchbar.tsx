import React from 'react';
import { Text, Button, Spacer, Badge, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

import { Navbar } from '../components/Navbar';

export function Searchbar() {
    return (
        <Navbar height="75px" minHeight="75px" variant="secondary" fontSize="lg">
            <Text>Sorting Options</Text>
            <Badge colorScheme="orange">TBD</Badge>
            <Spacer />
            <InputGroup maxWidth="25%">
                <InputLeftElement pointerEvents="none">
                    <SearchIcon />
                </InputLeftElement>
                <Input type="text" placeholder="Type to search" />
            </InputGroup>
            <Button colorScheme="accent" variant="solid">
                Search
            </Button>
            <Spacer />
        </Navbar>
    );
}
