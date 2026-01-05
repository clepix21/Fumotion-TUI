/**
 * Received Bookings Screen - Bookings on my trips (as driver)
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { bookingsAPI, Booking } from '../../api/client.js';

interface ReceivedBookingsScreenProps {
    onBack: () => void;
    onMessage: (userId: number) => void;
}

export function ReceivedBookingsScreen({ onBack, onMessage }: ReceivedBookingsScreenProps): React.ReactElement {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await bookingsAPI.getBookingsForMyTrips();
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

    const handleUpdateStatus = async (bookingId: number, status: 'confirmed' | 'rejected') => {
        setLoading(true);
        setError(null);
        try {
            await bookingsAPI.updateStatus(bookingId, status);
            setSuccess(status === 'confirmed' ? 'Réservation acceptée' : 'Réservation refusée');
            await loadBookings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement des demandes..." />;
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
                <Text bold color="cyan">📨 Demandes de réservation</Text>
                <Alert type="info" message="Aucune demande de réservation sur vos trajets" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const items = bookings.flatMap((booking) => {
        const status = statusLabels[booking.status] || { icon: '❓', label: booking.status };
        const passenger = booking.passenger;
        const passengerName = passenger ? `${passenger.first_name} ${passenger.last_name}` : `Utilisateur #${booking.passenger_id}`;
        const trip = booking.trip;
        const tripInfo = trip
            ? `${trip.departure_city} → ${trip.arrival_city}`
            : `Trajet #${booking.trip_id}`;

        const mainItem = {
            label: `${status.icon} ${passengerName} - ${tripInfo} (${booking.seats_booked} place(s))`,
            value: `info-${booking.id}`,
        };

        const actions = [];
        if (booking.status === 'pending') {
            actions.push({
                label: `   ✅ Accepter`,
                value: `accept-${booking.id}`,
            });
            actions.push({
                label: `   ❌ Refuser`,
                value: `reject-${booking.id}`,
            });
        }
        actions.push({
            label: `   💬 Contacter`,
            value: `message-${booking.passenger_id}`,
        });

        return [mainItem, ...actions];
    });

    items.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">📨 Demandes reçues ({bookings.length})</Text>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <Box marginY={1}>
                <SelectInput
                    items={items}
                    onSelect={(item) => {
                        const value = item.value;
                        if (value === 'back') {
                            onBack();
                        } else if (value.startsWith('accept-')) {
                            handleUpdateStatus(parseInt(value.replace('accept-', ''), 10), 'confirmed');
                        } else if (value.startsWith('reject-')) {
                            handleUpdateStatus(parseInt(value.replace('reject-', ''), 10), 'rejected');
                        } else if (value.startsWith('message-')) {
                            onMessage(parseInt(value.replace('message-', ''), 10));
                        }
                    }}
                />
            </Box>

            <Text color="gray">🟡 En attente 🟢 Confirmée • Échap pour revenir</Text>
        </Box>
    );
}

export default ReceivedBookingsScreen;
