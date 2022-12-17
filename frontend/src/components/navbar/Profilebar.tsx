import React, { useEffect, useState } from 'react';
import { Button, Spacer, Popover, PopoverTrigger } from '@chakra-ui/react';
import { Navbar } from '../themed/Navbar';
import { UserBadge } from '../UserBadge';
import { UserApi, UserResponse } from '../../api/UserApi';
import { ListingApi } from '../../api/ListingApi';
import { useNavigate } from 'react-router-dom';
import { UploadFilePopover } from '../UploadFilePopover';
import { hasAdminPrivileges, isOwnProfile } from '../../utils/Auth';

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
                console.log(data);
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

            {((userId && isOwnProfile(userId)) || hasAdminPrivileges()) && (
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
            )}

            {((userId && isOwnProfile(userId)) || hasAdminPrivileges()) && (
                <Button colorScheme="accent" variant="solid" minWidth="min-content" onClick={handleHideAllListings}>
                    Hide all Listings
                </Button>
            )}
        </Navbar>
    );
}
