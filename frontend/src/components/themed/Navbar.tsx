import React from 'react';
import { Box, useStyleConfig, ChakraStyledOptions } from '@chakra-ui/react';

/**
 * Custom themed component for Chakra UI
 */
export function Navbar({ variant, ...rest }: ChakraStyledOptions) {
    const styles = useStyleConfig('Navbar', { variant });

    return <Box __css={styles} {...rest} />;
}
