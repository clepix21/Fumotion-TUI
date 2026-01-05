/**
 * Reviews Screen - Pending reviews to submit
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { reviewsAPI, Booking } from '../../api/client.js';

interface ReviewsScreenProps {
    onBack: () => void;
}

export function ReviewsScreen({ onBack }: ReviewsScreenProps): React.ReactElement {
    const [pendingReviews, setPendingReviews] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Review form state
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [step, setStep] = useState<'rating' | 'comment'>('rating');

    useEffect(() => {
        loadPendingReviews();
    }, []);

    const loadPendingReviews = async () => {
        try {
            const response = await reviewsAPI.getPending();
            setPendingReviews(response.reviews || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useInput((input, key) => {
        if (key.escape) {
            if (selectedBooking) {
                setSelectedBooking(null);
                setRating('5');
                setComment('');
                setStep('rating');
            } else {
                onBack();
            }
        }
    });

    const handleSubmitReview = async () => {
        if (!selectedBooking) return;

        const numRating = parseInt(rating, 10);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            setError('La note doit être entre 1 et 5');
            return;
        }

        if (step === 'rating') {
            setStep('comment');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await reviewsAPI.create(selectedBooking.id, numRating, comment || undefined);
            setSuccess('Avis envoyé avec succès !');
            setSelectedBooking(null);
            setRating('5');
            setComment('');
            setStep('rating');
            await loadPendingReviews();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement..." />;
    }

    // Review form
    if (selectedBooking) {
        const trip = selectedBooking.trip;

        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">⭐ Donner un avis</Text>

                {error && <Alert type="error" message={error} />}

                <Box marginY={1} flexDirection="column">
                    <Text color="gray">
                        Trajet: {trip ? `${trip.departure_city} → ${trip.arrival_city}` : `#${selectedBooking.trip_id}`}
                    </Text>
                </Box>

                {step === 'rating' ? (
                    <Box flexDirection="column">
                        <Box>
                            <Text color="cyan">Note (1-5): </Text>
                            <TextInput
                                value={rating}
                                onChange={setRating}
                                onSubmit={handleSubmitReview}
                            />
                        </Box>
                        <Text color="gray">1 = Mauvais • 5 = Excellent</Text>
                    </Box>
                ) : (
                    <Box flexDirection="column">
                        <Text>Note: {'⭐'.repeat(parseInt(rating, 10) || 0)}</Text>
                        <Box marginTop={1}>
                            <Text color="cyan">Commentaire (optionnel): </Text>
                            <TextInput
                                value={comment}
                                onChange={setComment}
                                placeholder="Votre expérience..."
                                onSubmit={handleSubmitReview}
                            />
                        </Box>
                    </Box>
                )}

                <Box marginTop={1}>
                    <Text color="gray">Entrée pour {step === 'rating' ? 'continuer' : 'envoyer'} • Échap pour annuler</Text>
                </Box>
            </Box>
        );
    }

    // List of pending reviews
    if (pendingReviews.length === 0) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">⭐ Avis à donner</Text>
                {success && <Alert type="success" message={success} />}
                <Alert type="info" message="Aucun avis en attente" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    const items = pendingReviews.map((booking) => {
        const trip = booking.trip;
        const date = trip ? new Date(trip.departure_time).toLocaleDateString('fr-FR') : '';
        const tripInfo = trip
            ? `${trip.departure_city} → ${trip.arrival_city} (${date})`
            : `Trajet #${booking.trip_id}`;

        return {
            label: `⭐ ${tripInfo}`,
            value: String(booking.id),
        };
    });

    items.push({ label: '← Retour', value: 'back' });

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">⭐ Avis à donner ({pendingReviews.length})</Text>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <Box marginY={1}>
                <SelectInput
                    items={items}
                    onSelect={(item) => {
                        if (item.value === 'back') {
                            onBack();
                        } else {
                            const booking = pendingReviews.find(b => b.id === parseInt(item.value, 10));
                            if (booking) {
                                setSelectedBooking(booking);
                            }
                        }
                    }}
                />
            </Box>

            <Text color="gray">Appuyez sur Échap pour revenir</Text>
        </Box>
    );
}

export default ReviewsScreen;
