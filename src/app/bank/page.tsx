"use client"
import { useState } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { useFinance, Invoice } from '@/context/FinanceContext';

export default function BankPage() {
    const { lang } = useLanguage();
    const { bankTransactions, invoices, matchTransaction, syncBankTransactions } = useFinance();
    const [selectedTx, setSelectedTx] = useState<string | null>(null);
    const [isSelectingBank, setIsSelectingBank] = useState(false);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStep, setSyncStep] = useState(0);

    const pendingInvoices = invoices.filter(inv => !inv.status || inv.status === 'pendiente');

    const [selectedBankKey, setSelectedBankKey] = useState<string>("BBVA");

    const banks = [
        { id: "BBVA", name: "BBVA", hex: "#004481", textHex: "#ffffff" },
        { id: "Sabadell", name: "Banco Sabadell", hex: "#006DFF", textHex: "#ffffff" },
        { id: "Santander", name: "Banco Santander", hex: "#EC0000", textHex: "#ffffff" },
        { id: "CaixaBank", name: "CaixaBank", hex: "#000000", textHex: "#ffffff" },
        { id: "Revolut", name: "Revolut", hex: "#ffffff", textHex: "#000000", border: "#e5e7eb" },
        { id: "TradeRepublic", name: "Trade Republic", hex: "#111111", textHex: "#ffffff" }
    ];

    const startBankSelection = () => {
        const bank = banks.find(b => b.id === selectedBankKey) || banks[0];
        handleSync(bank);
    };

    const handleSync = (bank: any) => {
        setSelectedBank(bank);
        setIsSyncing(true);
        setSyncStep(0);
        setTimeout(() => setSyncStep(1), 1500);
        setTimeout(() => setSyncStep(2), 3000);
        setTimeout(() => setSyncStep(3), 4500);
        setTimeout(() => {
            syncBankTransactions();
            setIsSyncing(false);
        }, 5500);
    };

    const handleMatch = (txId: string, invoiceId: string) => {
        matchTransaction(txId, invoiceId);
        setSelectedTx(null);
    };

    const t = {
        es: {
            title: "Conciliación Bancaria",
            subtitle: "Sincroniza tus cuentas y empareja movimientos con tus facturas automáticamente.",
            colDate: "Fecha",
            colDesc: "Concepto Bancario",
            colAmount: "Importe",
            colStatus: "Estado",
            matchBtn: "Conciliar",
            matched: "Conciliado",
            selectInvoice: "Selecciona una factura para conciliar con este cobro:",
            cancel: "Cancelar"
        },
        en: {
            title: "Bank Reconciliation",
            subtitle: "Sync your accounts and match transactions with your invoices automatically.",
            colDate: "Date",
            colDesc: "Bank Concept",
            colAmount: "Amount",
            colStatus: "Status",
            matchBtn: "Match",
            matched: "Matched",
            selectInvoice: "Select an invoice to match with this transaction:",
            cancel: "Cancel"
        }
    }[lang];

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

    return (
        <div className="w-full min-h-full bg-gray-50 dark:bg-slate-950 p-4 sm:p-8 relative">
            <div className="max-w-5xl mx-auto space-y-6">
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center">
                            <i className="fa-solid fa-building-columns text-blue-600 mr-3"></i>
                            {t.title}
                        </h1>
                        <p className="text-slate-500 mt-1 max-w-lg">{t.subtitle}</p>
                    </div>
                </header>

                {/* Cajón de Selección de Banco */}
                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <i className="fa-solid fa-link text-xl"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">Conexión Open Banking</h3>
                            <p className="text-slate-500 text-sm">Selecciona tu entidad para sincronizar movimientos</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <select 
                            value={selectedBankKey}
                            onChange={(e) => setSelectedBankKey(e.target.value)}
                            className="flex-1 md:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                        >
                            {banks.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <button 
                            onClick={startBankSelection}
                            disabled={isSyncing}
                            className="bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-md transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                            <i className={`fa-solid fa-arrows-rotate mr-2 ${isSyncing ? 'fa-spin' : ''}`}></i>
                            Conectar
                        </button>
                    </div>
                </div>

                {/* Sincronización PSD2 Modal */}
                {isSyncing && selectedBank && (
                    <div className="fixed inset-0 bg-slate-900 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-100">
                                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(syncStep / 3) * 100}%` }}></div>
                            </div>
                            
                            <div className="flex justify-center items-center space-x-6 mb-8 mt-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                                    <i className="fa-solid fa-scale-balanced text-2xl"></i>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="w-2 h-2 rounded-full bg-slate-200 animate-pulse"></span>
                                    <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-150"></span>
                                </div>
                                <div 
                                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border"
                                    style={{ 
                                        backgroundColor: selectedBank.hex, 
                                        color: selectedBank.textHex,
                                        borderColor: selectedBank.border || 'transparent'
                                    }}
                                >
                                    <span className="font-bold text-[10px] uppercase text-center leading-tight px-1">
                                        {selectedBank.name.substring(0, 8)}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                                {syncStep === 0 && `Conectando con ${selectedBank.name}...`}
                                {syncStep === 1 && "Redirigiendo a tu banco..."}
                                {syncStep === 2 && "Autorizando con FaceID..."}
                                {syncStep === 3 && "Descargando transacciones..."}
                            </h3>
                            <p className="text-slate-500 text-sm">
                                {syncStep < 2 
                                    ? "Conexión segura vía Open Banking" 
                                    : "Obteniendo los últimos movimientos de tu cuenta de forma encriptada."}
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm uppercase font-bold">
                            <tr>
                                <th className="p-4">{t.colDate}</th>
                                <th className="p-4">{t.colDesc}</th>
                                <th className="p-4 text-right">{t.colAmount}</th>
                                <th className="p-4 text-center">{t.colStatus}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bankTransactions.map(trx => (
                                <tr key={trx.id} className="hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                                    <td className="p-4 text-slate-500 font-medium whitespace-nowrap">{new Date(trx.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{trx.description}</td>
                                    <td className={`p-4 text-right font-black ${trx.amount > 0 ? 'text-green-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {formatCurrency(trx.amount)}
                                    </td>
                                    <td className="p-4 text-center">
                                        {trx.matchedInvoiceId ? (
                                            <span className="inline-flex items-center text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full cursor-help" title={`Factura ID: ${trx.matchedInvoiceId}`}>
                                                <i className="fa-solid fa-check mr-1"></i> {t.matched}
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={() => setSelectedTx(trx.id)}
                                                className="inline-flex items-center text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-full transition-colors"
                                            >
                                                <i className="fa-solid fa-link mr-1"></i> {t.matchBtn}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Match Modal */}
                {selectedTx && (
                    <div className="fixed inset-0 bg-slate-900 dark:bg-slate-950/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50">Vincular Factura</h3>
                                <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-slate-700 dark:text-slate-300"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">{t.selectInvoice}</p>
                            
                            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                                {pendingInvoices.length === 0 ? (
                                    <p className="text-center text-sm text-slate-400 py-4">No hay facturas pendientes.</p>
                                ) : (
                                    pendingInvoices.map(inv => (
                                        <div 
                                            key={inv.id} 
                                            onClick={() => handleMatch(selectedTx, inv.id)}
                                            className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{inv.concept}</p>
                                                <p className="text-xs text-slate-500">{new Date(inv.date).toLocaleDateString()} - {inv.type}</p>
                                            </div>
                                            <div className="font-bold text-slate-700 dark:text-slate-300">
                                                {formatCurrency(inv.amount + inv.vat)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <button 
                                onClick={() => setSelectedTx(null)}
                                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-lg transition-colors"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
