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
  maxDate?: Date
  required?: boolean
  language?: string
  variant?: TextFieldVariants
  readOnly?: boolean
  onChange?: (value: Date | null) => void
}

const DatePicker = ({
  value: dateValue,
  label,
  minDate,
  maxDate,
  required,
  language,
  variant,
  readOnly,
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
        readOnly={readOnly}
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
        maxDate={maxDate}
        slotProps={{
          textField: {
            variant: variant || 'standard',
            required,
            inputProps: {
              content: 'zz'
            }
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
