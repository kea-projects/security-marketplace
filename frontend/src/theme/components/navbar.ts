import { defineStyleConfig } from '@chakra-ui/react';

export const Navbar = defineStyleConfig({
    // The styles all Navbars have in common
    baseStyle: {
        display: 'flex',
        flexDirection: 'row',
        background: 'accent.500',
        alignItems: 'center',
        width: '100%',
        padding: '30px',
        boxShadow: 'dark-lg',
        gap: '10px',
    },
    variants: {
        secondary: {
            background: 'layer',
        },
        userDisplay: {
            background: 'secondary',
        },
    },
});
