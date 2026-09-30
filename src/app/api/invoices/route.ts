import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { date: 'desc' }
        });
        
        // Return mapped to what the context expects:
        // FinanceContext expects: { id, type, concept, category, date, amount, vat, status }
        // Oh wait, Invoice in DB doesn't have "type" ("ingreso" | "gasto") or "concept" or "category".
        // Let's map it based on what we have.
        // Wait, the DB schema has Invoice (for ingresos) and Expense (for gastos).
        
        const dbInvoices = invoices.map(inv => ({
            id: inv.id,
            type: 'ingreso',
            concept: inv.clientName,
            category: 'Facturación', // default
            date: inv.date.toISOString(),
            amount: inv.amount,
            vat: inv.vat,
            status: inv.status.toLowerCase()
        }));

        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        });

        const dbExpenses = expenses.map(exp => ({
            id: exp.id,
            type: 'gasto',
            concept: exp.concept,
            providerName: exp.providerName,
            category: exp.category || 'General',
            date: exp.date.toISOString(),
            amount: exp.amount,
            vat: exp.vat,
            status: 'cobrada' // or pagada
        }));

        return NextResponse.json([...dbInvoices, ...dbExpenses]);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, concept, clientName, clientNif, providerName, category, date, amount, vat, status } = body;
        
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: { email: "admin@kaxera.com", password: "pwd", name: "Admin" }
            });
        }

        if (type === 'ingreso') {
            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNum: `INV-${Date.now()}`,
                    date: new Date(date),
                    clientName: concept || clientName || 'Cliente General',
                    clientNif: clientNif || 'B0000000',
                    amount: parseFloat(amount),
                    vat: parseFloat(vat),
                    status: (status || 'PENDIENTE').toUpperCase(),
                    userId: user.id
                }
            });
            return NextResponse.json({
                id: invoice.id,
                type: 'ingreso',
                concept: invoice.clientName,
                category: 'Facturación',
                date: invoice.date.toISOString(),
                amount: invoice.amount,
                vat: invoice.vat,
                status: invoice.status.toLowerCase()
            }, { status: 201 });
        } else {
            const expense = await prisma.expense.create({
                data: {
                    date: new Date(date),
                    providerName: providerName || concept || 'Proveedor',
                    concept: concept || 'Gasto General',
                    amount: parseFloat(amount),
                    vat: parseFloat(vat),
                    category: category || 'General',
                    userId: user.id
                }
            });
            return NextResponse.json({
                id: expense.id,
                type: 'gasto',
                concept: expense.concept,
                category: expense.category || 'General',
                date: expense.date.toISOString(),
                amount: expense.amount,
                vat: expense.vat,
                status: 'cobrada'
            }, { status: 201 });
        }
    } catch (error) {
        console.error("Error creating invoice/expense:", error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
