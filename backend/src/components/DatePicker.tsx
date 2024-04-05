import React, { useEffect, useState } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { fr, enUS } from 'date-fns/locale'
import { TextFieldVariants } from '@mui/material'

interface DatePickerProps {
  value?: Date
  label?: string
  minDate?: Date
  required?: boolean
  language?: string
  variant?: TextFieldVariants
  onChange?: (value: Date | null) => void
}

const DatePicker = ({
  value: dateValue,
  label,
  minDate,
  required,
  language,
  variant,
  onChange
}: DatePickerProps) => {
  const [value, setValue] = useState<Date | null>(null)

  useEffect(() => {
    setValue(dateValue || null)
  }, [dateValue])

  return (
    <LocalizationProvider adapterLocale={language === 'fr' ? fr : enUS} dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        label={label}
        views={['year', 'month', 'day']}
        value={value}
        onAccept={(_value) => {
          if (_value) {
            const date = _value as Date
            date.setHours(12, 0, 0, 0)
          }
          setValue(_value)

          if (onChange) {
            onChange(_value)
          }
        }}
        minDate={minDate}
        slotProps={{
          textField: {
            variant: variant || 'standard',
            required,
          },
          actionBar: {
            actions: ['accept', 'cancel', 'today', 'clear'],
          },
        }}
      />
    </LocalizationProvider>
  )
}

export default DatePicker
