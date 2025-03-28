'use client';
import { useState, FormEvent, useRef, useEffect } from 'react';
import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Trash } from 'lucide-react';
import Together from "together-ai";
import { contextData } from '@/data/contextData';

const BLUR_FADE_DELAY = 0.04;

const together = new Together({
    apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY
});

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    isStreaming?: boolean;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const clearChat = () => {
        const systemMessage: Message = {
            role: 'system',
            content: 'Anda adalah Jarvis asisten pribadi milik Ahmad Rosyihuddin. Untuk menjawab pertanyaan gunakan bahasa  dari user.'
        };

        // Reset ke system message saja
        setMessages([systemMessage]);

        // Hapus input yang sedang diketik
        setInput('');

        // Force update localStorage
        localStorage.setItem('chatHistory', JSON.stringify([systemMessage]));
    };

    // Load history dari localStorage
    useEffect(() => {
        const loadHistory = async () => {
            const saved = localStorage.getItem('chatHistory');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const hasSystemMessage = parsed.some((msg: Message) => msg.role === 'system');

                    // Jika tidak ada system message, tambahkan di awal array
                    const updatedMessages = hasSystemMessage
                        ? parsed
                        : [
                            { role: 'system', content: 'Anda adalah Jarvis asisten pribadi milik Ahmad Rosyihuddin. Untuk menjawab pertanyaan gunakan bahasa  dari user.' },
                            ...parsed
                        ];

                    setMessages(updatedMessages);
                } catch (error) {
                    console.error('Error loading chat history:', error);
                }
            }
            setIsLoadingHistory(false);
            setIsMounted(true);
        };
        loadHistory();
    }, []);

    // Simpan history ke localStorage hanya setelah komponen mounted
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('chatHistory', JSON.stringify(messages));
        }
    }, [messages, isMounted]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleAIResponse = async (history: Message[]) => {
        try {
            setIsLoading(true);
            setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

            // Clone history properly
            const history_copy = history.map(msg => ({ ...msg }));

            // Modify last message with contextData
            if (history_copy.length > 0) {
                history_copy[history_copy.length - 1].content = contextData(history_copy[history_copy.length - 1].content);
            }

            const response = await together.chat.completions.create({
                messages: history_copy,
                model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                stream: true,
                max_tokens: 1000,
                temperature: 0.7,
                top_p: 0.7,
                top_k: 50,
                repetition_penalty: 1,
                stop: ["<|eot_id|>", "<|eom_id|>"],
            });

            let fullResponse = '';
            for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content || '';
                fullResponse += content;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                        lastMessage.content = fullResponse;
                        delete lastMessage.isStreaming;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('API Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silakan coba lagi.'
            }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    };

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };

        // Gunakan functional update untuk memastikan state terbaru
        setMessages(prev => {
            const hasSystemMessage = prev.some(msg => msg.role === 'system');

            // Jika tidak ada system message, tambahkan di awal
            if (!hasSystemMessage) {
                return [
                    { role: 'system', content: 'Anda adalah Jarvis asisten pribadi milik Ahmad Rosyihuddin. Untuk menjawab pertanyaan gunakan bahasa  dari user.' },
                    ...prev,
                    userMessage
                ];
            }

            return [...prev, userMessage];
        });

        setInput('');
        scrollToBottom();

        // Siapkan history untuk API call
        const historyForAPI = messages.some(msg => msg.role === 'system')
            ? [...messages, userMessage]
            : [
                { role: 'system', content: 'Anda adalah Jarvis asisten pribadi milik Ahmad Rosyihuddin. Untuk menjawab pertanyaan gunakan bahasa  dari user.' } as Message,
                ...messages,
                userMessage
            ];

        await handleAIResponse(historyForAPI);
    };

    return (
        <main className="flex flex-col">
            <section id="chat">
                <div className="space-y-12 w-full py-12 pt-2">
                    {/* Header Section */}
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <BlurFade delay={BLUR_FADE_DELAY * 11}>
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                                    Assistant
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Jarvis
                                </h2>
                                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Jarvis is my assistant who will help you answer questions about me.
                                </p>
                            </div>
                        </BlurFade>
                    </div>

                    {/* Chat Container */}
                    <BlurFade delay={BLUR_FADE_DELAY * 11}>
                        <Card className="h-[600px] flex flex-col">
                            <div className='border-b'></div>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 relative hide-scrollbar">
                                {isLoadingHistory ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.filter(msg => msg.role !== 'system').length === 0 ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                                                <div className="bg-muted rounded-full p-4">
                                                    <Send className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-xl font-semibold">Start a conversation</h3>
                                                <p className="text-muted-foreground max-w-md">
                                                    Ask me anything about Rosik. I&apos;ll help answer your questions!
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.map((message, index) => (
                                                    message.role !== 'system' && (
                                                        <div
                                                            key={index}
                                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                                                        >
                                                            <div className={`max-w-[80%] p-3 rounded-lg transition-all duration-300 ${message.role === 'user'
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted'
                                                                }`}>
                                                                {message.content}
                                                                {message.isStreaming && (
                                                                    <div className="typing-indicator">
                                                                        <div className="dot"></div>
                                                                        <div className="dot"></div>
                                                                        <div className="dot"></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                                <div ref={messagesEndRef} />
                                            </>
                                        )}
                                    </>
                                )}
                            </CardContent>

                            {/* Input Form */}
                            <div className="border-t p-4">
                                <div className="flex items-center gap-3">
                                    {/* Clear Chat Button */}
                                    <Button
                                        onClick={clearChat}
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                        disabled={messages.filter(msg => msg.role !== 'system').length === 0}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>

                                    {/* Input Form */}
                                    <form onSubmit={sendMessage} className="flex-1">
                                        <div className="flex gap-2">
                                            <Input
                                                ref={inputRef}
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                placeholder="Ask something about Rosik..."
                                                className="flex-1"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="submit"
                                                size="icon"
                                                disabled={isLoading || !input.trim()}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </Card>
                    </BlurFade>
                </div>
            </section>

            <style jsx global>{`
        @keyframes blink {
            0%, 100% { opacity: 0.4; transform: translateY(0); }
            50% { opacity: 1; transform: translateY(-2px); }
        }
            
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .animate-spin {
            animation: spin 1s linear infinite;
        }

         /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }

        .typing-indicator {
            display: inline-flex;
            gap: 4px;
            margin-left: 8px;
        }

        .typing-indicator .dot {
            width: 6px;
            height: 6px;
            background: #666;
            border-radius: 50%;
            animation: blink 1.4s infinite;
        }

        .typing-indicator .dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-indicator .dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes fade-in-up {
            0% {
                opacity: 0;
                transform: translateY(10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out;
        }
        `}</style>
        </main>
    );
}