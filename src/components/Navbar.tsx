"use client"
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useFinance } from '@/context/FinanceContext';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-8 h-8"></div>;

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Alternar Modo Oscuro"
        >
            {theme === 'dark' ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
        </button>
    );
}

export default function Navbar() {
    const { lang, setLang } = useLanguage();
    const { currentUser } = useFinance();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
    const [isFacturasOpen, setIsFacturasOpen] = useState(false);
    
    // Accordion categories
    const [isOperativaOpen, setIsOperativaOpen] = useState(false);
    const [isPlanificacionOpen, setIsPlanificacionOpen] = useState(false);
    const [isFiscalidadOpen, setIsFiscalidadOpen] = useState(false);

    if (pathname === '/login' || currentUser === 'default') return null;

    const nav = {
        es: { 
            home: "Inicio", 
            dashboard: "Área Fiscal", 
            facturasMenu: "Ventas y Clientes",
            invoices: "Facturas Emitidas",
            newInvoice: "Nueva Factura",
            gastos: "Gastos y Proveedores",
            calendar: "Calendario Fiscal",
            mainLabel: "Herramientas",
            es: "Español",
            en: "Inglés",
            notif1: "⚠️ Tu IVA a pagar ha superado los 1.000€",
            notif2: "📅 Faltan 5 días para presentar los modelos",
            notifTitle: "Notificaciones"
        },
        en: { 
            home: "Home", 
            dashboard: "Tax Area", 
            facturasMenu: "Sales & Clients",
            invoices: "Issued Invoices",
            newInvoice: "New Invoice",
            gastos: "Expenses & Suppliers",
            calendar: "Tax Calendar",
            mainLabel: "Tools",
            es: "Spanish",
            en: "English",
            notif1: "⚠️ Your VAT to pay has exceeded €1,000",
            notif2: "📅 5 days left until tax filing",
            notifTitle: "Notifications"
        }
    }[lang];

    return (
        <nav className="bg-slate-900 dark:bg-slate-950 text-white shadow-lg relative z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Hamburguer Menu */}
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="mr-4 p-2 rounded-md hover:bg-slate-800 focus:outline-none transition-colors"
                        >
                            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
                        </button>
                        
                        <Link href="/" className="flex items-center text-xl font-bold text-white hover:text-blue-400 transition-colors">
                            <i className="fa-solid fa-scale-balanced mr-2 text-blue-500"></i>
                            Kaxera
                        </Link>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-2">
                        
                        {/* Notifications Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 rounded-full hover:bg-slate-800 focus:outline-none transition-colors"
                            >
                                <i className="fa-regular fa-bell text-lg"></i>
                                {hasUnreadNotifs && (
                                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-slate-900"></span>
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-2xl py-2 text-slate-800 dark:text-slate-200 ring-1 ring-black ring-opacity-5 animate-fade-in">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-50">
                                        {nav.notifTitle}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <div 
                                            onClick={() => { setHasUnreadNotifs(false); setIsNotifOpen(false); }}
                                            className="px-4 py-3 hover:bg-slate-50 dark:bg-slate-800 border-b border-slate-50 cursor-pointer transition-colors"
                                        >
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{nav.notif1}</p>
                                            <p className="text-xs text-slate-400 mt-1">Hace 2 horas</p>
                                        </div>
                                        <div 
                                            onClick={() => { setHasUnreadNotifs(false); setIsNotifOpen(false); }}
                                            className="px-4 py-3 hover:bg-slate-50 dark:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{nav.notif2}</p>
                                            <p className="text-xs text-slate-400 mt-1">Hace 1 día</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Language Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-800 focus:outline-none transition-colors text-sm font-medium"
                            >
                                <i className="fa-solid fa-globe"></i>
                                <span className="hidden sm:inline">{lang.toUpperCase()}</span>
                                <i className="fa-solid fa-chevron-down text-xs hidden sm:inline"></i>
                            </button>

                            {isLangOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-md shadow-xl py-1 text-slate-800 dark:text-slate-200 ring-1 ring-black ring-opacity-5 animate-fade-in">
                                    <button 
                                        onClick={() => { setLang('es'); setIsLangOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:bg-slate-700 ${lang === 'es' ? 'font-bold text-blue-600' : ''}`}
                                    >
                                        🇪🇸 {nav.es}
                                    </button>
                                    <button 
                                        onClick={() => { setLang('en'); setIsLangOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:bg-slate-700 ${lang === 'en' ? 'font-bold text-blue-600' : ''}`}
                                    >
                                        🇬🇧 {nav.en}
                                    </button>
                                </div>
                            )}
                        </div>

                        <ThemeToggle />

                        {/* Profile Avatar */}
                        <div className="hidden sm:block ml-2 pl-4 border-l border-slate-700">
                            <button 
                                onClick={async () => {
                                    localStorage.removeItem('kaxera_user');
                                    await signOut({ redirect: true, callbackUrl: '/login' });
                                }}
                                className="flex items-center space-x-2 group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-inner group-hover:scale-105 transition-transform">
                                    <i className="fa-solid fa-power-off"></i>
                                </div>
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Hamburguer Dropdown Content */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-slate-800 shadow-2xl border-t border-slate-700 pb-4 rounded-b-xl animate-fade-in z-40">
                    <div className="max-w-md mx-auto px-4 py-4 space-y-1">
                        
                        {/* INICIO (Top Level) */}
                        <Link 
                            href="/" 
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-3 rounded-xl text-white hover:bg-slate-700 transition-colors flex items-center group mb-4 border border-slate-700/50 bg-slate-800/50"
                        >
                            <i className="fa-solid fa-house w-8 text-blue-400 group-hover:text-white transition-colors"></i>
                            <span className="font-medium text-sm">{nav.home}</span>
                        </Link>

                        {/* CATEGORÍA 1: OPERATIVA DIARIA */}
                        <div className="mb-4">
                            <button 
                                onClick={() => setIsOperativaOpen(!isOperativaOpen)}
                                className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest mb-2 mt-2 px-4 focus:outline-none transition-colors"
                            >
                                <span>{lang === 'es' ? 'OPERATIVA DIARIA' : 'DAILY OPERATIONS'}</span>
                                <i className={`fa-solid fa-chevron-${isOperativaOpen ? 'up' : 'down'}`}></i>
                            </button>
                            
                            {isOperativaOpen && (
                                <div className="space-y-1">                                <Link 
                                    href="/contacts" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center group"
                                >
                                    <i className="fa-solid fa-address-book w-8 text-emerald-400 group-hover:text-white transition-colors"></i>
                                    <span className="font-medium text-sm">{lang === 'es' ? 'Directorio CRM' : 'Contacts CRM'}</span>
                                </Link>

                                {/* Facturas Submenu */}
                                <div>
                                    <button 
                                        onClick={() => setIsFacturasOpen(!isFacturasOpen)}
                                        className="w-full text-left px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex items-center">
                                            <i className="fa-solid fa-file-invoice w-8 text-indigo-400 group-hover:text-white transition-colors"></i>
                                            <span className="font-medium text-sm">{lang === 'es' ? 'Facturas' : 'Invoices'}</span>
                                        </div>
                                        <i className={`fa-solid fa-chevron-${isFacturasOpen ? 'up' : 'down'} text-slate-400 text-xs`}></i>
                                    </button>

                                    {isFacturasOpen && (
                                        <div className="pl-12 pr-4 py-2 space-y-1 bg-slate-900 dark:bg-slate-950/50 rounded-lg mt-1 mb-1">
                                            <Link 
                                                href="/invoices" 
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600 transition-colors text-xs font-medium"
                                            >
                                                {lang === 'es' ? 'Facturas Emitidas' : 'Issued Invoices'}
                                            </Link>
                                            <Link 
                                                href="/expenses" 
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-orange-600 transition-colors text-xs font-medium"
                                            >
                                                {lang === 'es' ? 'Buzón de Gastos' : 'Expenses Inbox'}
                                            </Link>
                                            <Link 
                                                href="/recurring" 
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600 transition-colors text-xs font-medium flex justify-between items-center"
                                            >
                                                {lang === 'es' ? 'Recurrentes' : 'Recurring'}
                                                <i className="fa-solid fa-rotate text-[10px] bg-blue-500/20 text-blue-300 p-1.5 rounded-full"></i>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <Link 
                                    href="/bank" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center group"
                                >
                                    <i className="fa-solid fa-building-columns w-8 text-cyan-400 group-hover:text-white transition-colors"></i>
                                    <span className="font-medium text-sm">{lang === 'es' ? 'Banco' : 'Bank'}</span>
                                </Link>

                                <Link 
                                    href="/employees" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center group"
                                >
                                    <i className="fa-solid fa-users w-8 text-purple-400 group-hover:text-white transition-colors"></i>
                                    <span className="font-medium text-sm">{lang === 'es' ? 'Empleados' : 'Employees'}</span>
                                </Link>
                            </div>
                            )}
                        </div>

                        {/* CATEGORÍA 2: PLANIFICACIÓN Y AGENDA */}
                        <div className="mb-4">
                            <button 
                                onClick={() => setIsPlanificacionOpen(!isPlanificacionOpen)}
                                className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest mb-2 mt-2 px-4 focus:outline-none transition-colors"
                            >
                                <span>{lang === 'es' ? 'PLANIFICACIÓN Y AGENDA' : 'PLANNING & AGENDA'}</span>
                                <i className={`fa-solid fa-chevron-${isPlanificacionOpen ? 'up' : 'down'}`}></i>
                            </button>
                            
                            {isPlanificacionOpen && (
                                <div className="space-y-1">
                                    <Link 
                                        href="/calendar" 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center group"
                                    >
                                        <i className="fa-solid fa-calendar-days w-8 text-pink-400 group-hover:text-white transition-colors"></i>
                                        <span className="font-medium text-sm">{nav.calendar}</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* CATEGORÍA 3: FISCALIDAD Y ASESORÍA */}
                        <div className="mb-4">
                            <button 
                                onClick={() => setIsFiscalidadOpen(!isFiscalidadOpen)}
                                className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest mb-2 mt-2 px-4 focus:outline-none transition-colors"
                            >
                                <span>{lang === 'es' ? 'FISCALIDAD Y ASESORÍA' : 'TAX & ACCOUNTING'}</span>
                                <i className={`fa-solid fa-chevron-${isFiscalidadOpen ? 'up' : 'down'}`}></i>
                            </button>
                            
                            {isFiscalidadOpen && (
                                <div className="space-y-1">
                                    <Link 
                                        href="/dashboard" 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center group"
                                    >
                                        <i className="fa-solid fa-folder-open w-8 text-amber-400 group-hover:text-white transition-colors"></i>
                                        <span className="font-medium text-sm">{lang === 'es' ? 'Área Fiscal / Modelos' : 'Tax Area'}</span>
                                    </Link>
                                    
                                    <Link 
                                        href="/accounting" 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center group"
                                    >
                                        <i className="fa-solid fa-file-export w-8 text-green-400 group-hover:text-white transition-colors"></i>
                                        <span className="font-medium text-sm">{lang === 'es' ? 'Conexión Gestoría' : 'Accountant Bridge'}</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* CATEGORÍA 4: CONFIGURACIÓN */}
                        <div className="pt-4 border-t border-slate-700 mt-2">
                            <Link 
                                href="/settings" 
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center group"
                            >
                                <i className="fa-solid fa-gear w-8 text-slate-400 group-hover:text-white transition-colors"></i>
                                <span className="font-medium text-sm">{lang === 'es' ? 'Configuración' : 'Settings'}</span>
                            </Link>

                            <button 
                                onClick={() => {
                                    localStorage.removeItem('kaxera_user');
                                    window.location.href = '/login';
                                }}
                                className="block w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center group mt-2"
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket w-8 transition-colors"></i>
                                <span className="font-bold">{lang === 'es' ? 'Cerrar Sesión' : 'Log Out'}</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </nav>
    );
}
