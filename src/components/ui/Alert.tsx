/**
 * Alert Component for status messages
 */

import React from 'react';
import { Box, Text } from 'ink';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    message: string;
}

const alertConfig: Record<AlertType, { icon: string; color: string }> = {
    success: { icon: '✔', color: 'green' },
    error: { icon: '✖', color: 'red' },
    warning: { icon: '⚠', color: 'yellow' },
    info: { icon: 'ℹ', color: 'blue' },
};

export function Alert({ type, message }: AlertProps): React.ReactElement {
    const config = alertConfig[type];

    return (
        <Box marginY={1}>
            <Text color={config.color}>
                {config.icon} {message}
            </Text>
        </Box>
    );
}

export default Alert;
