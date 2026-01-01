import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const limit = searchParams.get('limit') || '100';
  const sort = searchParams.get('sort') || 'DESC';
  const timeframe = searchParams.get('timeframe');

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
    // Calculate date range based on timeframe
    const dateTo = new Date();
    let dateFrom = new Date();
    
    if (timeframe === '1d') {
      dateFrom.setDate(dateFrom.getDate() - 1);
    } else if (timeframe === '5d') {
      dateFrom.setDate(dateFrom.getDate() - 5);
    } else if (timeframe === '1m') {
      dateFrom.setMonth(dateFrom.getMonth() - 1);
    } else if (timeframe === '6m') {
      dateFrom.setMonth(dateFrom.getMonth() - 6);
    } else if (timeframe === 'YTD') {
      dateFrom = new Date(new Date().getFullYear(), 0, 1);
    } else if (timeframe === '1y') {
      dateFrom.setFullYear(dateFrom.getFullYear() - 1);
    } else if (timeframe === '5y') {
      dateFrom.setFullYear(dateFrom.getFullYear() - 5);
    } else {
      // Default to 30 days if no timeframe specified
      dateFrom.setDate(dateFrom.getDate() - 30);
    }
    
    const dateToStr = dateTo.toISOString().split('T')[0];
    const dateFromStr = dateFrom.toISOString().split('T')[0];

    const marketstackUrl = `http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=${encodeURIComponent(symbol)}&sort=${sort}&date_from=${dateFromStr}&date_to=${dateToStr}&limit=${limit}`;
    
    console.log('Fetching historical data for:', symbol);
    
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
          error: 'Failed to fetch historical data',
          message: data.error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Transform EOD data to chart format with OHLC data
    const chartData = [];
    if (data.data && data.data.length > 0) {
      for (const item of data.data) {
        const date = new Date(item.date);
        const timestamp = date.getTime();
        
        chartData.push({
          time: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          }),
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }),
          fullDate: date,
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

    // Sort by timestamp ascending for chart
    chartData.sort((a, b) => a.timestamp - b.timestamp);

    console.log('Historical data fetched:', { 
      symbol: symbol,
      dataPoints: chartData.length
    });

    return NextResponse.json({ 
      data: chartData,
      symbol: symbol
    });
  } catch (error: any) {
    console.error('Error fetching historical data:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical data',
        message: error?.message || 'Unknown error occurred',
        type: error?.name || 'Error'
      },
      { status: 500 }
    );
  }
}

