import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(contacts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, name, nif, address, email, phone } = body;
        
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: { email: "admin@kaxera.com", password: "pwd", name: "Admin" }
            });
        }

        const contact = await prisma.contact.create({
            data: {
                type,
                name,
                nif: nif || '',
                address: address || '',
                email: email || '',
                phone: phone || '',
                userId: user.id
            }
        });
        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }
}
