import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.MARKETSTACK_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Marketstack API key not configured' },
      { status: 500 }
    );
  }

  // Marketstack doesn't use WebSocket, return API key for polling
  return NextResponse.json({ token: apiKey });
}

