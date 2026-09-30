"use client"
import { useFinance } from '@/context/FinanceContext';
import { useState } from 'react';

export default function YearEndPage() {
    const { invoices } = useFinance();
    const [isExporting, setIsExporting] = useState(false);
    const [hasExported, setHasExported] = useState(false);

    // Cálculos
    const totalIncome = invoices.filter(i => i.type === 'ingreso').reduce((acc, i) => acc + i.amount, 0);
    const totalExpense = invoices.filter(i => i.type === 'gasto').reduce((acc, i) => acc + i.amount, 0);
    const ebitda = totalIncome - totalExpense;
    const isProfitable = ebitda > 0;
    
    // Estimación Impuesto Sociedades (25% estándar PYMES)
    const corporateTax = isProfitable ? ebitda * 0.25 : 0;
    const finalProfit = isProfitable ? ebitda - corporateTax : ebitda;

    // Calcular el mejor mes
    const monthlyIncome = new Array(12).fill(0);
    invoices.filter(i => i.type === 'ingreso').forEach(inv => {
        monthlyIncome[inv.date.getMonth()] += inv.amount;
    });
    
    const bestMonthIndex = monthlyIncome.indexOf(Math.max(...monthlyIncome));
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const bestMonthName = Math.max(...monthlyIncome) > 0 ? months[bestMonthIndex] : "N/A";

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            setHasExported(true);
        }, 2000);
    };

    return (
        <div className="w-full h-full bg-slate-900 dark:bg-slate-950 flex flex-col font-sans overflow-hidden text-white relative">
            
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[150px] opacity-20"></div>
            </div>

            {/* Header */}
            <header className="p-8 flex justify-center items-center z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
                <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-pink-500/20 text-pink-300 font-bold rounded-full text-xs uppercase tracking-widest mb-3 border border-pink-500/30">Kaxera Wrapped</span>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                        Resumen del Año
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 font-medium">
                        Tu esfuerzo resumido en números. Sin contabilidad aburrida.
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto w-full z-10 space-y-8">
                
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Ingresos */}
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:bg-white dark:bg-slate-900 dark:bg-slate-950/10 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                        <i className="fa-solid fa-arrow-trend-up text-3xl text-green-400 mb-4"></i>
                        <p className="text-slate-400 font-medium text-sm">Total Facturado</p>
                        <p className="text-5xl font-black mt-2 text-white">{formatCurrency(totalIncome)}</p>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm text-slate-400">
                            <span>El mejor mes fue:</span>
                            <span className="font-bold text-white bg-white dark:bg-slate-900 dark:bg-slate-950/10 px-3 py-1 rounded-full">{bestMonthName}</span>
                        </div>
                    </div>

                    {/* Gastos */}
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:bg-white dark:bg-slate-900 dark:bg-slate-950/10 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                        <i className="fa-solid fa-receipt text-3xl text-red-400 mb-4"></i>
                        <p className="text-slate-400 font-medium text-sm">Total Invertido (Gastos)</p>
                        <p className="text-5xl font-black mt-2 text-white">{formatCurrency(totalExpense)}</p>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm text-slate-400">
                            <span>Eficiencia:</span>
                            <span className="font-bold text-white">
                                {totalIncome > 0 ? Math.round((totalExpense/totalIncome)*100) : 0}% de los ingresos
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats (EBITDA & Tax) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Beneficio */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 backdrop-blur-xl border border-indigo-500/30 p-8 rounded-3xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-1">Beneficio Bruto (EBITDA)</h3>
                                <p className="text-4xl font-black text-white">{formatCurrency(ebitda)}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isProfitable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                <i className={`fa-solid ${isProfitable ? 'fa-face-laugh-beam' : 'fa-face-sad-tear'}`}></i>
                            </div>
                        </div>
                        
                        {isProfitable ? (
                            <p className="text-slate-300 text-sm leading-relaxed">
                                ¡Enhorabuena! Has cerrado el año en positivo. Este dinero es el oxígeno de tu empresa para seguir creciendo el año que viene.
                            </p>
                        ) : (
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Este año hemos invertido más de lo ingresado. Es normal en fases de crecimiento. Toca revisar la calculadora de Break-Even para ajustar el año que viene.
                            </p>
                        )}
                    </div>

                    {/* Corporate Tax (IS) */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <i className="fa-solid fa-building text-6xl"></i>
                        </div>
                        <div>
                            <h3 className="text-slate-400 font-bold text-sm">Previsión Impuesto Sociedades</h3>
                            <p className="text-xs text-slate-500 mt-1">Estimación del 25% (Julio año sig.)</p>
                        </div>
                        <div className="mt-6">
                            <p className="text-3xl font-black text-pink-400 mb-2">{formatCurrency(corporateTax)}</p>
                            <p className="text-xs text-slate-400 border-t border-slate-700 pt-3">
                                Beneficio Neto Final: <span className="text-white font-bold">{formatCurrency(finalProfit)}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* El Botón Mágico */}
                <div className="mt-12 bg-white dark:bg-slate-900 dark:bg-slate-950/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg shadow-pink-500/20">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <h2 className="text-2xl font-black mb-3">Pásale el testigo a tu Gestor</h2>
                    <p className="text-slate-400 text-sm mb-8 px-4">
                        Olvídate de cuadrar cuentas y buscar Excel. Haremos un paquete con todas tus facturas, extractos bancarios y apuntes pre-contables, y se lo enviaremos a la gestoría para que hagan el cierre del PGC oficial.
                    </p>
                    
                    {hasExported ? (
                        <div className="bg-green-500/20 border border-green-500/50 text-green-400 py-4 px-6 rounded-xl font-bold flex items-center justify-center">
                            <i className="fa-solid fa-check-circle mr-2 text-xl"></i>
                            Paquete enviado a info@gestoria.com
                        </div>
                    ) : (
                        <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`w-full py-4 px-6 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center ${
                                isExporting 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                : 'bg-white dark:bg-slate-900 dark:bg-slate-950 text-slate-900 dark:text-slate-50 hover:bg-slate-200 hover:scale-[1.02]'
                            }`}
                        >
                            {isExporting ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin mr-3"></i>
                                    Empaquetando año...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-box-archive mr-3"></i>
                                    Empaquetar y Enviar al Gestor
                                </>
                            )}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
