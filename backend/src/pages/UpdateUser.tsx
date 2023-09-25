import React, { useState } from 'react'
import Master from '../components/Master'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as ccStrings } from '../lang/create-agency'
import { strings as cuStrings } from '../lang/create-user'
import { strings } from '../lang/update-user'
import * as Helper from '../common/Helper'
import * as UserService from '../services/UserService'
import * as AgencyService from '../services/AgencyService'
import NoMatch from './NoMatch'
import Error from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import Avatar from '../components/Avatar'
import DatePicker from '../components/DatePicker'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Select,
  MenuItem,
  Link,
  FormControlLabel,
  Switch,
  SelectChangeEvent
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import { intervalToDuration } from 'date-fns'
import validator from 'validator'
import { useNavigate } from 'react-router-dom'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'

import '../assets/css/update-user.css'

const UpdateUser = () => {
  const navigate = useNavigate()
  const [loggedUser, setLoggedUser] = useState<movininTypes.User>()
  const [user, setUser] = useState<movininTypes.User>()
  const [visible, setVisible] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullNameError, setFullNameError] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [avatarError, setAvatarError] = useState(false)
  const [type, setType] = useState('')
  const [birthDate, setBirthDate] = useState<Date>()
  const [birthDateValid, setBirthDateValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [payLater, setPayLater] = useState(true)

  const handleUserTypeChange = async (e: SelectChangeEvent<string>) => {
    const type = e.target.value

    setType(e.target.value)

    if (type === movininTypes.RecordType.Agency) {
      await validateFullName(fullName)
    } else {
      setFullNameError(false)
    }
  }

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)

    if (!e.target.value) {
      setFullNameError(false)
    }
  }

  const validateFullName = async (_fullName: string, strict = true) => {
    const __fullName = _fullName || fullName

    if (__fullName && (strict || (!strict && __fullName !== user?.fullName))) {
      try {
        const status = await AgencyService.validate({ fullName: __fullName })

        if (status === 200) {
          setFullNameError(false)
          setError(false)
          return true
        } else {
          setFullNameError(true)
          setAvatarError(false)
          setError(false)
          return false
        }
      } catch (err) {
        Helper.error(err)
      }
    } else {
      setFullNameError(false)
      return true
    }
  }

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === movininTypes.RecordType.Agency) {
      await validateFullName(e.target.value)
    } else {
      setFullNameError(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)

    if (!e.target.value) {
      setPhoneValid(true)
    }
  }

  const validatePhone = (phone?: string) => {
    if (phone) {
      const phoneValid = validator.isMobilePhone(phone)
      setPhoneValid(phoneValid)

      return phoneValid
    } else {
      setPhoneValid(true)

      return true
    }
  }

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validatePhone(e.target.value)
  }

  const validateBirthDate = (date?: Date) => {
    if (date && movininHelper.isDate(date) && type === movininTypes.RecordType.User) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const birthDateValid = sub >= Env.MINIMUM_AGE

      setBirthDateValid(birthDateValid)
      return birthDateValid
    } else {
      setBirthDateValid(true)
      return true
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value)
  }

  const onBeforeUpload = () => {
    setLoading(true)
  }

  const onAvatarChange = (avatar: string) => {
    if (loggedUser && user && loggedUser._id === user._id) {
      const _loggedUser = movininHelper.clone(loggedUser)
      _loggedUser.avatar = avatar

      setLoggedUser(_loggedUser)
    }

    const _user = movininHelper.clone(user)
    _user.avatar = avatar

    setLoading(false)
    setUser(_user)
    setAvatar(avatar)

    if (avatar !== null && type === movininTypes.RecordType.Agency) {
      setAvatarError(false)
    }
  }

  const handleCancel = async () => {
    try {
      if (avatar) {
        setLoading(true)

        await UserService.deleteTempAvatar(avatar)
        navigate('/users')
      } else {
        navigate('/users')
      }
    } catch {
      navigate('/users')
    }
  }

  const handleResendActivationLink = async () => {
    try {
      const status = await UserService.resend(email, false, type === movininTypes.RecordType.User ? 'frontend' : 'backend')

      if (status === 200) {
        Helper.info(commonStrings.ACTIVATION_EMAIL_SENT)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onLoad = async (loggedUser?: movininTypes.User) => {
    if (loggedUser && loggedUser.verified) {
      setLoading(true)

      const params = new URLSearchParams(window.location.search)
      if (params.has('u')) {
        const id = params.get('u')
        if (id && id !== '') {
          try {
            const user = await UserService.getUser(id)

            if (user) {
              setLoggedUser(loggedUser)
              setUser(user)
              setAdmin(Helper.admin(loggedUser))
              setType(user.type || '')
              setEmail(user.email || '')
              setAvatar(user.avatar || '')
              setFullName(user.fullName || '')
              setPhone(user.phone || '')
              setLocation(user.location || '')
              setBio(user.bio || '')
              setBirthDate(user && user.birthDate ? new Date(user.birthDate) : undefined)
              setPayLater(user.payLater || false)
              setVisible(true)
              setLoading(false)
            } else {
              setLoading(false)
              setNoMatch(true)
            }
          } catch (err) {
            Helper.error(err)
            setLoading(false)
            setVisible(false)
          }
        } else {
          setLoading(false)
          setNoMatch(true)
        }
      } else {
        setLoading(false)
        setNoMatch(true)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      if (!user) {
        Helper.error()
        return
      }

      if (type === movininTypes.RecordType.Agency) {
        const fullNameValid = await validateFullName(fullName, false)

        if (!fullNameValid) {
          return
        }
      } else {
        setFullNameError(false)
      }

      const phoneValid = validatePhone(phone)
      if (!phoneValid) {
        return
      }

      const birthDateValid = validateBirthDate(birthDate)
      if (!birthDateValid) {
        return
      }

      if (type === movininTypes.RecordType.Agency && !avatar) {
        setAvatarError(true)
        setError(false)
        return
      }

      const language = UserService.getLanguage()
      const data: movininTypes.UpdateUserPayload = {
        _id: user._id as string,
        phone,
        location,
        bio,
        fullName,
        language,
        type,
        avatar,
        birthDate,
      }

      if (type === movininTypes.RecordType.Agency) {
        data.payLater = payLater
      }

      const status = await UserService.updateUser(data)

      if (status === 200) {
        user.fullName = fullName
        user.type = type
        setUser(user)
        Helper.info(commonStrings.UPDATED)
      } else {
        Helper.error()

        setError(false)
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const agency = type === movininTypes.RecordType.Agency
  const renter = type === movininTypes.RecordType.User
  const activate = admin
    || (loggedUser && user && loggedUser.type === movininTypes.RecordType.Agency && user.type === movininTypes.RecordType.User && user.agency as string === loggedUser._id)

  return (
    <Master onLoad={onLoad} user={loggedUser} strict>
      {loggedUser && user && visible && (
        <div className="update-user">
          <Paper className="user-form user-form-wrapper" elevation={10}>
            <h1 className="user-form-title"> {strings.UPDATE_USER_HEADING} </h1>
            <form onSubmit={handleSubmit}>
              <Avatar
                type={type}
                mode="update"
                record={user}
                size="large"
                readonly={false}
                onBeforeUpload={onBeforeUpload}
                onChange={onAvatarChange}
                color="disabled"
                className="avatar-ctn"
                hideDelete={type === movininTypes.RecordType.Agency}
              />

              {agency && (
                <div className="info">
                  <InfoIcon />
                  <label>{ccStrings.RECOMMENDED_IMAGE_SIZE}</label>
                </div>
              )}

              {admin && (
                <FormControl fullWidth margin="dense" style={{ marginTop: agency ? 0 : 39 }}>
                  <InputLabel className="required">{commonStrings.TYPE}</InputLabel>
                  <Select label={commonStrings.TYPE} value={type} onChange={handleUserTypeChange} variant="standard" required fullWidth>
                    <MenuItem value={movininTypes.RecordType.Admin}>{Helper.getUserType(movininTypes.UserType.Admin)}</MenuItem>
                    <MenuItem value={movininTypes.RecordType.Agency}>{Helper.getUserType(movininTypes.UserType.Agency)}</MenuItem>
                    <MenuItem value={movininTypes.RecordType.User}>{Helper.getUserType(movininTypes.UserType.User)}</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                <Input id="full-name" type="text" error={fullNameError} required onBlur={handleFullNameBlur} onChange={handleFullNameChange} autoComplete="off" value={fullName} />
                <FormHelperText error={fullNameError}>{(fullNameError && ccStrings.INVALID_AGENCY_NAME) || ''}</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <Input id="email" type="text" value={email} disabled />
              </FormControl>

              {renter && (
                <FormControl fullWidth margin="dense">
                  <DatePicker
                    label={cuStrings.BIRTH_DATE}
                    value={birthDate}
                    required
                    onChange={(birthDate) => {
                      if (birthDate) {
                        const birthDateValid = validateBirthDate(birthDate)

                        setBirthDate(birthDate)
                        setBirthDateValid(birthDateValid)
                      }
                    }}
                    language={(user && user.language) || Env.DEFAULT_LANGUAGE}
                  />
                  <FormHelperText error={!birthDateValid}>{(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}</FormHelperText>
                </FormControl>
              )}

              {agency && (
                <FormControl component="fieldset" style={{ marginTop: 15 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={payLater}
                        onChange={(e) => {
                          setPayLater(e.target.checked)
                        }}
                        color="primary"
                      />
                    }
                    label={commonStrings.PAY_LATER}
                  />
                </FormControl>
              )}

              <div className="info">
                <InfoIcon />
                <label>{commonStrings.OPTIONAL}</label>
              </div>

              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.PHONE}</InputLabel>
                <Input id="phone" type="text" onChange={handlePhoneChange} onBlur={handlePhoneBlur} autoComplete="off" value={phone} error={!phoneValid} />
                <FormHelperText error={!phoneValid}>{(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.LOCATION}</InputLabel>
                <Input id="location" type="text" onChange={handleLocationChange} autoComplete="off" value={location} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.BIO}</InputLabel>
                <Input id="bio" type="text" onChange={handleBioChange} autoComplete="off" value={bio} />
              </FormControl>

              {activate && (
                <FormControl fullWidth margin="dense" className="resend-activation-link">
                  <Link onClick={handleResendActivationLink}>{commonStrings.RESEND_ACTIVATION_LINK}</Link>
                </FormControl>
              )}

              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin btn-margin-bottom" size="small" href={`/change-password?u=${user._id}`}>
                  {commonStrings.RESET_PASSWORD}
                </Button>

                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>

                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" onClick={handleCancel}>
                  {commonStrings.CANCEL}
                </Button>
              </div>

              <div className="form-error">
                {error && <Error message={commonStrings.GENERIC_ERROR} />}
                {avatarError && <Error message={commonStrings.IMAGE_REQUIRED} />}
              </div>
            </form>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
      {noMatch && <NoMatch hideHeader />}
    </Master>
  )
}

export default UpdateUser
