/**
 * Chat Screen - Message thread with a user
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { messagesAPI, authAPI, Message, User, getStoredUser } from '../../api/client.js';

interface ChatScreenProps {
    userId: number;
    onBack: () => void;
}

export function ChatScreen({ userId, onBack }: ChatScreenProps): React.ReactElement {
    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');

    const currentUser = getStoredUser();
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadData();

        // Poll for new messages every 5 seconds
        pollInterval.current = setInterval(loadMessages, 5000);

        return () => {
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, [userId]);

    const loadData = async () => {
        try {
            const [userResponse, messagesResponse] = await Promise.all([
                authAPI.getPublicProfile(userId),
                messagesAPI.getMessages(userId),
            ]);
            setOtherUser(userResponse.user);
            setMessages(messagesResponse.messages || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const response = await messagesAPI.getMessages(userId);
            setMessages(response.messages || []);
        } catch {
            // Silently fail on poll errors
        }
    };

    useInput((input, key) => {
        if (key.escape) {
            onBack();
        }
    });

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        setSending(true);
        setError(null);

        try {
            await messagesAPI.send(userId, newMessage.trim());
            setNewMessage('');
            await loadMessages();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement de la conversation..." />;
    }

    const displayMessages = messages.slice(-10); // Show last 10 messages

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">
                💬 Conversation avec {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : `Utilisateur #${userId}`}
            </Text>

            {error && <Alert type="error" message={error} />}

            <Box
                flexDirection="column"
                marginY={1}
                borderStyle="single"
                borderColor="gray"
                padding={1}
                height={12}
            >
                {displayMessages.length === 0 ? (
                    <Text color="gray" italic>Aucun message. Commencez la conversation !</Text>
                ) : (
                    displayMessages.map((msg) => {
                        const isMe = msg.sender_id === currentUser?.id;
                        const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <Box key={msg.id} justifyContent={isMe ? 'flex-end' : 'flex-start'}>
                                <Text color={isMe ? 'cyan' : 'white'}>
                                    {isMe ? '' : `${otherUser?.first_name || 'Eux'}: `}
                                    {msg.message}
                                    <Text color="gray"> ({time})</Text>
                                </Text>
                            </Box>
                        );
                    })
                )}
            </Box>

            <Box>
                <Text color="cyan">Message: </Text>
                <TextInput
                    value={newMessage}
                    onChange={setNewMessage}
                    placeholder={sending ? 'Envoi...' : 'Tapez votre message...'}
                    onSubmit={handleSend}
                />
            </Box>

            <Box marginTop={1}>
                <Text color="gray">Entrée pour envoyer • Échap pour revenir • Actualisation auto toutes les 5s</Text>
            </Box>
        </Box>
    );
}

export default ChatScreen;
