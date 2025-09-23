/**
 * Google Calendar API integration utilities
 * Handles OAuth flow and calendar operations
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
}

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Generate Google OAuth authorization URL
 */
export function generateAuthUrl(config: GoogleCalendarConfig, scopes: string[]): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  config: GoogleCalendarConfig,
  code: string
): Promise<{ access_token: string; refresh_token?: string }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a calendar event using Google Calendar API
 */
export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEvent
): Promise<any> {
  const calendarEvent = {
    summary: event.title,
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.startTime,
      timeZone: 'America/New_York', // You might want to make this configurable
    },
    end: {
      dateTime: event.endTime,
      timeZone: 'America/New_York',
    },
    attendees: event.attendees?.map(email => ({ email })),
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarEvent),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create calendar event: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List calendar events using Google Calendar API
 */
export async function listCalendarEvents(
  accessToken: string,
  options: {
    maxResults?: number;
    timeMin?: string;
    timeMax?: string;
  } = {}
): Promise<any> {
  const params = new URLSearchParams({
    maxResults: (options.maxResults || 10).toString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  if (options.timeMin) {
    params.append('timeMin', options.timeMin);
  }
  if (options.timeMax) {
    params.append('timeMax', options.timeMax);
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list calendar events: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  config: GoogleCalendarConfig,
  refreshToken: string
): Promise<{ access_token: string }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  return response.json();
}
