# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm start` - Start development server using Vite
- `npm run deploy` - Build and deploy to Cloudflare Workers using Wrangler
- `npm test` - Run tests using Vitest
- `npm run types` - Generate TypeScript types for Workers environment
- `npm run format` - Format code using Prettier
- `npm run check` - Run linting (Biome), type checking (TypeScript), and formatting checks

### Environment Setup
Create a `.dev.vars` file with required environment variables:
```
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

## Architecture Overview

This is a Cloudflare Workers AI Chat Agent application built with the Agents SDK, featuring an integrated study timer and Google Calendar functionality.

### Core Components

**AI Chat Agent (`src/server.ts`)**
- Main entry point extending `AIChatAgent` from the agents package
- Handles real-time AI chat interactions with tool support
- Implements human-in-the-loop confirmations for certain tools
- Uses Anthropic Claude model with AI SDK for streaming responses

**Frontend App (`src/app.tsx`)**
- React-based chat interface with dynamic layout
- Integrated study timer that expands/contracts based on usage
- Dark/light theme support with localStorage persistence
- Real-time responsive design using Tailwind CSS

**Tool System (`src/tools.ts`)**
- Two types of tools: automatic execution and human confirmation required
- Weather information and web scraping require user confirmation
- Scheduling, Google Calendar, and time tools execute automatically
- Firecrawl integration for web content scraping

**Study Timer System**
- Custom React context for timer state management
- Pomodoro-style timer functionality
- Dynamic UI layout adaptation based on timer state

### Key Integrations

**Google Calendar**
- OAuth 2.0 flow for calendar access
- Event creation and listing capabilities
- Handles missing credentials gracefully with setup prompts

**Web Scraping**
- Firecrawl integration for content extraction
- Markdown format output with content truncation
- Error handling for inaccessible websites

**Cloudflare Workers Features**
- Durable Objects for agent state persistence
- Static assets serving for React frontend
- Workers AI binding available (though using external Anthropic API)

### Project Structure Notes

- `src/contexts/` - React context providers (TimerContext)
- `src/components/` - Reusable UI components with consistent design system
- `src/hooks/` - Custom React hooks for timer and utility functions
- `src/lib/` - Utility libraries and integrations
- `src/routes/` - API route handlers (Google OAuth callback)

### Configuration Requirements

The project uses `wrangler.jsonc` with:
- Durable Objects binding for Chat agent
- SQLite classes migration for state persistence
- Static assets serving from public directory
- Workers AI binding (currently unused)
- Node.js compatibility enabled

### Tool Development Guidelines

When adding new tools:
- Tools without `execute` function require human confirmation
- Tools with `execute` function run automatically
- Add corresponding execution handlers to `executions` object for confirmation-required tools
- Use Zod schemas for input validation
- Implement graceful error handling and user-friendly messages