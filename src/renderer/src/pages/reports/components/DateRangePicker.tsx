import { useState } from 'react'
import dayjs from 'dayjs'

interface DateRangePickerProps {
  from: Date
  to: Date
  onUpdate: (range: { from: Date; to: Date }) => void
}

export function DateRangePicker({ from, to, onUpdate }: DateRangePickerProps) {
  const presets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 }
  ]

  const handlePresetClick = (days: number) => {
    onUpdate({
      from: dayjs().subtract(days, 'day').toDate(),
      to: dayjs().toDate()
    })
  }

  return (
    <div className="date-range-picker">
      <div className="date-inputs">
        <input
          type="date"
          value={dayjs(from).format('YYYY-MM-DD')}
          onChange={(e) => onUpdate({ from: new Date(e.target.value), to })}
          max={dayjs(to).format('YYYY-MM-DD')}
        />
        <span>to</span>
        <input
          type="date"
          value={dayjs(to).format('YYYY-MM-DD')}
          onChange={(e) => onUpdate({ from, to: new Date(e.target.value) })}
          min={dayjs(from).format('YYYY-MM-DD')}
          max={dayjs().format('YYYY-MM-DD')}
        />
      </div>
      <div className="date-presets">
        {presets.map((preset) => (
          <button
            key={preset.days}
            onClick={() => handlePresetClick(preset.days)}
            className="preset-btn"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
