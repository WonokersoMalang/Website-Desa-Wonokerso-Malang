import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, UserCircle2, Loader2, AlertCircle, Send } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import villageData from './villageData.json';

const Chatbot = () => {
    const [chatMessages, setChatMessages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const textareaRef = React.useRef(null);

    useEffect(() => {
        AOS.init({
            once: false,
            duration: 1000,
        });
    }, []);

    const formatDate = useCallback((timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    }, []);

    const handleTextareaChange = (e) => {
        setNewMessage(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const createContextPrompt = (userMessage) => {
        let context = "Informasi Desa Wonokerso:\n";
        for (const [key, value] of Object.entries(villageData)) {
            context += `- ${value}\n`;
        }

        context += `\nPertanyaan: "${userMessage}"\n`;
        context += "Jawablah menggunakan informasi yang ada, jika anda tidak mempunyai informasi terkait pertanyaan maka jawab secara umum(boleh diluar konteks asalkan relevan) dalam bahasa Indonesia.";

        return encodeURIComponent(context);
    };

    const typeMessage = (message, elementId, callback) => {
        const textElement = document.getElementById(elementId);
        if (!textElement) return;

        let index = 0;
        textElement.textContent = '';

        const type = () => {
            if (index < message.length) {
                textElement.textContent += message[index];
                index++;
                const chatHistory = document.getElementById('chat-history');
                if (chatHistory) {
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                }
                setTimeout(type, 10);
            } else {
                callback();
            }
        };
        type();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setError('');
        setIsSubmitting(true);

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            content: newMessage,
            isBot: false,
            createdAt: new Date().getTime(),
        };

        setChatMessages(prev => [...prev, userMessage]);

        try {
            // Create context prompt
            const contextPrompt = createContextPrompt(newMessage);

            // API call with context
            const response = await fetch(
                `https://api.ryzumi.vip/api/ai/chatgpt?text=${encodeURIComponent(newMessage)}&prompt=${contextPrompt}`
            );

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            // Handle response
            const botResponse = data.result || 'Maaf, tidak ada respons dari AI.';

            // Add temporary bot message
            const tempBotMessage = {
                id: `temp-${Date.now()}`,
                content: '',
                isBot: true,
                createdAt: new Date().getTime(),
            };
            setChatMessages(prev => [...prev, tempBotMessage]);

            // Type the response
            const checkAndType = () => {
                const el = document.getElementById(`typing-${tempBotMessage.id}`);
                if (el) {
                    typeMessage(botResponse, `typing-${tempBotMessage.id}`, () => {
                        setChatMessages((prevMessages) =>
                            prevMessages.map((msg) =>
                                msg.id === tempBotMessage.id ? { ...msg, content: botResponse } : msg
                            )
                        );
                        // eslint-disable-next-line no-undef
                        isBot(false);
                    });
                } else {
                    // Coba lagi setelah 50ms
                    setTimeout(checkAndType, 50);
                }
            };

            checkAndType(); // panggil segera

        } catch (error) {
            console.error('Error fetching response:', error);
            const errorMsg = error.message.includes('404')
                ? 'API endpoint not found. Please check the API configuration.'
                : error.message.includes('CORS')
                    ? 'CORS error: API does not allow direct browser requests.'
                    : 'Terjadi kesalahan saat menghubungi API.';
            setError(errorMsg);

            setChatMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    content: 'Maaf, terjadi kesalahan. Coba lagi.',
                    isBot: true,
                    createdAt: new Date().getTime(),
                },
            ]);
        } finally {
            setIsSubmitting(false);
            setNewMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const Message = ({ message, isBot }) => (

        <div
            className={`px-4 pt-4 pb-2 rounded-xl ${
                isBot ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-black/5 border-black/10'
            } hover:bg-opacity-20 transition-all group hover:shadow-lg hover:-translate-y-0.5`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`p-2 rounded-full ${
                        isBot ? 'bg-black    text-indigo-300' : 'bg-black/10 text-black/60'
                    } group-hover:bg-opacity-80 transition-colors`}
                >
                    <UserCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <h4 className="font-medium text-black">{isBot ? 'Wonokerso Bot' : 'You'}</h4>
                        <span className="text-xs text-black/55 whitespace-nowrap">
              {formatDate(message.createdAt)}
            </span>
                    </div>
                    <p
                        className="text-black/60 text-sm break-words leading-relaxed relative bottom-2"
                        id={message.content ? undefined : `typing-${message.id}`}
                    >
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FFFDF6] flex items-center justify-center p-4">
            <div
                className="max-w-7xl w-full bg-gradient-to-b from-white/10 to-white/5 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl"
                data-aos="fade-up"
                data-aos-duration="1000"
            >
                <div className="p-6 border-b border-white/10" data-aos="fade-down" data-aos-duration="800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/20">
                            <MessageCircle className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                            Chat with Wonokerso Bot <span className="text-xl text-indigo-400">({chatMessages.length})</span>
                        </h3>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div
                            className="flex items-center gap-2 p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl"
                            data-aos="fade-in"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2" data-aos="fade-up" data-aos-duration="1200">
                            <label className="block text-sm font-medium text-black">
                                Message <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={handleTextareaChange}
                                placeholder="Ask about Desa Wonokerso..."
                                className="w-full p-4 rounded-xl bg-black/5 border border-black/10 text-black placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none min-h-[120px]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            className="relative w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Send Message</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div
                        className="space-y-4 h-[300px] overflow-y-auto custom-scrollbar"
                        data-aos="fade-up"
                        data-aos-delay="200"
                        id="chat-history"
                    >
                        {chatMessages.length === 0 ? (
                            <div className="text-center py-8" data-aos="fade-in">
                                <UserCircle2 className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" />
                                <p className="text-gray-400">No messages yet. Ask about Desa Wonokerso!</p>
                            </div>
                        ) : (
                            chatMessages.map((message) => (
                                <Message
                                    key={message.id}
                                    message={message}
                                    isBot={message.isBot}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
        </div>
    );
};

export default Chatbot;