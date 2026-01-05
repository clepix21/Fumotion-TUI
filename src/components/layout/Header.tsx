/**
 * Header Component
 * Displays the app title and user info
 */

import React from 'react';
import { Box, Text } from 'ink';
import { User } from '../../api/client.js';

interface HeaderProps {
    user?: User | null;
}

export function Header({ user }: HeaderProps): React.ReactElement {
    return (
        <Box
            borderStyle="round"
            borderColor="cyan"
            paddingX={2}
            marginBottom={1}
            justifyContent="space-between"
        >
            <Text bold color="cyan">
                🚗 FUMOTION TUI
            </Text>
            {user && (
                <Text color="gray">
                    Connecté: <Text color="white">{user.first_name} {user.last_name}</Text>
                    {user.is_admin && <Text color="yellow"> [ADMIN]</Text>}
                </Text>
            )}
        </Box>
    );
}

export default Header;
