import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Text } from '@chakra-ui/react';
import { UpdateListingFormFields, UpdateListingForm } from './UpdateListingForm';
import { ListingApi, ListingResponse } from '../../api/ListingApi';

interface UpdateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing?: ListingResponse;
    setListing: (listing: ListingResponse | undefined) => void;
}

/**
 * Creates a component that will display a modal which contains the form for updating a listing.
 */
export function UpdateListingModal({ isOpen, onClose, listing, setListing }: UpdateListingModalProps) {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [listingUpdateError, setListingUpdateError] = useState<string | undefined>(undefined);

    // Handlers
    const handleUpdateListing = async (formFields: UpdateListingFormFields) => {
        setIsLoading(true);
        try {
            if (listing) {
                const { data } = await ListingApi.updateListing(formFields, listing.listingId);
                setListing(data);
                setListingUpdateError(undefined);
                onClose();
            }
        } catch (error) {
            setListingUpdateError('We encountered an error while updating your listing.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="textDark">
                    <Text>Update Listing</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <UpdateListingForm
                        listing={listing}
                        isLoading={isLoading}
                        error={listingUpdateError}
                        onSubmit={handleUpdateListing}
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
