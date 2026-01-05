/**
 * Search Trips Screen
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { tripsAPI, Trip } from '../../api/client.js';

interface SearchScreenProps {
    onBack: () => void;
    onSelectTrip: (tripId: number) => void;
}

type Mode = 'filters' | 'results';
type FilterField = 'departure' | 'arrival' | 'date';

export function SearchScreen({ onBack, onSelectTrip }: SearchScreenProps): React.ReactElement {
    const [mode, setMode] = useState<Mode>('filters');
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [date, setDate] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterField>('departure');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useInput((input, key) => {
        if (key.escape) {
            if (mode === 'results') {
                setMode('filters');
            } else {
                onBack();
            }
        }
    });

    const handleSearch = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: { departure?: string; arrival?: string; date?: string } = {};
            if (departure) params.departure = departure;
            if (arrival) params.arrival = arrival;
            if (date) params.date = date;

            const response = await tripsAPI.search(params);
            setTrips(response.trips || []);
            setMode('results');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = () => {
        if (activeFilter === 'departure') {
            setActiveFilter('arrival');
        } else if (activeFilter === 'arrival') {
            setActiveFilter('date');
        } else {
            handleSearch();
        }
    };

    if (loading) {
        return <Loading text="Recherche en cours..." />;
    }

    if (mode === 'results') {
        if (trips.length === 0) {
            return (
                <Box flexDirection="column" padding={1}>
                    <Text bold color="cyan">🔍 Résultats de recherche</Text>
                    <Alert type="info" message="Aucun trajet trouvé" />
                    <Text color="gray">Appuyez sur Échap pour modifier les filtres</Text>
                </Box>
            );
        }

        const tripItems = trips.map((trip) => ({
            label: `${trip.departure_city} → ${trip.arrival_city} | ${new Date(trip.departure_time).toLocaleDateString('fr-FR')} ${new Date(trip.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} | ${trip.price_per_seat}€ | ${trip.available_seats} place(s)`,
            value: String(trip.id),
        }));

        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">🔍 {trips.length} trajet(s) trouvé(s)</Text>
                <Box marginY={1}>
                    <SelectInput
                        items={tripItems}
                        onSelect={(item) => onSelectTrip(Number(item.value))}
                    />
                </Box>
                <Text color="gray">Appuyez sur Échap pour modifier les filtres</Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">🔍 Rechercher un trajet</Text>

            {error && <Alert type="error" message={error} />}

            <Box flexDirection="column" marginY={1}>
                <Box>
                    <Text color={activeFilter === 'departure' ? 'cyan' : 'gray'}>Départ: </Text>
                    {activeFilter === 'departure' ? (
                        <TextInput
                            value={departure}
                            onChange={setDeparture}
                            placeholder="Ville de départ"
                            onSubmit={handleFilterSubmit}
                        />
                    ) : (
                        <Text>{departure || '(tous)'}</Text>
                    )}
                </Box>

                <Box>
                    <Text color={activeFilter === 'arrival' ? 'cyan' : 'gray'}>Arrivée: </Text>
                    {activeFilter === 'arrival' ? (
                        <TextInput
                            value={arrival}
                            onChange={setArrival}
                            placeholder="Ville d'arrivée"
                            onSubmit={handleFilterSubmit}
                        />
                    ) : (
                        <Text>{arrival || '(tous)'}</Text>
                    )}
                </Box>

                <Box>
                    <Text color={activeFilter === 'date' ? 'cyan' : 'gray'}>Date: </Text>
                    {activeFilter === 'date' ? (
                        <TextInput
                            value={date}
                            onChange={setDate}
                            placeholder="YYYY-MM-DD (optionnel)"
                            onSubmit={handleFilterSubmit}
                        />
                    ) : (
                        <Text>{date || '(toutes)'}</Text>
                    )}
                </Box>
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text color="gray">Entrée pour continuer • Échap pour revenir</Text>
            </Box>
        </Box>
    );
}

export default SearchScreen;
