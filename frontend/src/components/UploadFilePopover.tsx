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

    // Handlers
    const handleOnFileChange = (files: File[]) => {
        setFiles(files);
    };

    const getFileItems = () => {
        const elements: JSX.Element[] = [];
        if (files) {
            for (const file of files) {
                elements.push(
                    <HStack wrap="wrap">
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
                                if (files) {
                                    onFileSubmit(files);
                                }
                            }}
                        >
                            {label}
                        </Button>
                    </HStack>
                    {getFileItems()}
                </VStack>
            </PopoverBody>
        </PopoverContent>
    );
}
