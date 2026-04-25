"use client";

import { useState, FormEvent, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  timestamp?: number;
}

const SYSTEM_MESSAGE: Message = {
  role: "system",
  content:
    "Anda adalah Jarvis asisten pribadi milik Ahmad Rosyihuddin. Untuk menjawab pertanyaan gunakan bahasa dari user.",
};

const SUGGESTED_QUESTIONS = [
  "Siapa Ahmad Rosyihuddin?",
  "Proyek apa saja yang dikerjakan?",
  "Skill teknologi apa yang dikuasai?",
];

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

export default function ChatBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hide on admin routes
  if (pathname.startsWith("/admin")) return null;

  // Load history
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasSystem = parsed.some((m: Message) => m.role === "system");
        setMessages(hasSystem ? parsed : [SYSTEM_MESSAGE, ...parsed]);
      } catch {
        /* ignore */
      }
    }
    setIsMounted(true);
  }, []);

  // Save history
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages, isMounted]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (messages.length > 0 && open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const clearChat = () => {
    setMessages([SYSTEM_MESSAGE]);
    setInput("");
    localStorage.setItem("chatHistory", JSON.stringify([SYSTEM_MESSAGE]));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleAIResponse = async (history: Message[]) => {
    try {
      setIsLoading(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", isStreaming: true, timestamp: Date.now() },
      ]);

      const cleanMessages = history.map(({ isStreaming, timestamp, ...rest }) => rest);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: cleanMessages }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullResponse = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullResponse += parsed.content;
              setMessages((prev) => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                if (last.role === "assistant") last.content = fullResponse;
                return newMsgs;
              });
            }
          } catch {
            /* skip */
          }
        }
      }

      setMessages((prev) => {
        const newMsgs = [...prev];
        const last = newMsgs[newMsgs.length - 1];
        if (last.role === "assistant") delete last.isStreaming;
        return newMsgs;
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMsgs = [...prev];
        const lastIdx = newMsgs.length - 1;
        if (lastIdx >= 0 && newMsgs[lastIdx].role === "assistant") {
          newMsgs[lastIdx] = {
            ...newMsgs[lastIdx],
            content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
            isStreaming: false,
          };
        }
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async (e: FormEvent | string) => {
    const text = typeof e === "string" ? e : input;
    if (typeof e !== "string") e.preventDefault();
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => {
      const hasSystem = prev.some((m) => m.role === "system");
      return hasSystem ? [...prev, userMsg] : [SYSTEM_MESSAGE, ...prev, userMsg];
    });

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    scrollToBottom();

    const historyForAPI = messages.some((m) => m.role === "system")
      ? [...messages, userMsg]
      : [SYSTEM_MESSAGE, ...messages, userMsg];

    await handleAIResponse(historyForAPI);
  };

  const visibleMessages = messages.filter((m) => m.role !== "system");

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`chat-bubble-btn fixed z-40 bottom-20 right-4 sm:right-6 h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open
            ? "bg-muted text-muted-foreground hover:bg-muted/80 scale-90"
            : "bg-primary text-primary-foreground hover:bg-primary/90 scale-100"
        }`}
        title={open ? "Close chat" : "Chat with Jarvis"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed z-50 bottom-[8.5rem] right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] transition-all duration-300 origin-bottom-right ${
          open
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-[min(500px,70vh)] rounded-xl border bg-background shadow-2xl overflow-hidden">
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
                      onClick={() => sendMessage(q)}
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
                {visibleMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 animate-chat-fade-in-up ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 mt-0.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                          message.role === "assistant"
                            ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <Bot className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                      </div>
                    </div>

                    {/* Bubble */}
                    <div className="group relative max-w-[80%]">
                      <div
                        className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted/70 rounded-bl-md"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="chat-prose prose prose-xs dark:prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                code(codeProps: any) {
                                  const {
                                    inline,
                                    className,
                                    children,
                                    ...props
                                  } = codeProps || {};
                                  if (inline) {
                                    return (
                                      <code
                                        className={`px-1 py-0.5 rounded bg-background/60 text-foreground text-[10px] ${className || ""}`}
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <pre className="overflow-x-auto rounded-md bg-background/80 p-2 text-[10px] my-1">
                                      <code {...props}>{children}</code>
                                    </pre>
                                  );
                                },
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                            {message.isStreaming && !message.content && (
                              <div className="typing-indicator mt-1">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        )}
                      </div>
                      {message.role === "assistant" &&
                        message.content &&
                        !message.isStreaming && (
                          <div className="absolute -bottom-4 left-0">
                            <CopyBtn text={message.content} />
                          </div>
                        )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-2.5">
            <form onSubmit={(e) => sendMessage(e)} className="flex items-end gap-1.5">
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
                      if (input.trim()) {
                        (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                      }
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
