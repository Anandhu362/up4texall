'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { addDoc, collection, onSnapshot, orderBy, query, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Image from 'next/image';

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    createdAt: any;
}

export default function ChatWidget() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        // Query last 50 messages
        const q = query(
            collection(db, 'messages'),
            orderBy('createdAt', 'asc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setMessages(msgs);
            // Auto scroll to bottom
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        });

        return () => unsubscribe();
    }, [user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            await addDoc(collection(db, 'messages'), {
                text: newMessage,
                senderId: user.uid,
                senderName: user.name,
                senderRole: user.role,
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (!user) return null; // Chat only for logged-in users

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center gap-2"
                >
                    <span className="text-xl">💬</span>
                    <span className="font-bold hidden md:inline">Community Chat</span>
                </button>
            ) : (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200 animate-slide-up">
                    {/* Header */}
                    <div className="bg-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">Community Chat</h3>
                            <p className="text-xs text-purple-200">Connect with everyone</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    >
                        {messages.length === 0 && (
                            <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Say hello!</p>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user.uid;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-600">
                                            {isMe ? 'You' : msg.senderName}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold text-white
                                            ${msg.senderRole === 'admin' ? 'bg-black' :
                                                msg.senderRole === 'seller' ? 'bg-green-500' : 'bg-blue-500'}`
                                        }>
                                            {msg.senderRole}
                                        </span>
                                    </div>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${isMe
                                            ? 'bg-purple-600 text-white rounded-tr-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 input py-2 text-sm focus:ring-1"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
