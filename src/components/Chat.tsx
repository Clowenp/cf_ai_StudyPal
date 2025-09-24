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
import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { Textarea } from "@/components/textarea/Textarea";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";

// Icon imports
import {
  Moon,
  Sun,
  Trash,
  PaperPlaneTilt,
  Stop,
  Microphone,
  MicrophoneSlash,
  Sparkle,
  ChatCircle,
  GraduationCap
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
        ? 'shadow-lg border-2 border-[#E91E63]/20' 
        : 'shadow-2xl border-2 border-[#E91E63]/30'
    } ${className}`}
    style={{
      boxShadow: isTimerActive 
        ? '0 10px 25px -5px rgba(233, 30, 99, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
        : '0 25px 50px -12px rgba(233, 30, 99, 0.15), 0 25px 25px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
    }}>
      {/* Modern Header */}
      <div className="relative px-6 py-4 border-b border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-4 sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-neutral-950/80">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/3 via-transparent to-[#E91E63]/3 pointer-events-none"></div>
        
        {/* Logo with enhanced styling */}
        <div className="relative flex items-center gap-3">
          <div className="relative">
            {/* Glow effect behind icon */}
            <div className="absolute inset-0 bg-[#E91E63]/20 rounded-lg blur-md scale-110"></div>
            <div className="relative bg-gradient-to-br from-[#E91E63]/10 to-[#E91E63]/5 p-2 rounded-lg border border-[#E91E63]/10">
              <GraduationCap size={24} className="text-[#E91E63]" />
            </div>
          </div>
          
          {/* Title with enhanced typography */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold bg-gradient-to-r from-[#E91E63] via-[#E91E63]/90 to-[#E91E63]/70 bg-clip-text text-transparent leading-tight">
              Study Pal
            </h1>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-[#E91E63]/40 rounded-full"></div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">AI Study Companion</span>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Action buttons with modern styling */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="relative group p-2.5 rounded-xl bg-neutral-100/60 dark:bg-neutral-800/60 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 border border-neutral-200/40 dark:border-neutral-700/40 transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Toggle theme"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative text-neutral-600 dark:text-neutral-300 group-hover:text-[#E91E63] transition-colors duration-200">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </div>
          </button>

          <button
            onClick={() => {
              clearHistory();
              setCompletedToolCalls(new Set());
            }}
            className="relative group p-2.5 rounded-xl bg-neutral-100/60 dark:bg-neutral-800/60 hover:bg-red-50/80 dark:hover:bg-red-900/20 border border-neutral-200/40 dark:border-neutral-700/40 hover:border-red-200/60 dark:hover:border-red-800/60 transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Clear chat history"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative text-neutral-600 dark:text-neutral-300 group-hover:text-red-500 transition-colors duration-200">
              <Trash size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 max-h-[calc(100vh-10rem)] chat-scrollbar">
        {agentMessages.length === 0 && (
          <div className="h-full flex items-center justify-center p-4">
            <div className="max-w-lg mx-auto text-center">
              {/* Modern Hero Section */}
              <div className="relative mb-8">
                {/* Decorative background elements */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-4 left-8 w-2 h-2 bg-[#E91E63]/20 rounded-full animate-pulse"></div>
                  <div className="absolute top-12 right-12 w-1 h-1 bg-[#E91E63]/30 rounded-full animate-pulse delay-300"></div>
                  <div className="absolute bottom-8 left-16 w-1.5 h-1.5 bg-[#E91E63]/25 rounded-full animate-pulse delay-700"></div>
                </div>
                
                {/* Main icon with gradient background */}
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E91E63]/20 via-[#E91E63]/10 to-transparent rounded-full blur-xl scale-150"></div>
                  <div className="relative bg-gradient-to-br from-[#E91E63]/15 to-[#E91E63]/5 p-6 rounded-2xl border border-[#E91E63]/10 backdrop-blur-sm">
                    <ChatCircle size={32} className="text-[#E91E63]" />
                  </div>
                </div>
              </div>

              {/* Title with gradient */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#E91E63] via-[#E91E63]/90 to-[#E91E63]/70 bg-clip-text text-transparent mb-2">
                  Study Pal
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed">
                  Your AI-powered study companion. Let's learn together!
                </p>
              </div>

              {/* Feature cards */}
              <div className="grid gap-3 mb-6">
                <Card className="p-4 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-900/50 dark:to-neutral-800/30 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-[#E91E63]/20 transition-all duration-300">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-shrink-0 w-2 h-2 bg-[#E91E63] rounded-full"></div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Voice input (click the microphone)</span>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-900/50 dark:to-neutral-800/30 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-[#E91E63]/20 transition-all duration-300">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-shrink-0 w-2 h-2 bg-[#E91E63] rounded-full"></div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">I want to study Math (auto-starts timer)</span>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-900/50 dark:to-neutral-800/30 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-[#E91E63]/20 transition-all duration-300">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-shrink-0 w-2 h-2 bg-[#E91E63] rounded-full"></div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Study for online lecture notes</span>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-900/50 dark:to-neutral-800/30 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-[#E91E63]/20 transition-all duration-300">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-shrink-0 w-2 h-2 bg-[#E91E63] rounded-full"></div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Authorize Google Calendar and see events</span>
                  </div>
                </Card>
              </div>

              {/* Call to action */}
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <Sparkle size={14} className="text-[#E91E63]/60" />
                <span>Start a conversation to begin studying</span>
                <Sparkle size={14} className="text-[#E91E63]/60" />
              </div>
            </div>
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
