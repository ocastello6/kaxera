import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Obtener todos los empleados
export async function GET() {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
}

// POST: Crear un nuevo empleado
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, dni, ssNum, startDate, endDate, gross } = body;
        
        // As we don't have Auth yet, we create a dummy user if none exists, or fetch the first one
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: "admin@kaxera.com",
                    password: "password123",
                    name: "Admin"
                }
            });
        }

        const employee = await prisma.employee.create({
            data: {
                name,
                dni,
                ssNum,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                gross: gross || 0,
                userId: user.id
            }
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        console.error("Error creating employee:", error);
        return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
    }
}
