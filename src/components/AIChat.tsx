"use client"
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useFinance } from '@/context/FinanceContext';

export default function AIChat() {
    const pathname = usePathname();
    const { currentUser } = useFinance();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: '¡Hola! Soy tu asesor fiscal de Kaxera. ¿Tienes alguna duda sobre qué te puedes deducir?' }
    ]);

    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, isOpen]);

    if (pathname === '/login' || currentUser === 'default') return null;

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            let reply = "Como gasto general, si es 100% necesario para tu actividad podrías deducirlo, pero consúltalo con un gestor para asegurar.";
            
            const lowerMsg = userMsg.toLowerCase();
            if (lowerMsg.includes("coche") || lowerMsg.includes("vehículo") || lowerMsg.includes("gasolina")) {
                reply = "El vehículo es delicado. Hacienda solo permite deducir el 50% del IVA del coche y la gasolina, a menos que demuestres que es 100% para uso comercial (ej: furgoneta rotulada).";
            } else if (lowerMsg.includes("comida") || lowerMsg.includes("restaurante")) {
                reply = "Las comidas (dietas) son deducibles si son con clientes o proveedores, en días laborables y siempre que pagues con tarjeta y pidas factura a nombre de la empresa.";
            } else if (lowerMsg.includes("ordenador") || lowerMsg.includes("portátil") || lowerMsg.includes("mac")) {
                reply = "¡Sí! El material informático es 100% deducible si lo necesitas para trabajar. Si pasa de 300€, debes amortizarlo en varios años, pero el IVA te lo deduces de golpe ahora.";
            }

            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Botón flotante */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
                >
                    <i className="fa-solid fa-message text-2xl"></i>
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                </button>
            )}

            {/* Ventana de Chat */}
            {isOpen && (
                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-white dark:bg-slate-900 dark:bg-slate-950/20 rounded-full flex items-center justify-center mr-3">
                                <i className="fa-solid fa-robot"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Asesor IA FiscaFlow</h3>
                                <p className="text-[10px] text-blue-100 flex items-center">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span> En línea
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-2 rounded-lg transition-colors">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-800 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-none'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-500 p-3 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef}></div>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-slate-900 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-700 flex items-center">
                        <input 
                            type="text" 
                            placeholder="Pregunta sobre deducibilidad..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            className="flex-1 bg-slate-100 dark:bg-slate-700 px-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="ml-2 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
                        >
                            <i className="fa-solid fa-paper-plane text-sm"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
