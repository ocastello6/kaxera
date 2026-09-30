"use client"
import { useLanguage } from '@/context/LanguageContext';
import { useFinance } from '@/context/FinanceContext';
import { useState } from 'react';

export default function AccountingPage() {
    const { lang } = useLanguage();
    const { invoices, exportLogs, addExportLog } = useFinance();
    const [exportFormat, setExportFormat] = useState('a3');

    const generateAccountingEntries = () => {
        const entries: any[] = [];
        
        invoices.forEach(inv => {
            const dateStr = new Date(inv.date).toLocaleDateString('es-ES');
            if (inv.type === 'ingreso') {
                entries.push({ date: dateStr, concept: `N/Fra ${inv.concept}`, account: '4300000', debit: inv.amount + inv.vat, credit: 0 });
                entries.push({ date: dateStr, concept: `Venta ${inv.concept}`, account: '7000000', debit: 0, credit: inv.amount });
                entries.push({ date: dateStr, concept: `IVA Repercutido`, account: '4770000', debit: 0, credit: inv.vat });
            } else {
                entries.push({ date: dateStr, concept: `Gasto ${inv.concept}`, account: '6000000', debit: inv.amount, credit: 0 });
                entries.push({ date: dateStr, concept: `IVA Soportado`, account: '4720000', debit: inv.vat, credit: 0 });
                entries.push({ date: dateStr, concept: `S/Fra ${inv.concept}`, account: '4000000', debit: 0, credit: inv.amount + inv.vat });
            }
        });
        
        return entries;
    };

    const entries = generateAccountingEntries();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
    };

    const handleDownload = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        if (exportFormat === 'a3') {
            csvContent += "FECHA;CONCEPTO;CUENTA;DEBE;HABER\n";
            entries.forEach(e => {
                csvContent += `${e.date};${e.concept};${e.account};${e.debit.toFixed(2)};${e.credit.toFixed(2)}\n`;
            });
        } else {
            csvContent += "DATE,DESCRIPTION,ACCOUNT_CODE,DEBIT,CREDIT\n";
            entries.forEach(e => {
                csvContent += `${e.date},${e.concept},${e.account},${e.debit.toFixed(2)},${e.credit.toFixed(2)}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `asientos_contables_${exportFormat}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Record in history
        const now = new Date();
        const quarter = `T${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
        addExportLog({
            date: now,
            format: exportFormat === 'a3' ? 'A3 Software' : 'Sage 50',
            entriesCount: entries.length,
            quarter: quarter
        });
    };

    return (
        <div className="w-full h-full bg-gray-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 dark:bg-slate-950 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 dark:border-slate-700">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center">
                        <i className="fa-solid fa-file-export text-green-600 mr-3"></i>
                        Puente Pyme-Gestoría
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        Tus facturas convertidas automáticamente a Plan General Contable (PGC).
                    </p>
                </div>
                <div className="flex space-x-3 items-center">
                    <select 
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="a3">Formato A3 Software</option>
                        <option value="sage">Formato Sage 50</option>
                    </select>
                    <button 
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center shadow-md shadow-green-600/20 transition-all"
                    >
                        <i className="fa-solid fa-download mr-2"></i>
                        Exportar Diario
                    </button>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto w-full flex-1 overflow-hidden flex flex-col space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-xl flex flex-col justify-center">
                        <div className="flex items-start mb-2">
                            <i className="fa-solid fa-circle-info text-2xl mr-3 mt-0.5"></i>
                            <h4 className="font-bold text-lg">Generación Contable</h4>
                        </div>
                        <p className="text-sm mt-1 leading-relaxed">Kaxera traduce instantáneamente cada factura a la contabilidad por partida doble (Cuentas 430, 700, 600, 477, 472). Tu gestor solo tiene que importar el archivo y se ahorrará horas de picar datos.</p>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-0 overflow-hidden flex flex-col shadow-sm">
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm"><i className="fa-solid fa-clock-rotate-left mr-2"></i>Historial de Exportaciones</h4>
                        </div>
                        <div className="p-0 overflow-y-auto max-h-40">
                            {exportLogs && exportLogs.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <tbody className="divide-y divide-slate-100">
                                        {exportLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50 dark:bg-slate-800">
                                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                                    {new Date(log.date).toLocaleDateString('es-ES')} <span className="text-slate-400 text-xs ml-1">{new Date(log.date).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-xs font-bold border border-slate-200 dark:border-slate-700">{log.quarter}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{log.format}</td>
                                                <td className="px-4 py-3 text-right text-slate-500"><span className="font-bold text-slate-700 dark:text-slate-300">{log.entriesCount}</span> asientos</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    Aún no has realizado ninguna exportación a tu gestoría.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
                    <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-white font-bold"><i className="fa-solid fa-book-open mr-2 text-slate-400"></i> Vista Previa del Libro Diario</h3>
                        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded font-mono border border-slate-700">
                            {entries.length} Asientos Generados
                        </span>
                    </div>
                    <div className="overflow-auto flex-1 bg-slate-50 dark:bg-slate-800">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs uppercase font-bold sticky top-0 shadow-sm z-10">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Cuenta</th>
                                    <th className="px-6 py-4 w-1/3">Concepto</th>
                                    <th className="px-6 py-4 text-right">Debe</th>
                                    <th className="px-6 py-4 text-right">Haber</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white dark:bg-slate-900 dark:bg-slate-950">
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No hay facturas para generar asientos.
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:bg-slate-800 font-mono text-sm">
                                            <td className="px-6 py-3 text-slate-500">{entry.date}</td>
                                            <td className="px-6 py-3 font-bold text-blue-600">{entry.account}</td>
                                            <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{entry.concept}</td>
                                            <td className="px-6 py-3 text-right font-medium text-slate-900 dark:text-slate-50">{entry.debit > 0 ? formatCurrency(entry.debit) : ''}</td>
                                            <td className="px-6 py-3 text-right font-medium text-slate-900 dark:text-slate-50">{entry.credit > 0 ? formatCurrency(entry.credit) : ''}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
