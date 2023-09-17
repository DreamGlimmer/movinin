import React, { useState, useEffect } from 'react'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as csStrings } from '../lang/properties'
import { strings } from '../lang/booking-list'
import * as Helper from '../common/Helper'
import * as BookingService from '../services/BookingService'
import { DataGrid, frFR, enUS, GridPaginationModel, GridColDef, GridRowId } from '@mui/x-data-grid'
import {
  Tooltip,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Check as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { fr as dfnsFR, enUS as dfnsENUS } from 'date-fns/locale'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'

import '../assets/css/booking-list.css'

const BookingList = (
  {
    agencies: bookingAgencies,
    statuses: bookingStatuses,
    filter: bookingFilter,
    reload: bookingReload,
    property: bookingProperty,
    offset: bookingOffset,
    user: bookingUser,
    containerClassName,
    hideDates,
    hidePropertyColumn,
    hideAgencyColumn,
    language,
    loading: bookingLoading,
    checkboxSelection,
    onLoad,
  }: {
    agencies?: string[]
    statuses?: string[]
    filter?: movininTypes.Filter | null
    reload?: boolean
    property?: string
    offset?: number
    user?: movininTypes.User
    containerClassName?: string
    hideDates?: boolean
    hidePropertyColumn?: boolean
    hideAgencyColumn?: boolean
    language?: string
    loading?: boolean
    checkboxSelection?: boolean
    onLoad?: movininTypes.DataEvent<movininTypes.Booking>
  }
) => {
  const [user, setUser] = useState<movininTypes.User>()
  const [columns, setColumns] = useState<GridColDef<movininTypes.Booking>[]>([])
  const [rows, setRows] = useState<movininTypes.Booking[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [fetch, setFetch] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [agencies, setAgencies] = useState<string[]>(bookingAgencies || [])
  const [statuses, setStatuses] = useState<string[]>(bookingStatuses || [])
  const [filter, setFilter] = useState<movininTypes.Filter | undefined | null>(bookingFilter)
  const [reload, setReload] = useState(bookingReload)
  const [property, setProperty] = useState<string>(bookingProperty || '')
  const [offset, setOffset] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Env.BOOKINGS_PAGE_SIZE,
    page: 0,
  })
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(Env.isMobile() ? Env.BOOKINGS_MOBILE_PAGE_SIZE : Env.BOOKINGS_PAGE_SIZE)
  const [load, setLoad] = useState(false)
  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [cancelRequestSent, setCancelRequestSent] = useState(false)
  const [cancelRequestProcessing, setCancelRequestProcessing] = useState(false)

  useEffect(() => {
    setPage(paginationModel.page)
    setPageSize(paginationModel.pageSize)
  }, [paginationModel])

  const _fetch = async (page: number, user?: movininTypes.User) => {
    try {
      const _pageSize = Env.isMobile() ? Env.BOOKINGS_MOBILE_PAGE_SIZE : pageSize

      if (agencies.length > 0) {
        setLoading(true)

        const data = await BookingService.getBookings(
          {
            agencies,
            statuses,
            filter: filter || undefined,
            property,
            user: (user && user._id) || undefined,
            language: user?.language || Env.DEFAULT_LANGUAGE
          },
          page,
          _pageSize,
        )

        const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
        if (!_data) {
          Helper.error()
          return
        }
        const totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

        if (Env.isMobile()) {
          const _rows = page === 0 ? _data.resultData : [...rows, ..._data.resultData]
          setRows(_rows)
          setRowCount(totalRecords)
          setFetch(_data.resultData.length > 0)
          if (onLoad) {
            onLoad({ rows: _rows, rowCount: totalRecords })
          }
        } else {
          setRows(_data.resultData)
          setRowCount(totalRecords)
          if (onLoad) {
            onLoad({ rows: _data.resultData, rowCount: totalRecords })
          }
        }
      } else {
        setRows([])
        setRowCount(0)
        if (onLoad) {
          onLoad({ rows: [], rowCount: 0 })
        }
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
      setLoad(false)
      setInit(false)
    }
  }

  useEffect(() => {
    setAgencies(bookingAgencies || [])
  }, [bookingAgencies])

  useEffect(() => {
    setStatuses(bookingStatuses || [])
  }, [bookingStatuses])

  useEffect(() => {
    setFilter(bookingFilter || null)
  }, [bookingFilter])

  useEffect(() => {
    setProperty(bookingProperty || '')
  }, [bookingProperty])

  useEffect(() => {
    setOffset(bookingOffset || 0)
  }, [bookingOffset])

  useEffect(() => {
    setReload(bookingReload || false)
  }, [bookingReload])

  useEffect(() => {
    setUser(bookingUser)
  }, [bookingUser])

  useEffect(() => {
    if (reload) {
      setPage(0)
      paginationModel.page = 0
      setPaginationModel(paginationModel)
      _fetch(0, user)
      setLoad(false)
      setReload(false)
      return
    }
    if (load) {
      _fetch(page, user)
      setLoad(false)
      setReload(false)
    }
  }, [load, reload]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (agencies.length > 0 && statuses.length > 0) {
      const columns = getColumns()
      setColumns(columns)
      setLoad(true)
    }
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (agencies.length > 0 && statuses.length > 0) {
      const columns = getColumns()
      setColumns(columns)
      setReload(true)
    }
  }, [pageSize]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (agencies.length > 0 && statuses.length > 0) {
      const columns = getColumns()
      setColumns(columns)
      setReload(true)
    }
  }, [agencies, statuses, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const columns = getColumns()
    setColumns(columns)
  }, [selectedIds]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (Env.isMobile()) {
      const element: HTMLDivElement | null =
        containerClassName
          ? document.querySelector(`.${containerClassName}`)
          : document.querySelector('div.bookings')

      if (element) {
        element.onscroll = (event: Event) => {
          if (fetch && !loading) {
            const target = event.target as HTMLDivElement

            if (target.scrollTop > 0
              && target.offsetHeight + target.scrollTop + Env.INFINITE_SCROLL_OFFSET >= target.scrollHeight) {
              setLoading(true)
              setPage(page + 1)
            }
          }
        }
      }
    }
  }, [containerClassName, page, fetch, loading, offset]) // eslint-disable-line react-hooks/exhaustive-deps

  const getDate = (date: Date) => {
    const d = new Date(date)
    return `${movininHelper.formatDatePart(d.getDate())}-${movininHelper.formatDatePart(d.getMonth() + 1)}-${d.getFullYear()}`
  }

  const getColumns = () => {
    const columns = [
      {
        field: 'from',
        headerName: commonStrings.FROM,
        flex: 1,
        valueGetter: (params: any) => getDate(params.value),
      },
      {
        field: 'to',
        headerName: commonStrings.TO,
        flex: 1,
        valueGetter: (params: any) => getDate(params.value),
      },
      {
        field: 'price',
        headerName: strings.PRICE,
        flex: 1,
        valueGetter: (params: any) => `${movininHelper.formatNumber(params.value)} ${commonStrings.CURRENCY}`,
        renderCell: (params: any) => <span className="bp">{params.value}</span>,
      },
      {
        field: 'status',
        headerName: strings.STATUS,
        flex: 1,
        renderCell: (params: any) => <span className={`bs bs-${params.value.toLowerCase()}`}>{Helper.getBookingStatus(params.value)}</span>,
        valueGetter: (params: any) => params.value,
      },
      {
        field: 'action',
        headerName: '',
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params: any) => {
          const cancelBooking = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation() // don't select this row after clicking
            setSelectedId(params.row._id)
            setOpenCancelDialog(true)
          }

          return (
            <>
              <Tooltip title={strings.VIEW}>
                <IconButton href={`booking?b=${params.row._id}`}>
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              {params.row.cancellation &&
                !params.row.cancelRequest &&
                params.row.status !== movininTypes.BookingStatus.Cancelled &&
                new Date(params.row.from) > new Date() && (
                  <Tooltip title={strings.CANCEL}>
                    <IconButton onClick={cancelBooking}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                )}
            </>
          )
        },
      },
    ]

    if (hideDates) {
      columns.splice(0, 2)
    }

    if (!hidePropertyColumn) {
      columns.unshift({
        field: 'property',
        headerName: strings.PROPERTY,
        flex: 1,
        valueGetter: (params: any) => params.value.name
      })
    }

    if (!hideAgencyColumn) {
      columns.unshift({
        field: 'agency',
        headerName: commonStrings.AGENCY,
        flex: 1,
        renderCell: (params: any) => (
          <div className="cell-agency">
            <img src={movininHelper.joinURL(Env.CDN_USERS, params.row.agency.avatar)} alt={params.value} />
          </div>
        ),
        valueGetter: (params: any) => params.value.fullName,
      })
    }

    return columns
  }

  const handleCloseCancelBooking = () => {
    setOpenCancelDialog(false)
    if (cancelRequestSent) {
      setTimeout(() => {
        setCancelRequestSent(false)
      }, 500)
    }
  }

  const handleConfirmCancelBooking = async () => {
    try {
      setCancelRequestProcessing(true)
      const status = await BookingService.cancel(selectedId)
      if (status === 200) {
        const row = rows.find((r) => r._id === selectedId)
        if (row) {
          row.cancelRequest = true

          setCancelRequestSent(true)
          setRows(rows)
          setSelectedId('')
          setCancelRequestProcessing(false)
        } else {
          Helper.error()
        }
      } else {
        Helper.error()
        setOpenCancelDialog(false)
        setCancelRequestProcessing(false)
      }
    } catch (err) {
      Helper.error(err)
      setOpenCancelDialog(false)
      setCancelRequestProcessing(false)
    }
  }

  const _fr = language === 'fr'
  const _locale = _fr ? dfnsFR : dfnsENUS
  const _format = _fr ? 'eee d LLL kk:mm' : 'eee, d LLL, kk:mm'
  const bookingDetailHeight = Env.AGENCY_IMAGE_HEIGHT + 10

  return (
    <div className="bs-list">
      {user &&
        (rows.length === 0 ? (
          !loading &&
          !init &&
          !bookingLoading &&
          <Card variant="outlined" className="empty-list">
            <CardContent>
              <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
            </CardContent>
          </Card>
        ) : Env.isMobile() ? (
          <>
            {rows.map((booking) => {
              const from = new Date(booking.from)
              const to = new Date(booking.to)

              return (
                <div key={booking._id} className="booking-details">
                  <div className={`bs bs-${booking.status.toLowerCase()}`}>
                    <label>{Helper.getBookingStatus(booking.status)}</label>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{strings.PROPERTY}</label>
                    <div className="booking-detail-value">
                      <Link href={`property/?p=${(booking.property as movininTypes.Property)._id}`}>{(booking.property as movininTypes.Property).name}</Link>
                    </div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{strings.DAYS}</label>
                    <div className="booking-detail-value">{`${Helper.getDaysShort(movininHelper.days(from, to))} (${movininHelper.capitalize(
                      format(from, _format, { locale: _locale }),
                    )} - ${movininHelper.capitalize(format(to, _format, { locale: _locale }))})`}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{commonStrings.LOCATION}</label>
                    <div className="booking-detail-value">{((booking.property as movininTypes.Property).location as movininTypes.Location).name}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{commonStrings.AGENCY}</label>
                    <div className="booking-detail-value">
                      <div className="property-agency">
                        <img src={movininHelper.joinURL(Env.CDN_USERS, (booking.agency as movininTypes.User).avatar)} alt={(booking.agency as movininTypes.User).fullName} />
                        <label className="property-agency-name">{(booking.agency as movininTypes.User).fullName}</label>
                      </div>
                    </div>
                  </div>

                  {booking.cancellation && (
                    <>
                      <div className="extras">
                        <label className="extras-title">{commonStrings.OPTIONS}</label>
                        {booking.cancellation && (
                          <div className="extra">
                            <CheckIcon className="extra-icon" />
                            <label className="extra-title">{csStrings.CANCELLATION}</label>
                            <label className="extra-text">{Helper.getCancellationOption((booking.property as movininTypes.Property).cancellation, _fr, true)}</label>
                          </div>
                        )}

                      </div>
                    </>
                  )}

                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{strings.COST}</label>
                    <div className="booking-detail-value booking-price">{`${movininHelper.formatNumber(booking.price)} ${commonStrings.CURRENCY}`}</div>
                  </div>

                  <div className="bs-buttons">
                    {booking.cancellation &&
                      !booking.cancelRequest &&
                      booking.status !== movininTypes.BookingStatus.Cancelled &&
                      new Date(booking.from) > new Date() && (
                        <Button
                          variant="contained"
                          className="btn-secondary"
                          onClick={() => {
                            setSelectedId(booking._id as string)
                            setOpenCancelDialog(true)
                          }}
                        >
                          {strings.CANCEL}
                        </Button>
                      )}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <DataGrid
            className="data-grid"
            checkboxSelection={checkboxSelection}
            getRowId={(row: movininTypes.Booking): GridRowId => row._id as GridRowId}
            columns={columns}
            rows={rows}
            rowCount={rowCount}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { pageSize: Env.BOOKINGS_PAGE_SIZE },
              },
            }}
            pageSizeOptions={[Env.BOOKINGS_PAGE_SIZE, 50, 100]}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            localeText={(user.language === 'fr' ? frFR : enUS).components.MuiDataGrid.defaultProps.localeText}
            onRowSelectionModelChange={(selectedIds) => {
              setSelectedIds(Array.from(new Set(selectedIds)).map(id => id.toString()))
            }}
            disableRowSelectionOnClick
          />
        ))}

      <Dialog disableEscapeKeyDown maxWidth="xs" open={openCancelDialog}>
        <DialogTitle className="dialog-header">{!cancelRequestSent && !cancelRequestProcessing && commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent className="dialog-content">
          {cancelRequestProcessing ? (
            <Stack sx={{ color: '#0D63C9' }}>
              <CircularProgress color="inherit" />
            </Stack>
          ) : cancelRequestSent ? (
            strings.CANCEL_BOOKING_REQUEST_SENT
          ) : (
            strings.CANCEL_BOOKING
          )}
        </DialogContent>
        <DialogActions className="dialog-actions">
          {!cancelRequestProcessing && (
            <Button onClick={handleCloseCancelBooking} variant="contained" className="btn-secondary">
              {commonStrings.CLOSE}
            </Button>
          )}
          {!cancelRequestSent && !cancelRequestProcessing && (
            <Button onClick={handleConfirmCancelBooking} variant="contained" className="btn-primary">
              {commonStrings.CONFIRM}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default BookingList
