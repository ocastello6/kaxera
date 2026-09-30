"use client"
import { useState, useRef } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { useFinance, Invoice } from '@/context/FinanceContext';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
    const { lang } = useLanguage();
    const { invoices, addInvoice } = useFinance();
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanText, setScanText] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const t = {
        es: {
            title: "Buzón de Gastos",
            subtitle: "Escanea tus facturas de proveedores y tiques con la cámara o súbelos en PDF. La IA extraerá los datos automáticamente.",
            scanBtn: "Subir PDF / Imagen",
            cameraBtn: "Hacer Foto al Tique",
            exportBtn: "Exportar a CSV",
            scanning: "Analizando documento con IA...",
            step1: "Detectando proveedor y C.I.F...",
            step2: "Extrayendo base imponible, IVA y categorizando...",
            step3: "Conciliando y guardando...",
            empty: "Tu buzón está vacío. ¡Escanea tu primer tique de gasto!",
            dragText: "Arrastra tu tique o factura de proveedor aquí",
            dragSub: "o haz clic para explorar tus archivos",
            colDate: "Fecha",
            colAmount: "Base Imponible",
            colVat: "IVA Soportado",
            colCategory: "Categoría",
            invoiceCount: (n: number) => n === 1 ? "1 factura" : `${n} facturas`,
        },
        en: {
            title: "Expenses Inbox",
            subtitle: "Scan your provider invoices and receipts with the camera or upload PDFs. AI will extract data automatically.",
            scanBtn: "Upload PDF / Image",
            cameraBtn: "Take Photo of Receipt",
            exportBtn: "Export to CSV",
            scanning: "Analyzing document with AI...",
            step1: "Detecting provider and Tax ID...",
            step2: "Extracting tax base, VAT and categorizing...",
            step3: "Reconciling and saving...",
            empty: "Your inbox is empty. Scan your first expense receipt!",
            dragText: "Drag your receipt or provider invoice here",
            dragSub: "or click to browse your files",
            colDate: "Date",
            colAmount: "Base Amount",
            colVat: "Input VAT",
            colCategory: "Category",
            invoiceCount: (n: number) => n === 1 ? "1 invoice" : `${n} invoices`,
        }
    }[lang];

    const handleFileUpload = async (file: File) => {
        if (isScanning) return;
        setIsScanning(true);
        setScanProgress(0);
        setScanText(t.step1);

        // Simulamos progreso de subida
        const progressInterval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    setScanText(t.step3);
                    return prev;
                }
                if (prev === 40) setScanText(t.step2);
                return prev + 10;
            });
        }, 300);

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/api/ocr', {
                method: 'POST',
                body: formData
            });
            
            if (res.ok) {
                const data = await res.json();
                
                await addInvoice({
                    type: 'gasto',
                    concept: data.concept,
                    category: data.category,
                    date: new Date(data.date),
                    amount: data.amount,
                    vat: data.vat,
                    status: 'cobrada'
                });
                toast.success(`Factura escaneada de ${data.concept}`);
            } else {
                toast.error("Error al procesar el archivo");
            }
        } catch (error) {
            console.error("OCR Error", error);
            toast.error("Fallo de red en OCR");
        } finally {
            clearInterval(progressInterval);
            setScanProgress(100);
            setTimeout(() => {
                setIsScanning(false);
                setScanProgress(0);
            }, 1000);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const exportToCSV = () => {
        const headers = ["Proveedor", "Categoría", "Fecha", "Base", "IVA Soportado", "Total"];
        const rows = gastos.map(inv => [
            inv.concept,
            inv.category || 'Gasto',
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
        link.setAttribute("download", "Buzon_Gastos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

    const toggleGroup = (concept: string) => {
        setExpandedGroups(prev => ({ ...prev, [concept]: !prev[concept] }));
    };

    // Agrupar solo gastos, ordenados cronológicamente
    const gastos = invoices
        .filter(i => i.type === 'gasto')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const groupByConcept = (list: Invoice[]) => {
        return list.reduce((acc, inv) => {
            if (!acc[inv.concept]) acc[inv.concept] = [];
            acc[inv.concept].push(inv);
            return acc;
        }, {} as Record<string, Invoice[]>);
    };

    const gastosGrouped = groupByConcept(gastos);

    const renderGroupCard = (providerName: string, groupInvoices: Invoice[]) => {
        const totalBase = groupInvoices.reduce((sum, i) => sum + i.amount, 0);
        const totalVat = groupInvoices.reduce((sum, i) => sum + i.vat, 0);
        const isExpanded = expandedGroups[providerName] || false;

        return (
            <div key={providerName} className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-4 transition-all hover:shadow-md">
                <div 
                    onClick={() => toggleGroup(providerName)}
                    className="p-5 cursor-pointer flex items-center justify-between hover:bg-slate-50 dark:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-orange-50 text-orange-600">
                            <i className="fa-solid fa-building"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{providerName}</h3>
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
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Gasto</p>
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
                
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center">
                            <i className="fa-solid fa-receipt text-orange-600 mr-3"></i>
                            {t.title}
                        </h1>
                        <p className="text-slate-500 mt-1 max-w-lg">{t.subtitle}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={exportToCSV}
                            disabled={gastos.length === 0}
                            className="bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-file-csv text-lg"></i>
                            <span className="hidden sm:inline">{t.exportBtn}</span>
                        </button>
                        
                        {/* Hidden file inputs */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            className="hidden" 
                            accept=".pdf,image/*"
                        />
                        <input 
                            type="file" 
                            ref={cameraInputRef} 
                            onChange={handleFileSelect} 
                            className="hidden" 
                            accept="image/*"
                            capture="environment"
                        />
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isScanning}
                            className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-950 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-file-arrow-up text-lg"></i>
                            <span className="hidden sm:inline">{t.scanBtn}</span>
                        </button>
                        
                        <button 
                            onClick={() => cameraInputRef.current?.click()}
                            disabled={isScanning}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-camera text-lg"></i>
                            <span>{t.cameraBtn}</span>
                        </button>
                    </div>
                </header>

                {/* Drag and Drop Zone */}
                {!isScanning && (
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                            isDragging 
                            ? "bg-orange-50 border-orange-500 text-orange-600 scale-[1.01]" 
                            : "bg-white dark:bg-slate-900 dark:bg-slate-950 border-slate-300 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 hover:border-slate-400"
                        }`}
                    >
                        <i className={`fa-solid fa-camera-retro text-5xl mb-4 transition-transform ${isDragging ? "animate-bounce" : "opacity-40"}`}></i>
                        <h3 className="text-xl font-bold mb-1">{isDragging ? "¡Suéltalo aquí!" : t.dragText}</h3>
                        <p className="text-sm opacity-70">{t.dragSub}</p>
                    </div>
                )}

                {/* Scanner Simulation Modal */}
                {isScanning && (
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-xl border border-orange-200 p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                        <i className="fa-solid fa-robot fa-bounce text-6xl text-orange-500 mb-6"></i>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t.scanning}</h3>
                        <p className="text-orange-600 font-medium mt-3 animate-pulse text-lg">{scanText}</p>
                    </div>
                )}

                {gastos.length === 0 && !isScanning ? (
                    <div className="text-center text-slate-400 py-12">
                        <p className="text-lg font-medium">{t.empty}</p>
                    </div>
                ) : (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700 mt-8">
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                            <i className="fa-solid fa-receipt mr-3 text-orange-500"></i>
                            Tus Gastos Clasificados
                        </h2>
                        {Object.entries(gastosGrouped).map(([providerName, invs]) => renderGroupCard(providerName, invs))}
                    </div>
                )}
            </div>
        </div>
    );
}
