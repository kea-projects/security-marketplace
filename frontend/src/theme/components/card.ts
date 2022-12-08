import { defineStyleConfig } from '@chakra-ui/react';

export const Card = defineStyleConfig({
    // The styles all Cards have in common
    baseStyle: {
        display: 'flex',
        flexDirection: 'column',
        background: 'primary',
        alignItems: 'center',
        gap: 10,
    },
    variants: {
        rounded: {
            padding: 8,
            borderRadius: 'xl',
            boxShadow: 'xl',
        },
        smooth: {
            padding: 6,
            borderRadius: 'base',
            boxShadow: 'md',
        },
    },
    defaultProps: {
        variant: 'smooth',
    },
});
