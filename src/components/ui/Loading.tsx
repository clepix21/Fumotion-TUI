/**
 * Loading Spinner Component
 */

import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface LoadingProps {
    text?: string;
}

export function Loading({ text = 'Chargement...' }: LoadingProps): React.ReactElement {
    return (
        <Box>
            <Text color="cyan">
                <Spinner type="dots" />
            </Text>
            <Text> {text}</Text>
        </Box>
    );
}

export default Loading;
