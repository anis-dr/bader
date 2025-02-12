import { useMemo } from 'react'

interface ChartData {
  date: string
  total: number
}

interface LineChartProps {
  data: ChartData[]
}

export function LineChart({ data }: LineChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.total), 0), [data])
  const points = useMemo(() => {
    if (data.length < 2) return ''

    const height = 200
    const width = 800
    const padding = 40
    const availableHeight = height - padding * 2
    const availableWidth = width - padding * 2
    const xStep = availableWidth / Math.max(data.length - 1, 1)

    return data
      .map((d, i) => {
        const x = padding + i * xStep
        const y = height - (padding + (maxValue ? d.total / maxValue : 0) * availableHeight)
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`
      })
      .join(' ')
  }, [data, maxValue])

  if (data.length === 0) {
    return <div className="no-data">No data available</div>
  }

  // Handle single data point
  if (data.length === 1) {
    return (
      <div className="chart-container">
        <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="none">
          <circle
            cx="400"
            cy={200 - (40 + (maxValue ? data[0].total / maxValue : 0) * (200 - 80))}
            r="4"
            fill="#4299e1"
          >
            <title>{`${data[0].date}: ${data[0].total.toFixed(2)} DT`}</title>
          </circle>
          <text x="400" y="180" fontSize="10" fill="#64748b" textAnchor="middle">
            {data[0].date}
          </text>
        </svg>
      </div>
    )
  }

  const getXPosition = (index: number) => {
    const availableWidth = 760 - 40 // total width minus padding
    return 40 + (index * availableWidth) / Math.max(data.length - 1, 1)
  }

  const getYPosition = (value: number) => {
    return 200 - (40 + (maxValue ? value / maxValue : 0) * (200 - 80))
  }

  return (
    <div className="chart-container">
      <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1="40"
              y1={200 - (40 + ratio * (200 - 80))}
              x2="760"
              y2={200 - (40 + ratio * (200 - 80))}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x="20"
              y={200 - (40 + ratio * (200 - 80))}
              fontSize="12"
              fill="#64748b"
              dominantBaseline="middle"
              textAnchor="end"
            >
              {(maxValue * ratio).toFixed(0)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = getXPosition(i)
          return (
            <text
              key={i}
              x={x}
              y="180"
              fontSize="10"
              fill="#64748b"
              textAnchor="middle"
              transform={`rotate(-45 ${x},180)`}
            >
              {d.date}
            </text>
          )
        })}

        {/* Line */}
        {data.length > 1 && <path d={points} fill="none" stroke="#4299e1" strokeWidth="2" />}

        {/* Data points */}
        {data.map((d, i) => {
          const x = getXPosition(i)
          const y = getYPosition(d.total)
          return (
            <circle key={i} cx={x} cy={y} r="4" fill="#4299e1">
              <title>{`${d.date}: ${d.total.toFixed(2)} DT`}</title>
            </circle>
          )
        })}
      </svg>
    </div>
  )
}

// We'll export BarChart as well for future use
export function BarChart({ data }: LineChartProps) {
  return <div>Bar Chart implementation coming soon</div>
}
