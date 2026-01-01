import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1min';

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.MARKETSTACK_API_KEY;
  if (!apiKey) {
    console.error('MARKETSTACK_API_KEY environment variable is not set');
    return NextResponse.json(
      { 
        error: 'Marketstack API key not configured',
        message: 'Please set MARKETSTACK_API_KEY in your .env.local file'
      },
      { status: 500 }
    );
  }

  try {
    const marketstackUrl = `http://api.marketstack.com/v1/intraday?access_key=${apiKey}&symbols=${encodeURIComponent(symbol)}&interval=${interval}`;
    
    console.log('Fetching intraday data for:', symbol);
    
    const response = await fetch(marketstackUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Marketstack API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          error: `Marketstack API returned an error`,
          status: response.status,
          statusText: response.statusText,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Marketstack API returned error:', data.error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch intraday data',
          message: data.error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    const chartData = [];
    if (data.data && data.data.length > 0) {
      for (const item of data.data) {
        const date = new Date(item.date);
        const timestamp = date.getTime();
        
        chartData.push({
          time: date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          price: item.close,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume || 0,
          timestamp: timestamp
        });
      }
    }

    chartData.sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({ 
      data: chartData,
      symbol: symbol
    });
  } catch (error: any) {
    console.error('Error fetching intraday data:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch intraday data',
        message: error?.message || 'Unknown error occurred',
        type: error?.name || 'Error'
      },
      { status: 500 }
    );
  }
}

