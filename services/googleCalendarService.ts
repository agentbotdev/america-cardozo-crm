
import { supabase } from './supabaseClient';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const FALLBACK_USER_ID = '00000000-0000-0000-0000-000000000000'; // For local testing without login
const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires';

export const googleCalendarService = {
    getTimeZone: () => {
        return localStorage.getItem('crm_timezone') || DEFAULT_TIMEZONE;
    },

    getAuthUrl: () => {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: SCOPES,
        };

        const qs = new URLSearchParams(options);
        return `${rootUrl}?${qs.toString()}`;
    },

    exchangeCodeForToken: async (code: string) => {
        const url = 'https://oauth2.googleapis.com/token';
        const values = {
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        };

        const response = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams(values),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokens = await response.json();

        // Save to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || FALLBACK_USER_ID;

        const expires_at = new Date();
        expires_at.setSeconds(expires_at.getSeconds() + tokens.expires_in);

        const { error } = await supabase
            .from('google_tokens')
            .upsert({
                user_id: userId,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: expires_at.toISOString(),
            });

        if (error) throw error;
        return tokens;
    },

    getTokens: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || FALLBACK_USER_ID;

        const { data, error } = await supabase
            .from('google_tokens')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        // Check if expired
        const now = new Date();
        const expiresAt = new Date(data.expires_at);

        if (now >= expiresAt) {
            return await googleCalendarService.refreshAccessToken(data.refresh_token);
        }

        return data;
    },

    refreshAccessToken: async (refresh_token: string) => {
        const url = 'https://oauth2.googleapis.com/token';
        const values = {
            refresh_token,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token',
        };

        const response = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams(values),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const tokens = await response.json();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || FALLBACK_USER_ID;

        const expires_at = new Date();
        expires_at.setSeconds(expires_at.getSeconds() + tokens.expires_in);

        const { error } = await supabase
            .from('google_tokens')
            .upsert({
                user_id: userId,
                access_token: tokens.access_token,
                expires_at: expires_at.toISOString(),
            });

        if (error) throw error;
        return { ...tokens, refresh_token };
    },

    createVisitEvent: async (visit: any) => {
        const tokens = await googleCalendarService.getTokens();
        if (!tokens) throw new Error('Google Calendar not connected');

        const startDateTime = `${visit.fecha}T${visit.hora}:00`;
        const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

        const event = {
            summary: visit.tipo_reunion === 'propiedad'
                ? `Visita: ${visit.lead_nombre} - ${visit.property_titulo}`
                : `Reunión: ${visit.lead_nombre} - Oficina América Cardozo`,
            location: visit.tipo_reunion === 'propiedad' ? visit.property_titulo : 'Oficina Central',
            description: visit.notas || `Cita agendada con ${visit.lead_nombre}`,
            start: {
                dateTime: new Date(startDateTime).toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            attendees: visit.invitados?.map((email: string) => ({ email })) || [],
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to create Google Calendar event');
        }

        return await response.json();
    },

    updateVisitEvent: async (event_id: string, visit: any) => {
        const tokens = await googleCalendarService.getTokens();
        if (!tokens) throw new Error('Google Calendar not connected');

        const startDateTime = `${visit.fecha}T${visit.hora}:00`;
        const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

        const event = {
            summary: visit.tipo_reunion === 'propiedad'
                ? `Visita: ${visit.lead_nombre} - ${visit.property_titulo}`
                : `Reunión: ${visit.lead_nombre} - Oficina América Cardozo`,
            location: visit.tipo_reunion === 'propiedad' ? visit.property_titulo : 'Oficina Central',
            description: visit.notas || `Cita agendada con ${visit.lead_nombre}`,
            start: {
                dateTime: new Date(startDateTime).toISOString(),
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'America/Argentina/Buenos_Aires',
            },
            attendees: visit.invitados?.map((email: string) => ({ email })) || [],
        };

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${event_id}?sendUpdates=all`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to update Google Calendar event');
        }

        return await response.json();
    },

    deleteVisitEvent: async (event_id: string) => {
        const tokens = await googleCalendarService.getTokens();
        if (!tokens) throw new Error('Google Calendar not connected');

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${event_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
            }
        });

        if (!response.ok && response.status !== 404) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to delete Google Calendar event');
        }
        return true;
    }
};
