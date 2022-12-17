import React, { useState } from 'react';
import { Button, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

import { Navbar } from '../themed/Navbar';
import { UserResponse } from '../../api/UserApi';
import { ListingResponse } from '../../api/ListingApi';
import { TypeHelper } from '../../utils/TypeHelper';

interface SearchbarProps {
    items: UserResponse[] | ListingResponse[];
    setItems: (items: UserResponse[] | ListingResponse[]) => void;
}

export function Searchbar({ items, setItems }: SearchbarProps) {
    // States
    const [searchInput, setSearchInput] = useState('');

    // Handlers
    const handleSearch = () => {
        if (items.length > 0) {
            if (TypeHelper.isListingResponse(items[0])) {
                setItems(searchListings(items as ListingResponse[]));
            } else if (TypeHelper.isUserResponse(items[0])) {
                setItems(searchUsers(items as UserResponse[]));
            }
        }
    };

    // Searching functions
    const searchUsers = (users: UserResponse[]) => {
        return users.filter((user) => {
            return (
                user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                user.email.toLowerCase().includes(searchInput.toLowerCase())
            );
        });
    };

    const searchListings = (listings: ListingResponse[]) => {
        return listings.filter((listing) => {
            return (
                listing.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                listing.description.toLowerCase().includes(searchInput.toLowerCase())
            );
        });
    };

    return (
        <Navbar height="75px" minHeight="75px" variant="secondary" fontSize="lg" display="flex" justifyContent="center">
            <InputGroup maxWidth="25%">
                <InputLeftElement pointerEvents="none">
                    <SearchIcon />
                </InputLeftElement>
                <Input
                    type="text"
                    placeholder="Type to search"
                    onChange={(value) => setSearchInput(value.currentTarget.value)}
                />
            </InputGroup>
            <Button colorScheme="accent" variant="solid" onClick={handleSearch}>
                Search
            </Button>
        </Navbar>
    );
}
