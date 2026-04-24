import { NextResponse } from 'next/server';

// We hardcode the Render URL here so Next.js knows exactly where to forward the request
const EXTERNAL_API_URL = 'https://garment-classifier-api.onrender.com/classify';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // The Next.js server makes the request to Render, bypassing browser CORS entirely!
        const response = await fetch(EXTERNAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `External API error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}