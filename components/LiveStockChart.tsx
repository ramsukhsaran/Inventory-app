"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Search, TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon } from 'lucide-react'
import CandlestickChart from './CandlestickChart'

interface StockData {
  time: string
  date?: string
  fullDate?: Date | string
  price: number
  volume?: number
  timestamp?: number
  open?: number
  high?: number
  low?: number
  close?: number
}

interface StockResult {
  symbol: string
  description: string
  type: string
}

const LiveStockChart = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockResult[]>([])
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [stockData, setStockData] = useState<StockData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [wsToken, setWsToken] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line')
  const [timeframe, setTimeframe] = useState<'1d' | '5d' | '1m' | '6m' | 'YTD' | '1y' | '5y'>('1d')
  const [lastClose, setLastClose] = useState<number | null>(null)
  const wsRef = useRef<NodeJS.Timeout | null>(null)
  const dataRef = useRef<StockData[]>([])
  const previousPriceRef = useRef<number | null>(null)
  const previousSymbolRef = useRef<string | null>(null)
  const historicalDataLoadedRef = useRef<boolean>(false)

  // WebSocket token fetch commented out - not using real-time data
  // useEffect(() => {
  //   const fetchToken = async () => {
  //     try {
  //       const response = await fetch('/api/stocks/ws-token')
  //       const data = await response.json()
  //       if (data.token) {
  //         setWsToken(data.token)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching WebSocket token:', error)
  //     }
  //   }
  //   fetchToken()
  // }, [])

  // Search for stocks
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Error searching stocks:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  // Fetch historical data based on timeframe
  const fetchHistoricalData = useCallback(async (symbol: string, tf: string = timeframe) => {
    setIsLoadingHistorical(true)
    try {
      // Use EOD for all timeframes - pass timeframe to API for proper date range calculation
      const response = await fetch(`/api/stocks/historical?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(tf)}&limit=1000`)
      
      const result = await response.json()
      
      if (result.data && result.data.length > 0) {
        const sortedData = result.data.sort((a: StockData, b: StockData) => 
          (a.timestamp || 0) - (b.timestamp || 0)
        )
        
        dataRef.current = sortedData
        setStockData([...sortedData])
        
        if (sortedData.length > 0) {
          const lastPrice = sortedData[sortedData.length - 1].price
          const firstPrice = sortedData[0].price
          setCurrentPrice(lastPrice)
          previousPriceRef.current = lastPrice
          
          // Set last close (previous day's close) - use first data point's close
          const prevClose = sortedData[0].close || sortedData[0].price
          setLastClose(prevClose)
          
          // Calculate price change from previous close
          setPriceChange(lastPrice - prevClose)
        }
        
        historicalDataLoadedRef.current = true
        console.log('Historical data loaded:', sortedData.length, 'data points')
      } else {
        console.warn('No historical data received')
        dataRef.current = []
        setStockData([])
      }
    } catch (error) {
      console.error('Error fetching historical data:', error)
      dataRef.current = []
      setStockData([])
    } finally {
      setIsLoadingHistorical(false)
    }
  }, [timeframe])

  // Connect and fetch stock data (WebSocket code commented out)
  const connectWebSocket = useCallback((symbol: string) => {
    // WebSocket code commented out - not using real-time data
    // if (!wsToken) {
    //   console.error('WebSocket token not available')
    //   return
    // }

    // Clear existing polling interval (commented out - no polling)
    // if (wsRef.current) {
    //   clearInterval(wsRef.current)
    // }
    
    previousSymbolRef.current = symbol
    historicalDataLoadedRef.current = false

    // Reset data
    setStockData([])
    dataRef.current = []
    previousPriceRef.current = null
    setCurrentPrice(null)
    setPriceChange(0)

    // Fetch historical data once (no polling for non-real-time data)
    fetchHistoricalData(symbol, timeframe).then(() => {
      setIsConnected(true)
      // WebSocket/polling code commented out - EOD data is not real-time
      // Marketstack doesn't support WebSocket, and polling is not needed for EOD data
      // const pollInterval = setInterval(() => {
      //   fetchHistoricalData(symbol, timeframe)
      // }, 60000) // Poll every 60 seconds
      // 
      // // Store interval for cleanup
      // if (wsRef.current) {
      //   clearInterval(wsRef.current)
      // }
      // wsRef.current = pollInterval
    })
  }, [fetchHistoricalData, timeframe])

  // Refetch when timeframe changes (only when user explicitly changes timeframe)
  useEffect(() => {
    if (selectedStock) {
      fetchHistoricalData(selectedStock, timeframe)
    }
    // Clear any existing intervals when timeframe changes
    if (wsRef.current) {
      clearInterval(wsRef.current)
      wsRef.current = null
    }
  }, [timeframe, selectedStock, fetchHistoricalData])

  // Handle stock selection
  const handleSelectStock = (stock: StockResult) => {
    setSelectedStock(stock.symbol)
    setSearchQuery(stock.symbol)
    setSearchResults([])
    connectWebSocket(stock.symbol)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        clearInterval(wsRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Stock Chart - US Market</h2>
      
      {/* Search Section */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for US stocks (e.g., AAPL, MSFT, GOOGL)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((stock, index) => (
              <div
                key={index}
                onClick={() => handleSelectStock(stock)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-semibold text-gray-900">{stock.symbol}</div>
                <div className="text-sm text-gray-600">{stock.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Info and Chart */}
      {selectedStock && (
        <div>
          {/* Stock Info Header */}
          <div className="mb-4">
            <div className="mb-4">
              {currentPrice !== null && (
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {currentPrice.toFixed(2)}
                  </div>
                  {priceChange !== 0 && lastClose !== null && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-semibold ${
                          priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {priceChange >= 0 ? '+' : ''}
                        {priceChange.toFixed(2)}
                      </span>
                      <span
                        className={`text-lg font-semibold ${
                          priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        ({((priceChange / lastClose) * 100).toFixed(2)}%)
                      </span>
                      <span className="text-sm text-gray-500">Today</span>
                      {priceChange >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    USD - {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} ET - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex gap-2 mb-4">
              {(['1d', '5d', '1m', '6m', 'YTD', '1y', '5y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            
            {/* Chart Type Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setChartType('line')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LineChartIcon className="w-4 h-4" />
                Line Chart
              </button>
              <button
                onClick={() => setChartType('candlestick')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === 'candlestick'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Candlestick Chart
              </button>
            </div>
          </div>

          {/* Chart */}
          {isLoadingHistorical ? (
            <div className="h-80 flex flex-col items-center justify-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p>Loading historical data (12 hours)...</p>
            </div>
          ) : stockData.length > 0 ? (
            <>
              {chartType === 'line' ? (
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stockData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="time"
                        stroke="#666"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        interval={Math.floor(stockData.length / 8)}
                        tickFormatter={(value, index) => {
                          if (!stockData[index]) return value
                          
                          const dataPoint = stockData[index]
                          const date = dataPoint.fullDate ? new Date(dataPoint.fullDate) : new Date(dataPoint.timestamp || 0)
                          
                          // For 1d timeframe with EOD data, show date (since EOD is daily data)
                          if (timeframe === '1d') {
                            return date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })
                          }
                          
                          // For 5d and 1m, show date with day
                          if (timeframe === '5d' || timeframe === '1m') {
                            return date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })
                          }
                          
                          // For longer timeframes, show month and year
                          if (timeframe === '6m' || timeframe === 'YTD' || timeframe === '1y') {
                            return date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: '2-digit'
                            })
                          }
                          
                          // For 5y, show year only
                          if (timeframe === '5y') {
                            return date.toLocaleDateString('en-US', { 
                              year: 'numeric'
                            })
                          }
                          
                          return value
                        }}
                      />
                      <YAxis
                        stroke="#666"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => value.toFixed(0)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                        labelStyle={{ color: '#374151', fontWeight: '500' }}
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                      />
                      {lastClose !== null && (
                        <ReferenceLine 
                          y={lastClose} 
                          stroke="#666" 
                          strokeDasharray="5 5"
                          label={{ value: `Last Close ${lastClose.toFixed(2)}`, position: 'right', fill: '#666', fontSize: 11 }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: priceChange >= 0 ? '#10b981' : '#ef4444' }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full">
                  <CandlestickChart 
                    data={stockData.filter(d => d.open !== undefined && d.high !== undefined && d.low !== undefined && d.close !== undefined).map(d => ({
                      time: d.time,
                      open: d.open!,
                      high: d.high!,
                      low: d.low!,
                      close: d.close!,
                      volume: d.volume || 0,
                      timestamp: d.timestamp
                    }))} 
                  />
                </div>
              )}
            </>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              {isConnected ? 'Waiting for live data...' : 'Connecting...'}
            </div>
          )}
        </div>
      )}

      {!selectedStock && (
        <div className="h-80 flex items-center justify-center text-gray-500">
          Search and select a stock to view live chart
        </div>
      )}
    </div>
  )
}

export default LiveStockChart
