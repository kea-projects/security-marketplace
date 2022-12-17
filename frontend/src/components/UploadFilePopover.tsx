import React, { useState } from 'react';
import {
    Button,
    HStack,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    Text,
    VStack,
    Badge,
    PopoverCloseButton,
    PopoverHeader,
} from '@chakra-ui/react';
import FilePicker from 'chakra-ui-file-picker';

interface UploadFilePopoverProps {
    onFileSubmit: (fileList: File[]) => void;
    placeholder?: string;
    allowMultipleFiles?: boolean;
    label?: string;
    title?: string;
    contentType?: string;
}

/**
 * Creates a component displays a popover which contains an input field to upload one or multiple files.
 */
export function UploadFilePopover({
    onFileSubmit,
    placeholder = 'Upload file...',
    allowMultipleFiles = false,
    label = 'Confirm',
    title = 'Upload File(s)',
    contentType = 'image/png, image/jpeg',
}: UploadFilePopoverProps) {
    // States
    const [files, setFiles] = useState<File[] | undefined>(undefined);
    const [inputError, setInputError] = useState<string | undefined>(undefined);

    // Handlers

    /**
     * Checks if the files uploaded have less than 50MB each.
     * If they do, then the component will render an error message.
     * Otherwise, the files are set into the state.
     * @param files
     */
    const handleOnFileChange = (files: File[]) => {
        for (const file of files) {
            if (file.size > 50 * 1024 * 1024) {
                return setInputError('The Profile picture exceeds the maximum file size. (50MB)');
            }
        }
        setInputError(undefined);
        setFiles(files);
    };

    /**
     * Generates a component displaying the name and the file size of each of the
     * files the user has uploaded.
     * @returns the files uploaded by the user.
     */
    const getFileItems = () => {
        const elements: JSX.Element[] = [];
        if (files) {
            for (const file of files) {
                elements.push(
                    <HStack wrap="wrap" key={file.name + file.size}>
                        <Badge colorScheme="purple">{file.name}</Badge>
                        <Text>Size: {(file.size / 1024).toFixed(0)}KB</Text>
                    </HStack>,
                );
            }
        }
        return elements;
    };

    return (
        <PopoverContent color="textDark">
            <PopoverArrow />
            <PopoverHeader fontWeight="semibold">{title}</PopoverHeader>
            <PopoverCloseButton />

            <PopoverBody>
                <VStack>
                    <HStack>
                        <FilePicker
                            onFileChange={handleOnFileChange}
                            placeholder={placeholder}
                            multipleFiles={allowMultipleFiles}
                            accept={contentType}
                            hideClearButton={true}
                        />
                        <Button
                            colorScheme="accent"
                            variant="solid"
                            minWidth="min-content"
                            onClick={() => {
                                if (files && !inputError) {
                                    onFileSubmit(files);
                                }
                            }}
                        >
                            {label}
                        </Button>
                    </HStack>
                    {inputError && <Text>{inputError}</Text>}
                    {getFileItems()}
                </VStack>
            </PopoverBody>
        </PopoverContent>
    );
}
