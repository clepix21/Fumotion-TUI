/**
 * Home Screen - Main Menu
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Menu, MenuItem } from '../../components/layout/Menu.js';
import { User } from '../../api/client.js';

interface HomeScreenProps {
    user: User;
    onNavigate: (screen: string) => void;
    onLogout: () => void;
}

export function HomeScreen({ user, onNavigate, onLogout }: HomeScreenProps): React.ReactElement {
    const menuItems: MenuItem[] = [
        { label: '🔍 Rechercher un trajet', value: 'search' },
        { label: '🚗 Créer un trajet', value: 'create-trip' },
        { label: '📋 Mes trajets', value: 'my-trips' },
        { label: '🎫 Mes réservations', value: 'bookings' },
        { label: '📨 Demandes reçues', value: 'received-bookings' },
        { label: '💬 Messages', value: 'conversations' },
        { label: '⭐ Avis à donner', value: 'reviews' },
        { label: '👤 Mon profil', value: 'profile' },
        ...(user.is_admin ? [{ label: '🔧 Administration', value: 'admin' }] : []),
        { label: '🚪 Déconnexion', value: 'logout' },
    ];

    const handleSelect = (item: MenuItem) => {
        if (item.value === 'logout') {
            onLogout();
        } else {
            onNavigate(item.value);
        }
    };

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text bold color="green">
                    👋 Bienvenue, {user.first_name} !
                </Text>
            </Box>

            <Menu
                title="Menu Principal"
                items={menuItems}
                onSelect={handleSelect}
            />

            <Box marginTop={2}>
                <Text color="gray">Utilisez ↑↓ pour naviguer, Entrée pour sélectionner</Text>
            </Box>
        </Box>
    );
}

export default HomeScreen;
