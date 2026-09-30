"use client"
import { useState, useEffect } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { useFinance } from '@/context/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
    const { lang } = useLanguage();
    const { totalDevengado, totalSoportado, invoices, addInvoice, currentUser } = useFinance();
    
    // 1. Valores base (ahora se inicializan con el estado global)
    const [devengado, setDevengado] = useState<number | string>(totalDevengado);
    const [soportado, setSoportado] = useState<number | string>(totalSoportado);

    useEffect(() => {
        setDevengado(totalDevengado);
        setSoportado(totalSoportado);
    }, [totalDevengado, totalSoportado]);

    const [amount, setAmount] = useState<number | string>(0);
    
    // 2. Estados para los 3 cajones de la fecha
    const [day, setDay] = useState<number | string>("");
    const [month, setMonth] = useState<number | string>("");
    const [year, setYear] = useState<number | string>("");
    
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Autocompletar con la fecha de hoy por comodidad, pero se puede editar libremente.
        const today = new Date();
        setDay(today.getDate());
        setMonth(today.getMonth() + 1);
        setYear(today.getFullYear());
    }, []);

    const ivaRate = 0.21;
    
    // Cálculos seguros
    const numDevengado = typeof devengado === 'string' ? (parseFloat(devengado) || 0) : devengado;
    const numSoportado = typeof soportado === 'string' ? (parseFloat(soportado) || 0) : soportado;
    const numAmount = typeof amount === 'string' ? (parseFloat(amount) || 0) : amount;

    const currentIvaToPay = Number((numDevengado - numSoportado).toFixed(2));
    const ivaDeductible = Number((numAmount * ivaRate).toFixed(2));
    const newIva = Number((currentIvaToPay - ivaDeductible).toFixed(2));

    // Lógica para determinar el trimestre actual vs trimestre del gasto
    const today = new Date();
    const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
    const currentYear = today.getFullYear();

    const inputDay = parseInt(String(day)) || today.getDate();
    const inputMonth = parseInt(String(month)) || (today.getMonth() + 1);
    const inputYear = parseInt(String(year)) || today.getFullYear();
    
    const inputQuarter = Math.floor((inputMonth - 1) / 3) + 1;
    
    // Si la fecha introducida es de un trimestre futuro, el impacto se retrasa
    const isFutureQuarter = inputYear > currentYear || (inputYear === currentYear && inputQuarter > currentQuarter);
    const isCurrent = !isFutureQuarter;

    // Cálculos Hucha de Impuestos (Tax Provisioning)
    const totalIngresos = invoices.filter(inv => inv.type === 'ingreso').reduce((sum, inv) => sum + inv.amount, 0);
    const mockSaldoBanco = currentUser === 'admin' ? 0 + totalIngresos : 4500 + totalIngresos; // Simulamos que el saldo crece con los ingresos
    const irpfHucha = totalIngresos * 0.15; // 15% retención IRPF simulada
    const ivaHucha = Math.max(0, currentIvaToPay);
    const totalHucha = irpfHucha + ivaHucha;
    const dineroLibre = mockSaldoBanco - totalHucha;

    // Cálculos Break-Even (Punto de Equilibrio)
    const gastosFijosMensuales = currentUser === 'admin' ? 0 : 1500; // Simulación de gastos fijos (oficina, sueldos, cuota autónomo)
    const ingresosEsteMes = invoices
        .filter(inv => inv.type === 'ingreso' && new Date(inv.date).getMonth() === today.getMonth())
        .reduce((sum, inv) => sum + inv.amount, 0);
    const breakEvenProgress = Math.min(100, (ingresosEsteMes / gastosFijosMensuales) * 100);
    const breakEvenSuperado = ingresosEsteMes >= gastosFijosMensuales;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(Math.abs(value));
    };

    const t = {
        es: {
            title: "Radar Inteligente de Tesorería",
            subtitle: `Proyección fiscal en tiempo real (Cierre Trimestre ${currentQuarter})`,
            introTitle: "Paso 1: Configura tu situación fiscal actual",
            introText: "Introduce las ventas y gastos reales que lleva acumulados tu empresa este trimestre. Con estos datos base, el simulador podrá recomendarte la mejor decisión para tu bolsillo.",
            devengado: "IVA Devengado (Tus ventas)",
            soportado: "IVA Soportado (Tus gastos)",
            aPagar: "IVA a Pagar (Si cerraras hoy)",
            aCompensar: "IVA a Compensar (A tu favor)",
            liquidPagar: "Liquidación a final de trimestre",
            liquidComp: "Saldo a favor en el Modelo 303",
            simTitle: "Paso 2: Simulador de Impacto Fiscal",
            simSub: "Prueba a introducir una futura inversión (ej. un coche o servidor nuevo) y una fecha de compra para ver cómo afecta a tu cierre de IVA.",
            expenseBase: "Gasto Previsto (Base Imponible)",
            type: "Tipo de Inversión / Gasto",
            typeOptions: ["Vehículo de empresa (Furgoneta)", "Equipos informáticos y servidores", "Mobiliario de oficina", "Campaña de Marketing / Servicios"],
            dateLabel: "Fecha planificada para la compra",
            dayPlaceholder: "Día",
            monthPlaceholder: "Mes",
            yearPlaceholder: "Año",
            emptyState: "Introduce el importe de tu próximo gasto arriba para visualizar su impacto fiscal.",
            optStrategy: "Estrategia Óptima",
            optBody1: (iva: string) => `Al realizar la compra en el trimestre actual, consigues deducirte <strong>${iva}</strong> de IVA de forma inmediata en este próximo cierre.`,
            optBody2: (iva: string) => `Esta inversión inyecta <strong>${iva}</strong> extra de IVA soportado, poniendo la balanza aún más a tu favor en este trimestre.`,
            saveImmed: "AHORRO INMEDIATO",
            balanceFavor: "SALDO A FAVOR",
            ivaDrops: "Tu pago de IVA baja a:",
            haciendaOwes: "Hacienda pasa a deberte (o te debe más):",
            retain: "🛡️ Proteges tu liquidez y optimizas tu caja.",
            careful: "Impacto Retrasado a Futuro",
            delayedImpact: "IMPACTO RETRASADO",
            carefulBody: (iva: string, q: number, y: number) => `Has programado la compra para el Trimestre ${q} de ${y}. Al ser un trimestre futuro, asumirás la liquidación actual de <strong>${iva}</strong> en el cierre inminente.`,
            liquidationStays: "Tu liquidación en el trimestre actual se mantiene en:",
            deductLater: "⏳ No deducirás este IVA hasta el siguiente cierre trimestral.",
            analyticsTitle: "Analítica en Tiempo Real",
            analyticsSub: "Evolución de Ingresos vs Gastos y desglose de tus salidas de dinero.",
            chartInc: "Ingresos",
            chartExp: "Gastos",
            noData: "Escanea facturas para ver los gráficos."
        },
        en: {
            title: "Intelligent Cash Flow Radar",
            subtitle: `Real-time tax projection (Q${currentQuarter} Close)`,
            introTitle: "Step 1: Set up your current tax situation",
            introText: "Enter your company's actual accumulated sales and expenses for this quarter. With this baseline data, the simulator will recommend the best financial decision.",
            devengado: "Output VAT (Your sales)",
            soportado: "Input VAT (Your expenses)",
            aPagar: "VAT to Pay (If you closed today)",
            aCompensar: "VAT to Recover (In your favor)",
            liquidPagar: "Settlement at quarter end",
            liquidComp: "Positive balance on Tax Form 303",
            simTitle: "Step 2: Continuous Tax Impact Simulator",
            simSub: "Try entering a future investment (e.g., a new car or server) and a purchase date to see how it affects your VAT close.",
            expenseBase: "Planned Expense (Tax Base)",
            type: "Investment / Expense Type",
            typeOptions: ["Company Vehicle (Van)", "IT Equipment and Servers", "Office Furniture", "Marketing Campaign"],
            dateLabel: "Planned purchase date",
            dayPlaceholder: "Day",
            monthPlaceholder: "Month",
            yearPlaceholder: "Year",
            emptyState: "Enter the amount of your next expense above to visualize its tax impact.",
            optStrategy: "Optimal Strategy",
            optBody1: (iva: string) => `By making the purchase in the current quarter, you immediately deduct <strong>${iva}</strong> of input VAT in this upcoming close.`,
            optBody2: (iva: string) => `This investment injects an extra <strong>${iva}</strong> of input VAT, tipping the scale further in your favor this quarter.`,
            saveImmed: "IMMEDIATE SAVINGS",
            balanceFavor: "FAVORABLE BALANCE",
            ivaDrops: "Your VAT payment drops to:",
            haciendaOwes: "The Tax Agency will owe you (or owe you more):",
            retain: "🛡️ You protect your liquidity and optimize cash flow.",
            careful: "Delayed Future Impact",
            delayedImpact: "DELAYED IMPACT",
            carefulBody: (iva: string, q: number, y: number) => `You scheduled the purchase for Q${q} of ${y}. Being a future quarter, you will fully assume the current settlement of <strong>${iva}</strong> now.`,
            liquidationStays: "Your settlement for the current quarter remains at:",
            deductLater: "⏳ You won't deduct this VAT until the following quarterly close.",
            analyticsTitle: "Real-time Analytics",
            analyticsSub: "Income vs Expenses evolution and breakdown of your cash outflows.",
            chartInc: "Income",
            chartExp: "Expenses",
            noData: "Scan invoices to see charts."
        }
    }[lang];

    const renderSimulationResult = () => {
        if (numAmount === 0 || isNaN(numAmount)) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 transition-all animate-fade-in text-center">
                    <i className="fa-solid fa-calculator text-5xl mb-4 opacity-50"></i>
                    <p className="font-medium max-w-sm">{t.emptyState}</p>
                </div>
            );
        }

        if (isCurrent) {
            const messageTitle = newIva >= 0 ? t.optStrategy : (currentIvaToPay >= 0 ? (lang === 'es' ? "¡Cambio de Escenario!" : "Change of Scenario!") : t.optStrategy);
            const messageBody = newIva >= 0 ? t.optBody1(formatCurrency(ivaDeductible)) : t.optBody2(formatCurrency(ivaDeductible));
            const finalColor = newIva >= 0 ? "text-green-600" : "text-blue-600";
            const badgeText = newIva >= 0 ? t.saveImmed : t.balanceFavor;
            const finalStateLabel = newIva >= 0 ? t.ivaDrops : t.haciendaOwes;
            const ahorroColor = newIva >= 0 ? "text-green-700 bg-green-100" : "text-blue-700 bg-blue-100";

            return (
                <div className="w-full h-full bg-green-50 border-2 border-green-400 p-8 rounded-xl flex flex-col justify-center transition-all animate-fade-in shadow-sm">
                    <div className="flex items-center text-green-700 mb-4">
                        <i className="fa-solid fa-circle-check text-3xl mr-3"></i>
                        <h4 className="font-extrabold text-2xl tracking-tight">{messageTitle}</h4>
                    </div>
                    <p className="text-green-900 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: messageBody }}></p>
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-xl shadow-sm border border-green-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">{badgeText}</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">{finalStateLabel}</p>
                        <p className={`text-5xl font-extrabold ${finalColor} tracking-tighter`}>{formatCurrency(newIva)}</p>
                        <p className={`text-sm ${ahorroColor} font-bold mt-3 inline-block px-4 py-1.5 rounded-full shadow-sm`}>
                            {t.retain}
                        </p>
                    </div>
                </div>
            );
        } else {
            const colorDeLiquidacionActual = currentIvaToPay >= 0 ? "text-red-600" : "text-green-600";
            return (
                <div className="w-full h-full bg-orange-50 border-2 border-orange-400 p-8 rounded-xl flex flex-col justify-center transition-all animate-fade-in shadow-sm">
                    <div className="flex items-center text-orange-700 mb-4">
                        <i className="fa-solid fa-triangle-exclamation text-3xl mr-3"></i>
                        <h4 className="font-extrabold text-2xl tracking-tight">{t.careful}</h4>
                    </div>
                    <p className="text-orange-900 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: t.carefulBody(formatCurrency(currentIvaToPay), inputQuarter, inputYear) }}></p>
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-xl shadow-sm border border-orange-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">{t.delayedImpact}</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">{t.liquidationStays}</p>
                        <p className={`text-5xl font-extrabold ${colorDeLiquidacionActual} tracking-tighter`}>{formatCurrency(currentIvaToPay)}</p>
                        <p className="text-sm text-orange-700 font-bold mt-3 bg-orange-100 inline-block px-4 py-1.5 rounded-full shadow-sm">
                            {t.deductLater}
                        </p>
                    </div>
                </div>
            );
        }
    };

    // Prepare data for charts
    const chartMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthlyData = chartMonths.map((m, i) => {
        const monthInvs = invoices.filter(inv => new Date(inv.date).getMonth() === i);
        return {
            name: m,
            ingresos: monthInvs.filter(i => i.type === 'ingreso').reduce((sum, i) => sum + i.amount, 0),
            gastos: monthInvs.filter(i => i.type === 'gasto').reduce((sum, i) => sum + i.amount, 0)
        };
    }).filter(d => d.ingresos > 0 || d.gastos > 0);

    const gastosOnly = invoices.filter(i => i.type === 'gasto');
    const categoryTotals = gastosOnly.reduce((acc, inv) => {
        const cat = inv.category || 'General';
        acc[cat] = (acc[cat] || 0) + inv.amount;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6'];

    const handleGenerateMocks = () => {
        const categoriesIngreso = ["Diseño Web", "Consultoría", "Desarrollo", "Mantenimiento"];
        const categoriesGasto = ["Software", "Marketing", "Mobiliario", "Dietas", "Transporte"];
        
        for (let i = 0; i < 5; i++) {
            const ingrAmt = Math.floor(Math.random() * 2000) + 1000;
            addInvoice({
                type: "ingreso",
                concept: categoriesIngreso[Math.floor(Math.random() * categoriesIngreso.length)],
                category: "Servicios",
                date: new Date(Date.now() - Math.random() * 90 * 86400000), 
                amount: ingrAmt,
                vat: ingrAmt * 0.21,
                status: "cobrada"
            });
            
            const gstAmt = Math.floor(Math.random() * 600) + 200;
            addInvoice({
                type: "gasto",
                concept: "Gasto de prueba",
                category: categoriesGasto[Math.floor(Math.random() * categoriesGasto.length)],
                date: new Date(Date.now() - Math.random() * 90 * 86400000),
                amount: gstAmt,
                vat: gstAmt * 0.21,
                status: "pagada" as any
            });
        }
        
        setTimeout(() => window.location.reload(), 500);
    };

    if (!isMounted) return null;

    return (
        <div className="w-full h-full bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 dark:bg-slate-950 shadow-sm p-4 sm:p-6 flex justify-between items-center border-b border-gray-100 dark:border-slate-700">
                <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-500 tracking-tight">
                            {t.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {t.subtitle}
                        </p>
                    </div>
                    <button 
                        onClick={handleGenerateMocks}
                        className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 font-bold py-1.5 px-3 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 whitespace-nowrap"
                        title="Generar 10 facturas aleatorias para ver los gráficos"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                        Auto-Rellenar
                    </button>
                </div>
            </header>

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
                
                {/* Salud Financiera y Break-Even */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    
                    {/* Hucha de Impuestos (Tax Provisioning) */}
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold"><i className="fa-solid fa-piggy-bank mr-2 text-pink-400"></i> Hucha de Impuestos</h2>
                                <p className="text-slate-400 text-sm mt-1">Dinero apartado virtualmente en tiempo real.</p>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-end border-b border-gray-100 dark:border-slate-700 pb-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Saldo en Banco (Simulado)</p>
                                    <p className="text-3xl font-black text-slate-800 dark:text-slate-200">{formatCurrency(mockSaldoBanco)}</p>
                                </div>
                                <i className="fa-solid fa-building-columns text-4xl text-slate-200"></i>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-pink-50 p-4 rounded-lg border border-pink-100 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-16 h-16 bg-pink-100 rounded-bl-full -z-0"></div>
                                    <p className="text-xs font-bold text-pink-700 uppercase mb-1 relative z-10">Hucha Intocable</p>
                                    <p className="text-2xl font-black text-pink-600 relative z-10">-{formatCurrency(totalHucha)}</p>
                                    <p className="text-xs text-pink-600/70 mt-1 relative z-10 font-medium">IVA ({formatCurrency(ivaHucha)}) + IRPF ({formatCurrency(irpfHucha)})</p>
                                </div>
                                
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-16 h-16 bg-green-100 rounded-bl-full -z-0"></div>
                                    <p className="text-xs font-bold text-green-700 uppercase mb-1 relative z-10">Tu Dinero Libre</p>
                                    <p className="text-2xl font-black text-green-600 relative z-10">{formatCurrency(dineroLibre)}</p>
                                    <p className="text-xs text-green-600/70 mt-1 relative z-10 font-medium">Disponible para gastar 🟢</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calculadora Break-Even */}
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold"><i className="fa-solid fa-bullseye mr-2 text-orange-400"></i> Punto de Equilibrio (Break-Even)</h2>
                                <p className="text-slate-400 text-sm mt-1">¿Cuándo cubres tus gastos fijos este mes?</p>
                            </div>
                        </div>
                        <div className="p-8 flex flex-col justify-center h-[calc(100%-88px)]">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{formatCurrency(ingresosEsteMes)} <span className="text-lg font-medium text-slate-400">/ {formatCurrency(gastosFijosMensuales)}</span></p>
                                </div>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${breakEvenSuperado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {breakEvenSuperado ? '¡Superado!' : 'En progreso'}
                                </span>
                            </div>
                            
                            <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-6 overflow-hidden relative">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${breakEvenSuperado ? 'bg-green-500' : 'bg-orange-500'}`}
                                    style={{ width: `${breakEvenProgress}%` }}
                                ></div>
                                {/* Marca del 100% */}
                                <div className="absolute top-0 right-0 h-full w-1 bg-slate-300"></div>
                            </div>

                            {breakEvenSuperado ? (
                                <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-start border border-green-200">
                                    <i className="fa-solid fa-champagne-glasses text-2xl mr-4 text-green-500 mt-1"></i>
                                    <div>
                                        <p className="font-bold">¡Beneficio Neto Desbloqueado!</p>
                                        <p className="text-sm mt-1 text-green-700">Ya has cubierto los {formatCurrency(gastosFijosMensuales)} de costes fijos. Cada factura extra que emitas este mes es pura rentabilidad.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-orange-50 text-orange-800 p-4 rounded-lg flex items-start border border-orange-200">
                                    <i className="fa-solid fa-person-running text-2xl mr-4 text-orange-500 mt-1"></i>
                                    <div>
                                        <p className="font-bold">A un paso del Break-Even</p>
                                        <p className="text-sm mt-1 text-orange-700">Te faltan {formatCurrency(gastosFijosMensuales - ingresosEsteMes)} para cubrir costes. ¡Cierra un cliente más y empezarás a ganar dinero neto!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gráficos Recharts Profesionales */}
                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white">
                        <h2 className="text-xl font-bold"><i className="fa-solid fa-chart-line mr-2 text-indigo-400"></i> Analítica del Trimestre</h2>
                        <p className="text-slate-400 text-sm mt-1">Comparativa visual de ingresos y gastos.</p>
                    </div>
                    <div className="p-8 h-96">
                        {invoices.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { name: 'Mes Actual', Ingresos: totalIngresos, Gastos: invoices.filter(inv => inv.type === 'gasto').reduce((sum, inv) => sum + inv.amount, 0) }
                                    ]}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}€`} />
                                    <RechartsTooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    <Bar dataKey="Gastos" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <i className="fa-solid fa-chart-bar text-4xl mb-3 opacity-50"></i>
                                <p>No hay suficientes datos para mostrar gráficos.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Paso 1 */}
                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold"><i className="fa-solid fa-sliders mr-2 text-blue-400"></i> {t.introTitle}</h2>
                            <p className="text-slate-400 text-sm mt-1">{t.introText}</p>
                        </div>
                    </div>
                    
                    <div className="p-4 sm:p-8 bg-gray-50 dark:bg-slate-950/30">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:border-blue-300 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <label className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-blue-600 cursor-pointer">{t.devengado}</label>
                                    <i className="fa-solid fa-arrow-trend-up text-green-500"></i>
                                </div>
                                <div className="mt-2 flex items-center">
                                    <span className="text-xl font-bold text-gray-400 mr-2">€</span>
                                    <input 
                                        type="number" 
                                        value={devengado} 
                                        onChange={(e) => setDevengado(e.target.value)}
                                        className="text-3xl font-bold text-gray-800 dark:text-gray-200 w-full bg-transparent border-b-2 border-dashed border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none transition-colors pb-1 hide-arrows" 
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:border-blue-300 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <label className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-blue-600 cursor-pointer">{t.soportado}</label>
                                    <i className="fa-solid fa-receipt text-blue-500"></i>
                                </div>
                                <div className="mt-2 flex items-center">
                                    <span className="text-xl font-bold text-gray-400 mr-2">€</span>
                                    <input 
                                        type="number" 
                                        value={soportado} 
                                        onChange={(e) => setSoportado(e.target.value)}
                                        className="text-3xl font-bold text-gray-800 dark:text-gray-200 w-full bg-transparent border-b-2 border-dashed border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none transition-colors pb-1 hide-arrows" 
                                    />
                                </div>
                            </div>
                            
                            <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden transition-colors ${currentIvaToPay > 0 ? "bg-red-50 border-red-200" : (currentIvaToPay < 0 ? "bg-green-50 border-green-200" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700")}`}>
                                <div className="absolute -right-4 -bottom-4 text-gray-400 opacity-20 text-7xl"><i className="fa-solid fa-building-columns"></i></div>
                                <h3 className={`text-lg font-extrabold relative z-10 ${currentIvaToPay > 0 ? "text-red-800" : (currentIvaToPay < 0 ? "text-green-800" : "text-slate-800 dark:text-slate-200")}`}>
                                    {currentIvaToPay >= 0 ? t.aPagar : t.aCompensar}
                                </h3>
                                <p className={`text-5xl font-black mt-2 relative z-10 ${currentIvaToPay > 0 ? "text-red-600" : (currentIvaToPay < 0 ? "text-green-600" : "text-slate-600 dark:text-slate-400")}`}>
                                    {formatCurrency(currentIvaToPay)}
                                </p>
                                <p className={`text-sm mt-2 font-bold relative z-10 ${currentIvaToPay > 0 ? "text-red-700" : (currentIvaToPay < 0 ? "text-green-700" : "text-slate-700 dark:text-slate-300")}`}>
                                    {currentIvaToPay >= 0 ? t.liquidPagar : t.liquidComp}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold"><i className="fa-solid fa-chart-pie mr-2 text-purple-400"></i> {t.analyticsTitle}</h2>
                            <p className="text-slate-400 text-sm mt-1">{t.analyticsSub}</p>
                        </div>
                    </div>
                    <div className="p-8">
                        {invoices.length === 0 ? (
                            <div className="text-center text-slate-400 py-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <i className="fa-solid fa-chart-line text-4xl mb-3 opacity-30"></i>
                                <p className="font-medium">{t.noData}</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="h-80 flex flex-col">
                                    <h3 className="text-center font-bold text-slate-600 dark:text-slate-400 mb-4">{t.chartInc} vs {t.chartExp}</h3>
                                    <div className="flex-1 min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                                <Legend wrapperStyle={{fontSize: '12px', fontWeight: 'bold', paddingTop: '20px'}} />
                                                <Bar dataKey="ingresos" name={t.chartInc} fill="#22c55e" radius={[4, 4, 0, 0]} barSize={32} />
                                                <Bar dataKey="gastos" name={t.chartExp} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="h-80 flex flex-col">
                                    <h3 className="text-center font-bold text-slate-600 dark:text-slate-400 mb-4">Desglose de Gastos</h3>
                                    {pieData.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
                                            <i className="fa-solid fa-receipt text-3xl mb-2 opacity-50"></i>
                                            <p className="text-sm font-medium">No hay gastos registrados.</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-h-0 pb-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart margin={{ bottom: 20 }}>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                                    <Legend wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tax Simulator */}
                <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-900 dark:bg-slate-950 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold"><i className="fa-solid fa-wand-magic-sparkles mr-2 text-yellow-400"></i> {t.simTitle}</h2>
                            <p className="text-slate-400 text-sm mt-1">{t.simSub}</p>
                        </div>
                    </div>
                    
                    <div className="p-8 grid md:grid-cols-2 gap-12 items-center">
                        {/* Inputs */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-base font-extrabold text-slate-900 dark:text-slate-50 mb-2">{t.expenseBase}</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 dark:text-gray-400 text-lg font-bold">€</span>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-bold text-slate-900 dark:text-slate-50 transition-all hide-arrows" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-base font-extrabold text-slate-900 dark:text-slate-50 mb-2">{t.type}</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. Equipos informáticos..."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-slate-900 dark:text-slate-50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-extrabold text-slate-900 dark:text-slate-50 mb-2">{t.dateLabel}</label>
                                <div className="flex space-x-3">
                                    <input 
                                        type="number" 
                                        placeholder={t.dayPlaceholder}
                                        value={day}
                                        onChange={(e) => setDay(e.target.value)}
                                        min="1" max="31"
                                        className="w-1/3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center font-bold text-slate-900 dark:text-slate-50 hide-arrows" 
                                    />
                                    <input 
                                        type="number" 
                                        placeholder={t.monthPlaceholder}
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        min="1" max="12"
                                        className="w-1/3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center font-bold text-slate-900 dark:text-slate-50 hide-arrows" 
                                    />
                                    <input 
                                        type="number" 
                                        placeholder={t.yearPlaceholder}
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        min="2000" max="2100"
                                        className="w-1/3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center font-bold text-slate-900 dark:text-slate-50 hide-arrows" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Output / Result */}
                        <div className="h-full min-h-[300px]">
                            {renderSimulationResult()}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                .hide-arrows::-webkit-inner-spin-button, .hide-arrows::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                .hide-arrows { -moz-appearance: textfield; }
            `}} />
        </div>
    );
}
