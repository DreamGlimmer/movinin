import React, { useState, useEffect } from 'react'
import Env from '../config/env.config'
import Const from '../config/const'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/locations'
import * as LocationService from '../services/LocationService'
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material'
import * as Helper from '../common/Helper'
import Pager from './Pager'
import * as movininTypes from 'movinin-types'

import '../assets/css/location-list.css'

const LocationList = (
  {
    keyword: locationKeyword,
    reload: locationReload,
    onLoad,
    onDelete
  }: {
    keyword?: string
    reload?: boolean
    onLoad: movininTypes.DataEvent<movininTypes.Location>
    onDelete: (rowCount: number) => void
  }
) => {
  const [keyword, setKeyword] = useState(locationKeyword)
  const [reload, setReload] = useState(false)
  const [init, setInit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetch, setFetch] = useState(false)
  const [rows, setRows] = useState<movininTypes.Location[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openInfoDialog, setOpenInfoDialog] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [locationIndex, setLocationIndex] = useState(-1)

  const _fetch = async (page: number, keyword?: string) => {
    try {
      setLoading(true)

      const data = await LocationService.getLocations(keyword || '', page, Env.PAGE_SIZE)
      const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
      if (!_data) {
        Helper.error()
        return
      }
      const totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

      let _rows = []
      if (Env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || Env.isMobile()) {
        _rows = page === 1 ? _data.resultData : [...rows, ..._data.resultData]
      } else {
        _rows = _data.resultData
      }

      setRows(_rows)
      setRowCount((page - 1) * Env.PAGE_SIZE + _rows.length)
      setTotalRecords(totalRecords)
      setFetch(_data.resultData.length > 0)

      if (((Env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || Env.isMobile()) && page === 1)
        || (Env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !Env.isMobile())) {
        window.scrollTo(0, 0)
      }

      if (onLoad) {
        onLoad({ rows: _data.resultData, rowCount: totalRecords })
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
      setInit(false)
    }
  }

  useEffect(() => {
    if (locationKeyword !== keyword) {
      _fetch(1, locationKeyword)
    }
    setKeyword(locationKeyword || '')
  }, [locationKeyword, keyword]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (locationReload && !reload) {
      _fetch(1, '')
    }
    setReload(locationReload || false)
  }, [locationReload, reload]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    _fetch(page, keyword)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (Env.PAGINATION_MODE === Const.PAGINATION_MODE.INFINITE_SCROLL || Env.isMobile()) {
      const element = document.querySelector('body')

      if (element) {
        element.onscroll = () => {
          if (fetch
            && !loading
            && window.scrollY > 0
            && window.scrollY + window.innerHeight + Env.INFINITE_SCROLL_OFFSET >= document.body.scrollHeight) {
            setLoading(true)
            setPage(page + 1)
          }
        }
      }
    }
  }, [fetch, loading, page, keyword]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (e: React.MouseEvent<HTMLElement>) => {
    try {
      const locationId = e.currentTarget.getAttribute('data-id') as string
      const locationIndex = Number(e.currentTarget.getAttribute('data-index') as string)

      const status = await LocationService.check(locationId)

      if (status === 204) {
        setOpenDeleteDialog(true)
        setLocationId(locationId)
        setLocationIndex(locationIndex)
      } else if (status === 200) {
        setOpenInfoDialog(true)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const handleCloseInfo = () => {
    setOpenInfoDialog(false)
  }

  const handleConfirmDelete = async () => {
    try {
      if (locationId !== '' && locationIndex > -1) {
        setLoading(true)
        setOpenDeleteDialog(false)

        const status = await LocationService.deleteLocation(locationId)

        if (status === 200) {
          const _rowCount = rowCount - 1

          rows.splice(locationIndex, 1)

          setRows(rows)
          setRowCount(_rowCount)
          setTotalRecords(totalRecords - 1)
          setLocationId('')
          setLocationIndex(-1)
          setLoading(false)

          if (onDelete) {
            onDelete(_rowCount)
          }
        } else {
          Helper.error()
          setLocationId('')
          setLocationIndex(-1)
          setLoading(false)
        }
      } else {
        Helper.error()
        setOpenDeleteDialog(false)
        setLocationId('')
        setLocationIndex(-1)
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false)
    setLocationId('')
    setLocationIndex(-1)
  }

  return (
    <>
      <section className="location-list">
        {rows.length === 0 ? (
          !init
          && !loading
          && (
            <Card variant="outlined" className="empty-list">
              <CardContent>
                <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
              </CardContent>
            </Card>
          )
        ) : (
          <List>
            {rows.map((location, index) => (
              <ListItem
                className="location-list-item"
                key={location._id}
                secondaryAction={
                  <div>
                    <Tooltip title={commonStrings.UPDATE}>
                      <IconButton edge="end" href={`/update-location?l=${location._id}`}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={commonStrings.DELETE}>
                      <IconButton edge="end" data-id={location._id} data-index={index} onClick={handleDelete}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <LocationIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={<Typography className="location-title">{location.name}</Typography>} />
              </ListItem>
            ))}
          </List>
        )}
        <Dialog disableEscapeKeyDown maxWidth="xs" open={openInfoDialog}>
          <DialogTitle className="dialog-header">{commonStrings.INFO}</DialogTitle>
          <DialogContent>{strings.CANNOT_DELETE_LOCATION}</DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleCloseInfo} variant="contained" className="btn-secondary">
              {commonStrings.CLOSE}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog disableEscapeKeyDown maxWidth="xs" open={openDeleteDialog}>
          <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
          <DialogContent>{strings.DELETE_LOCATION}</DialogContent>
          <DialogActions className="dialog-actions">
            <Button onClick={handleCancelDelete} variant="contained" className="btn-secondary">
              {commonStrings.CANCEL}
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error">
              {commonStrings.DELETE}
            </Button>
          </DialogActions>
        </Dialog>
      </section>
      {Env.PAGINATION_MODE === Const.PAGINATION_MODE.CLASSIC && !Env.isMobile() && (
        <Pager
          page={page}
          pageSize={Env.PAGE_SIZE}
          rowCount={rowCount}
          totalRecords={totalRecords}
          onNext={() => setPage(page + 1)}
          onPrevious={() => setPage(page - 1)}
        />
      )}
    </>
  )
}

export default LocationList
