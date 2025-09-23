import { useState } from "react";
import type { ToolUIPart } from "ai";
import { Robot, CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { GoogleAuthButton } from "@/components/google-auth-button/GoogleAuthButton";
import { SetupRequiredCard } from "@/components/setup-required/SetupRequiredCard";
import { APPROVAL } from "@/shared";

interface ToolResultWithContent {
  content: Array<{ type: string; text: string }>;
}

function isToolResultWithContent(
  result: unknown
): result is ToolResultWithContent {
  return (
    typeof result === "object" &&
    result !== null &&
    "content" in result &&
    Array.isArray((result as ToolResultWithContent).content)
  );
}

interface ToolInvocationCardProps {
  toolUIPart: ToolUIPart;
  toolCallId: string;
  needsConfirmation: boolean;
  isCompleted?: boolean;
  onSubmit: ({
    toolCallId,
    result
  }: {
    toolCallId: string;
    result: string;
  }) => void;
  addToolResult: (params: { tool: string; toolCallId: string; output: string }) => void;
}

export function ToolInvocationCard({
  toolUIPart,
  toolCallId,
  needsConfirmation,
  isCompleted = false,
  onSubmit,
  addToolResult
}: ToolInvocationCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="p-4 my-3 w-full max-w-[500px] rounded-md bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 cursor-pointer"
      >
        <div
          className={`${needsConfirmation ? "bg-[#F48120]/10" : "bg-[#F48120]/5"} p-1.5 rounded-full flex-shrink-0`}
        >
          <Robot size={16} className="text-[#F48120]" />
        </div>
        <h4 className="font-medium flex items-center gap-2 flex-1 text-left">
          {toolUIPart.type}
          {!needsConfirmation && toolUIPart.state === "output-available" && (
            <span className="text-xs text-[#F48120]/70">✓ Completed</span>
          )}
        </h4>
        <CaretDown
          size={16}
          className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`transition-all duration-200 ${isExpanded ? "max-h-[200px] opacity-100 mt-3" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div
          className="overflow-y-auto"
          style={{ maxHeight: isExpanded ? "180px" : "0px" }}
        >
          <div className="mb-3">
            <h5 className="text-xs font-medium mb-1 text-muted-foreground">
              Arguments:
            </h5>
            <pre className="bg-background/80 p-2 rounded-md text-xs overflow-auto whitespace-pre-wrap break-words max-w-[450px]">
              {JSON.stringify(toolUIPart.input, null, 2)}
            </pre>
          </div>

          {needsConfirmation && toolUIPart.state === "input-available" && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSubmit({ toolCallId, result: APPROVAL.NO })}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSubmit({ toolCallId, result: APPROVAL.YES })}
              >
                Approve
              </Button>
            </div>
          )}

          {!needsConfirmation && toolUIPart.state === "output-available" && (
            <div className="mt-3 border-t border-[#F48120]/10 pt-3">
              <h5 className="text-xs font-medium mb-1 text-muted-foreground">
                Result:
              </h5>
              {(() => {
                const result = toolUIPart.output;
                
                // Check if this is a special response type
                if (typeof result === 'object' && result !== null && 'type' in result) {
                  const resultObj = result as any;
                  
                  // Google auth button (with or without skip)
                  if ((resultObj.type === "google_auth_button" || resultObj.type === "google_auth_button_with_skip") && resultObj.authUrl) {
                    return (
                      <div className="mt-2">
                        <GoogleAuthButton
                          authUrl={resultObj.authUrl}
                          message={resultObj.message}
                          buttonText={resultObj.buttonText}
                          skipMessage={resultObj.skipMessage}
                          skipButtonText={resultObj.skipButtonText}
                          onSkip={isCompleted ? undefined : () => {
                            console.log('User chose to skip Google Calendar setup');
                            // Add a tool result to complete the conversation properly
                            addToolResult({
                              tool: toolUIPart.type.replace("tool-", ""),
                              toolCallId,
                              output: "I understand you'd prefer to skip the Google Calendar setup for now. No problem! I can help you with other tasks instead. What would you like to do?"
                            });
                          }}
                        />
                      </div>
                    );
                  }
                  
                  // Setup required message
                  if (resultObj.type === "setup_required") {
                    return (
                      <div className="mt-2">
                        <SetupRequiredCard
                          message={resultObj.message}
                          details={resultObj.details}
                          alternative={resultObj.alternative}
                          skipMessage={resultObj.skipMessage}
                          onSkip={() => {
                            // Tool is already completed, just a visual indicator
                            console.log('User chose to skip calendar setup');
                          }}
                        />
                      </div>
                    );
                  }
                }
                
                // Default result display
                return (
                  <pre className="bg-background/80 p-2 rounded-md text-xs overflow-auto whitespace-pre-wrap break-words max-w-[450px]">
                    {(() => {
                      if (isToolResultWithContent(result)) {
                        return result.content
                          .map((item: { type: string; text: string }) => {
                            if (
                              item.type === "text" &&
                              item.text.startsWith("\n~ Page URL:")
                            ) {
                              const lines = item.text.split("\n").filter(Boolean);
                              return lines
                                .map(
                                  (line: string) => `- ${line.replace("\n~ ", "")}`
                                )
                                .join("\n");
                            }
                            return item.text;
                          })
                          .join("\n");
                      }
                      return JSON.stringify(result, null, 2);
                    })()}
                  </pre>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
