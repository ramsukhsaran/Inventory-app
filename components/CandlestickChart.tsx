"use client"

import React from 'react'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Line } from 'recharts'

interface CandlestickData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp?: number
}

interface CandlestickChartProps {
  data: CandlestickData[]
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-500">No data available</div>
  }

  // Calculate the price range for the chart
  const minPrice = Math.min(...data.map(d => d.low))
  const maxPrice = Math.max(...data.map(d => d.high))
  const priceRange = maxPrice - minPrice
  const padding = priceRange * 0.05

  // Calculate max volume for volume chart scaling
  const maxVolume = Math.max(...data.map(d => d.volume || 0))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isUp = data.close >= data.open
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.time}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Open:</span>
              <span className="font-medium">${data.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">High:</span>
              <span className="font-medium text-green-600">${data.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Low:</span>
              <span className="font-medium text-red-600">${data.low.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Close:</span>
              <span className={`font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                ${data.close.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-gray-200">
              <span className="text-gray-600">Volume:</span>
              <span className="font-medium">{data.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Prepare data for candlestick rendering
  const chartData = data.map((entry) => {
    const isUp = entry.close >= entry.open
    const bodyTop = Math.min(entry.open, entry.close)
    const bodyBottom = Math.max(entry.open, entry.close)
    const bodyHeight = bodyBottom - bodyTop
    
    return {
      ...entry,
      isUp,
      bodyTop,
      bodyBottom,
      bodyHeight,
      // For rendering wick (high-low range)
      wickTop: entry.high,
      wickBottom: entry.low,
    }
  })

  return (
    <div className="w-full">
      {/* Price Chart with Candlesticks */}
      <div className="h-64 mb-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 8)}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Render high-low lines for wicks */}
            <Line
              yAxisId="price"
              dataKey="high"
              stroke="transparent"
              dot={false}
              activeDot={false}
            />
            <Line
              yAxisId="price"
              dataKey="low"
              stroke="transparent"
              dot={false}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Custom SVG overlay for candlesticks - positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none" style={{ marginTop: '10px', marginRight: '30px', marginLeft: '20px', marginBottom: '80px' }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            {chartData.map((entry, index) => {
              const isUp = entry.close >= entry.open
              const color = isUp ? '#10b981' : '#ef4444'
              
              // Calculate positions based on chart dimensions
              const chartWidth = 100 // percentage
              const chartHeight = 100 // percentage
              const barWidth = chartWidth / chartData.length
              const xPercent = (index / chartData.length) * 100
              const wickXPercent = xPercent + (barWidth / 2)
              
              // Scale prices to percentages
              const priceRange = maxPrice - minPrice + 2 * padding
              const scaleY = (price: number) => {
                return ((maxPrice + padding - price) / priceRange) * 100
              }
              
              const highY = scaleY(entry.high)
              const lowY = scaleY(entry.low)
              const bodyTopY = scaleY(Math.min(entry.open, entry.close))
              const bodyBottomY = scaleY(Math.max(entry.open, entry.close))
              const bodyHeight = Math.max(Math.abs(bodyBottomY - bodyTopY), 0.3)
              
              return (
                <g key={`candle-${index}`}>
                  {/* Wick (high-low line) */}
                  <line
                    x1={`${wickXPercent}%`}
                    y1={`${highY}%`}
                    x2={`${wickXPercent}%`}
                    y2={`${lowY}%`}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  {/* Body (open-close rectangle) */}
                  <rect
                    x={`${xPercent + (barWidth * 0.15)}%`}
                    y={`${bodyTopY}%`}
                    width={`${barWidth * 0.7}%`}
                    height={`${bodyHeight}%`}
                    fill={color}
                  />
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 8)}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="volume"
              orientation="right"
              stroke="#666"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, maxVolume * 1.1]}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                return value.toString()
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [value.toLocaleString(), 'Volume']}
            />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              radius={[2, 2, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isUp ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default CandlestickChart
