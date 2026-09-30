"use client"
import { useState } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { useFinance } from '@/context/FinanceContext';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

export default function NewInvoicePage() {
    const { lang } = useLanguage();
    const { addInvoice, companySettings } = useFinance();
    const router = useRouter();

    const [clientName, setClientName] = useState("");
    const [clientNif, setClientNif] = useState("");
    const [showContacts, setShowContacts] = useState(false);
    
    // Lista dinámica de conceptos
    const [items, setItems] = useState([
        { concept: "Desarrollo de Software", quantity: 1, amount: 1000 }
    ]);

    const contacts = [
        { name: "Tech Solutions S.L.", nif: "B98765432" },
        { name: "Agencia Creativa", nif: "B45678912" },
        { name: "Innovación y Desarrollo", nif: "B11223344" },
        { name: "Cliente Particular", nif: "12345678Z" }
    ];
    const [isSaving, setIsSaving] = useState(false);

    const ivaRate = 0.21;
    
    // Calcular totales
    const numAmount = Number(items.reduce((sum, item) => sum + ((parseFloat(item.amount as any) || 0) * (parseFloat(item.quantity as any) || 0)), 0).toFixed(2));
    const vat = Number((numAmount * ivaRate).toFixed(2));
    const total = Number((numAmount + vat).toFixed(2));

    const today = new Date().toLocaleDateString();
    const invoiceNum = `F-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;

    const t = {
        es: {
            title: "Emitir Nueva Factura",
            subtitle: "Crea y descarga una factura en PDF al instante.",
            formTitle: "Datos de la Factura",
            clientName: "Nombre del Cliente",
            clientNif: "NIF / CIF del Cliente",
            concept: "Concepto del servicio/producto",
            amount: "Base Imponible (€)",
            preview: "Vista Previa de Factura",
            saveAndDownload: "Guardar y Descargar PDF",
            saving: "Guardando...",
            myCompany: "Mi Empresa, S.L.",
            myNif: "B98765432",
            subtotal: "Subtotal",
            vatLabel: "IVA (21%)",
            totalLabel: "Total a Pagar",
        },
        en: {
            title: "Issue New Invoice",
            subtitle: "Create and download a PDF invoice instantly.",
            formTitle: "Invoice Details",
            clientName: "Client Name",
            clientNif: "Client Tax ID",
            concept: "Service/Product Concept",
            amount: "Tax Base (€)",
            preview: "Invoice Preview",
            saveAndDownload: "Save & Download PDF",
            saving: "Saving...",
            myCompany: "My Company, LLC",
            myNif: "B98765432",
            subtotal: "Subtotal",
            vatLabel: "VAT (21%)",
            totalLabel: "Total Due",
        }
    }[lang];

    const handleAddItem = () => {
        setItems([...items, { concept: "", quantity: 1, amount: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSaveAndPrint = async () => {
        setIsSaving(true);
        
        const mainConcept = items.length === 1 
            ? items[0].concept 
            : `${items[0].concept} y ${items.length - 1} más`;

        // Registrar el ingreso en el sistema global
        await addInvoice({
            type: 'ingreso',
            concept: clientName || "Cliente Sin Nombre", 
            category: "Ventas B2B",
            date: new Date(),
            amount: numAmount,
            vat: vat,
            status: 'pendiente'
        });

        // Generar PDF Real
        const element = document.getElementById('invoice-preview');
        if (element) {
            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
                margin:       0,
                filename:     `Factura_${invoiceNum}_${clientName.replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            
            // Promise based PDF generation
            await html2pdf().set(opt as any).from(element).save();
            toast.success('Factura guardada y PDF descargado correctamente');
        }

        setIsSaving(false);
    };

    return (
        <div className="w-full min-h-full bg-gray-50 dark:bg-slate-950 p-4 sm:p-8 print:bg-white dark:bg-slate-900 dark:bg-slate-950 print:p-0">
            <div className="max-w-6xl mx-auto space-y-8 print:m-0 print:space-y-0">
                
                {/* Header - Hides on print */}
                <header className="print:hidden">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{t.title}</h1>
                    <p className="text-slate-500 mt-1 max-w-lg">{t.subtitle}</p>
                </header>

                <div className="grid lg:grid-cols-2 gap-10 print:block">
                    
                    {/* Formulario - Hides on print */}
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 print:hidden">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
                            <i className="fa-solid fa-pen-to-square text-blue-500 mr-2"></i>
                            {t.formTitle}
                        </h2>
                        
                        <div className="space-y-5">
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.clientName}</label>
                                <input 
                                    type="text" 
                                    value={clientName}
                                    onChange={(e) => {
                                        setClientName(e.target.value);
                                        setShowContacts(true);
                                    }}
                                    onFocus={() => setShowContacts(true)}
                                    onBlur={() => setTimeout(() => setShowContacts(false), 200)}
                                    placeholder="Ej: Acme Corp..."
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50" 
                                />
                                {showContacts && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                        {contacts.filter(c => c.name.toLowerCase().includes(clientName.toLowerCase())).map((contact, i) => (
                                            <div 
                                                key={i}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-none"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setClientName(contact.name);
                                                    setClientNif(contact.nif);
                                                    setShowContacts(false);
                                                }}
                                            >
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{contact.name}</p>
                                                <p className="text-xs text-slate-500">{contact.nif}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.clientNif}</label>
                                <input 
                                    type="text" 
                                    value={clientNif}
                                    onChange={(e) => setClientNif(e.target.value)}
                                    placeholder="Ej: B12345678"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50" 
                                />
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Conceptos facturados</label>
                                {items.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-3 mb-3 items-end">
                                        <div className="flex-1 w-full">
                                            <input 
                                                type="text" 
                                                value={item.concept}
                                                onChange={(e) => handleItemChange(index, 'concept', e.target.value)}
                                                placeholder={t.concept}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50" 
                                            />
                                        </div>
                                        <div className="w-full sm:w-24">
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                placeholder="Cant."
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 dark:text-slate-50 text-center" 
                                            />
                                        </div>
                                        <div className="w-full sm:w-32 flex items-center">
                                            <input 
                                                type="number" 
                                                value={item.amount}
                                                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                                placeholder="Precio"
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 dark:text-slate-50 text-right" 
                                            />
                                            {items.length > 1 && (
                                                <button 
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="ml-2 text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={handleAddItem}
                                    className="text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors mt-1 flex items-center"
                                >
                                    <i className="fa-solid fa-plus mr-1"></i> Añadir línea
                                </button>
                            </div>

                            <button 
                                onClick={handleSaveAndPrint}
                                disabled={isSaving || numAmount <= 0 || !clientName}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
                                ) : (
                                    <i className="fa-solid fa-file-pdf text-lg"></i>
                                )}
                                <span>{isSaving ? t.saving : t.saveAndDownload}</span>
                            </button>
                            <p className="text-xs text-center text-slate-400 mt-2">
                                <i className="fa-solid fa-circle-info"></i> Al guardar, se sumará automáticamente a tus ingresos trimestrales.
                            </p>
                        </div>
                    </div>

                    {/* Preview - This is what gets printed */}
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-10 print:border-none print:shadow-none print:p-0">
                        <div className="print:hidden mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                <i className="fa-solid fa-eye text-green-500 mr-2"></i>
                                {t.preview}
                            </h2>
                        </div>

                        {/* HOJA DE FACTURA REAL */}
                        <div id="invoice-preview" className="border border-slate-100 dark:border-slate-700 p-8 rounded-lg print:border-none print:p-0 font-serif text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 dark:bg-slate-950 min-h-[600px] flex flex-col">
                            
                            {/* Cabecera de factura */}
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tighter uppercase">Factura</h2>
                                    <p className="text-slate-500 mt-1 font-sans text-sm">Nº {invoiceNum}</p>
                                    <p className="text-slate-500 font-sans text-sm">Fecha: {today}</p>
                                </div>
                                <div className="text-right">
                                    {companySettings.logoUrl ? (
                                        <img src={companySettings.logoUrl} alt="Logo" className="h-16 ml-auto mb-2 object-contain" />
                                    ) : (
                                        <div className="w-12 h-12 bg-blue-600 rounded-lg ml-auto mb-2 flex items-center justify-center text-white">
                                            <i className="fa-solid fa-scale-balanced text-xl"></i>
                                        </div>
                                    )}
                                    <h3 className="font-bold text-lg">{companySettings.name}</h3>
                                    <p className="text-slate-500 text-sm font-sans">{companySettings.nif}</p>
                                    <p className="text-slate-500 text-sm font-sans whitespace-pre-wrap">{companySettings.address}</p>
                                </div>
                            </div>

                            {/* Datos del Cliente */}
                            <div className="mb-10 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg font-sans">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Facturado a:</h4>
                                <p className="font-bold text-lg">{clientName || "—"}</p>
                                <p className="text-slate-600 dark:text-slate-400">{clientNif || "—"}</p>
                            </div>

                            {/* Tabla de Conceptos */}
                            <table className="w-full text-left font-sans mb-8">
                                <thead>
                                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                                        <th className="py-3 font-bold text-slate-700 dark:text-slate-300 w-[55%]">Descripción</th>
                                        <th className="py-3 font-bold text-slate-700 dark:text-slate-300 text-center w-[15%]">Cantidad</th>
                                        <th className="py-3 font-bold text-slate-700 dark:text-slate-300 text-right w-[15%]">Precio</th>
                                        <th className="py-3 font-bold text-slate-700 dark:text-slate-300 text-right w-[15%]">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => {
                                        const qty = parseFloat(item.quantity as any) || 0;
                                        const prc = parseFloat(item.amount as any) || 0;
                                        const rowTotal = qty * prc;
                                        return (
                                            <tr key={idx} className="border-b border-slate-100 dark:border-slate-700">
                                                <td className="py-4 font-medium text-slate-800 dark:text-slate-200 break-words pr-4">{item.concept || "—"}</td>
                                                <td className="py-4 text-center text-slate-600 dark:text-slate-400">{qty}</td>
                                                <td className="py-4 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">{prc.toFixed(2)} €</td>
                                                <td className="py-4 text-right font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{rowTotal.toFixed(2)} €</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Totales */}
                            <div className="w-1/2 ml-auto font-sans">
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-600 dark:text-slate-400 font-medium">{t.subtotal}:</span>
                                    <span className="font-bold">{numAmount.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                    <span className="text-slate-600 dark:text-slate-400 font-medium">{t.vatLabel}:</span>
                                    <span className="font-bold">{vat.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between py-3 mt-2 bg-slate-900 dark:bg-slate-950 text-white px-4 rounded-lg">
                                    <span className="font-bold text-lg">{t.totalLabel}:</span>
                                    <span className="font-bold text-lg">{total.toFixed(2)} €</span>
                                </div>
                            </div>
                            
                            <div className="mt-16 text-center text-xs text-slate-400 font-sans border-t border-slate-100 dark:border-slate-700 pt-4 print:mt-auto">
                                <p>Gracias por confiar en nuestros servicios.</p>
                                <p>Documento generado por TaxTwin Digital.</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
