/**
 * Admin Trips Screen
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { adminAPI, Trip } from '../../api/client.js';

interface TripsAdminScreenProps {
    onBack: () => void;
}

export function TripsAdminScreen({ onBack }: TripsAdminScreenProps): React.ReactElement {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const response = await adminAPI.getTrips();
            setTrips(response.trips || []);
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

    const handleDelete = async (tripId: number) => {
        setLoading(true);
        setError(null);
        try {
            await adminAPI.deleteTrip(tripId);
            setSuccess('Trajet supprimé');
            await loadTrips();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement des trajets..." />;
    }

    const statusIcon: Record<string, string> = {
        active: '🟢',
        completed: '🔵',
        cancelled: '🔴',
    };

    if (trips.length === 0) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="yellow">🚗 Gestion des trajets</Text>
                <Alert type="info" message="Aucun trajet" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const items = trips.flatMap((trip) => {
        const date = new Date(trip.departure_time).toLocaleDateString('fr-FR');
        const icon = statusIcon[trip.status] || '❓';
        const mainItem = {
            label: `${icon} ${trip.departure_city} → ${trip.arrival_city} (${date})`,
            value: `view-${trip.id}`,
        };

        return [
            mainItem,
            { label: `   ❌ Supprimer`, value: `delete-${trip.id}` },
        ];
    });

    items.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="yellow">🚗 Trajets ({trips.length})</Text>

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

            <Text color="gray">🟢 Actif 🔵 Terminé 🔴 Annulé • Échap pour revenir</Text>
        </Box>
    );
}

export default TripsAdminScreen;
