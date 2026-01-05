/**
 * Bookings Screen - My reservations
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { bookingsAPI, Booking } from '../../api/client.js';

interface BookingsScreenProps {
    onBack: () => void;
    onSelectTrip: (tripId: number) => void;
}

export function BookingsScreen({ onBack, onSelectTrip }: BookingsScreenProps): React.ReactElement {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await bookingsAPI.getMyBookings();
            setBookings(response.bookings || []);
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

    const handleCancel = async (bookingId: number) => {
        setLoading(true);
        setError(null);
        try {
            await bookingsAPI.cancel(bookingId);
            setSuccess('Réservation annulée');
            await loadBookings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement de vos réservations..." />;
    }

    const statusLabels: Record<string, { icon: string; label: string }> = {
        pending: { icon: '🟡', label: 'En attente' },
        confirmed: { icon: '🟢', label: 'Confirmée' },
        cancelled: { icon: '🔴', label: 'Annulée' },
        rejected: { icon: '⛔', label: 'Refusée' },
    };

    if (bookings.length === 0) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">🎫 Mes réservations</Text>
                <Alert type="info" message="Vous n'avez pas encore de réservation" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const items = bookings.flatMap((booking) => {
        const status = statusLabels[booking.status] || { icon: '❓', label: booking.status };
        const trip = booking.trip;
        const tripInfo = trip
            ? `${trip.departure_city} → ${trip.arrival_city} | ${new Date(trip.departure_time).toLocaleDateString('fr-FR')}`
            : `Trajet #${booking.trip_id}`;

        const mainItem = {
            label: `${status.icon} ${tripInfo} (${booking.seats_booked} place(s))`,
            value: `view-${booking.trip_id}`,
        };

        const actions = [];
        if (booking.status === 'pending' || booking.status === 'confirmed') {
            actions.push({
                label: `   ❌ Annuler cette réservation`,
                value: `cancel-${booking.id}`,
            });
        }

        return [mainItem, ...actions];
    });

    items.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">🎫 Mes réservations ({bookings.length})</Text>

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
                        } else if (value.startsWith('cancel-')) {
                            handleCancel(parseInt(value.replace('cancel-', ''), 10));
                        }
                    }}
                />
            </Box>

            <Text color="gray">🟡 En attente 🟢 Confirmée 🔴 Annulée ⛔ Refusée</Text>
        </Box>
    );
}

export default BookingsScreen;
