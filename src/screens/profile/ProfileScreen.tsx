/**
 * Profile Screen
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Loading } from '../../components/ui/Loading.js';
import { Alert } from '../../components/ui/Alert.js';
import { authAPI, reviewsAPI, User, Review, getStoredUser, setStoredUser } from '../../api/client.js';

interface ProfileScreenProps {
    onBack: () => void;
}

type EditField = 'first_name' | 'last_name' | 'phone';

const editableFields: EditField[] = ['first_name', 'last_name', 'phone'];
const fieldLabels: Record<EditField, string> = {
    first_name: 'Prénom',
    last_name: 'Nom',
    phone: 'Téléphone',
};

export function ProfileScreen({ onBack }: ProfileScreenProps): React.ReactElement {
    const [user, setUser] = useState<User | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Edit mode
    const [editMode, setEditMode] = useState(false);
    const [editFieldIndex, setEditFieldIndex] = useState(0);
    const [editData, setEditData] = useState<Record<EditField, string>>({
        first_name: '',
        last_name: '',
        phone: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const currentUser = getStoredUser();
            if (currentUser) {
                setUser(currentUser);
                setEditData({
                    first_name: currentUser.first_name || '',
                    last_name: currentUser.last_name || '',
                    phone: currentUser.phone || '',
                });

                const reviewsResponse = await reviewsAPI.getUserReviews(currentUser.id);
                setReviews(reviewsResponse.reviews || []);
                setAverageRating(reviewsResponse.average || 0);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    useInput((input, key) => {
        if (key.escape) {
            if (editMode) {
                setEditMode(false);
                setEditFieldIndex(0);
            } else {
                onBack();
            }
        }
        if (editMode && key.upArrow && editFieldIndex > 0) {
            setEditFieldIndex(editFieldIndex - 1);
        }
    });

    const handleEditSubmit = async () => {
        if (editFieldIndex < editableFields.length - 1) {
            setEditFieldIndex(editFieldIndex + 1);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authAPI.updateProfile(editData);
            setUser(response.user);
            setStoredUser(response.user);
            setSuccess('Profil mis à jour !');
            setEditMode(false);
            setEditFieldIndex(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Chargement du profil..." />;
    }

    if (!user) {
        return (
            <Box flexDirection="column" padding={1}>
                <Alert type="error" message="Profil non trouvé" />
                <Text color="gray">Appuyez sur Échap pour revenir</Text>
            </Box>
        );
    }

    // Edit mode
    if (editMode) {
        const activeField = editableFields[editFieldIndex];

        return (
            <Box flexDirection="column" padding={1}>
                <Text bold color="cyan">✏️ Modifier le profil</Text>

                {error && <Alert type="error" message={error} />}

                <Box flexDirection="column" marginY={1}>
                    {editableFields.map((field, index) => {
                        const isActive = index === editFieldIndex;
                        const isPast = index < editFieldIndex;

                        return (
                            <Box key={field}>
                                <Text color={isActive ? 'cyan' : 'gray'}>{fieldLabels[field]}: </Text>
                                {isActive ? (
                                    <TextInput
                                        value={editData[field]}
                                        onChange={(value) => setEditData({ ...editData, [field]: value })}
                                        onSubmit={handleEditSubmit}
                                    />
                                ) : (
                                    <Text color={isPast ? 'white' : 'gray'}>{editData[field] || '...'}</Text>
                                )}
                            </Box>
                        );
                    })}
                </Box>

                <Text color="gray">Entrée pour continuer • ↑ pour revenir • Échap pour annuler</Text>
            </Box>
        );
    }

    // View mode
    const menuItems = [
        { label: '✏️ Modifier le profil', value: 'edit' },
        { label: '← Retour', value: 'back' },
    ];

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">👤 Mon profil</Text>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <Box flexDirection="column" marginY={1} borderStyle="single" borderColor="gray" padding={1}>
                <Text><Text color="cyan">Nom:</Text> {user.first_name} {user.last_name}</Text>
                <Text><Text color="cyan">Email:</Text> {user.email}</Text>
                <Text><Text color="cyan">Téléphone:</Text> {user.phone || 'Non renseigné'}</Text>

                <Box marginTop={1}>
                    <Text>
                        <Text color="cyan">Note moyenne:</Text>{' '}
                        {averageRating > 0
                            ? `${'⭐'.repeat(Math.round(averageRating))} (${averageRating.toFixed(1)}/5 - ${reviews.length} avis)`
                            : 'Pas encore d\'avis'
                        }
                    </Text>
                </Box>

                <Box marginTop={1}>
                    <Text>
                        <Text color="cyan">Membre depuis:</Text>{' '}
                        {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
                            : 'N/A'
                        }
                    </Text>
                </Box>

                {user.is_admin && (
                    <Box marginTop={1}>
                        <Text color="yellow">🔧 Administrateur</Text>
                    </Box>
                )}
            </Box>

            <SelectInput
                items={menuItems}
                onSelect={(item) => {
                    if (item.value === 'edit') {
                        setEditMode(true);
                    } else {
                        onBack();
                    }
                }}
            />
        </Box>
    );
}

export default ProfileScreen;
