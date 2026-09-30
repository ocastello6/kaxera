"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export type InvoiceType = 'ingreso' | 'gasto';

export type InvoiceStatus = 'pendiente' | 'cobrada' | 'vencida';

export interface Invoice {
    id: string;
    type: InvoiceType;
    concept: string;
    category: string; 
    date: Date;
    amount: number;
    vat: number;
    status?: InvoiceStatus;
}

export interface CalendarEvent {
    id: string;
    dateKey: string; 
    title: string;
    color: string;
}

export interface CompanySettings {
    name: string;
    nif: string;
    address: string;
    accountantEmail?: string;
    accountantName?: string;
    logoUrl?: string;
}

export interface RecurringInvoice {
    id: string;
    client: string;
    concept: string;
    amount: number;
    period: string; 
    nextDate: string;
    active: boolean;
}

export interface BankTransaction {
    id: string;
    date: Date;
    description: string;
    amount: number;
    matchedInvoiceId?: string; 
}

export interface Contact {
    id: string;
    type: 'client' | 'supplier';
    name: string;
    nif: string;
    address: string;
    email: string;
    phone: string;
}

export interface ExportLog {
    id: string;
    date: Date;
    format: string;
    entriesCount: number;
    quarter: string;
}

interface FinanceContextType {
    invoices: Invoice[];
    addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
    contacts: Contact[];
    addContact: (contact: Omit<Contact, 'id'>) => void;
    exportLogs: ExportLog[];
    addExportLog: (log: Omit<ExportLog, 'id'>) => void;
    totalDevengado: number;
    totalSoportado: number;
    events: CalendarEvent[];
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    removeEvent: (id: string) => void;
    companySettings: CompanySettings;
    setCompanySettings: (settings: CompanySettings) => void;
    recurringInvoices: RecurringInvoice[];
    addRecurringInvoice: (inv: Omit<RecurringInvoice, 'id'>) => void;
    toggleRecurringInvoice: (id: string) => void;
    bankTransactions: BankTransaction[];
    matchTransaction: (transactionId: string, invoiceId: string) => void;
    syncBankTransactions: () => void;
    currentUser: string;
    isLoaded: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const sessionResult = useSession() || {};
    const { data: session, status } = sessionResult as any;
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanySettings>({
        name: "Mi Empresa, S.L.",
        nif: "B98765432",
        address: "Calle Principal, 123"
    });
    const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [exportLogs, setExportLogs] = useState<ExportLog[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentUser, setCurrentUser] = useState<string>('default');

    // Helper: generate 2026 data randomly
    const generate2026Data = (tenant: string) => {
        const generatedInvoices: Invoice[] = [];
        let idCounter = 1;
        const year = 2026;

        if (tenant === 'tech') {
            for (let m = 0; m < 12; m++) {
                const numInvoices = Math.floor(Math.random() * 11) + 20; // 20 to 30
                const isLossMonth = Math.random() > 0.7; // 30% chance of loss
                
                for (let i = 0; i < numInvoices; i++) {
                    const isIncome = isLossMonth ? Math.random() > 0.8 : Math.random() > 0.4;
                    const day = Math.floor(Math.random() * 28) + 1;
                    
                    if (isIncome) {
                        const amount = Math.floor(Math.random() * 4000) + 1000;
                        generatedInvoices.push({ id: `t-inc-${idCounter++}`, type: "ingreso", concept: `Proyecto de Software #${idCounter}`, category: "Servicios", date: new Date(year, m, day), amount, vat: amount * 0.21, status: "cobrada" });
                    } else {
                        const amount = Math.floor(Math.random() * 1000) + 100;
                        generatedInvoices.push({ id: `t-exp-${idCounter++}`, type: "gasto", concept: `Suscripción SaaS / Infra #${idCounter}`, category: "Infraestructura", date: new Date(year, m, day), amount, vat: amount * 0.21, status: "cobrada" });
                    }
                }
            }
        } else if (tenant === 'cafe') {
            for (let m = 0; m < 12; m++) {
                const numInvoices = Math.floor(Math.random() * 6) + 5; // 5 to 10
                const isLossMonth = Math.random() > 0.8; // 20% chance of loss
                
                for (let i = 0; i < numInvoices; i++) {
                    const isIncome = isLossMonth ? Math.random() > 0.7 : Math.random() > 0.5;
                    const day = Math.floor(Math.random() * 28) + 1;
                    
                    if (isIncome) {
                        const amount = Math.floor(Math.random() * 1500) + 500;
                        generatedInvoices.push({ id: `c-inc-${idCounter++}`, type: "ingreso", concept: `Caja TPV Semanal #${idCounter}`, category: "Ventas", date: new Date(year, m, day), amount, vat: amount * 0.10, status: "cobrada" });
                    } else {
                        const amount = Math.floor(Math.random() * 800) + 100;
                        generatedInvoices.push({ id: `c-exp-${idCounter++}`, type: "gasto", concept: `Proveedor de Ingredientes #${idCounter}`, category: "Mercaderías", date: new Date(year, m, day), amount, vat: amount * 0.10, status: "cobrada" });
                    }
                }
            }
        }
        return generatedInvoices;
    };

    // Load from database on mount
    useEffect(() => {
        if (status === 'loading') return;
        
        let user = 'default';
        if (status === 'authenticated' && session?.user?.email) {
            user = session.user.email;
        } else {
            // Fallback for demo or transition
            user = localStorage.getItem('kaxera_user') || 'default';
        }

        setCurrentUser(user);

        if (user === 'default') {
            setIsLoaded(true);
            return;
        }

        const storedExportLogs = localStorage.getItem(`kaxera_v1_export_${user}`);
        
        // Fetch real invoices from database
        fetch('/api/invoices')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setInvoices(data.map(inv => ({ ...inv, date: new Date(inv.date) })));
                } else if (user === 'tech' || user === 'cafe') {
                    setInvoices(generate2026Data(user));
                }
            })
            .catch(err => console.error("Error fetching DB invoices:", err));

        // Fetch contacts
        fetch('/api/contacts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setContacts(data);
                else if (user === 'tech' || user === 'cafe') {
                    setContacts([
                        { id: 'c1', type: 'client', name: 'Global Corp S.A.', nif: 'A12345678', address: 'Calle Principal 1, Madrid', email: 'admin@globalcorp.es', phone: '600123456' },
                        { id: 'c2', type: 'client', name: 'Innovación SL', nif: 'B87654321', address: 'Av. Empresa 45, Barcelona', email: 'info@innovacion.com', phone: '600654321' },
                        { id: 's1', type: 'supplier', name: 'Amazon AWS', nif: 'N0354116D', address: 'Seattle, WA', email: 'billing@aws.com', phone: '' }
                    ]);
                }
            }).catch(e => console.error(e));

        // Fetch bank txs
        fetch('/api/bank')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBankTransactions(data.map(tx => ({ ...tx, date: new Date(tx.date) })));
                }
            }).catch(e => console.error(e));
        
        // Fetch Settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data) setCompanySettings(data);
                else {
                    if (user === 'tech') setCompanySettings({ 
                        name: "TechStudio S.L.", 
                        nif: "B12345678", 
                        address: "Distrito 22@, Barcelona",
                        accountantName: "Gestoría López & Asoc.",
                        accountantEmail: "info@gestorialopez.es"
                    });
                    if (user === 'cafe') setCompanySettings({ 
                        name: "Cafetería El Grano", 
                        nif: "B87654321", 
                        address: "Plaza Mayor 5, Madrid",
                        accountantName: "Asesoría Pymes Madrid",
                        accountantEmail: "fiscal@asesoriapymes.com"
                    });
                }
            }).catch(e => console.error(e));

        // Fetch Events
        fetch('/api/events')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setEvents(data); })
            .catch(e => console.error(e));

        // Fetch Recurring
        fetch('/api/recurring')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setRecurringInvoices(data); })
            .catch(e => console.error(e));

        if (storedExportLogs) {
            try { 
                const parsed = JSON.parse(storedExportLogs).map((log: any) => ({ ...log, date: new Date(log.date) }));
                setExportLogs(parsed); 
            } catch (e) {}
        }

        setIsLoaded(true);
    }, [status, session]);

    // Save to localStorage when state changes (Only export logs left!)
    useEffect(() => {
        if (isLoaded && currentUser !== 'default') {
            localStorage.setItem(`kaxera_v1_export_${currentUser}`, JSON.stringify(exportLogs));
        }
    }, [exportLogs, isLoaded, currentUser]);

    const addContact = async (contact: Omit<Contact, 'id'>) => {
        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact)
            });
            if (res.ok) {
                const newContact = await res.json();
                setContacts(prev => [...prev, newContact]);
            }
        } catch (error) {
            console.error("Error adding contact", error);
        }
    };

    const addExportLog = (log: Omit<ExportLog, 'id'>) => {
        setExportLogs(prev => [{ ...log, id: "exp_" + Date.now().toString() }, ...prev]);
    };

    const matchTransaction = async (transactionId: string, invoiceId: string) => {
        try {
            const res = await fetch('/api/bank', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId, invoiceId })
            });
            if (res.ok) {
                setBankTransactions(prev => prev.map(tx => 
                    tx.id === transactionId ? { ...tx, matchedInvoiceId: invoiceId } : tx
                ));
                setInvoices(prev => prev.map(inv => 
                    inv.id === invoiceId ? { ...inv, status: 'cobrada' } : inv
                ));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const syncBankTransactions = async () => {
        try {
            const res = await fetch('/api/bank', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setBankTransactions(data.map((tx: any) => ({ ...tx, date: new Date(tx.date) })));
            }
        } catch (error) {
            console.error(error);
        }
    };


    const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoice)
            });
            if (res.ok) {
                const newInvoice = await res.json();
                setInvoices(prev => [{ ...newInvoice, date: new Date(newInvoice.date) }, ...prev]);
            }
        } catch (error) {
            console.error("Error adding invoice to DB", error);
        }
    };

    const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
            if (res.ok) {
                const newEv = await res.json();
                setEvents(prev => [...prev, newEv]);
            }
        } catch (error) { console.error(error); }
    };

    const removeEvent = async (id: string) => {
        try {
            const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEvents(prev => prev.filter(e => e.id !== id));
            }
        } catch (error) { console.error(error); }
    };

    const addRecurringInvoice = async (inv: Omit<RecurringInvoice, 'id'>) => {
        try {
            const res = await fetch('/api/recurring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inv)
            });
            if (res.ok) {
                const newRec = await res.json();
                setRecurringInvoices(prev => [...prev, newRec]);
            }
        } catch (error) { console.error(error); }
    };

    const toggleRecurringInvoice = async (id: string) => {
        const inv = recurringInvoices.find(r => r.id === id);
        if (!inv) return;
        try {
            const res = await fetch('/api/recurring', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !inv.active })
            });
            if (res.ok) {
                setRecurringInvoices(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
            }
        } catch (error) { console.error(error); }
    };

    const totalDevengado = Number(invoices
        .filter(inv => inv.type === 'ingreso')
        .reduce((sum, inv) => sum + inv.vat, 0).toFixed(2));

    const totalSoportado = Number(invoices
        .filter(inv => inv.type === 'gasto')
        .reduce((sum, inv) => sum + inv.vat, 0).toFixed(2));

    const setCompanySettingsAPI = async (settings: CompanySettings) => {
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                const saved = await res.json();
                setCompanySettings(saved);
            }
        } catch (error) { console.error(error); }
    };

    return (
        <FinanceContext.Provider value={{ 
            invoices, 
            addInvoice, 
            contacts,
            addContact,
            exportLogs,
            addExportLog,
            totalDevengado, 
            totalSoportado,
            events,
            addEvent,
            removeEvent,
            companySettings,
            setCompanySettings: setCompanySettingsAPI,
            recurringInvoices,
            addRecurringInvoice,
            toggleRecurringInvoice,
            bankTransactions,
            matchTransaction,
            syncBankTransactions,
            currentUser,
            isLoaded
        }}>
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
}
