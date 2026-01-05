/**
 * Trip Detail Screen
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { tripsAPI, bookingsAPI, Trip, getStoredUser } from '../../api/client.js';

interface TripDetailScreenProps {
    tripId: number;
    onBack: () => void;
    onMessage: (userId: number) => void;
}

export function TripDetailScreen({ tripId, onBack, onMessage }: TripDetailScreenProps): React.ReactElement {
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [bookingMode, setBookingMode] = useState(false);
    const [seats, setSeats] = useState('1');

    const currentUser = getStoredUser();

    useEffect(() => {
        loadTrip();
    }, [tripId]);

    const loadTrip = async () => {
        try {
            const response = await tripsAPI.getById(tripId);
            setTrip(response.trip);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useInput((input, key) => {
        if (key.escape) {
            if (bookingMode) {
                setBookingMode(false);
            } else {
                onBack();
            }
        }
    });

    const handleBook = async () => {
        const numSeats = parseInt(seats, 10);
        if (isNaN(numSeats) || numSeats < 1) {
            setError('Nombre de places invalide');
            return;
        }

        if (trip && numSeats > trip.available_seats) {
            setError(`Seulement ${trip.available_seats} place(s) disponible(s)`);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await bookingsAPI.create(tripId, numSeats);
            setSuccess('Réservation effectuée avec succès !');
            setBookingMode(false);
            loadTrip();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement du trajet..." />;
    }

    if (!trip) {
        return (
            <Box flexDirection="column" padding={1}>
                <Alert type="error" message="Trajet non trouvé" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const isDriver = currentUser?.id === trip.driver_id;
    const departureDate = new Date(trip.departure_time);

    if (bookingMode) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">🎫 Réserver ce trajet</Text>

                {error && <Alert type="error" message={error} />}

                <Box marginY={1}>
                    <Text>Nombre de places (max {trip.available_seats}): </Text>
                    <TextInput
                        value={seats}
                        onChange={setSeats}
                        onSubmit={handleBook}
                    />
                </Box>

                <Text color="gray">Total: {parseInt(seats, 10) * trip.price_per_seat}€</Text>
                <Box marginTop={1}>
                    <Text color="gray">Entrée pour confirmer • Échap pour annuler</Text>
                </Box>
            </Box>
        );
    }

    const actions = [];
    if (!isDriver && trip.status === 'active' && trip.available_seats > 0) {
        actions.push({ label: '🎫 Réserver', value: 'book' });
    }
    if (trip.driver_id) {
        actions.push({ label: '💬 Contacter le conducteur', value: 'message' });
    }
    actions.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">🚗 Détails du trajet</Text>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <Box flexDirection="column" marginY={1} borderStyle="single" borderColor="gray" padding={1}>
                <Text><Text color="cyan">Départ:</Text> {trip.departure_city}</Text>
                <Text color="gray">         {trip.departure_address}</Text>

                <Box marginY={1}>
                    <Text color="cyan">↓</Text>
                </Box>

                <Text><Text color="cyan">Arrivée:</Text> {trip.arrival_city}</Text>
                <Text color="gray">          {trip.arrival_address}</Text>

                <Box marginTop={1}>
                    <Text><Text color="cyan">Date:</Text> {departureDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </Box>
                <Text><Text color="cyan">Heure:</Text> {departureDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>

                <Box marginTop={1}>
                    <Text><Text color="cyan">Prix:</Text> {trip.price_per_seat}€ / place</Text>
                </Box>
                <Text><Text color="cyan">Places disponibles:</Text> {trip.available_seats}</Text>

                <Box marginTop={1}>
                    <Text>
                        <Text color="cyan">Statut:</Text>{' '}
                        <Text color={trip.status === 'active' ? 'green' : trip.status === 'completed' ? 'blue' : 'red'}>
                            {trip.status === 'active' ? '● Actif' : trip.status === 'completed' ? '● Terminé' : '● Annulé'}
                        </Text>
                    </Text>
                </Box>

                {trip.driver_name && (
                    <Box marginTop={1}>
                        <Text><Text color="cyan">Conducteur:</Text> {trip.driver_name}</Text>
                    </Box>
                )}
            </Box>

            <SelectInput
                items={actions}
                onSelect={(item) => {
                    if (item.value === 'book') {
                        setBookingMode(true);
                    } else if (item.value === 'message') {
                        onMessage(trip.driver_id);
                    } else {
                        onBack();
                    }
                }}
            />
        </Box>
    );
}

export default TripDetailScreen;
