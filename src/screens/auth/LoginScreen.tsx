/**
 * Login Screen
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { authAPI, setToken, setStoredUser } from '../../api/client.js';

interface LoginScreenProps {
    onLogin: () => void;
    onSwitchToRegister: () => void;
}

type Field = 'email' | 'password';

export function LoginScreen({ onLogin, onSwitchToRegister }: LoginScreenProps): React.ReactElement {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [activeField, setActiveField] = useState<Field>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useInput((input, key) => {
        if (key.escape) {
            onSwitchToRegister();
        }
    });

    const handleSubmit = async () => {
        if (activeField === 'email') {
            setActiveField('password');
            return;
        }

        if (!email || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authAPI.login(email, password);
            setToken(response.token);
            setStoredUser(response.user);
            onLogin();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Connexion en cours..." />;
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text bold color="cyan">
                    🔐 Connexion
                </Text>
            </Box>

            {error && <Alert type="error" message={error} />}

            <Box flexDirection="column" marginY={1}>
                <Box>
                    <Text color={activeField === 'email' ? 'cyan' : 'gray'}>Email: </Text>
                    {activeField === 'email' ? (
                        <TextInput
                            value={email}
                            onChange={setEmail}
                            placeholder="email@example.com"
                            onSubmit={handleSubmit}
                        />
                    ) : (
                        <Text>{email}</Text>
                    )}
                </Box>

                <Box marginTop={1}>
                    <Text color={activeField === 'password' ? 'cyan' : 'gray'}>Mot de passe: </Text>
                    {activeField === 'password' ? (
                        <TextInput
                            value={password}
                            onChange={setPassword}
                            placeholder="••••••••"
                            mask="*"
                            onSubmit={handleSubmit}
                        />
                    ) : (
                        <Text color="gray">{'•'.repeat(password.length || 8)}</Text>
                    )}
                </Box>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text color="gray">Appuyez sur Entrée pour {activeField === 'email' ? 'continuer' : 'vous connecter'}</Text>
                <Text color="gray">Appuyez sur Échap pour créer un compte</Text>
            </Box>
        </Box>
    );
}

export default LoginScreen;
