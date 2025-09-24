/** biome-ignore-all lint/correctness/useUniqueElementIds: it's alright */
import { useEffect, useState, useRef, useCallback } from "react";
import { useAgent } from "agents/react";
import { isToolUIPart } from "ai";
import { useAgentChat } from "agents/ai-react";
import type { UIMessage } from "@ai-sdk/react";
import type { tools } from "../tools";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useStudySession } from "../hooks/useStudySession";
import { useTimerContext } from "../contexts/TimerContext";

// Component imports
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { Textarea } from "@/components/textarea/Textarea";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";

// Icon imports
import {
  Moon,
  Robot,
  Sun,
  Trash,
  PaperPlaneTilt,
  Stop,
  Microphone,
  MicrophoneSlash
} from "@phosphor-icons/react";

// List of tools that require human confirmation
// NOTE: this should match the tools that don't have execute functions in tools.ts
const toolsRequiringConfirmation: (keyof typeof tools)[] = [
  "getWeatherInformation",
  "scrapeWebsite"
];

interface ChatProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  className?: string;
}

export function Chat({ theme, toggleTheme, className = '' }: ChatProps) {
  const [completedToolCalls, setCompletedToolCalls] = useState<Set<string>>(new Set());
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const agent = useAgent({
    agent: "chat"
  });

  // Voice input functionality
  const {
    isListening,
    isSupported: isVoiceSupported,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    clearTranscript
  } = useVoiceInput();

  // Study session functionality
  const studySession = useStudySession();
  const timer = useTimerContext();
  
  // Dynamic sizing based on timer state
  const isTimerActive = timer.isRunning || timer.isPaused;

  const [agentInput, setAgentInput] = useState("");
  const handleAgentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAgentInput(e.target.value);
  };

  const handleAgentSubmit = async (
    e: React.FormEvent,
    extraData: Record<string, unknown> = {}
  ) => {
    e.preventDefault();
    if (!agentInput.trim()) return;

    const message = agentInput;
    setAgentInput("");

    // Check if this is a study intent
    const studyIntent = studySession.parseStudyIntent(message);
    if (studyIntent) {
      // Start a study session
      const session = studySession.startStudySession(studyIntent.subject);
      
      // Set timer to the recommended duration
      timer.setTime(session.duration);
      timer.startTimer();
      
      // Generate motivational message
      const motivationalMessage = studySession.getMotivationalMessage(studyIntent.subject);
      
      // Send a modified message that prevents tool usage and includes our response
      const modifiedMessage = `${message}

SYSTEM INSTRUCTION: This is a study timer request. The timer has already been started automatically for ${session.duration} minutes. Do not use any tools or functions. Respond with this exact message: "${motivationalMessage}

**Timer Started:** ${session.duration} minutes for ${studyIntent.subject}"`;

      await sendMessage(
        {
          role: "user",
          parts: [{ type: "text", text: modifiedMessage }]
        },
        {
          body: extraData
        }
      );
      
      return;
    }

    // Send regular message to agent
    await sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: message }]
      },
      {
        body: extraData
      }
    );
  };

  const {
    messages: agentMessages,
    addToolResult,
    clearHistory,
    status,
    sendMessage,
    stop
  } = useAgentChat<unknown, UIMessage<{ createdAt: string }>>({
    agent
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    agentMessages.length > 0 && scrollToBottom();
  }, [agentMessages, scrollToBottom]);

  // Sync voice transcript with input field
  useEffect(() => {
    if (transcript) {
      setAgentInput(transcript);
    }
  }, [transcript]);

  // Voice input handlers
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      setAgentInput("");
      startListening();
    }
  };

  // Handle timer completion and stopping for study sessions
  const [processedSessionId, setProcessedSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    // Only process if we have a current session and it hasn't been processed yet
    if ((timer.isFinished || timer.wasStopped) && 
        studySession.currentSession && 
        studySession.currentSession.id !== processedSessionId) {
      
      // Mark this session as being processed to prevent duplicates
      setProcessedSessionId(studySession.currentSession.id);
      
      // Calculate actual study time
      const actualMinutes = Math.round((timer.totalTime - timer.timeRemaining) / 60);
      
      // Complete the study session with actual time studied
      const completedSession = studySession.completeStudySession(actualMinutes);
      
      if (completedSession) {
        // Generate completion message
        const completionMessage = studySession.getStudyCompletionMessage(
          completedSession, 
          timer.isFinished // true if completed, false if stopped early
        );
        
        // Send completion message with special instruction to prevent AI tool usage
        setTimeout(() => {
          const combinedMessage = `${completionMessage}

SYSTEM INSTRUCTION: This is an automatic study session completion message. Do not use any tools or functions. Simply acknowledge this completion with a brief encouraging response. Do not call getLocalTime, getWeatherInformation, or any other tools.`;

          sendMessage(
            {
              role: "user",
              parts: [{ type: "text", text: combinedMessage }]
            },
            { body: {} }
          );
        }, 500);
        
        // Clear timer state completely after processing to prevent re-triggering
        setTimeout(() => {
          timer.clearTimer(); // Completely reset all timer flags
        }, 1500);
      }
    }
    
    // Reset processed session when a new session starts
    if (studySession.currentSession && 
        studySession.currentSession.id !== processedSessionId && 
        !timer.isFinished && !timer.wasStopped) {
      setProcessedSessionId(null);
    }
  }, [timer.isFinished, timer.wasStopped, timer.timeRemaining, timer.totalTime, studySession.currentSession, processedSessionId, studySession, sendMessage, timer]);

  const pendingToolCallConfirmation = agentMessages.some((m: UIMessage) =>
    m.parts?.some(
      (part) =>
        isToolUIPart(part) &&
        part.state === "input-available" &&
        // Manual check inside the component
        toolsRequiringConfirmation.includes(
          part.type.replace("tool-", "") as keyof typeof tools
        )
    )
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`flex flex-col h-full rounded-md overflow-hidden relative transition-all duration-500 ease-in-out ${
      isTimerActive 
        ? 'shadow-lg border-2 border-[#F48120]/20' 
        : 'shadow-2xl border-2 border-[#F48120]/30'
    } ${className}`}
    style={{
      boxShadow: isTimerActive 
        ? '0 10px 25px -5px rgba(244, 129, 32, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
        : '0 25px 50px -12px rgba(244, 129, 32, 0.15), 0 25px 25px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div className="px-4 py-3 border-b border-neutral-300 dark:border-neutral-800 flex items-center gap-3 sticky top-0 z-10 bg-gradient-to-r from-transparent via-[#F48120]/5 to-transparent">
        <div className="flex items-center justify-center h-8 w-8">
          <svg
            width="28px"
            height="28px"
            className="text-[#F48120]"
            data-icon="agents"
          >
            <title>Cloudflare Agents</title>
            <symbol id="ai:local:agents" viewBox="0 0 80 79">
              <path
                fill="currentColor"
                d="M69.3 39.7c-3.1 0-5.8 2.1-6.7 5H48.3V34h4.6l4.5-2.5c1.1.8 2.5 1.2 3.9 1.2 3.8 0 7-3.1 7-7s-3.1-7-7-7-7 3.1-7 7c0 .9.2 1.8.5 2.6L51.9 30h-3.5V18.8h-.1c-1.3-1-2.9-1.6-4.5-1.9h-.2c-1.9-.3-3.9-.1-5.8.6-.4.1-.8.3-1.2.5h-.1c-.1.1-.2.1-.3.2-1.7 1-3 2.4-4 4 0 .1-.1.2-.1.2l-.3.6c0 .1-.1.1-.1.2v.1h-.6c-2.9 0-5.7 1.2-7.7 3.2-2.1 2-3.2 4.8-3.2 7.7 0 .7.1 1.4.2 2.1-1.3.9-2.4 2.1-3.2 3.5s-1.2 2.9-1.4 4.5c-.1 1.6.1 3.2.7 4.7s1.5 2.9 2.6 4c-.8 1.8-1.2 3.7-1.1 5.6 0 1.9.5 3.8 1.4 5.6s2.1 3.2 3.6 4.4c1.3 1 2.7 1.7 4.3 2.2v-.1q2.25.75 4.8.6h.1c0 .1.1.1.1.1.9 1.7 2.3 3 4 4 .1.1.2.1.3.2h.1c.4.2.8.4 1.2.5 1.4.6 3 .8 4.5.7.4 0 .8-.1 1.3-.1h.1c1.6-.3 3.1-.9 4.5-1.9V62.9h3.5l3.1 1.7c-.3.8-.5 1.7-.5 2.6 0 3.8 3.1 7 7 7s7-3.1 7-7-3.1-7-7-7c-1.5 0-2.8.5-3.9 1.2l-4.6-2.5h-4.6V48.7h14.3c.9 2.9 3.5 5 6.7 5 3.8 0 7-3.1 7-7s-3.1-7-7-7m-7.9-16.9c1.6 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.4-3 3-3m0 41.4c1.6 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.4-3 3-3M44.3 72c-.4.2-.7.3-1.1.3-.2 0-.4.1-.5.1h-.2c-.9.1-1.7 0-2.6-.3-1-.3-1.9-.9-2.7-1.7-.7-.8-1.3-1.7-1.6-2.7l-.3-1.5v-.7q0-.75.3-1.5c.1-.2.1-.4.2-.7s.3-.6.5-.9c0-.1.1-.1.1-.2.1-.1.1-.2.2-.3s.1-.2.2-.3c0 0 0-.1.1-.1l.6-.6-2.7-3.5c-1.3 1.1-2.3 2.4-2.9 3.9-.2.4-.4.9-.5 1.3v.1c-.1.2-.1.4-.1.6-.3 1.1-.4 2.3-.3 3.4-.3 0-.7 0-1-.1-2.2-.4-4.2-1.5-5.5-3.2-1.4-1.7-2-3.9-1.8-6.1q.15-1.2.6-2.4l.3-.6c.1-.2.2-.4.3-.5 0 0 0-.1.1-.1.4-.7.9-1.3 1.5-1.9 1.6-1.5 3.8-2.3 6-2.3q1.05 0 2.1.3v-4.5c-.7-.1-1.4-.2-2.1-.2-1.8 0-3.5.4-5.2 1.1-.7.3-1.3.6-1.9 1s-1.1.8-1.7 1.3c-.3.2-.5.5-.8.8-.6-.8-1-1.6-1.3-2.6-.2-1-.2-2 0-2.9.2-1 .6-1.9 1.3-2.6.6-.8 1.4-1.4 2.3-1.8l1.8-.9-.7-1.9c-.4-1-.5-2.1-.4-3.1s.5-2.1 1.1-2.9q.9-1.35 2.4-2.1c.9-.5 2-.8 3-.7.5 0 1 .1 1.5.2 1 .2 1.8.7 2.6 1.3s1.4 1.4 1.8 2.3l4.1-1.5c-.9-2-2.3-3.7-4.2-4.9q-.6-.3-.9-.6c.4-.7 1-1.4 1.6-1.9.8-.7 1.8-1.1 2.9-1.3.9-.2 1.7-.1 2.6 0 .4.1.7.2 1.1.3V72zm25-22.3c-1.6 0-3-1.3-3-3 0-1.6 1.3-3 3-3s3 1.3 3 3c0 1.6-1.3 3-3 3"
              />
            </symbol>
            <use href="#ai:local:agents" />
          </svg>
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-base bg-gradient-to-r from-[#F48120] to-[#F48120]/80 bg-clip-text text-transparent">
            Study Pal
          </h2>
        </div>


        <Button
          variant="ghost"
          size="md"
          shape="square"
          className="rounded-full h-9 w-9"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        <Button
          variant="ghost"
          size="md"
          shape="square"
          className="rounded-full h-9 w-9"
          onClick={() => {
            clearHistory();
            setCompletedToolCalls(new Set()); // Clear completed tool calls when clearing history
          }}
        >
          <Trash size={20} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 max-h-[calc(100vh-10rem)] chat-scrollbar">
        {agentMessages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <Card className="p-6 max-w-md mx-auto bg-neutral-100 dark:bg-neutral-900">
              <div className="text-center space-y-4">
                <div className="bg-[#F48120]/10 text-[#F48120] rounded-full p-3 inline-flex">
                  <Robot size={24} />
                </div>
                <h3 className="font-semibold text-lg">Study Pal</h3>
                <p className="text-muted-foreground text-sm">
                  Study with me! Ask me about anything ...
                </p>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-[#F48120]">•</span>
                    <span>Local time in different locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#F48120]">•</span>
                    <span>Voice input (click the microphone)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#F48120]">•</span>
                    <span>"I want to study Math" (auto-starts timer)</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        )}

        {agentMessages.map((m, index) => {
          const isUser = m.role === "user";
          const showAvatar =
            index === 0 || agentMessages[index - 1]?.role !== m.role;

          // Check if this message should be hidden (contains only system instructions)
          const shouldHideMessage = isUser && m.parts?.every(part => {
            if (part.type === "text") {
              const cleanText = part.text.replace(/\n\nSYSTEM INSTRUCTION:.*$/s, '').trim();
              return !cleanText || cleanText.length === 0;
            }
            return false;
          });

          // Don't render messages that are only system instructions
          if (shouldHideMessage) {
            return null;
          }

          return (
            <div key={m.id}>
              <div
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[85%] ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {showAvatar && !isUser ? (
                    <Avatar username={"AI"} />
                  ) : (
                    !isUser && <div className="w-8" />
                  )}

                  <div>
                    <div>
                      {m.parts?.map((part, i) => {
                        if (part.type === "text") {
                          // Filter out system instructions from display
                          const cleanText = part.text.replace(/\n\nSYSTEM INSTRUCTION:.*$/s, '').trim();
                          
                          // Don't render if the message is only system instructions
                          if (!cleanText || cleanText.length === 0) {
                            return null;
                          }
                          
                          return (
                            // biome-ignore lint/suspicious/noArrayIndexKey: immutable index
                            <div key={i}>
                              <Card
                                className={`p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 ${
                                  isUser
                                    ? "rounded-br-none"
                                    : "rounded-bl-none border-assistant-border"
                                } ${
                                  cleanText.startsWith("scheduled message")
                                    ? "border-accent/50"
                                    : ""
                                } relative`}
                              >
                                {cleanText.startsWith(
                                  "scheduled message"
                                ) && (
                                  <span className="absolute -top-3 -left-2 text-base">
                                    🕒
                                  </span>
                                )}
                                {(() => {
                                  const processedText = cleanText.replace(
                                    /^scheduled message: /,
                                    ""
                                  );
                                  
                                  // Check if this is a special tool result that should only be displayed in ToolInvocationCard
                                  try {
                                    const parsed = JSON.parse(processedText);
                                    if (parsed.type && (parsed.type.includes("google_auth_button") || parsed.type === "setup_required")) {
                                      // Don't render these as regular messages - they should only appear in ToolInvocationCards
                                      return null;
                                    }
                                  } catch (e) {
                                    // Not JSON, continue with regular markdown
                                  }
                                  
                                  return (
                                    <MemoizedMarkdown
                                      id={`${m.id}-${i}`}
                                      content={processedText}
                                    />
                                  );
                                })()}
                              </Card>
                              <p
                                className={`text-xs text-muted-foreground mt-1 ${
                                  isUser ? "text-right" : "text-left"
                                }`}
                              >
                                {formatTime(
                                  m.metadata?.createdAt
                                    ? new Date(m.metadata.createdAt)
                                    : new Date()
                                )}
                              </p>
                            </div>
                          );
                        }

                        if (isToolUIPart(part)) {
                          const toolCallId = part.toolCallId;
                          const toolName = part.type.replace("tool-", "");
                          const needsConfirmation =
                            toolsRequiringConfirmation.includes(
                              toolName as keyof typeof tools
                            );


                          // Check if this tool call has already been completed
                          const isCompleted = completedToolCalls.has(toolCallId);

                          // Always render the ToolInvocationCard to ensure proper tool execution
                          // The card itself should handle automatic execution vs confirmation
                          return (
                            <ToolInvocationCard
                              key={toolCallId} // Use just toolCallId to prevent duplicates
                              toolUIPart={part}
                              toolCallId={toolCallId}
                              needsConfirmation={needsConfirmation}
                              isCompleted={isCompleted}
                              onSubmit={({ toolCallId, result }) => {
                                // Mark as completed
                                setCompletedToolCalls(prev => new Set(prev).add(toolCallId));
                                addToolResult({
                                  tool: part.type.replace("tool-", ""),
                                  toolCallId,
                                  output: result
                                });
                              }}
                              addToolResult={(params) => {
                                // Mark as completed when skip is used
                                setCompletedToolCalls(prev => new Set(prev).add(params.toolCallId));
                                addToolResult(params);
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAgentSubmit(e, {
            annotations: {
              hello: "world"
            }
          });
          setTextareaHeight("auto"); // Reset height after submission
        }}
        className="p-3 bg-neutral-50 absolute bottom-0 left-0 right-0 z-10 border-t border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Textarea
              disabled={pendingToolCallConfirmation}
              placeholder={
                pendingToolCallConfirmation
                  ? "Please respond to the tool confirmation above..."
                  : "Send a message..."
              }
              className="flex w-full border border-neutral-200 dark:border-neutral-700 px-3 py-2  ring-offset-background placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base pb-10 dark:bg-neutral-900"
              value={agentInput}
              onChange={(e) => {
                handleAgentInputChange(e);
                // Auto-resize the textarea
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                setTextareaHeight(`${e.target.scrollHeight}px`);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  handleAgentSubmit(e as unknown as React.FormEvent);
                  setTextareaHeight("auto"); // Reset height on Enter submission
                }
              }}
              rows={2}
              style={{ height: textareaHeight }}
            />
            
            {/* Voice Status Indicator */}
            {(isListening || voiceError) && (
              <div className="absolute bottom-12 left-2 right-2 p-2 rounded-lg text-xs">
                {isListening && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Listening... (speak now)
                  </div>
                )}
                {voiceError && (
                  <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    Voice Error: {voiceError}
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end gap-2">
              {/* Voice Input Button */}
              {isVoiceSupported && (
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800 ${
                    isListening 
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? <MicrophoneSlash size={16} /> : <Microphone size={16} />}
                </button>
              )}
              
              {/* Send/Stop Button */}
              {status === "submitted" || status === "streaming" ? (
                <button
                  type="button"
                  onClick={stop}
                  className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800"
                  aria-label="Stop generation"
                >
                  <Stop size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800"
                  disabled={pendingToolCallConfirmation || !agentInput.trim()}
                  aria-label="Send message"
                >
                  <PaperPlaneTilt size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
