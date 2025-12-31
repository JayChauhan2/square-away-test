import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';

export default function ChatInterface({ messages, loading, onSendMessage, title = "Chat", placeholder = "Type your question..." }) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <div className="w-full h-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 flex flex-col border border-blue-100 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-semibold text-gray-800 mb-4 relative z-10 flex-none">{title}</h3>

            <div className="flex-1 overflow-y-auto relative z-10 space-y-4 pr-2 custom-scrollbar">
                {messages.length === 0 && <p className="italic text-gray-500">{placeholder === "Type your question..." ? "Ask questions about your notes here." : "Ask questions here."}</p>}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-2xl p-4 max-w-[90%] text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-gray-800'}`}>
                            <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl p-4 text-sm text-gray-500 italic">Thinking...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 relative z-10 flex gap-2 flex-none pt-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-3 rounded-full bg-white border border-blue-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
