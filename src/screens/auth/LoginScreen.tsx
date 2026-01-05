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

    const doLogin = async () => {
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
            setLoading(false);
        }
    };

    useInput((input, key) => {
        if (loading) return;

        if (key.escape) {
            onSwitchToRegister();
            return;
        }

        if (key.return) {
            if (activeField === 'email') {
                if (email.trim()) {
                    setActiveField('password');
                }
            } else {
                doLogin();
            }
        }

        if (key.tab || key.downArrow) {
            if (activeField === 'email') {
                setActiveField('password');
            }
        }

        if (key.upArrow) {
            if (activeField === 'password') {
                setActiveField('email');
            }
        }
    });

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
                    <TextInput
                        value={email}
                        onChange={setEmail}
                        placeholder="email@example.com"
                        focus={activeField === 'email'}
                    />
                </Box>

                <Box marginTop={1}>
                    <Text color={activeField === 'password' ? 'cyan' : 'gray'}>Mot de passe: </Text>
                    <TextInput
                        value={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                        mask="*"
                        focus={activeField === 'password'}
                    />
                </Box>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text color="gray">Entrée: {activeField === 'email' ? 'passer au mot de passe' : 'se connecter'}</Text>
                <Text color="gray">↑/↓ ou Tab: changer de champ</Text>
                <Text color="gray">Échap: créer un compte</Text>
            </Box>
        </Box>
    );
}

export default LoginScreen;
