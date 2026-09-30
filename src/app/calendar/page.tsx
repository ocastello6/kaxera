"use client"
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFinance, CalendarEvent } from '@/context/FinanceContext';

export default function CalendarPage() {
    const { lang } = useLanguage();
    const { invoices, events, addEvent, removeEvent } = useFinance();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [eventColor, setEventColor] = useState("bg-blue-500");

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const today = new Date();

    const t = {
        es: {
            title: "Calendario Fiscal",
            subtitle: "Tus obligaciones e hitos financieros",
            days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
            months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
            taxDeadline: "Cierre Trimestral",
            invoiceCount: (n: number) => n === 1 ? "1 Factura" : `${n} Facturas`,
            prev: "Anterior",
            next: "Siguiente",
            addEvent: "Añadir Hito",
            eventName: "Nombre del hito",
            cancel: "Cancelar",
            save: "Guardar",
            colors: {
                blue: "Azul",
                red: "Rojo",
                green: "Verde",
                yellow: "Amarillo",
                purple: "Morado"
            }
        },
        en: {
            title: "Tax Calendar",
            subtitle: "Your financial obligations and milestones",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            taxDeadline: "Quarterly Close",
            invoiceCount: (n: number) => n === 1 ? "1 Invoice" : `${n} Invoices`,
            prev: "Previous",
            next: "Next",
            addEvent: "Add Milestone",
            eventName: "Milestone name",
            cancel: "Cancel",
            save: "Save",
            colors: {
                blue: "Blue",
                red: "Red",
                green: "Green",
                yellow: "Yellow",
                purple: "Purple"
            }
        }
    }[lang];

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; 
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    
    const goToday = () => setCurrentDate(new Date());

    const getDateKey = (year: number, month: number, day: number) => 
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const getInvoicesForDay = (day: number) => {
        return invoices.filter(inv => inv.date.getDate() === day && inv.date.getMonth() === currentMonth && inv.date.getFullYear() === currentYear);
    };

    const getEventsForDay = (day: number) => {
        const key = getDateKey(currentYear, currentMonth, day);
        return events.filter(e => e.dateKey === key);
    };

    const handleDayClick = (day: number) => {
        setSelectedDate(new Date(currentYear, currentMonth, day));
        setEventTitle("");
        setEventColor("bg-blue-500");
        setIsModalOpen(true);
    };

    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDate && eventTitle.trim()) {
            addEvent({
                dateKey: getDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()),
                title: eventTitle.trim(),
                color: eventColor
            });
            setIsModalOpen(false);
        }
    };

    const colorOptions = [
        { class: "bg-blue-500", name: t.colors.blue },
        { class: "bg-red-500", name: t.colors.red },
        { class: "bg-green-500", name: t.colors.green },
        { class: "bg-yellow-500", name: t.colors.yellow },
        { class: "bg-purple-500", name: t.colors.purple },
    ];

    return (
        <div className="w-full h-full bg-gray-50 dark:bg-slate-950 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{t.title}</h1>
                        <p className="text-slate-500 mt-1">{t.subtitle}</p>
                    </div>
                </header>

                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden p-6">
                    
                    {/* Month header & Navigation */}
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div className="flex items-center">
                            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1 shadow-inner">
                                <button onClick={() => setCurrentDate(new Date(currentYear - 1, currentMonth, 1))} className="px-3 py-2 rounded-lg hover:bg-white dark:bg-slate-900 dark:bg-slate-950 hover:shadow-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-all" title="Año Anterior">
                                    <i className="fa-solid fa-angles-left"></i>
                                </button>
                                <button onClick={prevMonth} className="px-3 py-2 rounded-lg hover:bg-white dark:bg-slate-900 dark:bg-slate-950 hover:shadow-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-all" title="Mes Anterior">
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                
                                <span className="px-4 py-1 font-extrabold text-slate-800 dark:text-slate-200 w-48 text-center text-lg select-none">
                                    {t.months[currentMonth]} {currentYear}
                                </span>

                                <button onClick={nextMonth} className="px-3 py-2 rounded-lg hover:bg-white dark:bg-slate-900 dark:bg-slate-950 hover:shadow-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-all" title="Mes Siguiente">
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                                <button onClick={() => setCurrentDate(new Date(currentYear + 1, currentMonth, 1))} className="px-3 py-2 rounded-lg hover:bg-white dark:bg-slate-900 dark:bg-slate-950 hover:shadow-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-all" title="Año Siguiente">
                                    <i className="fa-solid fa-angles-right"></i>
                                </button>
                            </div>
                            
                            <button onClick={goToday} className="ml-4 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm">
                                {lang === 'es' ? 'Volver a Hoy' : 'Go to Today'}
                            </button>
                        </div>

                        <div className="flex space-x-2 hidden md:flex">
                            <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> {t.taxDeadline}</span>
                            <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-slate-800 mr-2"></span> Facturas</span>
                            <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> Ausencias (RRHH)</span>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        {t.days.map((d, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800 text-center py-3 text-sm font-bold text-slate-500">
                                {d}
                            </div>
                        ))}

                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} className="bg-white dark:bg-slate-900 dark:bg-slate-950 min-h-[120px]"></div>
                        ))}

                        {days.map(day => {
                            const isQuarterlyCloseMonth = (currentMonth === 3 || currentMonth === 6 || currentMonth === 9 || currentMonth === 0);
                            const isDeadline = day === 20 && isQuarterlyCloseMonth;
                            const dayInvoices = getInvoicesForDay(day);
                            const dayEvents = getEventsForDay(day);
                            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                            
                            // Mock Absences
                            const absences = [];
                            if (currentMonth === 10 && day >= 2 && day <= 5) { // November
                                absences.push("🏖️ Carlos R.");
                            }
                            if (currentMonth === 9 && day >= 18 && day <= 20) { // October
                                absences.push("❌ Laura T."); // Denegado
                            }

                            return (
                                <div 
                                    key={day} 
                                    onClick={() => handleDayClick(day)}
                                    className={`bg-white dark:bg-slate-900 dark:bg-slate-950 min-h-[120px] p-2 relative transition-colors hover:bg-blue-50 cursor-pointer group ${isToday ? 'ring-2 ring-inset ring-blue-400' : ''}`}
                                >
                                    <span className={`font-bold inline-block w-7 h-7 text-center leading-7 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600'}`}>{day}</span>
                                    
                                    <div className="mt-1 space-y-1 overflow-hidden h-[84px] overflow-y-auto hide-scrollbars">
                                        {/* Fake Deadline mark */}
                                        {isDeadline && (
                                            <div className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded leading-tight shadow-sm border border-red-200 truncate" title={t.taxDeadline}>
                                                🔥 {t.taxDeadline}
                                            </div>
                                        )}

                                        {/* HR Absences */}
                                        {absences.map((abs, idx) => (
                                            <div key={idx} className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded leading-tight shadow-sm truncate ${abs.includes('❌') ? 'bg-slate-400 opacity-60 line-through' : 'bg-teal-500'}`}>
                                                {abs}
                                            </div>
                                        ))}

                                        {/* Custom Events */}
                                        {dayEvents.map(ev => (
                                            <div key={ev.id} className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded leading-tight shadow-sm truncate flex justify-between items-center ${ev.color}`}>
                                                <span className="truncate">{ev.title}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); removeEvent(ev.id); }}
                                                    className="ml-1 hover:text-slate-200 transition-colors"
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        ))}

                                        {/* Invoices mark */}
                                        {dayInvoices.length > 0 && (
                                            <div className="text-[10px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded shadow-sm border border-slate-700 truncate">
                                                🧾 {t.invoiceCount(dayInvoices.length)}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Hover prompt */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        <i className="fa-solid fa-plus text-3xl text-blue-500/20"></i>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal para añadir evento */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900 dark:bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                                {t.addEvent} - {selectedDate?.toLocaleDateString()}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors">
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveEvent} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.eventName}</label>
                                <input 
                                    type="text" 
                                    autoFocus
                                    value={eventTitle}
                                    onChange={e => setEventTitle(e.target.value)}
                                    placeholder="Ej: Pagar nóminas, Revisar IVA..."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-slate-50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Color</label>
                                <div className="flex space-x-3">
                                    {colorOptions.map(c => (
                                        <button
                                            key={c.class}
                                            type="button"
                                            title={c.name}
                                            onClick={() => setEventColor(c.class)}
                                            className={`w-10 h-10 rounded-full ${c.class} shadow-sm border-2 transition-all ${eventColor === c.class ? 'border-slate-800 scale-110' : 'border-transparent opacity-80 hover:opacity-100'}`}
                                        ></button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700 transition-colors"
                                >
                                    {t.cancel}
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-colors"
                                >
                                    {t.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
