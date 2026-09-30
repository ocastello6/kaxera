"use client"
import { useState } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { useFinance } from '@/context/FinanceContext';

export default function RecurringPage() {
    const { lang } = useLanguage();
    const { recurringInvoices, addRecurringInvoice, toggleRecurringInvoice } = useFinance();

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Modal form state
    const [clientName, setClientName] = useState("");
    const [concept, setConcept] = useState("");
    const [amount, setAmount] = useState<number | string>("");
    const [period, setPeriod] = useState("Mensual");

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

    const t = {
        es: {
            title: "Facturación Recurrente",
            subtitle: "Automatiza tus cobros fijos. Crea plantillas que se envían solas mes a mes.",
            newBtn: "Nueva Suscripción",
            client: "Cliente",
            amount: "Importe Base",
            period: "Frecuencia",
            nextDate: "Próxima Emisión",
            status: "Estado",
            active: "Activo",
            paused: "Pausado",
            empty: "No tienes facturas recurrentes configuradas.",
            conceptLabel: "Concepto Fijo",
            activateBtn: "Activar Suscripción"
        },
        en: {
            title: "Recurring Invoicing",
            subtitle: "Automate your fixed charges. Create templates that send themselves month to month.",
            newBtn: "New Subscription",
            client: "Client",
            amount: "Base Amount",
            period: "Frequency",
            nextDate: "Next Issue",
            status: "Status",
            active: "Active",
            paused: "Paused",
            empty: "You have no recurring invoices configured.",
            conceptLabel: "Fixed Concept",
            activateBtn: "Activate Subscription"
        }
    }[lang];

    const handleCreate = () => {
        if (!clientName || !concept || !amount) return;
        
        const today = new Date();
        let nextD = new Date();
        if (period === 'Mensual') nextD.setMonth(today.getMonth() + 1);
        if (period === 'Trimestral') nextD.setMonth(today.getMonth() + 3);
        if (period === 'Anual') nextD.setFullYear(today.getFullYear() + 1);
        
        addRecurringInvoice({
            client: clientName,
            concept: concept,
            amount: Number(amount),
            period: period,
            nextDate: nextD.toISOString().split('T')[0],
            active: true
        });

        setIsModalOpen(false);
        setClientName("");
        setConcept("");
        setAmount("");
        setPeriod("Mensual");
    };

    return (
        <div className="w-full min-h-full bg-gray-50 dark:bg-slate-950 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center">
                            <i className="fa-solid fa-rotate text-blue-600 mr-3"></i>
                            {t.title}
                        </h1>
                        <p className="text-slate-500 mt-1 max-w-lg">{t.subtitle}</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center"
                    >
                        <i className="fa-solid fa-plus mr-2"></i>
                        {t.newBtn}
                    </button>
                </header>

                {/* Panel de Alerta Anticipada (Upcoming Executions) */}
                {recurringInvoices.filter(inv => inv.active).length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start">
                            <i className="fa-solid fa-triangle-exclamation text-yellow-500 text-2xl mt-1 mr-4"></i>
                            <div>
                                <h3 className="font-bold text-yellow-800 text-lg">Próximas Emisiones (Siguientes 7 días)</h3>
                                <p className="text-yellow-700 text-sm mt-1">
                                    Se va a generar automáticamente <span className="font-bold">1 factura</span> próximamente. Tienes tiempo de revisar los importes antes de su emisión.
                                </p>
                                
                                <div className="mt-4 bg-white dark:bg-slate-900 dark:bg-slate-950/60 p-3 rounded-lg border border-yellow-200 flex items-center justify-between max-w-lg">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{recurringInvoices.find(inv => inv.active)?.client || "Cliente"}</span>
                                        <span className="text-xs text-slate-500">Emisión: {new Date(new Date().getTime() + 86400000 * 2).toLocaleDateString('es-ES')}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-slate-900 dark:text-slate-50 mr-4">{formatCurrency(recurringInvoices.find(inv => inv.active)?.amount || 0)}</span>
                                        <button className="text-xs bg-white dark:bg-slate-900 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-md font-bold shadow-sm">
                                            Editar Importe
                                        </button>
                                        <button onClick={() => toggleRecurringInvoice(recurringInvoices.find(inv => inv.active)?.id || '')} className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1.5 rounded-md font-bold">
                                            Pausar Emisión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {recurringInvoices.length === 0 ? (
                    <div className="text-center bg-white dark:bg-slate-900 dark:bg-slate-950 p-12 rounded-xl border border-slate-200 dark:border-slate-700">
                        <i className="fa-solid fa-calendar-check text-5xl text-slate-300 mb-4"></i>
                        <p className="text-lg font-medium text-slate-500">{t.empty}</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm uppercase font-bold">
                                <tr>
                                    <th className="p-4">{t.client}</th>
                                    <th className="p-4">{t.amount}</th>
                                    <th className="p-4">{t.period}</th>
                                    <th className="p-4">{t.nextDate}</th>
                                    <th className="p-4 text-center">{t.status}</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recurringInvoices.map(inv => (
                                    <tr key={inv.id} className={`transition-colors ${inv.active ? 'hover:bg-slate-50 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50 opacity-75'}`}>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{inv.client}</p>
                                            <p className="text-xs text-slate-500">{inv.concept}</p>
                                        </td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{formatCurrency(inv.amount)}</td>
                                        <td className="p-4">
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-bold">
                                                {inv.period}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                                            <i className="fa-regular fa-calendar mr-2 text-slate-400"></i>
                                            {new Date(inv.nextDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            {inv.active ? (
                                                <span className="inline-flex items-center text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                                    {t.active}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-xs font-bold bg-slate-200 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">
                                                    <i className="fa-solid fa-pause mr-1"></i> {t.paused}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => toggleRecurringInvoice(inv.id)}
                                                className={`p-2 rounded-lg transition-colors ${inv.active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={inv.active ? 'Pausar' : 'Reactivar'}
                                            >
                                                <i className={`fa-solid ${inv.active ? 'fa-pause' : 'fa-play'}`}></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start">
                    <i className="fa-solid fa-robot text-blue-500 text-2xl mt-1 mr-4"></i>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">Piloto Automático Activado</h4>
                        <p className="text-blue-800 text-sm">
                            Las facturas activas se generarán en formato PDF automáticamente el día indicado y se enviarán por email a tu cliente. Además, se contabilizarán en tu previsión trimestral de IVA en el mismo momento de su creación.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal de Nueva Recurrencia */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900 dark:bg-slate-950/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Configurar Recurrencia</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.client}</label>
                                <input 
                                    type="text" 
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    placeholder="Ej: Tech Solutions" 
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-slate-50 placeholder:text-slate-400 placeholder:font-medium" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.conceptLabel}</label>
                                <input 
                                    type="text" 
                                    value={concept}
                                    onChange={e => setConcept(e.target.value)}
                                    placeholder="Mantenimiento Mensual Servidores" 
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-slate-50 placeholder:text-slate-400 placeholder:font-medium" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.amount} (€)</label>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00" 
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-slate-50 placeholder:text-slate-400 placeholder:font-medium" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.period}</label>
                                    <select 
                                        value={period}
                                        onChange={e => setPeriod(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 dark:text-slate-50"
                                    >
                                        <option value="Mensual">Mensual</option>
                                        <option value="Trimestral">Trimestral</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                onClick={handleCreate}
                                disabled={!clientName || !concept || !amount}
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
                            >
                                {t.activateBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
