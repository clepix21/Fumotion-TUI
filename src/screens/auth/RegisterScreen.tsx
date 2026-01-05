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
    phone: 'Téléphone (optionnel)',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer',
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

    const doRegister = async () => {
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
            setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
            setLoading(false);
        }
    };

    useInput((input, key) => {
        if (loading) return;

        if (key.escape) {
            onSwitchToLogin();
            return;
        }

        if (key.return) {
            if (activeFieldIndex < fields.length - 1) {
                setActiveFieldIndex(activeFieldIndex + 1);
            } else {
                doRegister();
            }
        }

        if (key.upArrow && activeFieldIndex > 0) {
            setActiveFieldIndex(activeFieldIndex - 1);
        }

        if ((key.downArrow || key.tab) && activeFieldIndex < fields.length - 1) {
            setActiveFieldIndex(activeFieldIndex + 1);
        }
    });

    const handleChange = (value: string) => {
        setFormData({ ...formData, [activeField]: value });
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
                    const isPassword = field === 'password' || field === 'confirmPassword';
                    const value = formData[field];

                    return (
                        <Box key={field}>
                            <Text color={isActive ? 'cyan' : 'gray'}>{fieldLabels[field]}: </Text>
                            <TextInput
                                value={value}
                                onChange={isActive ? handleChange : () => { }}
                                placeholder={isPassword ? '••••••' : ''}
                                mask={isPassword ? '*' : undefined}
                                focus={isActive}
                            />
                        </Box>
                    );
                })}
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text color="gray">
                    Entrée: {activeFieldIndex === fields.length - 1 ? "s'inscrire" : 'champ suivant'}
                </Text>
                <Text color="gray">↑/↓: naviguer entre les champs</Text>
                <Text color="gray">Échap: retour à la connexion</Text>
            </Box>
        </Box>
    );
}

export default RegisterScreen;
