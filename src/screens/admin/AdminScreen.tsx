/**
 * Admin Screen - Main admin dashboard
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { adminAPI } from '../../api/client.js';

interface AdminScreenProps {
    onBack: () => void;
    onNavigate: (screen: string) => void;
}

interface Statistics {
    totalUsers: number;
    totalTrips: number;
    totalBookings: number;
    activeTrips: number;
}

export function AdminScreen({ onBack, onNavigate }: AdminScreenProps): React.ReactElement {
    const [stats, setStats] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const response = await adminAPI.getStatistics();
            setStats(response.stats);
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
        return <Loading text="Chargement du panneau admin..." />;
    }

    const menuItems = [
        { label: '👥 Gérer les utilisateurs', value: 'admin-users' },
        { label: '🚗 Gérer les trajets', value: 'admin-trips' },
        { label: '🎫 Gérer les réservations', value: 'admin-bookings' },
        { label: '← Retour', value: 'back' },
    ];

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="yellow">🔧 Administration</Text>

            {error && <Alert type="error" message={error} />}

            {stats && (
                <Box flexDirection="column" marginY={1} borderStyle="double" borderColor="yellow" padding={1}>
                    <Text bold color="cyan">📊 Statistiques</Text>
                    <Box marginTop={1} flexDirection="column">
                        <Text><Text color="cyan">Utilisateurs:</Text> {stats.totalUsers}</Text>
                        <Text><Text color="cyan">Trajets:</Text> {stats.totalTrips} (dont {stats.activeTrips} actifs)</Text>
                        <Text><Text color="cyan">Réservations:</Text> {stats.totalBookings}</Text>
                    </Box>
                </Box>
            )}

            <Box marginY={1}>
                <SelectInput
                    items={menuItems}
                    onSelect={(item) => {
                        if (item.value === 'back') {
                            onBack();
                        } else {
                            onNavigate(item.value);
                        }
                    }}
                />
            </Box>

            <Text color="gray">Appuyez sur Échap pour revenir</Text>
        </Box>
    );
}

export default AdminScreen;
