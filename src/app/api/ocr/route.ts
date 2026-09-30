import { NextResponse } from 'next/server';

// Simulación de OCR o conexión a AI (e.g. OpenAI Vision o Google Cloud Vision)
// Recibe un archivo (PDF, JPG, PNG) y extrae sus datos estructurados.
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Aquí iría el código real para enviar el archivo a una API externa:
        // const arrayBuffer = await file.arrayBuffer();
        // const base64 = Buffer.from(arrayBuffer).toString('base64');
        // const aiResponse = await callOpenAIVision(base64);

        // Simulamos un retraso de la IA (2.5 segundos)
        await new Promise(resolve => setTimeout(resolve, 2500));

        const fileName = file.name.toLowerCase();
        
        // Simulación de "Lectura Inteligente" basada en el nombre del archivo
        let provider = "Proveedor Genérico";
        let amount = Math.floor(Math.random() * 200) + 20;
        let category = "General";
        
        if (fileName.includes("amazon") || fileName.includes("aws")) {
            provider = "Amazon Web Services";
            category = "Suscripciones";
            amount = 120.50;
        } else if (fileName.includes("uber") || fileName.includes("taxi")) {
            provider = "Uber Technologies";
            category = "Dietas y Viajes";
            amount = 35.00;
        } else if (fileName.includes("restaurante") || fileName.includes("comida")) {
            provider = "Restaurante La Plaza";
            category = "Dietas y Viajes";
            amount = 45.20;
        } else if (fileName.includes("internet") || fileName.includes("vodafone")) {
            provider = "Vodafone España";
            category = "Oficina";
            amount = 60.00;
        } else {
            provider = `Ticket Extraído: ${file.name.substring(0, 10)}`;
        }

        const vat = Number((amount * 0.21).toFixed(2));
        
        return NextResponse.json({
            concept: provider,
            category,
            date: new Date().toISOString(),
            amount,
            vat
        });

    } catch (error) {
        console.error("Error OCR:", error);
        return NextResponse.json({ error: "Failed to process OCR" }, { status: 500 });
    }
}
