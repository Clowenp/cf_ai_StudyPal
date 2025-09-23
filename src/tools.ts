/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";

/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 */
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  inputSchema: z.object({ city: z.string() })
  // Omitting execute function makes this tool require human confirmation
});

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: "get the local time for a specified location",
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  }
});

const scheduleTask = tool({
  description: "A tool to schedule a task to be executed at a later time",
  inputSchema: scheduleSchema,
  execute: async ({ when, description }) => {
    // we can now read the agent context from the ALS store
    const { agent } = getCurrentAgent<Chat>();

    function throwError(msg: string): string {
      throw new Error(msg);
    }
    if (when.type === "no-schedule") {
      return "Not a valid schedule input";
    }
    const input =
      when.type === "scheduled"
        ? when.date // scheduled
        : when.type === "delayed"
          ? when.delayInSeconds // delayed
          : when.type === "cron"
            ? when.cron // cron
            : throwError("not a valid schedule input");
    try {
      agent!.schedule(input!, "executeTask", description);
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for type "${when.type}" : ${input}`;
  }
});

/**
 * Tool to list all scheduled tasks
 * This executes automatically without requiring human confirmation
 */
const getScheduledTasks = tool({
  description: "List all tasks that have been scheduled",
  inputSchema: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const tasks = agent!.getSchedules();
      if (!tasks || tasks.length === 0) {
        return "No scheduled tasks found.";
      }
      return tasks;
    } catch (error) {
      console.error("Error listing scheduled tasks", error);
      return `Error listing scheduled tasks: ${error}`;
    }
  }
});

/**
 * Tool to cancel a scheduled task by its ID
 * This executes automatically without requiring human confirmation
 */
const cancelScheduledTask = tool({
  description: "Cancel a scheduled task using its ID",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to cancel")
  }),
  execute: async ({ taskId }) => {
    const { agent } = getCurrentAgent<Chat>();
    try {
      await agent!.cancelSchedule(taskId);
      return `Task ${taskId} has been successfully canceled.`;
    } catch (error) {
      console.error("Error canceling scheduled task", error);
      return `Error canceling task ${taskId}: ${error}`;
    }
  }
});

/**
 * Google Calendar authorization tool that executes automatically
 * This will initiate the OAuth flow for Google Calendar access
 */
const authorizeGoogleCalendar = tool({
  description: "Authorize access to Google Calendar to read and write events",
  inputSchema: z.object({
    scopes: z.array(z.string()).optional().describe("Calendar scopes to request (defaults to read/write)")
  }),
  execute: async ({ scopes }) => {
    console.log(`Authorizing Google Calendar with scopes:`, scopes);
    
    // Default scopes for calendar read/write access
    const defaultScopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];
    const requestedScopes = scopes || defaultScopes;
    
    // Generate OAuth URL for user authorization
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(requestedScopes.join(' '))}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    return {
      type: "google_auth_button",
      message: "Click the button below to authorize Google Calendar access:",
      authUrl: authUrl,
      buttonText: "🔗 Authorize Google Calendar"
    };
  }
});

/**
 * Create a Google Calendar event tool that executes automatically
 * This will create a new event in the user's Google Calendar
 */
const createCalendarEvent = tool({
  description: "Create a new event in Google Calendar",
  inputSchema: z.object({
    title: z.string().describe("Event title"),
    description: z.string().optional().describe("Event description"),
    startTime: z.string().describe("Start time in ISO format (e.g., 2024-01-15T10:00:00)"),
    endTime: z.string().describe("End time in ISO format (e.g., 2024-01-15T11:00:00)"),
    location: z.string().optional().describe("Event location"),
    attendees: z.array(z.string()).optional().describe("List of attendee email addresses")
  }),
  execute: async ({ title, description, startTime, endTime, location, attendees }) => {
    console.log(`Creating calendar event: ${title}`);
    
    // This would integrate with Google Calendar API
    // For now, we'll return a mock response
    const event = {
      title,
      description,
      startTime,
      endTime,
      location,
      attendees: attendees || []
    };
    
    // TODO: Implement actual Google Calendar API call
    // const response = await createGoogleCalendarEvent(event);
    
    return {
      message: `Calendar event "${title}" would be created successfully`,
      event: event,
      note: "Google Calendar API integration is pending - this is a preview of what would be created"
    };
  }
});

/**
 * List upcoming Google Calendar events tool that executes automatically
 * This will fetch upcoming events from the user's calendar
 */
const listCalendarEvents = tool({
  description: "List upcoming events from Google Calendar",
  inputSchema: z.object({
    maxResults: z.number().optional().describe("Maximum number of events to return (default: 10)"),
    timeMin: z.string().optional().describe("Start time filter in ISO format"),
    timeMax: z.string().optional().describe("End time filter in ISO format")
  }),
  execute: async ({ maxResults = 10, timeMin, timeMax }) => {
    // This will be implemented to fetch events from Google Calendar API
    console.log(`Fetching ${maxResults} calendar events`);
    return "Calendar events fetched successfully (implementation pending)";
  }
});

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getWeatherInformation,
  getLocalTime,
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask,
  authorizeGoogleCalendar,
  createCalendarEvent,
  listCalendarEvents
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  }
};
