import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        let user = await prisma.user.findFirst();
        if (!user) return NextResponse.json(null);

        const settings = await prisma.companySettings.findUnique({
            where: { userId: user.id }
        });
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, nif, address, accountantName, accountantEmail, logoUrl } = body;
        
        let user = await prisma.user.findFirst();
        if (!user) user = await prisma.user.create({ data: { email: "admin@kaxera.com", password: "pwd", name: "Admin" } });

        const settings = await prisma.companySettings.upsert({
            where: { userId: user.id },
            update: { name, nif, address, accountantName, accountantEmail, logoUrl },
            create: { name, nif, address, accountantName, accountantEmail, logoUrl, userId: user.id }
        });
        
        return NextResponse.json(settings, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
