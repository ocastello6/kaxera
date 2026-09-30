"use client"
import { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
    const { invoices, currentUser, companySettings } = useFinance();
    const [activeTab, setActiveTab] = useState<'roster' | 'expenses' | 'calendar' | 'analytics'>('roster');
    
    // DB State
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Mapear los datos de BD para que coincidan con la estructura que espera el front
                    const mapped = data.map(emp => ({
                        ...emp,
                        role: emp.endDate ? "Temporal" : "Indefinido",
                        irpf: emp.gross * 0.15,
                        ss: emp.gross * 0.30
                    }));
                    setEmployees(mapped);
                }
            })
            .catch(err => console.error("Error cargando empleados reales:", err));
    }, []);

    // Cálculos de nóminas
    const totalGross = employees.reduce((acc, emp) => acc + emp.gross, 0);
    const totalCost = employees.reduce((acc, emp) => acc + (emp.gross + emp.ss), 0);
    const totalIRPF = employees.reduce((acc, emp) => acc + emp.irpf, 0);
    
    // Rentabilidad (Analytics)
    const currentMonthIncomes = invoices
        .filter(inv => inv.type === 'ingreso')
        .reduce((sum, inv) => sum + inv.amount, 0) / 12 || (currentUser === 'cafe' ? 6000 : (currentUser === 'admin' ? 0 : 15000)); 
    
    const revenuePerEmployee = employees.length > 0 ? currentMonthIncomes / employees.length : 0;
    const isProfitable = employees.length > 0 ? revenuePerEmployee > (totalCost / employees.length) : false;

    // 2. Mock Data: Dietas y Gastos
    const pendingExpenses = currentUser === 'admin' ? [] : (currentUser === 'cafe' ? [
        { id: 1, emp: "Pedro Muñoz", concept: "Ticket parking", amount: 8.50, date: "12/03/2026" }
    ] : [
        { id: 1, emp: "Juan Pérez", concept: "Comida con cliente (Restaurante El Mirador)", amount: 56.50, date: "24/05/2026" },
        { id: 2, emp: "María Gómez", concept: "Taxi al aeropuerto", amount: 28.00, date: "22/05/2026" }
    ]);

    // Estado del modal de Nuevo Empleado
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isContractGenerated, setIsContractGenerated] = useState(false);

    const handleDownloadPayslip = async (emp: any) => {
        const html2pdf = (await import('html2pdf.js')).default;
        
        // Creamos una nómina virtual en HTML para el PDF
        const content = document.createElement('div');
        content.innerHTML = `
            <div style="padding: 40px; font-family: sans-serif; color: #333; min-height: 800px; background: white;">
                <div style="border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="margin: 0; color: #1e293b; font-size: 28px;">RECIBO INDIVIDUAL DE SALARIO</h1>
                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Generado por TaxTwin Nóminas</p>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                    <div style="width: 48%; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h3 style="margin-top: 0; color: #475569; font-size: 12px; text-transform: uppercase;">Datos de la Empresa</h3>
                        <p style="margin: 5px 0;"><strong>${companySettings.name}</strong></p>
                        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">NIF: ${companySettings.nif}</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">${companySettings.address}</p>
                    </div>
                    
                    <div style="width: 48%; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h3 style="margin-top: 0; color: #475569; font-size: 12px; text-transform: uppercase;">Datos del Trabajador</h3>
                        <p style="margin: 5px 0;"><strong>${emp.name}</strong></p>
                        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Puesto: ${emp.role}</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Nº Afiliación SS: Oculto</p>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                    <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                            <th style="padding: 12px; text-align: left;">Conceptos</th>
                            <th style="padding: 12px; text-align: right;">Devengos (Bruto)</th>
                            <th style="padding: 12px; text-align: right;">Deducciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px;">Salario Base</td>
                            <td style="padding: 12px; text-align: right;">${emp.gross.toFixed(2)} €</td>
                            <td style="padding: 12px; text-align: right;"></td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px;">IRPF</td>
                            <td style="padding: 12px; text-align: right;"></td>
                            <td style="padding: 12px; text-align: right;">${emp.irpf.toFixed(2)} €</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px;">Coste Seg. Social Empleado</td>
                            <td style="padding: 12px; text-align: right;"></td>
                            <td style="padding: 12px; text-align: right;">${(emp.gross * 0.0635).toFixed(2)} €</td>
                        </tr>
                    </tbody>
                </table>

                <div style="width: 50%; margin-left: auto; border: 2px solid #1e293b; border-radius: 8px; padding: 15px; margin-top: 40px; background: #f8fafc;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: bold; color: #475569;">Total Devengado:</span>
                        <span>${emp.gross.toFixed(2)} €</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: bold; color: #475569;">Total A Deducir:</span>
                        <span>${(emp.irpf + (emp.gross * 0.0635)).toFixed(2)} €</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid #cbd5e1;">
                        <span style="font-weight: 900; font-size: 18px; color: #0f172a;">LÍQUIDO A PERCIBIR:</span>
                        <span style="font-weight: 900; font-size: 18px; color: #2563eb;">${(emp.gross - emp.irpf - (emp.gross * 0.0635)).toFixed(2)} €</span>
                    </div>
                </div>

                <div style="margin-top: 60px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center; color: #94a3b8; font-size: 12px;">
                    <p>Firma y sello de la empresa</p>
                    <div style="width: 200px; height: 60px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #cbd5e1; font-style: italic;">[Firma Digital]</span>
                    </div>
                </div>
            </div>
        `;
        
        const opt = {
            margin:       0,
            filename:     `Nomina_${emp.name.replace(/\s+/g, '_')}_Mes.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(opt as any).from(content).save();
        toast.success(`Nómina de ${emp.name} generada`);
    };
    const [newEmpData, setNewEmpData] = useState({
        name: '',
        dni: '',
        ss: '',
        start: '',
        end: ''
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
    };

    const handleGenerateContract = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newEmpData.name,
                    dni: newEmpData.dni,
                    ssNum: newEmpData.ss,
                    startDate: newEmpData.start,
                    endDate: newEmpData.end || null,
                    gross: 2000 // default base salary for now
                })
            });
            
            if (res.ok) {
                const savedEmployee = await res.json();
                // Actualizar la tabla local
                setEmployees(prev => [
                    {
                        ...savedEmployee,
                        role: savedEmployee.endDate ? "Temporal" : "Indefinido",
                        irpf: savedEmployee.gross * 0.15,
                        ss: savedEmployee.gross * 0.30
                    },
                    ...prev
                ]);
                setIsContractGenerated(true);
            } else {
                console.error("Error guardando empleado en BD");
                alert("Error de servidor. Revisa la base de datos.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setIsContractGenerated(false);
            setNewEmpData({ name: '', dni: '', ss: '', start: '', end: '' });
        }, 300);
    };

    return (
        <div className="w-full h-full bg-gray-50 dark:bg-slate-950 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 dark:bg-slate-950 shadow-sm p-6 flex justify-between items-center border-b border-gray-100 dark:border-slate-700 z-10 relative">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center">
                        <i className="fa-solid fa-users-gear text-indigo-600 mr-3"></i>
                        Portal de Empleados (RRHH)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        Gestión de nóminas, dietas y rentabilidad de tu equipo.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center shadow-md shadow-indigo-600/20 transition-all"
                >
                    <i className="fa-solid fa-user-plus mr-2"></i>
                    Nuevo Empleado
                </button>
            </header>

            <div className="flex-1 overflow-auto p-8 max-w-7xl mx-auto w-full space-y-8">
                
                {/* KPIs Top */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl mr-4">
                            <i className="fa-solid fa-users"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Plantilla Activa</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{employees.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl mr-4">
                            <i className="fa-solid fa-money-bill-transfer"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Coste Total Mes (Sueldo + SS)</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{formatCurrency(totalCost)}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
                        <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xl mr-4">
                            <i className="fa-solid fa-piggy-bank"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Retención IRPF (Modelo 111)</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{formatCurrency(totalIRPF)}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mr-4">
                            <i className="fa-solid fa-arrow-trend-up"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Ingreso por Empleado</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{formatCurrency(revenuePerEmployee)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Nóminas y Dietas */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Tabla de Nóminas */}
                        <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="bg-slate-900 dark:bg-slate-950 p-5 text-white flex justify-between items-center">
                                <h2 className="text-lg font-bold"><i className="fa-solid fa-file-invoice-dollar mr-2 text-indigo-400"></i> Gestión de Nóminas</h2>
                                <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors border border-slate-600">
                                    Generar Remesa SEPA
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Empleado</th>
                                            <th className="px-6 py-4 text-right">Sueldo Bruto</th>
                                            <th className="px-6 py-4 text-right">Seguridad Social (Empresa)</th>
                                            <th className="px-6 py-4 text-right text-indigo-600">Coste Real</th>
                                            <th className="px-6 py-4 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {employees.map(emp => (
                                            <tr key={emp.id} className="hover:bg-slate-50 dark:bg-slate-800">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 dark:text-slate-50">{emp.name}</p>
                                                    <p className="text-xs text-slate-500">{emp.role}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">{formatCurrency(emp.gross)}</td>
                                                <td className="px-6 py-4 text-right text-slate-500">{formatCurrency(emp.ss)}</td>
                                                <td className="px-6 py-4 text-right font-black text-slate-800 dark:text-slate-200">{formatCurrency(emp.gross + emp.ss)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => handleDownloadPayslip(emp)}
                                                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                                                        title="Descargar Nómina PDF"
                                                    >
                                                        <i className="fa-solid fa-download"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Escáner de Dietas */}
                        <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="bg-slate-900 dark:bg-slate-950 p-5 text-white flex justify-between items-center">
                                <h2 className="text-lg font-bold"><i className="fa-solid fa-receipt mr-2 text-orange-400"></i> Dietas y Gastos Pendientes</h2>
                                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingExpenses.length} por revisar</span>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {pendingExpenses.map(exp => (
                                        <div key={exp.id} className="flex justify-between items-center p-4 border border-orange-100 bg-orange-50/30 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-white dark:bg-slate-900 dark:bg-slate-950 border border-orange-200 text-orange-500 rounded-lg flex items-center justify-center mr-4">
                                                    <i className="fa-solid fa-utensils"></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{exp.emp}</p>
                                                    <p className="text-sm text-slate-500">{exp.concept} • {exp.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="font-black text-lg text-slate-900 dark:text-slate-50">{formatCurrency(exp.amount)}</span>
                                                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-bold shadow-sm transition-colors">
                                                    Aprobar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Rentabilidad y Vacaciones */}
                    <div className="space-y-8">
                        
                        {/* Rentabilidad */}
                        <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="bg-slate-900 dark:bg-slate-950 p-5 text-white">
                                <h2 className="text-lg font-bold"><i className="fa-solid fa-chart-line mr-2 text-green-400"></i> Rentabilidad de Plantilla</h2>
                            </div>
                            <div className="p-6 flex flex-col justify-center h-48">
                                <p className="text-sm text-slate-500 font-medium mb-1">Ingresos vs Coste (Mensual)</p>
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-3xl font-black text-slate-800 dark:text-slate-200">{formatCurrency(currentMonthIncomes)}</p>
                                    <p className="text-lg font-medium text-red-500">/ {formatCurrency(totalCost)}</p>
                                </div>
                                <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden mb-4 relative">
                                    <div 
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${Math.min(100, (currentMonthIncomes / totalCost) * 100)}%` }}
                                    ></div>
                                </div>
                                {isProfitable ? (
                                    <p className="text-xs text-green-700 font-bold bg-green-50 p-2 rounded border border-green-200">
                                        ✅ Tu plantilla es rentable. Los ingresos cubren los sueldos con margen.
                                    </p>
                                ) : (
                                    <p className="text-xs text-orange-700 font-bold bg-orange-50 p-2 rounded border border-orange-200">
                                        ⚠️ Los costes salariales superan los ingresos este mes.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Vacaciones y Alertas */}
                        <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="bg-slate-900 dark:bg-slate-950 p-5 text-white">
                                <h2 className="text-lg font-bold"><i className="fa-solid fa-plane-departure mr-2 text-blue-400"></i> Calendario de Ausencias</h2>
                            </div>
                            <div className="p-6">
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start mb-4">
                                    <i className="fa-solid fa-circle-exclamation text-blue-500 text-xl mr-3 mt-0.5"></i>
                                    <div>
                                        <p className="font-bold text-blue-800 text-sm">Alerta Fiscal</p>
                                        <p className="text-xs text-blue-700 mt-1">Has bloqueado las vacaciones del 15 al 20 de Octubre por Cierre de Trimestre (Modelos 303 y 111).</p>
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    <li className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                            <span className="font-bold text-slate-900 dark:text-slate-50">Carlos Ruiz</span>
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">2 Nov - 5 Nov</span>
                                    </li>
                                    <li className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                            <span className="font-bold text-slate-900 dark:text-slate-50">Laura Torres</span>
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">18 Oct - 20 Oct (Denegado)</span>
                                    </li>
                                </ul>
                                
                                <Link href="/calendar" className="block text-center w-full mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                    Ver Calendario Completo &rarr;
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal de Nuevo Empleado */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 dark:bg-slate-950/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
                        {/* Cabecera Modal */}
                        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center">
                                <i className="fa-solid fa-file-signature mr-3"></i>
                                {isContractGenerated ? "Contrato Generado" : "Alta de Nuevo Empleado"}
                            </h2>
                            <button onClick={resetModal} className="text-white/70 hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark text-2xl"></i>
                            </button>
                        </div>

                        {/* Cuerpo Modal */}
                        <div className="p-8">
                            {!isContractGenerated ? (
                                <form onSubmit={handleGenerateContract} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block font-black text-slate-900 dark:text-slate-50 mb-2">Nombre y Apellidos</label>
                                            <input 
                                                type="text" required
                                                value={newEmpData.name}
                                                onChange={e => setNewEmpData({...newEmpData, name: e.target.value})}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Ej. Ana Martínez Silva"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-black text-slate-900 dark:text-slate-50 mb-2">DNI / NIE</label>
                                            <input 
                                                type="text" required
                                                value={newEmpData.dni}
                                                onChange={e => setNewEmpData({...newEmpData, dni: e.target.value})}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Ej. 12345678A"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-black text-slate-900 dark:text-slate-50 mb-2">Nº Seguridad Social</label>
                                            <input 
                                                type="text" required
                                                value={newEmpData.ss}
                                                onChange={e => setNewEmpData({...newEmpData, ss: e.target.value})}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Ej. 01 12345678 12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-black text-slate-900 dark:text-slate-50 mb-2">Inicio de Contrato</label>
                                            <input 
                                                type="date" required
                                                value={newEmpData.start}
                                                onChange={e => setNewEmpData({...newEmpData, start: e.target.value})}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-black text-slate-900 dark:text-slate-50 mb-2">Fin (Opcional - Indefinido)</label>
                                            <input 
                                                type="date"
                                                value={newEmpData.end}
                                                onChange={e => setNewEmpData({...newEmpData, end: e.target.value})}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end">
                                        <button 
                                            type="button" 
                                            onClick={resetModal}
                                            className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:text-slate-300 mr-4 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-indigo-200 transition-all flex items-center"
                                        >
                                            Generar Contrato Legal
                                            <i className="fa-solid fa-arrow-right ml-2"></i>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 font-serif text-sm text-slate-800 dark:text-slate-200 shadow-inner overflow-y-auto max-h-[400px]">
                                        <div className="text-center mb-6">
                                            <h3 className="text-lg font-bold uppercase underline">Contrato de Trabajo</h3>
                                            <p className="mt-2 text-slate-500">Documento Oficial de Alta en Seguridad Social</p>
                                        </div>
                                        <p className="mb-4 text-justify leading-relaxed">
                                            En Madrid, a {new Date().toLocaleDateString('es-ES')}, se reúnen de una parte Kaxera Empresa S.L. con CIF B-12345678, y de otra parte <strong>{newEmpData.name || 'el trabajador'}</strong>, mayor de edad, con DNI/NIE <strong>{newEmpData.dni || '_____________'}</strong> y Número de Afiliación a la Seguridad Social <strong>{newEmpData.ss || '_____________'}</strong>.
                                        </p>
                                        <p className="mb-4 text-justify leading-relaxed">
                                            Ambas partes reconocen mutua capacidad legal para suscribir el presente <strong>CONTRATO DE TRABAJO {newEmpData.end ? 'TEMPORAL' : 'INDEFINIDO'}</strong> con arreglo a la normativa legal vigente, estableciéndose como fecha de inicio de la prestación de servicios el <strong>{newEmpData.start ? new Date(newEmpData.start).toLocaleDateString('es-ES') : '_____________'}</strong>.
                                        </p>
                                        <p className="mb-8 text-justify leading-relaxed">
                                            Las condiciones salariales y la jornada de trabajo quedan sujetas al convenio colectivo aplicable. El presente contrato será comunicado al Servicio Público de Empleo Estatal en el plazo reglamentario.
                                        </p>
                                        <div className="grid grid-cols-2 gap-8 text-center mt-12 pt-8 border-t border-slate-300">
                                            <div>
                                                <p className="mb-12">Por la Empresa</p>
                                                <div className="border-b-2 border-slate-400 w-3/4 mx-auto border-dotted"></div>
                                            </div>
                                            <div>
                                                <p className="mb-12">Por el Trabajador</p>
                                                <div className="border-b-2 border-slate-400 w-3/4 mx-auto border-dotted"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                        <div className="flex items-center text-indigo-700">
                                            <i className="fa-solid fa-circle-check text-xl mr-3"></i>
                                            <p className="font-medium text-sm">Contrato generado exitosamente y listo para firma.</p>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button className="bg-white dark:bg-slate-900 dark:bg-slate-950 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded transition-all">
                                                <i className="fa-solid fa-print mr-2"></i> Imprimir
                                            </button>
                                            <button onClick={resetModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow transition-all">
                                                Hecho
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
