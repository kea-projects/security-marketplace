import React from 'react';
import { Box, useStyleConfig, ChakraStyledOptions } from '@chakra-ui/react';

/**
 * Custom themed component for Chakra UI
 */
export function Card({ variant, ...rest }: ChakraStyledOptions) {
    const styles = useStyleConfig('Card', { variant });

    return <Box __css={styles} {...rest} />;
}
