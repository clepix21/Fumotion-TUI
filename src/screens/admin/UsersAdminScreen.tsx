/**
 * Admin Users Screen
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { adminAPI, User } from '../../api/client.js';

interface UsersAdminScreenProps {
    onBack: () => void;
}

export function UsersAdminScreen({ onBack }: UsersAdminScreenProps): React.ReactElement {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.users || []);
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

    const handleDelete = async (userId: number) => {
        setLoading(true);
        setError(null);
        try {
            await adminAPI.deleteUser(userId);
            setSuccess('Utilisateur supprimé');
            await loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement des utilisateurs..." />;
    }

    if (users.length === 0) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="yellow">👥 Gestion des utilisateurs</Text>
                <Alert type="info" message="Aucun utilisateur" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const items = users.flatMap((user) => {
        const adminBadge = user.is_admin ? ' [ADMIN]' : '';
        const mainItem = {
            label: `👤 ${user.first_name} ${user.last_name} (${user.email})${adminBadge}`,
            value: `view-${user.id}`,
        };

        return [
            mainItem,
            { label: `   ❌ Supprimer`, value: `delete-${user.id}` },
        ];
    });

    items.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="yellow">👥 Utilisateurs ({users.length})</Text>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <Box marginY={1}>
                <SelectInput
                    items={items}
                    onSelect={(item) => {
                        if (item.value === 'back') {
                            onBack();
                        } else if (item.value.startsWith('delete-')) {
                            handleDelete(parseInt(item.value.replace('delete-', ''), 10));
                        }
                    }}
                />
            </Box>

            <Text color="gray">Échap pour revenir</Text>
        </Box>
    );
}

export default UsersAdminScreen;
