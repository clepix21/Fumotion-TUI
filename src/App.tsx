/**
 * Main App Component
 * Handles navigation and authentication state
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

// Components
import { Header } from './components/layout/Header.js';
import { Loading } from './components/ui/Loading.js';
import { Alert } from './components/ui/Alert.js';

// Auth
import {
    isAuthenticated,
    getStoredUser,
    clearAuth,
    checkHealth,
    User
} from './api/client.js';

// Auth Screens
import { LoginScreen } from './screens/auth/LoginScreen.js';
import { RegisterScreen } from './screens/auth/RegisterScreen.js';

// Main Screens
import { HomeScreen } from './screens/home/HomeScreen.js';
import { SearchScreen } from './screens/trips/SearchScreen.js';
import { TripDetailScreen } from './screens/trips/TripDetailScreen.js';
import { CreateTripScreen } from './screens/trips/CreateTripScreen.js';
import { MyTripsScreen } from './screens/trips/MyTripsScreen.js';
import { BookingsScreen } from './screens/bookings/BookingsScreen.js';
import { ReceivedBookingsScreen } from './screens/bookings/ReceivedBookingsScreen.js';
import { ConversationsScreen } from './screens/messages/ConversationsScreen.js';
import { ChatScreen } from './screens/messages/ChatScreen.js';
import { ReviewsScreen } from './screens/reviews/ReviewsScreen.js';
import { ProfileScreen } from './screens/profile/ProfileScreen.js';

// Admin Screens
import { AdminScreen } from './screens/admin/AdminScreen.js';
import { UsersAdminScreen } from './screens/admin/UsersAdminScreen.js';
import { TripsAdminScreen } from './screens/admin/TripsAdminScreen.js';
import { BookingsAdminScreen } from './screens/admin/BookingsAdminScreen.js';

type Screen =
    | 'loading'
    | 'login'
    | 'register'
    | 'home'
    | 'search'
    | 'trip-detail'
    | 'create-trip'
    | 'my-trips'
    | 'bookings'
    | 'received-bookings'
    | 'conversations'
    | 'chat'
    | 'reviews'
    | 'profile'
    | 'admin'
    | 'admin-users'
    | 'admin-trips'
    | 'admin-bookings';

interface AppState {
    screen: Screen;
    user: User | null;
    selectedTripId: number | null;
    selectedUserId: number | null;
    backendOnline: boolean;
}

export function App(): React.ReactElement {
    const [state, setState] = useState<AppState>({
        screen: 'loading',
        user: null,
        selectedTripId: null,
        selectedUserId: null,
        backendOnline: true,
    });

    useEffect(() => {
        initApp();
    }, []);

    const initApp = async () => {
        // Check backend health
        const online = await checkHealth();

        if (!online) {
            setState(prev => ({ ...prev, backendOnline: false, screen: 'login' }));
            return;
        }

        // Check if already authenticated
        if (isAuthenticated()) {
            const user = getStoredUser();
            setState(prev => ({
                ...prev,
                screen: 'home',
                user,
                backendOnline: true
            }));
        } else {
            setState(prev => ({ ...prev, screen: 'login', backendOnline: true }));
        }
    };

    const navigate = (screen: Screen, params?: { tripId?: number; userId?: number }) => {
        setState(prev => ({
            ...prev,
            screen,
            selectedTripId: params?.tripId ?? prev.selectedTripId,
            selectedUserId: params?.userId ?? prev.selectedUserId,
        }));
    };

    const handleLogin = () => {
        const user = getStoredUser();
        setState(prev => ({ ...prev, screen: 'home', user }));
    };

    const handleLogout = () => {
        clearAuth();
        setState(prev => ({ ...prev, screen: 'login', user: null }));
    };

    const { screen, user, selectedTripId, selectedUserId, backendOnline } = state;

    // Loading screen
    if (screen === 'loading') {
        return (
            <Box flexDirection="column" padding={1}>
                <Header />
                <Loading text="Initialisation..." />
            </Box>
        );
    }

    // Backend offline warning
    const offlineWarning = !backendOnline && (
        <Alert type="warning" message="⚠️ Backend inaccessible (http://137.74.47.37:5000)" />
    );

    // Auth screens
    if (screen === 'login') {
        return (
            <Box flexDirection="column" padding={1}>
                <Header />
                {offlineWarning}
                <LoginScreen
                    onLogin={handleLogin}
                    onSwitchToRegister={() => navigate('register')}
                />
            </Box>
        );
    }

    if (screen === 'register') {
        return (
            <Box flexDirection="column" padding={1}>
                <Header />
                {offlineWarning}
                <RegisterScreen
                    onRegister={handleLogin}
                    onSwitchToLogin={() => navigate('login')}
                />
            </Box>
        );
    }

    // Protected screens (require user)
    if (!user) {
        navigate('login');
        return <Loading />;
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Header user={user} />
            {offlineWarning}

            {screen === 'home' && (
                <HomeScreen
                    user={user}
                    onNavigate={(s) => navigate(s as Screen)}
                    onLogout={handleLogout}
                />
            )}

            {screen === 'search' && (
                <SearchScreen
                    onBack={() => navigate('home')}
                    onSelectTrip={(tripId) => navigate('trip-detail', { tripId })}
                />
            )}

            {screen === 'trip-detail' && selectedTripId && (
                <TripDetailScreen
                    tripId={selectedTripId}
                    onBack={() => navigate('search')}
                    onMessage={(userId) => navigate('chat', { userId })}
                />
            )}

            {screen === 'create-trip' && (
                <CreateTripScreen
                    onBack={() => navigate('home')}
                    onSuccess={() => navigate('my-trips')}
                />
            )}

            {screen === 'my-trips' && (
                <MyTripsScreen
                    onBack={() => navigate('home')}
                    onSelectTrip={(tripId) => navigate('trip-detail', { tripId })}
                />
            )}

            {screen === 'bookings' && (
                <BookingsScreen
                    onBack={() => navigate('home')}
                    onSelectTrip={(tripId) => navigate('trip-detail', { tripId })}
                />
            )}

            {screen === 'received-bookings' && (
                <ReceivedBookingsScreen
                    onBack={() => navigate('home')}
                    onMessage={(userId) => navigate('chat', { userId })}
                />
            )}

            {screen === 'conversations' && (
                <ConversationsScreen
                    onBack={() => navigate('home')}
                    onSelectConversation={(userId) => navigate('chat', { userId })}
                />
            )}

            {screen === 'chat' && selectedUserId && (
                <ChatScreen
                    userId={selectedUserId}
                    onBack={() => navigate('conversations')}
                />
            )}

            {screen === 'reviews' && (
                <ReviewsScreen
                    onBack={() => navigate('home')}
                />
            )}

            {screen === 'profile' && (
                <ProfileScreen
                    onBack={() => navigate('home')}
                />
            )}

            {screen === 'admin' && (
                <AdminScreen
                    onBack={() => navigate('home')}
                    onNavigate={(s) => navigate(s as Screen)}
                />
            )}

            {screen === 'admin-users' && (
                <UsersAdminScreen
                    onBack={() => navigate('admin')}
                />
            )}

            {screen === 'admin-trips' && (
                <TripsAdminScreen
                    onBack={() => navigate('admin')}
                />
            )}

            {screen === 'admin-bookings' && (
                <BookingsAdminScreen
                    onBack={() => navigate('admin')}
                />
            )}
        </Box>
    );
}

export default App;
