/**
 * Reusable Input Component for Ink
 * Styled text input with label support
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    mask?: string;
    focus?: boolean;
    onSubmit?: () => void;
}

export function Input({
    label,
    value,
    onChange,
    placeholder = '',
    mask,
    focus = true,
    onSubmit,
}: InputProps): React.ReactElement {
    return (
        <Box flexDirection="row">
            <Text color="cyan">{label}: </Text>
            <TextInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                mask={mask}
                focus={focus}
                onSubmit={onSubmit}
            />
        </Box>
    );
}

export default Input;
