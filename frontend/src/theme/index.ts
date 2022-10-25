import { extendTheme } from '@chakra-ui/react';

import { Card } from './components/card';
import { Input } from './components/input';
import { Navbar } from './components/navbar';

export const theme = extendTheme({
    colors: {
        background: '#EDF2F7',
        primary: '#A0AEC0',
        secondary: '#234E52',
        layer: '#4A5568',
        accent: {
            100: '#CBD5E0',
            500: '#319795',
        },
        text: '#fefefe',
        textDark: '#4A5568',
        link: '#E6FFFA',
    },
    components: { Card, Input, Navbar },
    styles: {
        global: () => ({
            body: {
                bg: 'background',
                color: 'text',
            },
        }),
    },
});
