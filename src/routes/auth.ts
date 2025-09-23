/**
 * Google Calendar OAuth callback handler
 * This handles the redirect from Google after user authorization
 */

import { exchangeCodeForToken, type GoogleCalendarConfig } from '../lib/google-calendar';

export async function handleGoogleCallback(
  request: Request,
  env: any
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  // Handle authorization errors
  if (error) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Authorization Error</h1>
          <div class="error">
            <p>There was an error authorizing your Google Calendar access:</p>
            <p><strong>${error}</strong></p>
            <p>Please try again or contact support if the problem persists.</p>
          </div>
          <p><a href="/">Return to Chat</a></p>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      }
    );
  }

  // Handle missing authorization code
  if (!code) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Missing Authorization Code</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Authorization Incomplete</h1>
          <div class="error">
            <p>No authorization code was received from Google.</p>
            <p>Please try the authorization process again.</p>
          </div>
          <p><a href="/">Return to Chat</a></p>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      }
    );
  }

  try {
    // Exchange authorization code for access token
    const config: GoogleCalendarConfig = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI,
    };

    const tokenResponse = await exchangeCodeForToken(config, code);

    // In a real application, you would store these tokens securely
    // For now, we'll just show a success message
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { color: #2e7d32; background: #e8f5e9; padding: 15px; border-radius: 4px; }
            .token-info { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .note { color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Google Calendar Authorization Successful!</h1>
          <div class="success">
            <p>✅ Your Google Calendar has been successfully authorized.</p>
            <p>You can now create and manage calendar events through the chat interface.</p>
          </div>
          
          <div class="token-info">
            <h3>Token Information (for development):</h3>
            <p><strong>Access Token:</strong> ${tokenResponse.access_token.substring(0, 20)}...</p>
            ${tokenResponse.refresh_token ? `<p><strong>Refresh Token:</strong> ${tokenResponse.refresh_token.substring(0, 20)}...</p>` : ''}
            <p class="note">Note: In production, these tokens would be securely stored and not displayed.</p>
          </div>
          
          <p><a href="/">Return to Chat</a></p>
          
          <script>
            // Auto-close this window after 5 seconds if it was opened as a popup
            if (window.opener) {
              setTimeout(() => {
                window.close();
              }, 5000);
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Token Exchange Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Token Exchange Error</h1>
          <div class="error">
            <p>There was an error exchanging the authorization code for an access token:</p>
            <p><strong>${error instanceof Error ? error.message : 'Unknown error'}</strong></p>
            <p>Please try the authorization process again.</p>
          </div>
          <p><a href="/">Return to Chat</a></p>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 500,
      }
    );
  }
}
