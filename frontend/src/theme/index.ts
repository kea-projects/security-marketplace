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

/* 
Teo Theme

Red: #E63946 action options aka buttons and links
light: #F1FAEE background 
light-blue: #A8DADC highlighted background like for a post or container
blue: #457B9D navbar and secondary action items
dark-blue: #1D3557 Second navbar or searchbars. Dark blue can also be the text color most places. Would test tho
*/
