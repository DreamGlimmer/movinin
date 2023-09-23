import React, { useEffect, useState } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { fr, enUS } from 'date-fns/locale'
import { TextFieldVariants } from '@mui/material'

const DateTimePicker = (
  {
    value: dateTimeValue,
    label,
    minDate,
    required,
    variant,
    language,
    onChange
  }
    : {
      value?: Date
      label?: string
      minDate?: Date
      required?: boolean
      language?: string
      variant?: TextFieldVariants
      onChange: (value: Date | null) => void
    }
) => {
  const [value, setValue] = useState<Date | null>(null)

  useEffect(() => {
    setValue(dateTimeValue || null)
  }, [dateTimeValue])

  return (
    <LocalizationProvider adapterLocale={language === 'fr' ? fr : enUS} dateAdapter={AdapterDateFns}>
      <MuiDateTimePicker
        label={label}
        // showToolbar
        value={value}
        onAccept={(value) => {
          setValue(value)

          if (onChange) {
            onChange(value)
          }
        }}
        minDate={minDate}
        defaultCalendarMonth={minDate}
        slotProps={{
          textField: {
            variant: variant || 'standard',
            required: required,
          },
          actionBar: {
            actions: ['accept', 'cancel', 'today', 'clear'],
          },
        }}
      />
    </LocalizationProvider>
  )
}

export default DateTimePicker
