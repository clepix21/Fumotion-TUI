/**
 * Admin Bookings Screen
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { adminAPI, Booking } from '../../api/client.js';

interface BookingsAdminScreenProps {
    onBack: () => void;
}

export function BookingsAdminScreen({ onBack }: BookingsAdminScreenProps): React.ReactElement {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await adminAPI.getBookings();
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

    const handleDelete = async (bookingId: number) => {
        setLoading(true);
        setError(null);
        try {
            await adminAPI.deleteBooking(bookingId);
            setSuccess('Réservation supprimée');
            await loadBookings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement des réservations..." />;
    }

    const statusIcon: Record<string, string> = {
        pending: '🟡',
        confirmed: '🟢',
        cancelled: '🔴',
        rejected: '⛔',
    };

    if (bookings.length === 0) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="yellow">🎫 Gestion des réservations</Text>
                <Alert type="info" message="Aucune réservation" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const items = bookings.flatMap((booking) => {
        const icon = statusIcon[booking.status] || '❓';
        const trip = booking.trip;
        const tripInfo = trip
            ? `${trip.departure_city} → ${trip.arrival_city}`
            : `Trajet #${booking.trip_id}`;
        const mainItem = {
            label: `${icon} Résa #${booking.id} - ${tripInfo} (${booking.seats_booked} place(s))`,
            value: `view-${booking.id}`,
        };

        return [
            mainItem,
            { label: `   ❌ Supprimer`, value: `delete-${booking.id}` },
        ];
    });

    items.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="yellow">🎫 Réservations ({bookings.length})</Text>

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

            <Text color="gray">🟡 En attente 🟢 Confirmée 🔴 Annulée ⛔ Refusée • Échap pour revenir</Text>
        </Box>
    );
}

export default BookingsAdminScreen;
