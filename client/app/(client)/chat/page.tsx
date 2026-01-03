"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { chatService } from "@/lib/services/chat.service";
import { userService } from "@/lib/services/user.service";
import { Message, User } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

import { socketService } from "@/lib/socket";

function ChatContent() {
    const searchParams = useSearchParams();
    const initialUserId = searchParams.get('userId');
    const { user: currentUser } = useAuthStore();

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    // Initialize
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Load potential chat partners (for now, simply all users)
                const res = await userService.findPartners();
                const otherUsers = res.data.filter(u => u.id !== currentUser?.id);
                setUsers(otherUsers);

                if (initialUserId) {
                    const target = otherUsers.find(u => u.id.toString() === initialUserId);
                    if (target) setSelectedUser(target);
                }
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [initialUserId, currentUser?.id]);

    // Load messages and setup real-time listener when selected user changes
    useEffect(() => {
        if (!selectedUser) return;

        const loadMessages = async () => {
            try {
                const res = await chatService.getMessages(selectedUser.id.toString());
                setMessages(res.data);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error("Failed to load messages");
            }
        };

        loadMessages();

        // Real-time listener
        const userId = Number(currentUser?.id);
        socketService.connect(userId);
        const socket = socketService.getSocket();

        if (socket) {
            socket.on("message", (msg: Message) => {
                // If the message is from the person we are currently chatting with
                // OR if it's from us (though we usually have optimistic updates)
                if (Number(msg.senderId) === Number(selectedUser.id) || Number(msg.senderId) === userId) {
                    setMessages(prev => {
                        // Avoid duplicates if we already added it optimistically
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    setTimeout(scrollToBottom, 100);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off("message");
            }
        };
    }, [selectedUser, currentUser?.id]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedUser) return;

        const optimisticMessage: Message = {
            id: Date.now(),
            senderId: Number(currentUser!.id),
            receiverId: Number(selectedUser.id),
            message: newMessage,
            read: false,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage("");
        setTimeout(scrollToBottom, 100);

        try {
            await chatService.sendMessage({
                receiverId: selectedUser.id.toString(),
                message: optimisticMessage.message
            });
        } catch (error) {
            console.error("Failed to send");
        }
    };

    if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>;


    return (
        <div className="container mx-auto py-6 h-[calc(100vh-64px)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">

                {/* Users List */}
                <Card className="col-span-1 p-4 h-full flex flex-col">
                    <h2 className="font-semibold mb-4">Messages</h2>
                    <ScrollArea className="flex-1">
                        <div className="space-y-2">
                            {users.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left",
                                        selectedUser?.id === user.id && "bg-gray-100 dark:bg-gray-800"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-sm">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">Click to chat</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Chat Area */}
                <Card className="col-span-1 md:col-span-3 h-full flex flex-col overflow-hidden">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedUser.avatar} />
                                    <AvatarFallback>{selectedUser.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold">{selectedUser.name}</div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500 mt-10">No messages yet. Say hi!</div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.senderId === Number(currentUser?.id);
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex w-full",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "max-w-[70%] px-4 py-2 rounded-2xl text-sm",
                                                        isMe
                                                            ? "bg-brand-600 text-white rounded-br-none"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                                                    )}
                                                >
                                                    {msg.message}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t mt-auto">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            Select a user to start chatting
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>}>
            <ChatContent />
        </Suspense>
    );
}
