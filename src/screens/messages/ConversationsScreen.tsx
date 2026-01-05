/**
 * Conversations Screen - List of message conversations
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { messagesAPI, Conversation } from '../../api/client.js';

interface ConversationsScreenProps {
    onBack: () => void;
    onSelectConversation: (userId: number) => void;
}

export function ConversationsScreen({ onBack, onSelectConversation }: ConversationsScreenProps): React.ReactElement {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const response = await messagesAPI.getConversations();
            setConversations(response.conversations || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useInput((input, key) => {
        if (key.escape) {
            onBack();
        }
    });

    if (loading) {
        return <Loading text="Chargement des conversations..." />;
    }

    if (conversations.length === 0) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">💬 Messages</Text>
                <Alert type="info" message="Aucune conversation" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const items = conversations.map((conv) => {
        const unreadBadge = conv.unread_count > 0 ? ` (${conv.unread_count} nouveau${conv.unread_count > 1 ? 'x' : ''})` : '';
        const timeAgo = new Date(conv.last_message_time).toLocaleDateString('fr-FR');
        const preview = conv.last_message.length > 30
            ? conv.last_message.substring(0, 30) + '...'
            : conv.last_message;

        return {
            label: `${conv.unread_count > 0 ? '🔵 ' : ''}${conv.first_name} ${conv.last_name}${unreadBadge} - "${preview}" (${timeAgo})`,
            value: String(conv.user_id),
        };
    });

    items.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">💬 Conversations ({conversations.length})</Text>

            {error && <Alert type="error" message={error} />}

            <Box marginY={1}>
                <SelectInput
                    items={items}
                    onSelect={(item) => {
                        if (item.value === 'back') {
                            onBack();
                        } else {
                            onSelectConversation(parseInt(item.value, 10));
                        }
                    }}
                />
            </Box>

            <Text color="gray">Appuyez sur Échap pour revenir</Text>
        </Box>
    );
}

export default ConversationsScreen;
