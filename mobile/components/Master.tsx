import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'

import * as UserService from '../services/UserService'
import Button from '../components/Button'
import i18n from '../lang/i18n'
import * as Helper from '../common/Helper'
import Header from '../components/Header'
import * as NotificationService from '../services/NotificationService'
import * as movininTypes from  '../miscellaneous/movininTypes'

const Master = (
  {
    navigation,
    strict,
    route,
    reload,
    notificationCount: mNotificationCount,
    style,
    title,
    hideTitle,
    avatar,
    children,
    onLoad
  }: {
    navigation: NativeStackNavigationProp<StackParams, keyof StackParams>
    strict?: boolean
    route?: RouteProp<StackParams, keyof StackParams>,
    reload?: boolean
    notificationCount?: number
    style?: object
    title?: string
    hideTitle?: boolean
    avatar?: string | null
    children: React.ReactNode
    onLoad: (user?: movininTypes.User) => void
  }
) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<movininTypes.User | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  const exit = async (reload = false) => {
    if (strict) {
      await UserService.signout(navigation, false, true)

      if (onLoad) {
        onLoad()
      }
    } else {
      await UserService.signout(navigation, false, false)
      setLoggedIn(false)

      if (onLoad) {
        onLoad()
      }

      if (reload && route) {
        Helper.navigate(route, navigation)
      } else {
        setLoading(false)
      }
    }
  }

  const _init = async () => {
    try {
      setLoading(true)

      const language = await UserService.getLanguage()
      i18n.locale = language

      const currentUser = await UserService.getCurrentUser()

      if (currentUser?._id) {
        const status = await UserService.validateAccessToken()

        if (status === 200) {
          const user = await UserService.getUser(currentUser._id)

          if (user) {
            if (user.blacklisted) {
              await exit(true)
              return
            }

            const notificationCounter = await NotificationService.getNotificationCounter(currentUser._id)
            setNotificationCount(notificationCounter.count)

            setLoggedIn(true)
            setUser(user)
            setLoading(false)

            if (onLoad) {
              onLoad(user)
            }
          } else {
            await exit(true)
          }
        } else {
          await exit(true)
        }
      } else {
        setUser(null)
        await exit(false)
      }
    } catch (err) {
      Helper.error(err, false)
      await exit(true)
    }
  }

  useEffect(() => {
    if (reload) {
      _init()
    }
  }, [reload]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setNotificationCount(mNotificationCount ?? 0)
  }, [mNotificationCount])

  const handleResend = async () => {
    try {
      if (user) {
        const data = { email: user.email }

        const status = await UserService.resendLink(data)

        if (status === 200) {
          Helper.toast(i18n.t('VALIDATION_EMAIL_SENT'))
        } else {
          Helper.toast(i18n.t('VALIDATION_EMAIL_ERROR'))
        }
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  return (
    <View style={{ ...styles.container, ...style }}>
      <Header title={title} hideTitle={hideTitle} loggedIn={loggedIn} notificationCount={notificationCount} reload={reload} _avatar={avatar} />
      {(!loading &&
        ((!user && !strict) || (user && user.verified) ? (
          children
        ) : (
          <View style={styles.validate}>
            <Text style={styles.validateText}>{i18n.t('VALIDATE_EMAIL')}</Text>
            <Button style={styles.validateButton} label={i18n.t('RESEND')} onPress={handleResend} />
          </View>
        ))) || <></>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
  },
  validate: {
    marginTop: 15,
    padding: 15,
  },
  validateText: {
    color: 'rgba(0, 0, 0, .7)',
    fontSize: 14,
    lineHeight: 20,
  },
  validateButton: {
    marginTop: 15,
  },
})

export default Master
