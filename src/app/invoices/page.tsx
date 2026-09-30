"use client"
import { useState } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { useFinance, Invoice } from '@/context/FinanceContext';

export default function InvoicesPage() {
    const { lang } = useLanguage();
    const { invoices } = useFinance();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const t = {
        es: {
            title: "Facturas Emitidas",
            subtitle: "Historial completo de tus ventas, agrupadas por cliente y ordenadas cronológicamente.",
            newBtn: "Crear Factura",
            exportBtn: "Exportar a CSV",
            empty: "Aún no has emitido ninguna factura.",
            colDate: "Fecha",
            colCategory: "Categoría",
            colAmount: "Base Imponible",
            colVat: "IVA",
            invoiceCount: (n: number) => n === 1 ? "1 factura" : `${n} facturas`,
        },
        en: {
            title: "Issued Invoices",
            subtitle: "Complete history of your sales, grouped by client and ordered chronologically.",
            newBtn: "Create Invoice",
            exportBtn: "Export to CSV",
            empty: "You haven't issued any invoices yet.",
            colDate: "Date",
            colCategory: "Category",
            colAmount: "Base Amount",
            colVat: "VAT",
            invoiceCount: (n: number) => n === 1 ? "1 invoice" : `${n} invoices`,
        }
    }[lang];

    const exportToCSV = () => {
        const headers = ["Cliente", "Categoría", "Fecha", "Base", "IVA", "Total"];
        const rows = ingresos.map(inv => [
            inv.concept,
            inv.category || 'Venta',
            new Date(inv.date).toLocaleDateString(),
            inv.amount.toFixed(2),
            inv.vat.toFixed(2),
            (inv.amount + inv.vat).toFixed(2)
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Facturas_Emitidas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

    const toggleGroup = (concept: string) => {
        setExpandedGroups(prev => ({ ...prev, [concept]: !prev[concept] }));
    };

    // Agrupar solo ingresos, ordenados cronológicamente
    const ingresos = invoices
        .filter(i => i.type === 'ingreso')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const groupByConcept = (list: Invoice[]) => {
        return list.reduce((acc, inv) => {
            if (!acc[inv.concept]) acc[inv.concept] = [];
            acc[inv.concept].push(inv);
            return acc;
        }, {} as Record<string, Invoice[]>);
    };

    const ingresosGrouped = groupByConcept(ingresos);

    const renderGroupCard = (clientName: string, groupInvoices: Invoice[]) => {
        const totalBase = groupInvoices.reduce((sum, i) => sum + i.amount, 0);
        const totalVat = groupInvoices.reduce((sum, i) => sum + i.vat, 0);
        const isExpanded = expandedGroups[clientName] || false;

        return (
            <div key={clientName} className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-4 transition-all hover:shadow-md">
                <div 
                    onClick={() => toggleGroup(clientName)}
                    className="p-5 cursor-pointer flex items-center justify-between hover:bg-slate-50 dark:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-blue-50 text-blue-600">
                            <i className="fa-solid fa-building-user"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{clientName}</h3>
                            <p className="text-sm font-medium text-slate-500">
                                {t.invoiceCount(groupInvoices.length)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="text-right hidden sm:block flex flex-col justify-center">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Base</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalBase)}</p>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Facturado</p>
                            <p className="text-lg leading-tight" style={{ color: '#000000', fontWeight: 900 }}>{formatCurrency(totalBase + totalVat)}</p>
                        </div>
                        <div className="text-slate-300">
                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-5">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase text-xs">
                                <tr>
                                    <th className="pb-2 font-bold">{t.colDate}</th>
                                    <th className="pb-2 font-bold">{t.colCategory}</th>
                                    <th className="pb-2 font-bold text-center">Estado</th>
                                    <th className="pb-2 font-bold text-right">{t.colAmount}</th>
                                    <th className="pb-2 font-bold text-right">{t.colVat}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {groupInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-100 dark:bg-slate-700 transition-colors">
                                        <td className="py-3 font-medium text-slate-600 dark:text-slate-400">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="py-3">
                                            <span className="bg-slate-200 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-1 rounded-full font-bold uppercase">{inv.category || 'General'}</span>
                                        </td>
                                        <td className="py-3 text-center">
                                            {inv.status === 'cobrada' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase"><i className="fa-solid fa-circle-check mr-1"></i>Cobrada</span>}
                                            {inv.status === 'vencida' && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase"><i className="fa-solid fa-circle-xmark mr-1"></i>Vencida</span>}
                                            {(!inv.status || inv.status === 'pendiente') && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase"><i className="fa-solid fa-clock mr-1"></i>Pendiente</span>}
                                        </td>
                                        <td className="py-3 text-right text-slate-700 dark:text-slate-300">{formatCurrency(inv.amount)}</td>
                                        <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-200">{formatCurrency(inv.vat)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full min-h-full bg-gray-50 dark:bg-slate-950 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center">
                            <i className="fa-solid fa-file-invoice text-blue-600 mr-3"></i>
                            {t.title}
                        </h1>
                        <p className="text-slate-500 mt-1 max-w-lg">{t.subtitle}</p>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            onClick={exportToCSV}
                            disabled={ingresos.length === 0}
                            className="bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center space-x-3 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-file-csv text-lg"></i>
                            <span className="hidden sm:inline">{t.exportBtn}</span>
                        </button>
                        <button 
                            onClick={() => window.location.href = '/new-invoice'}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center space-x-3"
                        >
                            <i className="fa-solid fa-plus text-lg"></i>
                            <span>{t.newBtn}</span>
                        </button>
                    </div>
                </header>

                {ingresos.length === 0 ? (
                    <div className="text-center text-slate-400 py-16 bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300">
                        <i className="fa-solid fa-file-invoice-dollar text-5xl mb-4 opacity-30"></i>
                        <p className="text-lg font-medium">{t.empty}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(ingresosGrouped).map(([clientName, invs]) => renderGroupCard(clientName, invs))}
                    </div>
                )}
            </div>
        </div>
    );
}
