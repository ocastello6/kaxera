import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const events = await prisma.calendarEvent.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { dateKey, title, color } = body;
        
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({ data: { email: "admin@kaxera.com", password: "pwd", name: "Admin" } });
        }

        const ev = await prisma.calendarEvent.create({
            data: { dateKey, title, color, userId: user.id }
        });
        return NextResponse.json(ev, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (id) {
            await prisma.calendarEvent.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
