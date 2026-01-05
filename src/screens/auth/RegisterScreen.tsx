/**
 * Register Screen
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { authAPI, setToken, setStoredUser } from '../../api/client.js';

interface RegisterScreenProps {
    onRegister: () => void;
    onSwitchToLogin: () => void;
}

type Field = 'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'confirmPassword';

const fields: Field[] = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
const fieldLabels: Record<Field, string> = {
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
};

export function RegisterScreen({ onRegister, onSwitchToLogin }: RegisterScreenProps): React.ReactElement {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [activeFieldIndex, setActiveFieldIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeField = fields[activeFieldIndex];

    useInput((input, key) => {
        if (key.escape) {
            onSwitchToLogin();
        }
        if (key.upArrow && activeFieldIndex > 0) {
            setActiveFieldIndex(activeFieldIndex - 1);
        }
    });

    const handleChange = (value: string) => {
        setFormData({ ...formData, [activeField]: value });
    };

    const handleSubmit = async () => {
        if (activeFieldIndex < fields.length - 1) {
            setActiveFieldIndex(activeFieldIndex + 1);
            return;
        }

        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authAPI.register({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
            });
            setToken(response.token);
            setStoredUser(response.user);
            onRegister();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Inscription en cours..." />;
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text bold color="cyan">
                    📝 Inscription
                </Text>
            </Box>

            {error && <Alert type="error" message={error} />}

            <Box flexDirection="column" marginY={1}>
                {fields.map((field, index) => {
                    const isActive = index === activeFieldIndex;
                    const isPast = index < activeFieldIndex;
                    const isPassword = field === 'password' || field === 'confirmPassword';
                    const value = formData[field];

                    return (
                        <Box key={field} marginBottom={index < fields.length - 1 ? 0 : 0}>
                            <Text color={isActive ? 'cyan' : 'gray'}>{fieldLabels[field]}: </Text>
                            {isActive ? (
                                <TextInput
                                    value={value}
                                    onChange={handleChange}
                                    placeholder={isPassword ? '••••••••' : ''}
                                    mask={isPassword ? '*' : undefined}
                                    onSubmit={handleSubmit}
                                />
                            ) : (
                                <Text color={isPast ? 'white' : 'gray'}>
                                    {isPassword ? '•'.repeat(value.length || 0) : value || '...'}
                                </Text>
                            )}
                        </Box>
                    );
                })}
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text color="gray">
                    Appuyez sur Entrée pour {activeFieldIndex === fields.length - 1 ? 's\'inscrire' : 'continuer'}
                </Text>
                <Text color="gray">↑ pour revenir au champ précédent • Échap pour se connecter</Text>
            </Box>
        </Box>
    );
}

export default RegisterScreen;
