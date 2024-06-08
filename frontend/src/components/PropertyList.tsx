import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  Typography,
  Button
} from '@mui/material'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import env from '../config/env.config'
import Const from '../config/const'
import { strings as commonStrings } from '../lang/common'
import { strings as csStrings, strings } from '../lang/properties'

import * as helper from '../common/helper'
import * as PropertyService from '../services/PropertyService'
import Pager from './Pager'
import PropertyInfo from './PropertyInfo'
import AgencyBadge from './AgencyBadge'

import '../assets/css/property-list.css'

interface PropertyListProps {
  agencies?: string[]
  types?: movininTypes.PropertyType[]
  rentalTerms?: movininTypes.RentalTerm[]
  location?: string
  from?: Date
  to?: Date
  reload?: boolean
  properties?: movininTypes.Property[]
  className?: string
  loading?: boolean
  hideAgency?: boolean
  hidePrice?: boolean
  hideActions?: boolean
  language: string
  sizeAuto?: boolean
  onLoad?: movininTypes.DataEvent<movininTypes.Property>
}

const PropertyList = ({
  agencies,
  types,
  rentalTerms,
  location,
  from,
  to,
  reload,
  properties,
  className,
  loading: propertyListLoading,
  hideAgency,
  hidePrice,
  hideActions,
  language,
  sizeAuto,
  onLoad,
}: PropertyListProps) => {
  const navigate = useNavigate()

  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetch, setFetch] = useState(false)
  const [rows, setRows] = useState<movininTypes.Property[]>([])
  const [page, setPage] = useState(1)
  const [rowCount, setRowCount] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {
    if (env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile()) {
      const element = document.querySelector('body')

      if (element) {
        element.onscroll = () => {
          if (fetch
            && !loading
            && window.scrollY > 0
            && window.scrollY + window.innerHeight + env.INFINITE_SCROLL_OFFSET >= document.body.scrollHeight) {
            setLoading(true)
            setPage(page + 1)
          }
        }
      }
    }
  }, [fetch, loading, page])

  const fetchData = async (_page: number) => {
    try {
      setLoading(true)

      const payload: movininTypes.GetPropertiesPayload = {
        agencies: agencies ?? [],
        types,
        rentalTerms,
        location,
      }
      const data = await PropertyService.getProperties(payload, _page, env.PROPERTIES_PAGE_SIZE)

      const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
      if (!_data) {
        helper.error()
        return
      }
      const _totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

      let _rows: movininTypes.Property[] = []
      if (env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile()) {
        _rows = _page === 1 ? _data.resultData : [...rows, ..._data.resultData]
      } else {
        _rows = _data.resultData
      }

      setRows(_rows)
      setRowCount((_page - 1) * env.PROPERTIES_PAGE_SIZE + _rows.length)
      setTotalRecords(_totalRecords)
      setFetch(_data.resultData.length > 0)

      if (((env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || env.isMobile()) && _page === 1) || (env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !env.isMobile())) {
        window.scrollTo(0, 0)
      }

      if (onLoad) {
        onLoad({ rows: _data.resultData, rowCount: _totalRecords })
      }
    } catch (err) {
      helper.error(err)
    } finally {
      setLoading(false)
      setInit(false)
    }
  }

  useEffect(() => {
    if (agencies) {
      if (agencies.length > 0) {
        fetchData(page)
      } else {
        setRows([])
        setRowCount(0)
        setFetch(false)
        if (onLoad) {
          onLoad({ rows: [], rowCount: 0 })
        }
        setInit(false)
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    agencies,
    types,
    rentalTerms,
    location
  ])

  useEffect(() => {
    if (properties) {
      setRows(properties)
      setRowCount(properties.length)
      setFetch(false)
      if (onLoad) {
        onLoad({ rows: properties, rowCount: properties.length })
      }
      // setLoading(false)
    }
  }, [properties]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1)
  }, [
    agencies,
    types,
    rentalTerms,
    location
  ])

  useEffect(() => {
    if (reload) {
      setPage(1)
      fetchData(1)
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reload,
    agencies,
    types,
    rentalTerms,
    location
  ])

  const days = movininHelper.days(from, to)

  return (
    <>
      <section className={`${className ? `${className} ` : ''}property-list`}>
        {rows.length === 0
          ? !init
          && !loading
          && !propertyListLoading && (
            <Card variant="outlined" className="empty-list">
              <CardContent>
                <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
              </CardContent>
            </Card>
          )
          : rows.map((property) => {
            const price = (from && to && helper.price(property, from, to)) || 0

            return (
              <article key={property._id}>

                <div className="left-panel">
                  <img
                    src={movininHelper.joinURL(env.CDN_PROPERTIES, property.image)}
                    alt={property.name}
                    className="property-img"
                  />
                  {!hideAgency && <AgencyBadge agency={property.agency} style={sizeAuto ? { bottom: 10 } : {}} />}
                </div>

                <div className="middle-panel">
                  <div className="name">
                    <h2>{property.name}</h2>
                  </div>

                  <PropertyInfo
                    property={property}
                    className="property-info"
                    language={language}
                    description
                  />
                </div>

                <div className="right-panel">
                  {!hidePrice && from && to && (
                    <div className="price">
                      <span className="price-days">{helper.getDays(days)}</span>
                      <span className="price-main">{movininHelper.formatPrice(price, commonStrings.CURRENCY, language)}</span>
                      <span className="price-day">{`${csStrings.PRICE_PER_DAY} ${movininHelper.formatPrice((price as number) / days, commonStrings.CURRENCY, language)}`}</span>
                    </div>
                  )}
                  {hidePrice && !hideActions && <span />}
                  {
                    !hideActions
                    && (
                      <div className="action">
                        <Button
                          variant="contained"
                          className="btn-action btn-margin-bottom btn"
                          onClick={() => {
                            navigate('/property', {
                              state: {
                                propertyId: property._id,
                                from,
                                to
                              }
                            })
                          }}
                        >
                          {strings.VIEW}
                        </Button>
                        {
                          !hidePrice && (
                            <Button
                              variant="contained"
                              className="btn-action btn-margin-bottom btn"
                              onClick={() => {
                                navigate('/checkout', {
                                  state: {
                                    propertyId: property._id,
                                    locationId: location,
                                    from,
                                    to
                                  }
                                })
                              }}
                            >
                              {strings.BOOK}
                            </Button>
                          )
                        }
                      </div>
                    )
                  }

                </div>

              </article>
            )
          })}
      </section>

      {env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !env.isMobile() && (
        <Pager
          page={page}
          pageSize={env.PROPERTIES_PAGE_SIZE}
          rowCount={rowCount}
          totalRecords={totalRecords}
          onNext={() => setPage(page + 1)}
          onPrevious={() => setPage(page - 1)}
        />
      )}
    </>
  )
}

export default PropertyList
