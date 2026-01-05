/**
 * API Client for Fumotion Backend
 * Handles all HTTP requests to the backend API
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ========== CONFIG STORAGE ==========
const CONFIG_DIR = join(homedir(), '.fumotion-tui');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface ConfigData {
    token: string | null;
    user: User | null;
}

function loadConfig(): ConfigData {
    try {
        if (existsSync(CONFIG_FILE)) {
            const data = readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch {
        // Ignore errors, return defaults
    }
    return { token: null, user: null };
}

function saveConfig(data: ConfigData): void {
    try {
        if (!existsSync(CONFIG_DIR)) {
            mkdirSync(CONFIG_DIR, { recursive: true });
        }
        writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
    } catch {
        // Ignore write errors
    }
}

let configCache: ConfigData = loadConfig();

const API_URL = process.env.API_URL || 'https://fumotion.tech';

// ========== TYPES ==========
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatar?: string;
    is_admin?: boolean;
    created_at?: string;
}

export interface Trip {
    id: number;
    driver_id: number;
    driver_name?: string;
    driver_avatar?: string;
    departure_city: string;
    departure_address: string;
    departure_lat?: number;
    departure_lng?: number;
    arrival_city: string;
    arrival_address: string;
    arrival_lat?: number;
    arrival_lng?: number;
    departure_time: string;
    available_seats: number;
    price_per_seat: number;
    status: 'active' | 'completed' | 'cancelled';
    created_at?: string;
}

export interface Booking {
    id: number;
    trip_id: number;
    passenger_id: number;
    seats_booked: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
    created_at?: string;
    trip?: Trip;
    passenger?: User;
}

export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    trip_id?: number;
    message: string;
    created_at: string;
    read_at?: string;
}

export interface Conversation {
    user_id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

export interface Review {
    id: number;
    booking_id: number;
    reviewer_id: number;
    reviewed_user_id: number;
    rating: number;
    comment?: string;
    created_at: string;
}

export interface ApiError extends Error {
    status?: number;
    data?: unknown;
}

// ========== TOKEN MANAGEMENT ==========
export function getToken(): string | null {
    return configCache.token;
}

export function setToken(token: string | null): void {
    configCache.token = token;
    saveConfig(configCache);
}

export function getStoredUser(): User | null {
    return configCache.user;
}

export function setStoredUser(user: User | null): void {
    configCache.user = user;
    saveConfig(configCache);
}

export function clearAuth(): void {
    configCache = { token: null, user: null };
    saveConfig(configCache);
}

export function isAuthenticated(): boolean {
    return !!getToken() && !!getStoredUser();
}

// ========== API REQUEST ==========
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${path}`;
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            if (response.status === 401) {
                clearAuth();
            }
            const error: ApiError = new Error(data?.message || response.statusText || 'API Error');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data as T;
    } catch (error) {
        throw error;
    }
}

// HTTP Methods
function get<T>(path: string): Promise<T> {
    return apiRequest<T>(path, { method: 'GET' });
}

function post<T>(path: string, body?: unknown): Promise<T> {
    return apiRequest<T>(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
    });
}

function put<T>(path: string, body?: unknown): Promise<T> {
    return apiRequest<T>(path, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
    });
}

function del<T>(path: string): Promise<T> {
    return apiRequest<T>(path, { method: 'DELETE' });
}

// ========== AUTH API ==========
export const authAPI = {
    login: (email: string, password: string) =>
        post<{ success: boolean; token: string; user: User }>('/api/auth/login', { email, password }),

    register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) =>
        post<{ success: boolean; token: string; user: User }>('/api/auth/register', data),

    getProfile: () => get<{ success: boolean; user: User }>('/api/auth/profile'),

    updateProfile: (data: Partial<User>) =>
        put<{ success: boolean; user: User }>('/api/auth/profile', data),

    getPublicProfile: (id: number) =>
        get<{ success: boolean; user: User }>(`/api/auth/users/${id}`),

    verifyToken: () => get<{ success: boolean }>('/api/auth/verify-token'),
};

// ========== TRIPS API ==========
export const tripsAPI = {
    search: (params: { departure?: string; arrival?: string; date?: string; page?: number }) => {
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
        ).toString();
        return get<{ success: boolean; trips: Trip[]; total: number }>(`/api/trips/search?${queryString}`);
    },

    getById: (id: number) => get<{ success: boolean; trip: Trip }>(`/api/trips/${id}`),

    create: (data: Omit<Trip, 'id' | 'driver_id' | 'status' | 'created_at'>) =>
        post<{ success: boolean; trip: Trip }>('/api/trips', data),

    update: (id: number, data: Partial<Trip>) =>
        put<{ success: boolean; trip: Trip }>(`/api/trips/${id}`, data),

    complete: (id: number) => put<{ success: boolean }>(`/api/trips/${id}/complete`),

    cancel: (id: number) => del<{ success: boolean }>(`/api/trips/${id}`),

    getMyTrips: () => get<{ success: boolean; trips: Trip[] }>('/api/trips'),
};

// ========== BOOKINGS API ==========
export const bookingsAPI = {
    create: (tripId: number, seatsBooked: number) =>
        post<{ success: boolean; booking: Booking }>(`/api/bookings/trips/${tripId}/book`, {
            seats_booked: seatsBooked,
        }),

    getMyBookings: () => get<{ success: boolean; bookings: Booking[] }>('/api/bookings'),

    getById: (id: number) => get<{ success: boolean; booking: Booking }>(`/api/bookings/${id}`),

    cancel: (id: number) => put<{ success: boolean }>(`/api/bookings/${id}/cancel`),

    updateStatus: (id: number, status: 'confirmed' | 'rejected') =>
        put<{ success: boolean }>(`/api/bookings/${id}/status`, { status }),

    getBookingsForMyTrips: () =>
        get<{ success: boolean; bookings: Booking[] }>('/api/bookings/my-trips'),
};

// ========== MESSAGES API ==========
export const messagesAPI = {
    getConversations: () =>
        get<{ success: boolean; conversations: Conversation[] }>('/api/messages/conversations'),

    getMessages: (otherUserId: number) =>
        get<{ success: boolean; messages: Message[] }>(`/api/messages/${otherUserId}`),

    send: (receiverId: number, message: string, tripId?: number) =>
        post<{ success: boolean; message: Message }>('/api/messages', {
            receiver_id: receiverId,
            message,
            trip_id: tripId,
        }),
};

// ========== REVIEWS API ==========
export const reviewsAPI = {
    create: (bookingId: number, rating: number, comment?: string) =>
        post<{ success: boolean; review: Review }>(`/api/reviews/bookings/${bookingId}`, {
            rating,
            comment,
        }),

    getPending: () => get<{ success: boolean; reviews: Booking[] }>('/api/reviews/pending'),

    checkExists: (bookingId: number) =>
        get<{ success: boolean; exists: boolean }>(`/api/reviews/check/${bookingId}`),

    getUserReviews: (userId: number) =>
        get<{ success: boolean; reviews: Review[]; average: number }>(`/api/reviews/user/${userId}`),
};

// ========== ADMIN API ==========
export const adminAPI = {
    getStatistics: () =>
        get<{
            success: boolean;
            stats: {
                totalUsers: number;
                totalTrips: number;
                totalBookings: number;
                activeTrips: number;
            };
        }>('/api/admin/statistics'),

    getUsers: () => get<{ success: boolean; users: User[] }>('/api/admin/users'),

    updateUser: (id: number, data: Partial<User>) =>
        put<{ success: boolean; user: User }>(`/api/admin/users/${id}`, data),

    deleteUser: (id: number) => del<{ success: boolean }>(`/api/admin/users/${id}`),

    getTrips: () => get<{ success: boolean; trips: Trip[] }>('/api/admin/trips'),

    deleteTrip: (id: number) => del<{ success: boolean }>(`/api/admin/trips/${id}`),

    getBookings: () => get<{ success: boolean; bookings: Booking[] }>('/api/admin/bookings'),

    deleteBooking: (id: number) => del<{ success: boolean }>(`/api/admin/bookings/${id}`),
};

// ========== HEALTH CHECK ==========
export async function checkHealth(): Promise<boolean> {
    try {
        await get<{ status: string }>('/api/health');
        return true;
    } catch {
        return false;
    }
}
