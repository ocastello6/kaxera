"use client"
import { useState, useEffect, useRef } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { useFinance } from '@/context/FinanceContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { lang } = useLanguage();
    const { companySettings, setCompanySettings } = useFinance();
    const [name, setName] = useState("");
    const [nif, setNif] = useState("");
    const [address, setAddress] = useState("");
    const [accountantName, setAccountantName] = useState("");
    const [accountantEmail, setAccountantEmail] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(companySettings.name);
        setNif(companySettings.nif);
        setAddress(companySettings.address);
        setAccountantName(companySettings.accountantName || "");
        setAccountantEmail(companySettings.accountantEmail || "");
        setLogoUrl(companySettings.logoUrl || "");
    }, [companySettings]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setCompanySettings({ name, nif, address, accountantName, accountantEmail, logoUrl });
        setIsSaved(true);
        toast.success(t.saved);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const t = {
        es: {
            title: "Configuración",
            subtitle: "Personaliza los datos de tu empresa y la conexión con tu gestoría.",
            name: "Razón Social o Nombre",
            nif: "NIF / CIF",
            address: "Dirección Fiscal Completa",
            accountantSection: "Puente Pyme-Gestoría",
            accountantName: "Nombre de la Gestoría",
            accountantEmail: "Email de la Gestoría (para envíos automáticos)",
            save: "Guardar Cambios",
            saved: "¡Guardado con éxito!"
        },
        en: {
            title: "Settings",
            subtitle: "Customize your company data and your accountant connection.",
            name: "Company Name",
            nif: "Tax ID (VAT)",
            address: "Full Billing Address",
            accountantSection: "Accountant Bridge",
            accountantName: "Accountant Firm Name",
            accountantEmail: "Accountant Email (for auto-exports)",
            save: "Save Changes",
            saved: "Successfully saved!"
        }
    }[lang];

    return (
        <div className="w-full min-h-full bg-gray-50 dark:bg-slate-950 p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{t.title}</h1>
                    <p className="text-slate-500 mt-1">{t.subtitle}</p>
                </header>

                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">Datos Fiscales</h2>
                    <div className="space-y-6">
                        {/* Logo Uploader */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Logotipo de la Empresa (Facturas)</label>
                            <div className="flex items-center space-x-6">
                                <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <i className="fa-solid fa-image text-3xl text-slate-400"></i>
                                    )}
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleLogoUpload}
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg shadow-sm transition-all text-sm"
                                    >
                                        Subir Logotipo
                                    </button>
                                    <p className="text-xs text-slate-500">Formato JPG o PNG. Máx 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.name}</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.nif}</label>
                            <input 
                                type="text" 
                                value={nif}
                                onChange={(e) => setNif(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.address}</label>
                            <textarea 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50" 
                            ></textarea>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 mt-10 border-b border-slate-100 dark:border-slate-700 pb-2">
                        <i className="fa-solid fa-file-export text-green-500 mr-2"></i>
                        {t.accountantSection}
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.accountantName}</label>
                            <input 
                                type="text" 
                                value={accountantName}
                                onChange={(e) => setAccountantName(e.target.value)}
                                placeholder="Ej: Gestoría Martínez"
                                className="w-full px-4 py-3 bg-green-50/30 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.accountantEmail}</label>
                            <input 
                                type="email" 
                                value={accountantEmail}
                                onChange={(e) => setAccountantEmail(e.target.value)}
                                placeholder="facturas@gestoria.com"
                                className="w-full px-4 py-3 bg-green-50/30 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50" 
                            />
                        </div>
                    </div>

                    <div className="pt-8 mt-8 flex items-center space-x-4 border-t border-slate-100 dark:border-slate-700">
                        <button 
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center space-x-2"
                        >
                            <i className="fa-solid fa-floppy-disk"></i>
                            <span>{t.save}</span>
                        </button>
                        {isSaved && (
                            <span className="text-green-600 font-bold animate-fade-in flex items-center">
                                <i className="fa-solid fa-check-circle mr-2"></i> {t.saved}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
