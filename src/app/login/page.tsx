"use client"
import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password
        });

        if (res?.error) {
            setError('Email o contraseña incorrectos. (Prueba admin@kaxera.com / pwd)');
            setIsLoading(false);
        } else {
            // Éxito, redirigir al panel principal
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 dark:bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4">
                        <i className="fa-solid fa-scale-balanced text-3xl"></i>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Iniciar Sesión</h1>
                    <p className="text-slate-500 text-sm mt-2">Accede a tu panel en Kaxera</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900 dark:text-slate-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900 dark:text-slate-50"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors mt-2"
                    >
                        {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
