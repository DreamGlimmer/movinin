import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react'
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Avatar,
  SxProps,
  Theme,
  TextFieldVariants,
  AutocompleteInputChangeReason,
  Chip
} from '@mui/material'
import { LocationOn as LocationIcon, AccountCircle } from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import env from '../config/env.config'

import '../assets/css/multiple-select.css'

interface MultipleSelectProps {
  label?: string
  reference?: any
  selectedOptions?: any[]
  key?: string
  required?: boolean
  options?: any[]
  ListboxProps?: (React.HTMLAttributes<HTMLUListElement> & {
    sx?: SxProps<Theme> | undefined
    ref?: React.Ref<Element> | undefined
  }),
  loading?: boolean
  multiple?: boolean
  type: string
  variant?: TextFieldVariants
  readOnly?: boolean
  callbackFromMultipleSelect?: (newValue: any, _key: string, _reference: any) => void
  onFocus?: React.FocusEventHandler<HTMLDivElement>
  onInputChange?: (event: React.SyntheticEvent<Element, Event>, value?: string, reason?: AutocompleteInputChangeReason) => void
  onClear?: () => void
  onOpen?: (event: React.SyntheticEvent<Element, Event>) => void
}

const ListBox: React.ComponentType<React.HTMLAttributes<HTMLElement>> = forwardRef((props, ref) => {
  const { children, ...rest }: { children?: React.ReactNode } = props

  const innerRef = useRef(null)

  useImperativeHandle(ref, () => innerRef.current)

  return (
    // eslint-disable-next-line
    <ul {...rest} ref={innerRef} role="list-box">
      {children}
    </ul>
  )
})

const MultipleSelect = ({
  label,
  reference,
  selectedOptions,
  key,
  required,
  options,
  ListboxProps,
  loading,
  multiple,
  type,
  variant,
  readOnly,
  callbackFromMultipleSelect,
  onFocus,
  onInputChange,
  onClear,
  onOpen
}: MultipleSelectProps) => {
  const [values, setValues] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')

  if (!options) {
    options = []
  }

  useEffect(() => {
    if (selectedOptions) {
      setValues(selectedOptions)
    }
    if (selectedOptions && selectedOptions.length === 0) {
      setInputValue('')
    }
  }, [selectedOptions, type])

  return (
    <div className="multiple-select">
      <Autocomplete
        readOnly={readOnly}
        options={options}
        value={multiple ? values : values.length > 0 ? values[0] : null}
        getOptionLabel={(option) => (option && option.name) || ''}
        isOptionEqualToValue={(option, value) => option._id === value._id}
        onChange={(event: React.SyntheticEvent<Element, Event>, newValue: any) => {
          if (event && event.type === 'keydown' && 'key' in event && event.key === 'Enter') {
            return
          }
          key = key || ''
          if (multiple) {
            setValues(newValue)
            if (callbackFromMultipleSelect) {
              callbackFromMultipleSelect(newValue, key, reference)
            }
            if (newValue.length === 0 && onClear) {
              onClear()
            }
          } else {
            const value = (newValue && [newValue]) || []
            setValues(value)
            if (callbackFromMultipleSelect) {
              callbackFromMultipleSelect(value, key, reference)
            }
            if (!newValue) {
              if (onClear) {
                onClear()
              }
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
          }
        }}
        clearOnBlur={false}
        clearOnEscape={false}
        loading={loading}
        multiple={multiple}
        handleHomeEndKeys={false}
        renderInput={(params) => {
          const { inputProps } = params
          inputProps.autoComplete = 'off'

          if (type === movininTypes.RecordType.User && !multiple && values.length === 1 && values[0]) {
            const option = values[0]

            return (
              <TextField
                {...params}
                label={label}
                variant={variant || 'outlined'}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        {option.image ? (
                          <Avatar src={movininHelper.joinURL(env.CDN_USERS, option.image)} className="avatar-small suo" />
                        ) : (
                          <AccountCircle className="avatar-small suo" color="disabled" />
                        )}
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )
          }

          if (type === movininTypes.RecordType.Agency && !multiple && values.length === 1 && values[0]) {
            const option = values[0]

            return (
              <TextField
                {...params}
                label={label}
                variant={variant || 'outlined'}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <div className="agency-ia">
                          <img src={movininHelper.joinURL(env.CDN_USERS, option.image)} alt={option.name} />
                        </div>
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )
          }

          if (type === movininTypes.RecordType.Location && !multiple && values.length === 1 && values[0]) {
            return (
              <TextField
                {...params}
                label={label}
                variant={variant || 'outlined'}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )
          }

          if (type === movininTypes.RecordType.Property && !multiple && values.length === 1 && values[0]) {
            const option = values[0]

            return (
              <TextField
                {...params}
                label={label}
                variant={variant || 'outlined'}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <img
                          src={movininHelper.joinURL(env.CDN_PROPERTIES, option.image)}
                          alt={option.name}
                          style={{
                            height: env.SELECTED_PROPERTY_OPTION_IMAGE_HEIGHT,
                          }}
                        />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )
          }

          return (
            <TextField
              {...params}
              label={label}
              variant={variant || 'outlined'}
              required={required && values && values.length === 0}
            />
          )
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue)
          if (onInputChange) {
            onInputChange(event)
          }
        }}
        renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => (
          <Chip {...getTagProps({ index })} key={option._id} label={option.name} />
        ))}
        renderOption={(props, option) => {
          if ('key' in props) delete props.key

          if (type === movininTypes.RecordType.User) {
            return (
              <li {...props} key={option._id} className={`${props.className} ms-option`}>
                <span className="option-image">
                  {option.image ? <Avatar src={movininHelper.joinURL(env.CDN_USERS, option.image)} className="avatar-medium" /> : <AccountCircle className="avatar-medium" color="disabled" />}
                </span>
                <span className="option-name">{option.name}</span>
              </li>
            )
          } if (type === movininTypes.RecordType.Agency) {
            return (
              <li {...props} key={option._id} className={`${props.className} ms-option`}>
                <span className="option-image agency-ia">
                  <img src={movininHelper.joinURL(env.CDN_USERS, option.image)} alt={option.name} />
                </span>
                <span className="option-name">{option.name}</span>
              </li>
            )
          } if (type === movininTypes.RecordType.Location) {
            return (
              <li {...props} key={option._id} className={`${props.className} ms-option`}>
                <span className="option-image">
                  <LocationIcon />
                </span>
                <span className="option-name">{option.name}</span>
              </li>
            )
          } if (type === movininTypes.RecordType.Property) {
            return (
              <li {...props} key={option._id} className={`${props.className} ms-option`}>
                <span className="option-image property-ia">
                  <img
                    src={movininHelper.joinURL(env.CDN_PROPERTIES, option.image)}
                    alt={option.name}
                    style={{
                      height: env.PROPERTY_OPTION_IMAGE_HEIGHT,
                    }}
                  />
                </span>
                <span className="property-option-name">{option.name}</span>
              </li>
            )
          }

          return (
            <li {...props} key={option._id} className={`${props.className} ms-option`}>
              <span>{option.name}</span>
            </li>
          )
        }}
        ListboxProps={ListboxProps || undefined}
        onFocus={onFocus || undefined}
        ListboxComponent={ListBox}
        onOpen={onOpen || undefined}
      />
    </div>
  )
}

export default MultipleSelect
