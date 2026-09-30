import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const txs = await prisma.bankTransaction.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(txs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch bank txs" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // This mocks the "Sync" button connecting to PSD2
    try {
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: { email: "admin@kaxera.com", password: "pwd", name: "Admin" }
            });
        }

        const newTxs = [
            { date: new Date(), description: "INGRESO SUSCRIPCIÓN B2B", amount: 1500.00, userId: user.id },
            { date: new Date(), description: "CARGO DOMICILIADO LUZ", amount: -85.30, userId: user.id },
            { date: new Date(), description: "PAGO NOMINA", amount: -1200.00, userId: user.id }
        ];

        await prisma.bankTransaction.createMany({ data: newTxs });
        
        const all = await prisma.bankTransaction.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(all, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to sync bank txs" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    // Para hacer el match de conciliación bancaria
    try {
        const body = await request.json();
        const { transactionId, invoiceId } = body;
        
        const tx = await prisma.bankTransaction.update({
            where: { id: transactionId },
            data: { matchedInvoiceId: invoiceId }
        });

        // Opcional: si la factura es un ingreso, ponerla como pagada
        // Primero intentamos buscar en invoices
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice) {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'PAGADA' }
            });
        } else {
            // Si no está en invoices, probar con expenses (gastos)
            const expense = await prisma.expense.findUnique({ where: { id: invoiceId } });
            if (expense) {
                // expense model doesn't have status, wait, I can just ignore it for now or add it later
            }
        }

        return NextResponse.json(tx);
    } catch (error) {
        return NextResponse.json({ error: "Failed to match" }, { status: 500 });
    }
}
