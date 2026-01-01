import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
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
    // Marketstack doesn't have a search endpoint, so we validate the symbol by trying to fetch EOD data
    const marketstackUrl = `http://api.marketstack.com/v1/eod?access_key=${apiKey}&symbols=${encodeURIComponent(query.toUpperCase())}&limit=1`;
    
    console.log('Validating symbol:', query);
    
    const response = await fetch(marketstackUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();
    
    if (data.error || !data.data || data.data.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Return the symbol as a valid result
    const result = data.data[0];
    const results = [{
      symbol: result.symbol,
      description: `${result.symbol} - ${result.exchange || 'Stock'}`,
      type: 'Common Stock'
    }];

    return NextResponse.json({ 
      results: results
    });
  } catch (error: any) {
    console.error('Error searching stocks:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to search stocks',
        message: error?.message || 'Unknown error occurred',
        type: error?.name || 'Error'
      },
      { status: 500 }
    );
  }
}

