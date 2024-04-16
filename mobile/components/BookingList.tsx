import React, { useState, useEffect } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  Text
} from 'react-native'
import {
  Paragraph,
  Dialog,
  Portal,
  Button as NativeButton
} from 'react-native-paper'
import { enUS, fr } from 'date-fns/locale'
import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'
import i18n from '../lang/i18n'
import * as helper from '../common/helper'
import * as BookingService from '../services/BookingService'
import Booking from './Booking'

interface BookingListProps {
  agencies?: string[]
  statuses?: string[]
  filter?: movininTypes.Filter
  user: string
  booking?: string
  language?: string
  header?: React.ReactElement
}

const BookingList = ({
  agencies,
  statuses,
  filter,
  user,
  booking: bookingId,
  language,
  header
}: BookingListProps) => {
  const [firstLoad, setFirstLoad] = useState(true)
  const [onScrollEnd, setOnScrollEnd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetch, setFetch] = useState(false)
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<movininTypes.Booking[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [cancelRequestProcessing, setCancelRequestProcessing] = useState(false)
  const [cancelRequestSent, setCancelRequestSent] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [locale, setLoacle] = useState(fr)

  const fetchData = async (reset = false) => {
    try {
      if (agencies && statuses && agencies.length > 0 && statuses.length > 0) {
        let _page = page
        if (reset) {
          _page = 0
          setPage(0)
        }
        const payload: movininTypes.GetBookingsPayload = {
          agencies,
          statuses,
          filter,
          user,
          language: language || env.DEFAULT_LANGUAGE
        }
        setLoading(true)
        setFetch(true)
        const data = await BookingService.getBookings(payload, _page + 1, env.BOOKINGS_PAGE_SIZE)
        const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
        if (!_data) {
          helper.error()
          return
        }
        const _rows = _page === 0 ? _data.resultData : [...rows, ..._data.resultData]
        setRows(_rows)
        setFetch(_data.resultData.length > 0)
        setLoading(false)
      } else {
        setRows([])
        setFetch(false)
      }
    } catch (err) {
      helper.error(err)
    }
  }

  useEffect(() => {
    setLoacle(language === 'fr' ? fr : enUS)
  }, [language])

  useEffect(() => {
    if (page > 0) {
      fetchData()
    }
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const init = async () => {
      if (firstLoad && agencies && agencies.length > 0 && statuses && statuses.length > 0) {
        await fetchData()
        setFirstLoad(false)
      }
    }

    init()
  }, [firstLoad, agencies, statuses]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!firstLoad) {
      if (agencies && statuses) {
        if (page > 0) {
          fetchData(true)
        } else {
          fetchData()
        }
      }
    }
  }, [agencies, statuses, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const init = async () => {
      try {
        if (bookingId) {
          setLoading(true)
          setFetch(true)
          const booking = await BookingService.getBooking(bookingId)
          setRows(booking ? [booking] : [])
          if (!booking) {
            setDeleted(true)
          }
          setFetch(false)
          setLoading(false)
        }
      } catch (err) {
        helper.error(err)
      }
    }

    if (bookingId) {
      init()
    }
  }, [bookingId])

  const numToRender = Math.floor(env.BOOKINGS_PAGE_SIZE / 2)

  return (
    <View style={styles.container}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        initialNumToRender={numToRender}
        maxToRenderPerBatch={numToRender}
        removeClippedSubviews
        nestedScrollEnabled
        contentContainerStyle={styles.contentContainer}
        style={styles.flatList}
        data={rows}
        renderItem={({ item: booking }) => (
          <Booking
            booking={booking}
            locale={locale}
            language={language as string}
            onCancel={() => {
              setSelectedId(booking._id as string)
              setOpenCancelDialog(true)
            }}
          />
        )}
        keyExtractor={(item) => item._id as string}
        onEndReached={() => setOnScrollEnd(true)}
        onMomentumScrollEnd={() => {
          if (onScrollEnd && fetch && agencies) {
            setPage(page + 1)
          }
          setOnScrollEnd(false)
        }}
        ListHeaderComponent={header}
        ListFooterComponent={
          fetch && !openCancelDialog
            ? <ActivityIndicator size="large" color="#0D63C9" style={styles.indicator} />
            : <></>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.container}>
              <Text style={styles.text}>{deleted ? i18n.t('BOOKING_DELETED') : i18n.t('EMPTY_BOOKING_LIST')}</Text>
            </View>
          )
            : <></>
        }
        refreshing={loading}
      />

      <Portal>
        <Dialog style={styles.dialog} visible={openCancelDialog} dismissable={false}>
          <Dialog.Title style={styles.dialogTitleContent}>{(!cancelRequestSent && !cancelRequestProcessing && i18n.t('CONFIRM_TITLE')) || ''}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {cancelRequestProcessing ? (
              <ActivityIndicator size="large" color="#0D63C9" />
            ) : cancelRequestSent ? (
              <Paragraph>{i18n.t('CANCEL_BOOKING_REQUEST_SENT')}</Paragraph>
            ) : (
              <Paragraph>{i18n.t('CANCEL_BOOKING')}</Paragraph>
            )}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            {!cancelRequestProcessing && (
              <NativeButton
                // color='#0D63C9'
                onPress={() => {
                  setOpenCancelDialog(false)
                  if (cancelRequestSent) {
                    setTimeout(() => {
                      setCancelRequestSent(false)
                    }, 500)
                  }
                }}
              >
                {i18n.t('CLOSE')}
              </NativeButton>
            )}
            {!cancelRequestSent && !cancelRequestProcessing && (
              <NativeButton
                // color='#0D63C9'
                onPress={async () => {
                  try {
                    const row = rows.find((r) => r._id === selectedId)
                    if (!row) {
                      helper.error()
                      return
                    }

                    setCancelRequestProcessing(true)
                    const status = await BookingService.cancel(selectedId)

                    if (status === 200) {
                      row.cancelRequest = true

                      setCancelRequestSent(true)
                      setRows(rows)
                      setSelectedId('')
                      setCancelRequestProcessing(false)
                    } else {
                      helper.error()
                      setCancelRequestProcessing(false)
                      setOpenCancelDialog(false)
                    }
                  } catch (err) {
                    helper.error(err)
                    setCancelRequestProcessing(false)
                    setOpenCancelDialog(false)
                  }
                }}
              >
                {i18n.t('CONFIRM')}
              </NativeButton>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#333',
    fontSize: 12,
  },
  contentContainer: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
  },
  flatList: {
    alignSelf: 'stretch',
  },
  indicator: {
    margin: 10,
  },
  dialog: {
    width: '90%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  dialogTitleContent: {
    textAlign: 'center',
  },
  dialogContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogActions: {
    height: 75,
  },
})

export default BookingList
