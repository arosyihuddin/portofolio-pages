"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Trash,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  X,
  MessageCircle,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTED_QUESTIONS = [
  "Siapa Ahmad Rosyihuddin?",
  "Proyek apa saja yang dikerjakan?",
  "Skill teknologi apa yang dikuasai?",
];

const STORAGE_KEY = "chatHistory";

const markdownComponents = {
  h1({ children }: any) {
    return (
      <h1 className="mb-2 mt-0 text-base font-semibold leading-tight">
        {children}
      </h1>
    );
  },
  h2({ children }: any) {
    return (
      <h2 className="mb-1.5 mt-3 text-sm font-semibold leading-snug">
        {children}
      </h2>
    );
  },
  h3({ children }: any) {
    return (
      <h3 className="mb-1 mt-2 text-xs font-semibold leading-snug">
        {children}
      </h3>
    );
  },
  p({ children }: any) {
    return <p className="my-1 leading-relaxed">{children}</p>;
  },
  ul({ children }: any) {
    return <ul className="my-1.5 list-disc space-y-1 pl-4">{children}</ul>;
  },
  ol({ children }: any) {
    return <ol className="my-1.5 list-decimal space-y-1 pl-4">{children}</ol>;
  },
  li({ children }: any) {
    return <li className="pl-0.5 leading-relaxed">{children}</li>;
  },
  strong({ children }: any) {
    return <strong className="font-semibold text-foreground">{children}</strong>;
  },
  code(codeProps: any) {
    const { inline, className, children, ...props } = codeProps || {};
    if (inline) {
      return (
        <code
          className={`rounded bg-background/70 px-1 py-0.5 text-[10px] text-foreground ${className || ""}`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="my-2 overflow-x-auto rounded-md bg-background/80 p-2 text-[10px]">
        <code {...props}>{children}</code>
      </pre>
    );
  },
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );
}

function getMessageText(message: any): string {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
  }
  return "";
}

// Outer component: handles mount, localStorage load, admin route check
export default function ChatBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [savedMessages, setSavedMessages] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((m: any) => m.role !== "system");
        if (filtered.length > 0) setSavedMessages(filtered);
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  if (pathname.startsWith("/admin")) return null;
  if (!mounted) return null;

  return (
    <ChatBubbleInner
      initialMessages={savedMessages}
      open={open}
      setOpen={setOpen}
    />
  );
}

// Inner component: useChat hook + all UI
function ChatBubbleInner({
  initialMessages,
  open,
  setOpen,
}: {
  initialMessages: any[];
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [layoutMode, setLayoutMode] = useState<"popup" | "sidebar">("popup");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, setMessages, status } = useChat({
    messages: initialMessages.length > 0 ? initialMessages : undefined,
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const toSave = messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: getMessageText(m),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {
        /* ignore */
      }
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0 && open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    if (!open || layoutMode !== "sidebar") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, layoutMode]);

  const clearChat = () => {
    setMessages([]);
    setInput("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;
    sendMessage({ text: msg.trim() });
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const visibleMessages = messages.filter((m) => m.role !== "system");
  const isSidebar = layoutMode === "sidebar";

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`chat-bubble-btn fixed z-40 bottom-20 right-4 sm:right-6 h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${open ? "bg-muted text-muted-foreground hover:bg-muted/80 scale-90" : "bg-primary text-primary-foreground hover:bg-primary/90 scale-100"}`}
        title={open ? "Close chat" : "Chat with Jarvis"}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>

      <div
        className={`fixed z-50 transition-all duration-300 ${
          isSidebar
            ? `inset-y-0 right-0 w-full overflow-hidden sm:w-[430px] lg:w-[480px] origin-right ${
                open
                  ? "translate-x-0 opacity-100 pointer-events-auto"
                  : "translate-x-full opacity-0 pointer-events-none"
              }`
            : `bottom-[8.5rem] right-4 w-[calc(100vw-2rem)] origin-bottom-right sm:right-6 sm:w-[400px] ${
                open
                  ? "scale-100 opacity-100 pointer-events-auto"
                  : "scale-95 opacity-0 pointer-events-none"
              }`
        }`}
      >
        <div
          className={`flex flex-col border bg-background shadow-2xl overflow-hidden ${
            isSidebar
              ? "h-full rounded-none border-y-0 border-r-0"
              : "h-[min(500px,70vh)] rounded-xl"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Jarvis</p>
                <p className="text-[10px] text-muted-foreground">
                  Personal Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setLayoutMode((mode) =>
                    mode === "popup" ? "sidebar" : "popup",
                  )
                }
                title={isSidebar ? "Switch to popup" : "Switch to sidebar"}
              >
                {isSidebar ? (
                  <PanelRightClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelRightOpen className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={clearChat}
                disabled={visibleMessages.length === 0}
                title="Clear chat"
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
            {visibleMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-3">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">How can I help?</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Ask me anything about Rosik
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full max-w-[280px]">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="flex items-start gap-2 p-2 rounded-lg border bg-background hover:bg-accent hover:border-primary/20 transition-all text-left text-xs group"
                    >
                      <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {q}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {visibleMessages.map((message) => {
                  const text = getMessageText(message);
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 animate-chat-fade-in-up ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className="shrink-0 mt-0.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${message.role === "assistant" ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          {message.role === "assistant" ? (
                            <Bot className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                      <div
                        className={`group relative ${
                          message.role === "user"
                            ? "max-w-[80%]"
                            : isSidebar
                              ? "max-w-[calc(100%-2rem)]"
                              : "max-w-[calc(100%-2rem)]"
                        }`}
                      >
                        <div
                          className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words ${message.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/70 rounded-bl-md"}`}
                        >
                          {message.role === "assistant" ? (
                            <div className="chat-prose max-w-none text-xs text-foreground">
                              {text && (
                                <ReactMarkdown
                                  components={markdownComponents}
                                >
                                  {text}
                                </ReactMarkdown>
                              )}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{text}</div>
                          )}
                        </div>
                        {message.role === "assistant" &&
                          text &&
                          status !== "streaming" && (
                            <div className="absolute -bottom-4 left-0">
                              <CopyBtn text={text} />
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator — shown while waiting for response */}
                {status === "submitted" && (
                  <div className="flex gap-2 animate-chat-fade-in-up">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                        <Bot className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-muted/70">
                      <div className="typing-indicator">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-2.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-1.5"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  placeholder="Ask something..."
                  rows={1}
                  className="flex w-full min-h-[36px] max-h-[120px] resize-none rounded-xl border bg-muted/50 px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 pr-9"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 bottom-1 h-6 w-6 rounded-full"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
