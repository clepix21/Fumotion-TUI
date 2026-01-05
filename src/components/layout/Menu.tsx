/**
 * Menu Component
 * Reusable selection menu
 */

import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

export interface MenuItem {
    label: string;
    value: string;
}

interface MenuProps {
    title?: string;
    items: MenuItem[];
    onSelect: (item: MenuItem) => void;
}

export function Menu({ title, items, onSelect }: MenuProps): React.ReactElement {
    return (
        <Box flexDirection="column">
            {title && (
                <Box marginBottom={1}>
                    <Text bold color="yellow">{title}</Text>
                </Box>
            )}
            <SelectInput
                items={items}
                onSelect={onSelect}
                indicatorComponent={({ isSelected }) => (
                    <Text color="cyan">{isSelected ? '❯ ' : '  '}</Text>
                )}
                itemComponent={({ isSelected, label }) => (
                    <Text color={isSelected ? 'cyan' : 'white'}>{label}</Text>
                )}
            />
        </Box>
    );
}

export default Menu;
