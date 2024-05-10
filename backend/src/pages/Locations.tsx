import React, { useState } from 'react'
import { Button } from '@mui/material'
import * as movininTypes from ':movinin-types'
import Layout from '../components/Layout'
import { strings } from '../lang/locations'
import Search from '../components/Search'
import LocationList from '../components/LocationList'
import InfoBox from '../components/InfoBox'

import '../assets/css/locations.css'

const Locations = () => {
  const [keyword, setKeyword] = useState('')
  const [rowCount, setRowCount] = useState(-1)

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword)
  }

  const handleLocationListLoad: movininTypes.DataEvent<movininTypes.Location> = (data) => {
    if (data) {
      setRowCount(data.rowCount)
    }
  }

  const handleLocationDelete = (_rowCount: number) => {
    setRowCount(_rowCount)
  }

  const onLoad = () => { }

  return (
    <Layout onLoad={onLoad} strict>
      <div className="locations">
        <div className="col-1">
          <div className="col-1-container">
            <Search className="search" onSubmit={handleSearch} />

            {rowCount > -1 && (
              <Button variant="contained" className="btn-primary new-location" size="small" href="/create-location">
                {strings.NEW_LOCATION}
              </Button>
            )}

            {rowCount > 0
              && (
              <InfoBox
                value={`${rowCount} ${rowCount > 1 ? strings.LOCATIONS : strings.LOCATION}`}
                className="location-count"
              />
)}
          </div>
        </div>
        <div className="col-2">
          <LocationList
            keyword={keyword}
            onLoad={handleLocationListLoad}
            onDelete={handleLocationDelete}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Locations
