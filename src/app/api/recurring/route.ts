import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const reqs = await prisma.recurringInvoice.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const mapped = reqs.map(r => ({
            ...r,
            nextDate: r.nextDate.toISOString().split('T')[0]
        }));
        return NextResponse.json(mapped);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch recurring" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { client, concept, amount, period, nextDate } = body;
        
        let user = await prisma.user.findFirst();
        if (!user) user = await prisma.user.create({ data: { email: "admin@kaxera.com", password: "pwd", name: "Admin" } });

        const r = await prisma.recurringInvoice.create({
            data: {
                client,
                concept,
                amount: parseFloat(amount),
                period,
                nextDate: new Date(nextDate),
                userId: user.id
            }
        });
        return NextResponse.json({ ...r, nextDate: r.nextDate.toISOString().split('T')[0] }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, active } = body;
        const updated = await prisma.recurringInvoice.update({
            where: { id },
            data: { active }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
