import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, ScrollView, View, Pressable, ActivityIndicator } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MaterialIcons } from '@expo/vector-icons'
import { Dialog, Portal, Button as NativeButton, Paragraph } from 'react-native-paper'
import { format } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'
import * as movininTypes from  '../miscellaneous/movininTypes'
import * as movininHelper from '../miscellaneous/movininHelper'

import i18n from '../lang/i18n'
import * as UserService from '../services/UserService'
import Master from '../components/Master'
import * as NotificationService from '../services/NotificationService'
import * as Env from '../config/env.config'
import * as Helper from '../common/Helper'
import Checkbox from '../components/Checkbox'

const NotificationsScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'Notifications'>) => {
  const isFocused = useIsFocused()
  const [reload, setReload] = useState(false)
  const [visible, setVisible] = useState(false)
  const [user, setUser] = useState<movininTypes.User>()
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<movininTypes.Notification[]>([])
  const [totalRecords, setTotalRecords] = useState(-1)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedRows, setSelectedRows] = useState<movininTypes.Notification[]>([])
  const [rowCount, setRowCount] = useState(-1)
  const [locale, setLoacle] = useState(fr)
  const notificationsListRef = useRef<ScrollView>(null)

  const _init = async () => {
    setVisible(false)
    const language = await UserService.getLanguage()
    i18n.locale = language
    setLoacle(language === Env.LANGUAGE.FR ? fr : enUS)

    const currentUser = await UserService.getCurrentUser()

    if (!currentUser || !currentUser._id) {
      await UserService.signout(navigation, false, true)
      return
    }

    const user = await UserService.getUser(currentUser._id)

    if (!user) {
      await UserService.signout(navigation, false, true)
      return
    }

    setUser(user)
    setVisible(true)
  }

  useEffect(() => {
    if (isFocused) {
      _init()
      setReload(true)
    } else {
      setVisible(false)
    }
  }, [route.params, isFocused]) // eslint-disable-line react-hooks/exhaustive-deps

  const onLoad = () => {
    setReload(false)
  }

  const fetch = useCallback(async () => {
    if (user?._id) {
      try {
        setRows([])
        setLoading(true)
        const data = await NotificationService.getNotifications(user._id, page)
        const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
        if (!_data) {
          Helper.error()
          return
        }
        const _rows = _data.resultData.map((row) => ({
          checked: false,
          ...row,
        }))
        const _totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0
        setRows(_rows)
        setTotalRecords(_totalRecords)
        setRowCount((page - 1) * Env.PAGE_SIZE + _rows.length)
        if (notificationsListRef.current) {
          notificationsListRef.current.scrollTo({ x: 0, y: 0, animated: false })
        }
        setLoading(false)
      } catch (err) {
        Helper.error(err)
      }
    }
  }, [user, page])

  useEffect(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    if (user) {
      const _init = async () => {
        if (user?._id) {
          const notificationCounter = await NotificationService.getNotificationCounter(user._id)
          const _notificationCount = notificationCounter.count
          setNotificationCount(_notificationCount)
        }
      }

      _init()
    }
  }, [user])

  const _format = 'eee d LLLL, kk:mm'
  const iconColor = 'rgba(0, 0, 0, 0.54)'
  const disabledIconColor = '#c6c6c6'

  const checkedRows = rows.filter((row) => row.checked)
  const allChecked = rows.length > 0 && checkedRows.length === rows.length
  const indeterminate = checkedRows.length > 0 && checkedRows.length < rows.length
  const previousPageDisabled = page === 1
  const nextPageDisabled = (page - 1) * Env.PAGE_SIZE + rows.length >= totalRecords

  return (
    <Master style={styles.master} navigation={navigation} route={route} onLoad={onLoad} reload={reload} notificationCount={notificationCount} strict>
      {visible && (
        <>
          {totalRecords === 0 && (
            <View style={styles.emptyList}>
              <Text>{i18n.t('EMPTY_NOTIFICATION_LIST')}</Text>
            </View>
          )}

          {totalRecords > 0 && (
            <>
              <View style={styles.headerContainer}>
                <View style={styles.header}>
                  <Checkbox
                    checked={allChecked}
                    indeterminate={indeterminate}
                    onChange={(checked: boolean) => {
                      if (indeterminate) {
                        rows.forEach((row) => {
                          row.checked = false
                        })
                      } else {
                        rows.forEach((row) => {
                          row.checked = checked
                        })
                      }
                      setRows(movininHelper.clone(rows))
                    }}
                  />
                  {checkedRows.length > 0 && (
                    <View style={styles.headerActions}>
                      {checkedRows.some((row) => !row.isRead) && (
                        <Pressable
                          style={styles.action}
                          onPress={async () => {
                            try {
                              if (user?._id) {
                                const _rows = checkedRows.filter((row) => !row.isRead)
                                const ids = _rows.map((row) => row._id)
                                const status = await NotificationService.markAsRead(user._id, ids)

                                if (status === 200) {
                                  _rows.forEach((row) => {
                                    row.isRead = true
                                  })
                                  setRows(movininHelper.clone(rows))
                                  setNotificationCount(notificationCount - _rows.length)
                                } else {
                                  Helper.error()
                                }
                              } else {
                                Helper.error()
                              }
                            } catch (err) {
                              await UserService.signout(navigation)
                            }
                          }}
                        >
                          <MaterialIcons name="drafts" size={24} color={iconColor} />
                        </Pressable>
                      )}
                      {checkedRows.some((row) => row.isRead) && (
                        <Pressable
                          style={styles.action}
                          onPress={async () => {
                            try {
                              if (user?._id) {
                                const _rows = checkedRows.filter((row) => row.isRead)
                                const ids = _rows.map((row) => row._id)
                                const status = await NotificationService.markAsUnread(user._id, ids)

                                if (status === 200) {
                                  _rows.forEach((row) => {
                                    row.isRead = false
                                  })
                                  setRows(movininHelper.clone(rows))
                                  setNotificationCount(notificationCount + _rows.length)
                                } else {
                                  Helper.error()
                                }
                              } else {
                                Helper.error()
                              }
                            } catch (err) {
                              Helper.error(err)
                            }
                          }}
                        >
                          <MaterialIcons name="markunread" size={24} color={iconColor} />
                        </Pressable>
                      )}
                      <Pressable
                        style={styles.action}
                        onPress={() => {
                          setSelectedRows(checkedRows)
                          setOpenDeleteDialog(true)
                        }}
                      >
                        <MaterialIcons name="delete" size={24} color={iconColor} />
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
              <ScrollView ref={notificationsListRef} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {loading && <ActivityIndicator size="large" color="#0D63C9" />}
                {rows.map((row) => (
                  <View key={row._id} style={styles.notificationContainer}>
                    <View style={styles.notificationCheckbox}>
                      <Checkbox
                        checked={row.checked}
                        onChange={(checked: boolean) => {
                          row.checked = checked
                          setRows(movininHelper.clone(rows))
                        }}
                      />
                    </View>
                    <View style={styles.notification}>
                      <Text
                        style={{
                          ...styles.date,
                          fontWeight: !row.isRead ? '700' : '400',
                        }}
                      >
                        {movininHelper.capitalize(format(new Date(row.createdAt as Date), _format, { locale }))}
                      </Text>
                      <View style={styles.messageContainer}>
                        <Text
                          style={{
                            ...styles.message,
                            fontWeight: !row.isRead ? '700' : '400',
                          }}
                        >
                          {row.message}
                        </Text>
                        <View style={styles.notificationActions}>
                          {row.booking && (
                            <Pressable
                              style={styles.action}
                              onPress={async () => {
                                try {
                                  const navigate = () =>
                                    navigation.navigate('Booking', {
                                      id: row.booking || '',
                                    })

                                  if (!row.isRead) {
                                    const status = await NotificationService.markAsRead(user?._id as string, [row._id])

                                    if (status === 200) {
                                      row.isRead = true
                                      setRows(movininHelper.clone(rows))
                                      setNotificationCount(notificationCount - 1)
                                      navigate()
                                    } else {
                                      Helper.error()
                                    }
                                  } else {
                                    navigate()
                                  }
                                } catch (err) {
                                  await UserService.signout(navigation)
                                }
                              }}
                            >
                              <MaterialIcons name="visibility" size={24} color={iconColor} />
                            </Pressable>
                          )}
                          {!row.isRead ? (
                            <Pressable
                              style={styles.action}
                              onPress={async () => {
                                try {
                                  const status = await NotificationService.markAsRead(user?._id as string, [row._id])

                                  if (status === 200) {
                                    row.isRead = true
                                    setRows(movininHelper.clone(rows))
                                    setNotificationCount(notificationCount - 1)
                                  } else {
                                    Helper.error()
                                  }
                                } catch (err) {
                                  Helper.error(err)
                                }
                              }}
                            >
                              <MaterialIcons name="drafts" size={24} color={iconColor} />
                            </Pressable>
                          ) : (
                            <Pressable
                              style={styles.action}
                              onPress={async () => {
                                try {
                                  const status = await NotificationService.markAsUnread(user?._id as string, [row._id])

                                  if (status === 200) {
                                    row.isRead = false
                                    setRows(movininHelper.clone(rows))
                                    setNotificationCount(notificationCount + 1)
                                  } else {
                                    Helper.error()
                                  }
                                } catch (err) {
                                  await UserService.signout(navigation)
                                }
                              }}
                            >
                              <MaterialIcons name="markunread" size={24} color={iconColor} />
                            </Pressable>
                          )}
                          <Pressable
                            style={styles.action}
                            onPress={() => {
                              setSelectedRows([row])
                              setOpenDeleteDialog(true)
                            }}
                          >
                            <MaterialIcons name="delete" size={24} color={iconColor} />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.footer}>
                <Text style={styles.rowCount}>{`${(page - 1) * Env.PAGE_SIZE + 1}-${rowCount} ${i18n.t('OF')} ${totalRecords}`}</Text>
                <View style={styles.footerActions}>
                  <Pressable
                    style={styles.action}
                    disabled={previousPageDisabled}
                    onPress={() => {
                      const _page = page - 1
                      setRowCount(_page < Math.ceil(totalRecords / Env.PAGE_SIZE) ? (_page - 1) * Env.PAGE_SIZE + Env.PAGE_SIZE : totalRecords)
                      setPage(_page)
                    }}
                  >
                    <MaterialIcons name="arrow-back-ios" size={24} color={previousPageDisabled ? disabledIconColor : iconColor} />
                  </Pressable>
                  <Pressable
                    style={styles.action}
                    disabled={nextPageDisabled}
                    onPress={() => {
                      const _page = page + 1
                      setRowCount(_page < Math.ceil(totalRecords / Env.PAGE_SIZE) ? (_page - 1) * Env.PAGE_SIZE + Env.PAGE_SIZE : totalRecords)
                      setPage(_page)
                    }}
                  >
                    <MaterialIcons name="arrow-forward-ios" size={24} color={nextPageDisabled ? disabledIconColor : iconColor} />
                  </Pressable>
                </View>
              </View>

              <Portal>
                <Dialog visible={openDeleteDialog} dismissable={false}>
                  <Dialog.Title style={styles.dialogTitleContent}>{i18n.t('CONFIRM_TITLE')}</Dialog.Title>
                  <Dialog.Content style={styles.dialogContent}>
                    <Paragraph>{selectedRows.length === 1 ? i18n.t('DELETE_NOTIFICATION') : i18n.t('DELETE_NOTIFICATIONS')}</Paragraph>
                  </Dialog.Content>
                  <Dialog.Actions style={styles.dialogActions}>
                    <NativeButton
                      // color='#0D63C9'
                      onPress={() => {
                        setOpenDeleteDialog(false)
                      }}
                    >
                      {i18n.t('CANCEL')}
                    </NativeButton>
                    <NativeButton
                      // color='#0D63C9'
                      onPress={async () => {
                        try {
                          if (user?._id) {
                            const ids = selectedRows.map((row) => row._id)
                            const status = await NotificationService.deleteNotifications(user._id, ids)

                            if (status === 200) {
                              if (selectedRows.length === rows.length) {
                                const _page = 1
                                const _totalRecords = totalRecords - selectedRows.length
                                setRowCount(_page < Math.ceil(_totalRecords / Env.PAGE_SIZE) ? (_page - 1) * Env.PAGE_SIZE + Env.PAGE_SIZE : _totalRecords)

                                if (page > 1) {
                                  setPage(1)
                                } else {
                                  fetch()
                                }
                              } else {
                                selectedRows.forEach((row) => {
                                  rows.splice(
                                    rows.findIndex((_row) => _row._id === row._id),
                                    1,
                                  )
                                })
                                setRows(movininHelper.clone(rows))
                                setRowCount(rowCount - selectedRows.length)
                                setTotalRecords(totalRecords - selectedRows.length)
                              }
                              setNotificationCount(notificationCount - selectedRows.length)
                              setOpenDeleteDialog(false)
                            } else {
                              Helper.error()
                            }
                          } else {
                            Helper.error()
                          }
                        } catch (err) {
                          Helper.error(err)
                        }
                      }}
                    >
                      {i18n.t('DELETE')}
                    </NativeButton>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            </>
          )}
        </>
      )}
    </Master>
  )
}

const styles = StyleSheet.create({
  master: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 15,
  },
  headerContainer: {
    position: 'relative',
    top: 0,
    right: 0,
    left: 0,
    height: 50,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 480,
    paddingLeft: 10,
  },
  headerActions: {
    flexDirection: 'row',
    marginRight: 10,
  },
  list: {
    position: 'relative',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  notificationContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 480,
    paddingRight: 10,
    paddingLeft: 10,
  },
  notificationCheckbox: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  notification: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    color: '#333',
    marginBottom: 10,
    minHeight: 75,
    padding: 10,
    fontSize: 15,
    flexDirection: 'column',
    marginLeft: 10,
  },
  date: {
    color: '#878787',
    marginBottom: 5,
  },
  messageContainer: {
    flexDirection: 'column',
  },
  message: {
    flex: 1,
    flexWrap: 'wrap',
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  action: {
    marginLeft: 10,
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
  footer: {
    position: 'relative',
    right: 0,
    bottom: 0,
    left: 0,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
  },
  rowCount: {
    marginRight: 5,
  },
  footerActions: {
    flexDirection: 'row',
  },
})

export default NotificationsScreen
