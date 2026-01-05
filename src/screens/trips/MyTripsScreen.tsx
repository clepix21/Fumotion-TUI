/**
 * My Trips Screen
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { tripsAPI, Trip } from '../../api/client.js';

interface MyTripsScreenProps {
    onBack: () => void;
    onSelectTrip: (tripId: number) => void;
}

export function MyTripsScreen({ onBack, onSelectTrip }: MyTripsScreenProps): React.ReactElement {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const response = await tripsAPI.getMyTrips();
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

    const handleAction = async (action: string, tripId: number) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (action === 'complete') {
                await tripsAPI.complete(tripId);
                setSuccess('Trajet marqué comme terminé');
            } else if (action === 'cancel') {
                await tripsAPI.cancel(tripId);
                setSuccess('Trajet annulé');
            }
            await loadTrips();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement de vos trajets..." />;
    }

    if (trips.length === 0) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">🚗 Mes trajets</Text>
                <Alert type="info" message="Vous n'avez pas encore créé de trajet" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const items = trips.flatMap((trip) => {
        const date = new Date(trip.departure_time);
        const statusIcon = trip.status === 'active' ? '🟢' : trip.status === 'completed' ? '🔵' : '🔴';
        const mainItem = {
            label: `${statusIcon} ${trip.departure_city} → ${trip.arrival_city} | ${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} | ${trip.available_seats} place(s)`,
            value: `view-${trip.id}`,
        };

        const actions = [];
        if (trip.status === 'active') {
            actions.push({
                label: `   ✅ Terminer`,
                value: `complete-${trip.id}`,
            });
            actions.push({
                label: `   ❌ Annuler`,
                value: `cancel-${trip.id}`,
            });
        }

        return [mainItem, ...actions];
    });

    items.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">🚗 Mes trajets ({trips.length})</Text>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <Box marginY={1}>
                <SelectInput
                    items={items}
                    onSelect={(item) => {
                        const value = item.value;
                        if (value === 'back') {
                            onBack();
                        } else if (value.startsWith('view-')) {
                            onSelectTrip(parseInt(value.replace('view-', ''), 10));
                        } else if (value.startsWith('complete-')) {
                            handleAction('complete', parseInt(value.replace('complete-', ''), 10));
                        } else if (value.startsWith('cancel-')) {
                            handleAction('cancel', parseInt(value.replace('cancel-', ''), 10));
                        }
                    }}
                />
            </Box>

            <Text color="gray">🟢 Actif 🔵 Terminé 🔴 Annulé • Échap pour revenir</Text>
        </Box>
    );
}

export default MyTripsScreen;
