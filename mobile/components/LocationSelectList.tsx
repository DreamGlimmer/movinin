import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import * as Env from '../config/env.config'
import { AutocompleteDropdown, AutocompleteOption } from './AutocompleteDropdown/AutocompleteDropdown'
import * as LocationService from '../services/LocationService'
import * as Helper from '../common/Helper'

const LocationSelectList = (
  {
    selectedItem: listSelectedItem,
    size,
    style,
    backgroundColor,
    label,
    blur,
    close,
    onSelectItem,
    onFetch,
    onChangeText: listOnChangeText,
    onFocus
  }: {
    selectedItem?: string
    size?: 'small'
    style?: object
    backgroundColor?: string
    label: string
    blur?: boolean
    close?: boolean
    onSelectItem?: (selectedItem: string) => void
    onFetch?: () => void
    onChangeText?: (text: string) => void
    onFocus?: () => void
  }
) => {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<AutocompleteOption[]>([])
  const [selectedItem, setSelectedItem] = useState<string>()

  useEffect(() => {
    setSelectedItem(listSelectedItem)
  }, [listSelectedItem])

  const _setSelectedItem = (selectedItem?: string) => {
    setSelectedItem(selectedItem)

    if (onSelectItem) {
      onSelectItem(selectedItem as string)
    }
  }

  const onChangeText = (text: string) => {
    _fetch(text)
  }

  const _fetch = async (text: string) => {
    try {
      setLoading(true)

      const data = await LocationService.getLocations(text, 1, Env.PAGE_SIZE)
      const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
      if (!_data) {
        Helper.error()
        return
      }

      const _rows = _data.resultData.map((location) => ({
        id: location._id,
        title: location.name || '',
      }))
      setRows(_rows)
      if (onFetch) {
        onFetch()
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
    }
  }

  const small = size === 'small'

  return (
    <View style={{ ...style, ...styles.container }}>
      <Text
        style={{
          display: selectedItem ? 'flex' : 'none',
          backgroundColor: backgroundColor ?? '#fafafa',
          color: 'rgba(0, 0, 0, 0.6)',
          fontSize: 12,
          fontWeight: '400',
          paddingRight: 5,
          paddingLeft: 5,
          marginLeft: 15,
          position: 'absolute',
          top: -8,
          zIndex: 1,
        }}
      >
        {label}
      </Text>
      <AutocompleteDropdown
        blur={blur}
        initialValue={selectedItem || ''}
        loading={loading}
        useFilter={false} // set false to prevent rerender twice
        dataSet={rows}
        onSelectItem={(item: AutocompleteOption) => {
          item && _setSelectedItem(item.id)
        }}
        onChangeText={(text: string) => {
          onChangeText(text)
          if (listOnChangeText) {
            listOnChangeText(text)
          }
        }}
        onClear={() => {
          _setSelectedItem(undefined)
        }}
        onFocus={() => {
          if (onFocus) {
            onFocus()
          }
        }}
        textInputProps={{
          placeholder: label || '',
          placeholderTextColor: 'rgba(0, 0, 0, 0.4)',
          autoCorrect: false,
          autoCapitalize: 'none',
          style: {
            borderRadius: 10,
            paddingLeft: 15,
            fontSize: small ? 14 : 16,
          },
        }}
        rightButtonsContainerStyle={{
          right: 8,
          height: 30,
          alignSelf: 'center',
        }}
        inputContainerStyle={{
          backgroundColor: backgroundColor ?? '#fafafa',
          color: 'rgba(0, 0, 0, 0.87)',
          borderColor: 'rgba(0, 0, 0, 0.23)',
          borderWidth: 1,
          borderRadius: 10,
        }}
        suggestionsListContainerStyle={{
          display: close ? 'none' : 'flex',
        }}
        renderItem={(item: AutocompleteOption) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="location-on" size={23} style={{ marginLeft: 5 }} />
            <Text
              style={{
                paddingTop: 15,
                paddingRight: 5,
                paddingBottom: 15,
                paddingLeft: 5,
              }}
            >
              {item.title}
            </Text>
          </View>
        )}
        inputHeight={small ? 37 : 55}
        showChevron={false}
        showClear={!!selectedItem}
        closeOnBlur={true}
        clearOnFocus={false}
        closeOnSubmit={true}
        EmptyResultComponent={<></>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 480,
  },
})

export default LocationSelectList
