/**
 * Create Trip Screen
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { tripsAPI } from '../../api/client.js';

interface CreateTripScreenProps {
    onBack: () => void;
    onSuccess: () => void;
}

type Field = 'departureCity' | 'departureAddress' | 'arrivalCity' | 'arrivalAddress' | 'date' | 'time' | 'seats' | 'price';

const fields: Field[] = ['departureCity', 'departureAddress', 'arrivalCity', 'arrivalAddress', 'date', 'time', 'seats', 'price'];
const fieldLabels: Record<Field, string> = {
    departureCity: 'Ville de départ',
    departureAddress: 'Adresse de départ',
    arrivalCity: 'Ville d\'arrivée',
    arrivalAddress: 'Adresse d\'arrivée',
    date: 'Date (YYYY-MM-DD)',
    time: 'Heure (HH:MM)',
    seats: 'Nombre de places',
    price: 'Prix par place (€)',
};

export function CreateTripScreen({ onBack, onSuccess }: CreateTripScreenProps): React.ReactElement {
    const [formData, setFormData] = useState<Record<Field, string>>({
        departureCity: '',
        departureAddress: '',
        arrivalCity: '',
        arrivalAddress: '',
        date: '',
        time: '',
        seats: '3',
        price: '5',
    });
    const [activeFieldIndex, setActiveFieldIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmMode, setConfirmMode] = useState(false);

    const activeField = fields[activeFieldIndex];

    useInput((input, key) => {
        if (key.escape) {
            if (confirmMode) {
                setConfirmMode(false);
            } else {
                onBack();
            }
        }
        if (key.upArrow && activeFieldIndex > 0 && !confirmMode) {
            setActiveFieldIndex(activeFieldIndex - 1);
        }
    });

    const handleChange = (value: string) => {
        setFormData({ ...formData, [activeField]: value });
    };

    const handleSubmit = async () => {
        if (!confirmMode && activeFieldIndex < fields.length - 1) {
            setActiveFieldIndex(activeFieldIndex + 1);
            return;
        }

        if (!confirmMode) {
            // Validation
            if (!formData.departureCity || !formData.arrivalCity || !formData.date || !formData.time) {
                setError('Veuillez remplir tous les champs obligatoires');
                return;
            }
            setConfirmMode(true);
            return;
        }

        // Create trip
        setLoading(true);
        setError(null);

        try {
            const departureTime = `${formData.date}T${formData.time}:00`;

            await tripsAPI.create({
                departure_city: formData.departureCity,
                departure_address: formData.departureAddress || formData.departureCity,
                arrival_city: formData.arrivalCity,
                arrival_address: formData.arrivalAddress || formData.arrivalCity,
                departure_time: departureTime,
                available_seats: parseInt(formData.seats, 10) || 3,
                price_per_seat: parseFloat(formData.price) || 5,
            });

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la création');
            setConfirmMode(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Création du trajet..." />;
    }

    if (confirmMode) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">✅ Confirmer le trajet</Text>

                {error && <Alert type="error" message={error} />}

                <Box flexDirection="column" marginY={1} borderStyle="single" borderColor="gray" padding={1}>
                    <Text><Text color="cyan">Départ:</Text> {formData.departureCity}</Text>
                    <Text color="gray">         {formData.departureAddress}</Text>
                    <Text><Text color="cyan">Arrivée:</Text> {formData.arrivalCity}</Text>
                    <Text color="gray">          {formData.arrivalAddress}</Text>
                    <Text><Text color="cyan">Date:</Text> {formData.date} à {formData.time}</Text>
                    <Text><Text color="cyan">Places:</Text> {formData.seats}</Text>
                    <Text><Text color="cyan">Prix:</Text> {formData.price}€ / place</Text>
                </Box>

                <Box marginTop={1}>
                    <Text color="yellow">Appuyez sur Entrée pour confirmer ou Échap pour modifier</Text>
                </Box>

                <Box marginTop={1}>
                    <TextInput value="" onChange={() => { }} onSubmit={handleSubmit} />
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">🚗 Créer un trajet</Text>

            {error && <Alert type="error" message={error} />}

            <Box flexDirection="column" marginY={1}>
                {fields.map((field, index) => {
                    const isActive = index === activeFieldIndex;
                    const isPast = index < activeFieldIndex;
                    const value = formData[field];

                    return (
                        <Box key={field}>
                            <Text color={isActive ? 'cyan' : 'gray'}>{fieldLabels[field]}: </Text>
                            {isActive ? (
                                <TextInput
                                    value={value}
                                    onChange={handleChange}
                                    onSubmit={handleSubmit}
                                />
                            ) : (
                                <Text color={isPast ? 'white' : 'gray'}>{value || '...'}</Text>
                            )}
                        </Box>
                    );
                })}
            </Box>

            <Box marginTop={1} flexDirection="column">
                <Text color="gray">Entrée pour continuer • ↑ pour revenir • Échap pour annuler</Text>
            </Box>
        </Box>
    );
}

export default CreateTripScreen;
