import React, { useState, useEffect } from 'react'
import { FormControl, Button } from '@mui/material'
import { DateTimeValidationError } from '@mui/x-date-pickers'
import * as movininTypes from ':movinin-types'
import env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import * as UserService from '../services/UserService'
import LocationSelectList from './LocationSelectList'
import DatePicker from './DatePicker'

import '../assets/css/property-filter.css'

interface PropertyFilterProps {
  from: Date
  to: Date
  location: movininTypes.Location
  className?: string
  onSubmit: movininTypes.PropertyFilterSubmitEvent
}

const PropertyFilter = ({
  from: filterFrom,
  to: filterTo,
  location: filterLocation,
  className,
  onSubmit
}: PropertyFilterProps) => {
  const _minDate = new Date()
  _minDate.setDate(_minDate.getDate() + 1)

  const [from, setFrom] = useState<Date | undefined>(filterFrom)
  const [to, setTo] = useState<Date | undefined>(filterTo)
  const [minDate, setMinDate] = useState<Date>()
  const [maxDate, setMaxDate] = useState<Date>()
  const [location, setLocation] = useState<movininTypes.Location | null | undefined>(filterLocation)
  const [fromError, setFromError] = useState(false)
  const [toError, setToError] = useState(false)

  useEffect(() => {
    if (filterFrom) {
      const __minDate = new Date(filterFrom)
      __minDate.setDate(filterFrom.getDate() + 1)
      setMinDate(__minDate)
    }
  }, [filterFrom])

  useEffect(() => {
    if (filterTo) {
      const __maxDate = new Date(filterTo)
      __maxDate.setDate(__maxDate.getDate() - 1)
      setMaxDate(__maxDate)
    }
  }, [filterTo])

  const handleLocationChange = (values: movininTypes.Option[]) => {
    const _location = (values.length > 0 && values[0]) || null

    setLocation(_location)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!location || !from || !to || fromError || toError) {
      return
    }

    if (onSubmit) {
      const filter: movininTypes.PropertyFilter = { location, from, to }
      onSubmit(filter)
    }
  }

  return (
    <div className={`${className ? `${className} ` : ''}property-filter`}>
      <form onSubmit={handleSubmit} className="home-search-form">
        <FormControl fullWidth className="pickup-location">
          <LocationSelectList
            label={commonStrings.LOCATION}
            hidePopupIcon
            customOpen={env.isMobile()}
            init={!env.isMobile()}
            required
            variant="standard"
            value={location as movininTypes.Location}
            onChange={handleLocationChange}
          />
        </FormControl>

        <FormControl fullWidth className="from">
          <DatePicker
            label={commonStrings.FROM}
            value={from}
            minDate={_minDate}
            maxDate={maxDate}
            variant="standard"
            required
            onChange={(date) => {
              if (date) {
                const __minDate = new Date(date)
                __minDate.setDate(date.getDate() + 1)
                setFrom(date)
                setMinDate(__minDate)
                setFromError(false)
              } else {
                setFrom(undefined)
                setMinDate(_minDate)
              }
            }}
            onError={(err: DateTimeValidationError) => {
              if (err) {
                setFromError(true)
              } else {
                setFromError(false)
              }
            }}
            language={UserService.getLanguage()}
          />
        </FormControl>
        <FormControl fullWidth className="to">
          <DatePicker
            label={commonStrings.TO}
            value={to}
            minDate={minDate}
            variant="standard"
            required
            onChange={(date) => {
              if (date) {
                const _maxDate = new Date(date)
                _maxDate.setDate(_maxDate.getDate() - 1)
                setTo(date)
                setMaxDate(_maxDate)
                setToError(false)
              } else {
                setTo(undefined)
                setMaxDate(undefined)
              }
            }}
            onError={(err: DateTimeValidationError) => {
              if (err) {
                setToError(true)
              } else {
                setToError(false)
              }
            }}
            language={UserService.getLanguage()}
          />
        </FormControl>
        <FormControl fullWidth className="search">
          <Button type="submit" variant="contained" className="btn-search">
            {commonStrings.SEARCH}
          </Button>
        </FormControl>
      </form>
    </div>
  )
}

export default PropertyFilter
