import React, { useEffect, useState } from 'react';
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
import { UserApi, UserResponse } from '../api/UserApi';
import { ListingApi } from '../api/ListingApi';
import { useNavigate } from 'react-router-dom';
import { UploadFilePopover } from './UploadFilePopover';

interface ProfilebarProps {
    userId?: string;
}

export function Profilebar({ userId }: ProfilebarProps) {
    // States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [user, setUser] = useState<UserResponse | undefined>(undefined);

    // Constants
    const userApi = new UserApi();
    const listingApi = new ListingApi();
    const navigate = useNavigate();

    // Fetching user
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            if (userId) {
                const { data } = await userApi.getUser(userId);
                setUser(data);
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Handlers
    const handleHideAllListings = async () => {
        if (userId) {
            const { data } = await listingApi.getUserListings(userId);
            for (const listing of data) {
                listing.isPublic = false;
                await listingApi.updateListing(listing, listing.listingId);
            }
            navigate(0);
        }
    };

    const handleProfilePictureUpload = async (pictureList: File[]) => {
        const picture = pictureList[0];
        if (userId) {
            await userApi.updateProfilePicture(userId, picture);
            navigate(0);
        }
    };

    return (
        <Navbar height="80px" minHeight="80px" variant="userDisplay" fontSize="lg">
            <UserBadge
                fullName={user?.name}
                username={user?.email}
                pictureUrl={user?.pictureUrl}
                isLoading={isLoading}
            />
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

            <Popover>
                <PopoverTrigger>
                    <Button colorScheme="accent" variant="solid" minWidth="min-content">
                        Update Picture
                    </Button>
                </PopoverTrigger>

                <UploadFilePopover
                    onFileSubmit={handleProfilePictureUpload}
                    label="Upload"
                    title="Select Profile Picture"
                />
            </Popover>

            <Button colorScheme="accent" variant="solid" minWidth="min-content" onClick={handleHideAllListings}>
                Hide all Listings
            </Button>
        </Navbar>
    );
}
