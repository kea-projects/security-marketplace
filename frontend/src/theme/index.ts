import { extendTheme } from '@chakra-ui/react';

import { Input } from './components/input';
import { Navbar } from './components/navbar';

export const theme = extendTheme({
    // Custom colors used globally in the theme our application.
    colors: {
        background: '#EDF2F7',
        primary: '#A0AEC0',
        secondary: '#234E52',
        layer: '#4A5568',
        accent: {
            100: '#CBD5E0',
            500: '#319795',
            600: '#CBD5E0',
        },
        layerBtn: {
            100: '#CBD5E0',
            500: '#4A5568',
            600: '#CBD5E0',
        },
        text: '#fefefe',
        textDark: '#4A5568',
        link: '#E6FFFA',
    },
    // Custom themed components.
    components: { Input, Navbar },
    // Global styles.
    styles: {
        global: () => ({
            body: {
                bg: 'background',
                color: 'text',
            },
        }),
    },
});
