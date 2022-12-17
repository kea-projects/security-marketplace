import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Text } from '@chakra-ui/react';
import { CreateListingFormFields, CreateListingForm } from './CreateListingForm';
import { ListingApi, ListingResponse } from '../../api/ListingApi';

interface CreateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    listings?: ListingResponse[];
    setListings: (listings: ListingResponse[] | undefined) => void;
    userId?: string;
}

/**
 * Creates a component that will display a modal which contains the form for creating a listing.
 */
export function CreateListingModal({ isOpen, onClose, listings, setListings, userId }: CreateListingModalProps) {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [listingCreateError, setListingCreateError] = useState<string | undefined>(undefined);

    // Handlers
    const handleCreateListing = async (formFields: CreateListingFormFields & { file: File }) => {
        setIsLoading(true);
        try {
            if (listings && userId) {
                const { data } = await ListingApi.createListing({ ...formFields, createdBy: userId });
                listings.push(data);
                setListings(listings);
                setListingCreateError(undefined);
                onClose();
            }
        } catch (error) {
            setListingCreateError('We encountered an error while creating your listing.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="textDark">
                    <Text>Create Listing</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <CreateListingForm
                        isLoading={isLoading}
                        error={listingCreateError}
                        onSubmit={handleCreateListing}
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
