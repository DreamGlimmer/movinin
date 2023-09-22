import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Keyboard } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import * as Env from '../config/env.config'
import i18n from '../lang/i18n'
import * as UserService from '../services/UserService'
import * as Helper from '../common/Helper'
import Master from '../components/Master'
import Button from '../components/Button'
import LocationSelectList from '../components/LocationSelectList'
import DateTimePicker from '../components/DateTimePicker'

const HomeScreen = ({ navigation, route }: NativeStackScreenProps<StackParams, 'Home'>) => {
  const isFocused = useIsFocused()

  const _minDate = new Date()
  _minDate.setDate(_minDate.getDate() + 1)

  const [init, setInit] = useState(false)
  const [visible, setVisible] = useState(false)
  const [location, setLocation] = useState('')
  const [closeLocation, setCloseLocation] = useState(false)
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [minDate, setMinDate] = useState(_minDate)
  const [language, setLanguage] = useState(Env.DEFAULT_LANGUAGE)
  const [blur, setBlur] = useState(false)
  const [reload, setReload] = useState(false)

  const _init = async () => {
    const language = await UserService.getLanguage()
    i18n.locale = language
    setLanguage(language)

    setLocation('')
    setFrom(undefined)
    setTo(undefined)

    Keyboard.addListener('keyboardDidHide', () => {
      setBlur(true)
    })

    setInit(true)
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

  const handleLocationSelect = (location: string) => {
    setLocation(location)
  }

  const blurLocations = () => {
    setBlur(true)
    setCloseLocation(true)
  }

  const handleTouchableOpacityClick = () => {
    blurLocations()
  }

  const handleSearch = () => {
    blurLocations()

    if (!location) {
      return Helper.toast(i18n.t('LOCATION_EMPTY'))
    }

    if (!from) {
      return Helper.toast(i18n.t('FROM_DATE_EMPTY'))
    }

    if (!to) {
      return Helper.toast(i18n.t('TO_DATE_EMPTY'))
    }

    const params = {
      location,
      from: from.getTime(),
      to: to.getTime(),
    }
    navigation.navigate('Properties', params)
  }

  const now = new Date()

  return (
    <Master style={styles.master} navigation={navigation} onLoad={onLoad} reload={reload} route={route}>
      {init && visible && (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          <View style={styles.contentContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoMain}>{"Movin' In"}</Text>
              <Text style={styles.logoRegistered}>®</Text>
            </View>

            <TouchableOpacity
              style={{
                position: 'absolute',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                opacity: 0,
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
              }}
              onPress={handleTouchableOpacityClick}
            />

            <LocationSelectList
              label={i18n.t('LOCATION')}
              style={styles.component}
              onSelectItem={handleLocationSelect}
              selectedItem={location}
              onFetch={() => {
                setCloseLocation(false)
              }}
              onFocus={() => {
                setBlur(false)
              }}
              close={closeLocation}
              blur={blur}
            />

            <DateTimePicker
              mode="date"
              locale={language}
              style={styles.component}
              label={i18n.t('FROM_DATE')}
              value={from}
              minDate={now}
              onChange={(date: Date | undefined) => {
                if (date) {
                  date.setHours(12, 0, 0, 0)

                  if (to && to.getTime() <= date.getTime()) {
                    setTo(undefined)
                  }

                  const minDate = new Date(date)
                  minDate.setDate(date.getDate() + 1)
                  setMinDate(minDate)
                } else {
                  setMinDate(_minDate)
                }
                setFrom(date)
              }}
              onPress={blurLocations}
            />

            <DateTimePicker
              mode="date"
              locale={language}
              style={styles.component}
              label={i18n.t('TO_DATE')}
              value={to}
              minDate={minDate}
              onChange={(date: Date | undefined) => {
                if (date) {
                  date.setHours(12, 0, 0, 0)
                }
                setTo(date)
              }}
              onPress={blurLocations}
              hidePicker={!from}
              hidePickerMessage={i18n.t('SELECT_FROM_DATE')}
            />

            <Button style={styles.component} label={i18n.t('SEARCH')} onPress={handleSearch} />
          </View>
        </ScrollView>
      )}
    </Master>
  )
}

const styles = StyleSheet.create({
  master: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  logo: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 10,
    maxWidth: 480,
  },
  logoMain: {
    color: '#0D63C9',
    fontSize: 70,
    fontWeight: '700',
    lineHeight: 125,
  },
  logoRegistered: {
    color: '#0D63C9',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 40,
  },
  component: {
    alignSelf: 'stretch',
    margin: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderTopColor: '#ebebeb',
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  copyright: {
    fontSize: 12,
    color: '#70757a',
  },
  copyrightRegistered: {
    fontSize: 6,
    color: '#70757a',
    position: 'relative',
    top: -5,
  },
})

export default HomeScreen
