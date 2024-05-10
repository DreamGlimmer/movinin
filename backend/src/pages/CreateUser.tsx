import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  SelectChangeEvent
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import validator from 'validator'
import { intervalToDuration } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import Layout from '../components/Layout'
import env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as ccStrings } from '../lang/create-agency'
import { strings } from '../lang/create-user'
import * as helper from '../common/helper'
import * as UserService from '../services/UserService'
import * as AgencyService from '../services/AgencyService'
import Error from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import Avatar from '../components/Avatar'
import DatePicker from '../components/DatePicker'

import '../assets/css/create-user.css'

const CreateUser = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<movininTypes.User>()
  const [admin, setAdmin] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fullNameError, setFullNameError] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [avatarError, setAvatarError] = useState(false)
  const [type, setType] = useState('')
  const [emailValid, setEmailValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [payLater, setPayLater] = useState(true)
  const [birthDate, setBirthDate] = useState<Date>()
  const [birthDateValid, setBirthDateValid] = useState(true)

  const validateFullName = async (_fullName: string) => {
    if (_fullName) {
      try {
        const status = await AgencyService.validate({ fullName: _fullName })

        if (status === 200) {
          setFullNameError(false)
          setError(false)
          return true
        }
        setFullNameError(true)
        setAvatarError(false)
        setError(false)
        return false
      } catch (err) {
        helper.error(err)
        return true
      }
    } else {
      setFullNameError(false)
      return true
    }
  }

  const handleUserTypeChange = async (e: SelectChangeEvent<string>) => {
    const _type = e.target.value

    setType(_type)

    if (_type === movininTypes.RecordType.Agency) {
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

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === movininTypes.RecordType.Agency) {
      await validateFullName(e.target.value)
    } else {
      setFullNameError(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (!e.target.value) {
      setEmailError(false)
      setEmailValid(true)
    }
  }

  const validateEmail = async (_email?: string) => {
    if (_email) {
      if (validator.isEmail(_email)) {
        try {
          const status = await UserService.validateEmail({ email: _email })
          if (status === 200) {
            setEmailError(false)
            setEmailValid(true)
            return true
          }
          setEmailError(true)
          setEmailValid(true)
          setAvatarError(false)
          setError(false)
          return false
        } catch (err) {
          helper.error(err)
          return true
        }
      } else {
        setEmailError(false)
        setEmailValid(false)
        return false
      }
    } else {
      setEmailError(false)
      setEmailValid(true)
      return false
    }
  }

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateEmail(e.target.value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)

    if (!e.target.value) {
      setPhoneValid(true)
    }
  }

  const validatePhone = (_phone?: string) => {
    if (_phone) {
      const _phoneValid = validator.isMobilePhone(_phone)
      setPhoneValid(_phoneValid)

      return _phoneValid
    }
    setPhoneValid(true)

    return true
  }

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validatePhone(e.target.value)
  }

  const validateBirthDate = (date?: Date) => {
    if (date && movininHelper.isDate(date) && type === movininTypes.RecordType.User) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const _birthDateValid = sub >= env.MINIMUM_AGE

      setBirthDateValid(_birthDateValid)
      return _birthDateValid
    }
    setBirthDateValid(true)
    return true
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

  const onAvatarChange = (_avatar: string) => {
    setLoading(false)
    setAvatar(_avatar)

    if (_avatar !== null && type === movininTypes.RecordType.Agency) {
      setAvatarError(false)
    }
  }

  const handleCancel = async () => {
    try {
      if (avatar) {
        await UserService.deleteTempAvatar(avatar)
        navigate('/users')
      } else {
        navigate('/users')
      }
    } catch {
      navigate('/users')
    }
  }

  const onLoad = (_user?: movininTypes.User) => {
    if (_user && _user.verified) {
      const _admin = helper.admin(_user)
      setUser(_user)
      setAdmin(_admin)
      setType(_admin ? '' : movininTypes.RecordType.User)
      setVisible(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      if (!user) {
        helper.error()
        return
      }

      if (type === movininTypes.RecordType.Agency) {
        const fullNameValid = await validateFullName(fullName)

        if (!fullNameValid) {
          return
        }
      } else {
        setFullNameError(false)
      }

      const _emailValid = await validateEmail(email)
      if (!_emailValid) {
        return
      }

      const _phoneValid = validatePhone(phone)
      if (!_phoneValid) {
        return
      }

      const _birthDateValid = validateBirthDate(birthDate)
      if (!_birthDateValid) {
        return
      }

      if (type === movininTypes.RecordType.Agency && !avatar) {
        setAvatarError(true)
        setError(false)
        return
      }

      const language = UserService.getLanguage()
      const agency = admin ? undefined : user._id

      const data: movininTypes.CreateUserPayload = {
        email,
        phone,
        location,
        bio,
        fullName,
        type,
        avatar,
        birthDate,
        language,
        agency,
      }

      if (type === movininTypes.RecordType.Agency) {
        data.payLater = payLater
      }

      const status = await UserService.create(data)

      if (status === 200) {
        navigate('/users')
      } else {
        setError(true)
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const agency = type === movininTypes.RecordType.Agency
  const renter = type === movininTypes.RecordType.User

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <div className="create-user">
          <Paper className="user-form user-form-wrapper" elevation={10} style={visible ? {} : { display: 'none' }}>
            <h1 className="user-form-title">
              {' '}
              {strings.CREATE_USER_HEADING}
              {' '}
            </h1>
            <form onSubmit={handleSubmit}>
              <Avatar
                type={type}
                mode="create"
                record={null}
                size="large"
                readonly={false}
                onBeforeUpload={onBeforeUpload}
                onChange={onAvatarChange}
                color="disabled"
                className="avatar-ctn"
              />

              {agency && (
                <div className="info">
                  <InfoIcon />
                  <span>{ccStrings.RECOMMENDED_IMAGE_SIZE}</span>
                </div>
              )}

              {admin && (
                <FormControl fullWidth margin="dense" style={{ marginTop: agency ? 0 : 39 }}>
                  <InputLabel className="required">{commonStrings.TYPE}</InputLabel>
                  <Select label={commonStrings.TYPE} value={type} onChange={handleUserTypeChange} variant="standard" required fullWidth>
                    <MenuItem value={movininTypes.RecordType.Admin}>{helper.getUserType(movininTypes.UserType.Admin)}</MenuItem>
                    <MenuItem value={movininTypes.RecordType.Agency}>{helper.getUserType(movininTypes.UserType.Agency)}</MenuItem>
                    <MenuItem value={movininTypes.RecordType.User}>{helper.getUserType(movininTypes.UserType.User)}</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                <Input id="full-name" type="text" error={fullNameError} required onBlur={handleFullNameBlur} onChange={handleFullNameChange} autoComplete="off" />
                <FormHelperText error={fullNameError}>{(fullNameError && ccStrings.INVALID_AGENCY_NAME) || ''}</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <Input id="email" type="text" error={!emailValid || emailError} onBlur={handleEmailBlur} onChange={handleEmailChange} autoComplete="off" required />
                <FormHelperText error={!emailValid || emailError}>
                  {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                  {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
                </FormHelperText>
              </FormControl>

              {renter && (
                <FormControl fullWidth margin="dense">
                  <DatePicker
                    label={strings.BIRTH_DATE}
                    value={birthDate}
                    required
                    onChange={(_birthDate) => {
                      if (_birthDate) {
                        const _birthDateValid = validateBirthDate(_birthDate)

                        setBirthDate(_birthDate)
                        setBirthDateValid(_birthDateValid)
                      }
                    }}
                    language={(user && user.language) || env.DEFAULT_LANGUAGE}
                  />
                  <FormHelperText error={!birthDateValid}>{(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}</FormHelperText>
                </FormControl>
              )}

              <FormControl fullWidth margin="dense">
                <InputLabel className={renter ? 'required' : ''}>{commonStrings.PHONE}</InputLabel>
                <Input id="phone" type="text" onBlur={handlePhoneBlur} onChange={handlePhoneChange} error={!phoneValid} required={!!renter} autoComplete="off" />
                <FormHelperText error={!phoneValid}>{(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.LOCATION}</InputLabel>
                <Input id="location" type="text" onChange={handleLocationChange} autoComplete="off" />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.BIO}</InputLabel>
                <Input id="bio" type="text" onChange={handleBioChange} autoComplete="off" />
              </FormControl>

              {agency && (
                <FormControl component="fieldset" style={{ marginTop: 15 }}>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={payLater}
                        onChange={(e) => {
                          setPayLater(e.target.checked)
                        }}
                        color="primary"
                      />
                    )}
                    label={commonStrings.PAY_LATER}
                  />
                </FormControl>
              )}

              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.CREATE}
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
    </Layout>
  )
}

export default CreateUser
