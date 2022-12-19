import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(inputAnatomy.keys);

export const Input = defineMultiStyleConfig({
    // The styles all inputs have in common
    baseStyle: definePartsStyle({
        field: { _placeholder: { color: 'text', opacity: 0.6 } },
    }),
});
