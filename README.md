# Study Pal

An AI-powered study companion built with Cloudflare Agents that helps students learn more effectively through intelligent conversation, integrated study tools, and adaptive timing features.

## Features

- **Stateful Chat Memory**: Remembers conversation history and study progress across sessions
- **Online Search and Web Scraping**: Access real-time information and research capabilities
- **Adaptive AI Timing**: Smart study session management with integrated Pomodoro timer
- **Google Calendar Integration**: Schedule study sessions and appointments
- **Responsive UI**: Modern, clean interface with dark/light theme support
- **Voice Input**: Hands-free interaction with speech-to-text capabilities
- **Integrated Note-Taking**: Built-in notes system with export functionality
- **Dynamic Landing Page**: Animated welcome screen with cloud effects
- **Study Session Management**: Automatic layout adaptation when study sessions begin

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- Anthropic API key
- Google Calendar API key

## Setup

1. **Clone the repository:**

```bash
git clone https://github.com/Clowenp/cf_ai_StudyPal.git
cd study-pal
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.dev.vars` file in the root directory:

```env
ANTHROPIC_API_KEY=<enter_your_anthropic_api_key_here>
GOOGLE_CLIENT_ID=<enter_your_google_client_id_here>
GOOGLE_CLIENT_SECRET=<enter_your_google_client_secret_here>
GOOGLE_REDIRECT_URI=<enter_your_google_redirect_uri_here>
FIRECRAWL_API_KEY=<enter_your_firecrawl_api_key_here>
```

4. **Run locally:**

```bash
npm start
```

The application will be available at `http://localhost:8787`

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Chat.tsx              # Main chat interface
│   │   ├── StudyTimer.tsx        # Pomodoro timer component
│   │   ├── NotesTextbox.tsx      # Note-taking interface
│   │   ├── LandingPage.tsx       # Animated welcome screen
│   │   └── Avatar.tsx            # User/AI avatars
│   ├── contexts/
│   │   └── TimerContext.tsx      # Study timer state management
│   ├── hooks/
│   │   ├── useVoiceInput.ts      # Voice recognition functionality
│   │   └── useStudySession.ts    # Study session management
│   ├── tools.ts                  # AI tool definitions
│   ├── server.ts                 # Cloudflare Worker backend
│   ├── app.tsx                   # Main app layout
│   ├── client.tsx               # Frontend entry point
│   └── styles.css               # Global styles
```
## Feature Improvements

- More feedback from study sessions for AI to gain more context
- Store more explanatory variates for each topic study to gain more insights
- Store analytics of study sessions within structured database for analysis