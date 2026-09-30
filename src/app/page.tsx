"use client"
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
    const { lang } = useLanguage();
    
    const content = {
        es: {
            badge: "El Sistema Operativo Definitivo para PYMEs",
            title: "Kaxera: Todo tu negocio",
            subtitle: "en piloto automático",
            description: "Olvídate de usar 5 programas distintos. Kaxera unifica tus facturas, bancos, nóminas, impuestos y la conexión con tu gestoría en un solo panel de control visual e inteligente.",
            featuresTitle: "Todo tu ecosistema financiero, conectado.",
            benefitsTitle: "¿Por qué las PYMEs se pasan a Kaxera?",
            benefits: [
                { title: "Control Total", desc: "Sabrás exactamente tu liquidez real y el margen de beneficio antes de que acabe el mes." },
                { title: "Gestoría Feliz", desc: "Exporta automáticamente a formato A3/Sage. Tu gestor tardará 1 minuto en contabilizar tu mes." },
                { title: "Cero Estrés", desc: "La Hucha de Impuestos calcula el IVA y el IRPF diario para que nunca te pille por sorpresa." }
            ]
        },
        en: {
            badge: "The Ultimate OS for SMEs",
            title: "Kaxera: Your entire business",
            subtitle: "on autopilot",
            description: "Forget using 5 different programs. Kaxera unifies your invoices, banks, payrolls, taxes, and accountant connection in a single, visual, and smart dashboard.",
            featuresTitle: "Your entire financial ecosystem, connected.",
            benefitsTitle: "Why are SMEs switching to Kaxera?",
            benefits: [
                { title: "Total Control", desc: "You'll know exactly your real liquidity and profit margin before the month ends." },
                { title: "Happy Accountant", desc: "Auto-export to A3/Sage format. Your accountant will book your month in 1 minute." },
                { title: "Zero Stress", desc: "The Tax Vault calculates daily VAT and IRPF so you are never caught by surprise." }
            ]
        }
    };

    const t = content[lang];

    return (
        <div className="min-h-full bg-slate-50 dark:bg-slate-800 flex flex-col font-sans overflow-hidden">
            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 pt-24 pb-20 flex flex-col items-center text-center relative">
                
                {/* Decorative background blobs */}
                <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-white dark:bg-slate-900 dark:bg-slate-950 text-indigo-700 mb-8 border border-indigo-100 shadow-sm relative z-10 hover:shadow-md transition-shadow">
                    <i className="fa-solid fa-rocket text-indigo-500 mr-2"></i> {t.badge}
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-slate-50 leading-[1.1] mb-8 max-w-5xl tracking-tighter relative z-10">
                    {t.title} <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                        {t.subtitle}
                    </span>
                </h1>
                
                <p className="max-w-2xl text-xl text-slate-500 mb-12 leading-relaxed font-medium relative z-10">
                    {t.description}
                </p>
                
            </main>

            {/* Bento Grid Features */}
            <section className="py-24 bg-white dark:bg-slate-900 dark:bg-slate-950 relative z-20 border-t border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{t.featuresTitle}</h2>
                    </div>

                    {/* Bento Box Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
                        
                        {/* 1. Área Fiscal (Large - spans 2 cols, 1 row) */}
                        <div 
                            onClick={() => window.location.href = '/dashboard'}
                            className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 relative overflow-hidden group cursor-pointer"
                        >
                            <div className="absolute right-[-10%] bottom-[-20%] opacity-20 group-hover:scale-110 transition-transform duration-500">
                                <i className="fa-solid fa-folder-open text-[250px] text-white"></i>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 relative z-10">Área Fiscal & Modelos</h3>
                            <p className="text-slate-400 font-medium max-w-sm relative z-10">Gestiona tus cierres trimestrales (IVA, IRPF) y resúmenes anuales. Visualiza tu beneficio neto y separa impuestos automáticamente.</p>
                            <Link href="/dashboard" className="absolute bottom-8 left-8 bg-white dark:bg-slate-900 dark:bg-slate-950/10 hover:bg-white dark:bg-slate-900 dark:bg-slate-950/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm font-bold text-sm transition-colors z-10">
                                Ver Modelos
                            </Link>
                        </div>

                        {/* 2. Empleados (Medium - spans 1 col, 1 row) */}
                        <div 
                            onClick={() => window.location.href = '/employees'}
                            className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-all hover:border-indigo-200 cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl mb-6 shadow-lg shadow-indigo-600/30 group-hover:-translate-y-1 transition-transform">
                                <i className="fa-solid fa-users"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Portal RRHH</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Rentabilidad por empleado, escáner de dietas y ausencias.</p>
                        </div>

                        {/* 3. Exportar A3 (Medium - spans 1 col, 1 row) */}
                        <div 
                            onClick={() => window.location.href = '/accounting'}
                            className="bg-green-50 border border-green-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-all hover:border-green-200 cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white text-xl mb-6 shadow-lg shadow-green-600/30 group-hover:-translate-y-1 transition-transform">
                                <i className="fa-solid fa-file-export"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Puente Gestoría</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Exportación automática a A3/Sage en partida doble PGC.</p>
                        </div>

                        {/* 4. Facturas Emitidas (Tall - spans 1 col, 2 rows) */}
                        <div 
                            onClick={() => window.location.href = '/invoices'}
                            className="md:row-span-2 bg-blue-50 border border-blue-100 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all hover:border-blue-200 cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl mb-6 shadow-lg shadow-blue-600/30 group-hover:-translate-y-1 transition-transform">
                                <i className="fa-solid fa-file-invoice"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">Facturas Emitidas</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8">Crea facturas recurrentes y envía PDFs a tus clientes automáticamente.</p>
                            
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = '/new-invoice';
                                }}
                                className="mt-auto bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl p-4 shadow-sm border border-blue-50/50 transform group-hover:scale-105 transition-transform cursor-pointer"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="w-20 h-2 bg-slate-200 rounded-full"></div>
                                    <div className="w-10 h-2 bg-blue-200 rounded-full"></div>
                                </div>
                                <div className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                                    <i className="fa-solid fa-plus mr-1"></i> Nueva Factura
                                </div>
                            </div>
                        </div>

                        {/* 5. Bancos (Large - spans 2 cols, 1 row) */}
                        <div 
                            onClick={() => window.location.href = '/bank'}
                            className="md:col-span-2 bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex items-center justify-between relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                        >
                            <div className="z-10 max-w-sm">
                                <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full mb-4">
                                    <i className="fa-solid fa-plug mr-1"></i> PSD2 API
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-2">Bancos Sincronizados</h3>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Concilia el cobro de tus facturas y el pago de tus nóminas directamente conectando la web de tu banco real.</p>
                            </div>
                            <div className="hidden md:block w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full border-[8px] border-white shadow-xl flex items-center justify-center z-10 group-hover:rotate-12 transition-transform">
                                <i className="fa-solid fa-building-columns text-4xl text-slate-800 dark:text-slate-200"></i>
                            </div>
                            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
                        </div>

                        {/* 6. Gastos y Tiques (Medium - spans 1 col, 1 row) */}
                        <div 
                            onClick={() => window.location.href = '/expenses'}
                            className="bg-orange-50 border border-orange-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-all hover:border-orange-200 cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white text-xl mb-6 shadow-lg shadow-orange-600/30 group-hover:-translate-y-1 transition-transform">
                                <i className="fa-solid fa-receipt"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Gastos y Tiques</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Escanea tiques con IA (OCR) y clasifica automáticamente las facturas de proveedores.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Banner */}
            <section className="bg-slate-900 dark:bg-slate-950 text-white py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-center mb-16">{t.benefitsTitle}</h2>
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {t.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-800 text-blue-400 rounded-full flex items-center justify-center text-2xl mb-6 font-black border border-slate-700 shadow-inner">
                                    {idx + 1}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-medium max-w-xs">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
