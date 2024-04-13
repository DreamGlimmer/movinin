import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'

import * as helper from '../common/helper'
import i18n from '../lang/i18n'
import Accordion from './Accordion'
import BookingStatus from './BookingStatus'
import Link from './Link'
import Switch from './Switch'

interface StatusFilterProps {
  visible?: boolean
  style?: object
  onLoad?: (checkedStatuses: movininTypes.BookingStatus[]) => void
  onChange?: (checkedStatuses: movininTypes.BookingStatus[]) => void
}

const StatusFilter = ({
  visible,
  style,
  onLoad,
  onChange
}: StatusFilterProps) => {
  const [statuses, setStatuses] = useState<movininTypes.StatusFilterItem[]>(
    helper.getBookingStatuses().map((status) => ({ ...status, checked: true }))
  )
  const [checkedStatuses, setCheckedStatuses] = useState(
    helper.getBookingStatuses().map((status) => status.value)
  )
  const [allChecked, setAllChecked] = useState(true)

  useEffect(() => {
    if (onLoad) {
      onLoad(checkedStatuses)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    visible && (
      <View style={{ ...styles.container, ...style }}>
        <Accordion style={styles.accordion} title={i18n.t('BOOKING_STATUS')}>
          <View style={styles.statuses}>
            {statuses.map((status) => (
              typeof status.checked !== 'undefined'
              && (
                <View key={status.value} style={styles.status}>
                  <Switch
                    value={status.checked}
                    onValueChange={(checked) => {
                      if (checked) {
                        status.checked = true
                        setStatuses(movininHelper.clone(statuses))
                        checkedStatuses.push(status.value)

                        if (checkedStatuses.length === statuses.length) {
                          setAllChecked(true)
                        }
                      } else {
                        status.checked = false
                        setStatuses(movininHelper.clone(statuses))
                        const index = checkedStatuses.indexOf(status.value)
                        checkedStatuses.splice(index, 1)

                        if (checkedStatuses.length === 0) {
                          setAllChecked(false)
                        }
                      }

                      if (onChange) {
                        onChange(movininHelper.clone(checkedStatuses))
                      }
                    }}
                  >
                    <BookingStatus style={styles.bookingStatus} status={status.value} />
                  </Switch>
                </View>
              )
            ))}

            <Link
              style={styles.link}
              textStyle={styles.linkText}
              label={allChecked ? i18n.t('UNCHECK_ALL') : i18n.t('CHECK_ALL')}
              onPress={() => {
                let _checkedStatuses: movininTypes.BookingStatus[] = []
                if (allChecked) {
                  statuses.forEach((status) => {
                    status.checked = false
                  })
                  setAllChecked(false)
                  setStatuses(movininHelper.clone(statuses))
                  setCheckedStatuses(_checkedStatuses)
                } else {
                  statuses.forEach((status) => {
                    status.checked = true
                  })
                  setAllChecked(true)
                  setStatuses(movininHelper.clone(statuses))
                  _checkedStatuses = movininHelper.clone(statuses.map((status) => status.value))
                  setCheckedStatuses(_checkedStatuses)

                  if (onChange) {
                    onChange(_checkedStatuses)
                  }
                }
              }}
            />
          </View>
        </Accordion>
      </View>
    )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  accordion: {
    width: '100%',
    maxWidth: 480,
  },
  statuses: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
  },
  status: {
    width: '50%',
    marginBottom: 7,
  },
  bookingStatus: {
    width: 85,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 12,
  },
})

export default StatusFilter
