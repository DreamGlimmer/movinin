import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { Avatar, Badge } from 'react-native-paper'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as movininHelper from ':movinin-helper'

import * as UserService from '../services/UserService'
import * as env from '../config/env.config'
import { useGlobalContext, GlobalContextType } from '../context/GlobalContext'
import * as NotificationService from '../services/NotificationService'

interface HeaderProps {
  title?: string
  hideTitle?: boolean
  loggedIn?: boolean
  reload?: boolean
  _avatar?: string | null
}

const Header = ({ title,
  hideTitle,
  loggedIn,
  reload,
  _avatar
}: HeaderProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParams, keyof StackParams>>()
  const { notificationCount, setNotificationCount } = useGlobalContext() as GlobalContextType

  const [avatar, setAvatar] = useState<string | null | undefined>(null)

  useEffect(() => {
    const init = async () => {
      const currentUser = await UserService.getCurrentUser()
      if (currentUser && currentUser._id) {
        const user = await UserService.getUser(currentUser._id)

        if (user.avatar) {
          setAvatar(movininHelper.joinURL(env.CDN_USERS, user.avatar))
        } else {
          setAvatar('')
        }

        const notificationCounter = await NotificationService.getNotificationCounter(currentUser._id)
        setNotificationCount(notificationCounter.count)
      }
    }

    if (reload) {
      init()
    }
  }, [reload, setNotificationCount])

  useEffect(() => {
    setAvatar(_avatar)
  }, [_avatar])

  return (
    <View style={styles.container}>
      <Pressable hitSlop={15} style={styles.menu} onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
        <MaterialIcons name="menu" size={24} color="#fff" />
      </Pressable>
      {!hideTitle && (
        <View>
          <Text style={styles.text}>{title}</Text>
        </View>
      )}
      {loggedIn && (
        <View style={styles.actions}>
          <Pressable style={styles.notifications} onPress={() => navigation.navigate('Notifications', {})}>
            {notificationCount > 0 && (
              <Badge style={styles.badge} size={18}>
                {notificationCount}
              </Badge>
            )}
            <MaterialIcons name="notifications" size={24} color="#fff" style={styles.badgeIcon} />
          </Pressable>
          <Pressable style={styles.avatar} onPress={() => navigation.navigate('Settings', {})}>
            {avatar ? <Avatar.Image size={24} source={{ uri: avatar }} /> : <MaterialIcons name="account-circle" size={24} color="#fff" />}
          </Pressable>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D63C9',
    elevation: 5,
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: '#fff',
  },
  menu: {
    padding: 5,
  },
  actions: {
    flexDirection: 'row',
  },
  notifications: {
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  avatar: {
    marginLeft: 2,
    padding: 5,
  },
  badge: {
    backgroundColor: '#D32F2F',
    color: '#ffffff',
    position: 'absolute',
    top: -2,
    right: 2,
    zIndex: 2,
  },
  badgeIcon: {
    zIndex: 1,
  },
})

export default Header
