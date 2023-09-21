import React, { useState } from 'react'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/booking-filter'
import LocationSelectList from './LocationSelectList'
import DatePicker from './DatePicker'
import {
  FormControl,
  TextField,
  Button,
  IconButton
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import Accordion from '../components/Accordion'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'

import '../assets/css/booking-filter.css'

const BookingFilter = ({
  collapse,
  className,
  language,
  onSubmit
}:
  {
    collapse?: boolean,
    className?: string,
    language?: string,
    onSubmit?: (filter: movininTypes.Filter | null) => void
  }) => {
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [location, setLocation] = useState('')
  const [keyword, setKeyword] = useState('')
  const [minDate, setMinDate] = useState<Date>()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const handleLocationChange = (locations: movininTypes.Option[]) => {
    setLocation(locations.length > 0 ? locations[0]._id : '')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault()

    let filter: movininTypes.Filter | null = { from, to, location, keyword }

    if (!from && !to && !location && !keyword) {
      filter = null
    }
    if (onSubmit) {
      onSubmit(movininHelper.clone(filter))
    }
  }

  return (
    <Accordion title={commonStrings.SEARCH} collapse={collapse} className={`${className ? `${className} ` : ''}booking-filter`}>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="dense">
          <DatePicker
            label={commonStrings.FROM}
            onChange={(from: Date) => {
              setFrom(from)
              setMinDate(from)
            }}
            language={language}
            variant="standard"
          />
        </FormControl>
        <FormControl fullWidth margin="dense">
          <DatePicker
            label={commonStrings.TO}
            minDate={minDate}
            onChange={(to: Date) => {
              setTo(to)
            }}
            language={language}
            variant="standard"
          />
        </FormControl>
        <FormControl fullWidth margin="dense">
          <LocationSelectList
            label={strings.LOCATION}
            variant="standard"
            onChange={handleLocationChange}
          />
        </FormControl>
        <FormControl fullWidth margin="dense">
          <TextField
            variant="standard"
            value={keyword}
            onKeyDown={handleSearchKeyDown}
            onChange={handleSearchChange}
            placeholder={commonStrings.SEARCH_PLACEHOLDER}
            InputProps={{
              endAdornment: keyword ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setKeyword('')
                  }}
                >
                  <ClearIcon className="d-adornment-icon" />
                </IconButton>
              ) : (
                <SearchIcon className="d-adornment-icon" />
              ),
            }}
            autoComplete="off"
            className="bf-search"
          />
        </FormControl>
        <Button type="submit" variant="contained" className="btn-primary btn-search" fullWidth>
          {commonStrings.SEARCH}
        </Button>
      </form>
    </Accordion>
  )
}

export default BookingFilter
