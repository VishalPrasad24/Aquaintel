
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { sendMessageToGemini } from '../../services/geminiService';

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-sm md:max-w-md lg:max-w-lg ${isUser ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
            </div>
        </div>
    );
};

const Chatbot: React.FC = () => {
    const { t, userRole, initialChatbotQuery, setInitialChatbotQuery } = useAppContext();
    
    const welcomeKey = userRole === 'user' ? 'chat_welcome_user' : 'chat_welcome_hospital';
    const welcomeMessage: ChatMessage = {
        sender: 'bot',
        text: t(welcomeKey),
        timestamp: new Date().toISOString()
    };
    
    const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (initialChatbotQuery) {
            setInput(initialChatbotQuery);
            setInitialChatbotQuery(null);
        }
    }, [initialChatbotQuery, setInitialChatbotQuery]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading || !userRole) return;

        const userMessage: ChatMessage = {
            sender: 'user',
            text: input.trim(),
            timestamp: new Date().toISOString()
        };
        const currentInput = input.trim();
        const currentHistory = [...messages, userMessage];
        
        setMessages(currentHistory);
        setInput('');
        setIsLoading(true);

        const botResponseText = await sendMessageToGemini(currentHistory, currentInput, userRole);
        
        const botMessage: ChatMessage = {
            sender: 'bot',
            text: botResponseText,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t('ai_assistant')}</h3>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('chat_placeholder')}
                        className="flex-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-100 dark:bg-gray-700"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.539l4.949-1.414a.75.75 0 00-.54-1.488L3.105 2.29zM4.949 14.895l-1.414 4.949a.75.75 0 00.95.826l4.949-1.414a.75.75 0 00-.539-.95l-4.95 1.414zM12.949 8.586l-4.949 1.414a.75.75 0 00.539.95l4.95-1.414a.75.75 0 00-.54-1.488zM14.895 4.949l-4.949 1.414a.75.75 0 00.95-.539l1.414-4.95a.75.75 0 00-.826-.95L10.586 3.51a.75.75 0 00.95.54l3.359-1.12z" />
    </svg>
);


export default Chatbot;