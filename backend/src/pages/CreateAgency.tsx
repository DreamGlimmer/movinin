import React, { useState } from 'react'
import Master from '../components/Master'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/create-agency'
import * as UserService from '../services/UserService'
import * as AgencyService from '../services/AgencyService'
import Error from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import Avatar from '../components/Avatar'
import { Input, InputLabel, FormControl, FormHelperText, Button, Paper, FormControlLabel, Switch } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import validator from 'validator'
import { useNavigate } from 'react-router-dom'
import * as Helper from '../common/Helper'
import * as movininTypes from 'movinin-types'

import '../assets/css/create-agency.css'

const CreateAgency = () => {
  const navigate = useNavigate()
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
  const [emailValid, setEmailValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [payLater, setPayLater] = useState(true)

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)

    if (!e.target.value) {
      setFullNameError(false)
    }
  }

  const validateFullName = async (fullName: string) => {
    if (fullName) {
      try {
        const status = await AgencyService.validate({ fullName })

        if (status === 200) {
          setFullNameError(false)
          return true
        } else {
          setFullNameError(true)
          return false
        }
      } catch (err) {
        Helper.error(err)
      }
    } else {
      setFullNameError(false)
      return false
    }
  }

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateFullName(e.target.value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (!e.target.value) {
      setEmailError(false)
      setEmailValid(true)
    }
  }

  const validateEmail = async (email?: string) => {
    if (email) {
      if (validator.isEmail(email)) {
        try {
          const status = await UserService.validateEmail({ email })

          if (status === 200) {
            setEmailError(false)
            setEmailValid(true)
            return true
          } else {
            setEmailError(true)
            setEmailValid(true)
            return false
          }
        } catch (err) {
          Helper.error(err)
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
    setLoading(false)
    setAvatar(avatar)

    if (avatar !== null) {
      setAvatarError(false)
    }
  }

  const handleCancel = async () => {
    try {
      if (avatar) {
        setLoading(true)

        await UserService.deleteTempAvatar(avatar)
        navigate('/agencies')
      } else {
        navigate('/agencies')
      }
    } catch {
      navigate('/agencies')
    }
  }

  const onLoad = (user?: movininTypes.User) => {
    if (user && user.verified) {
      setVisible(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const emailValid = await validateEmail(email)
      if (!emailValid) {
        return
      }

      const fullNameValid = await validateFullName(fullName)
      if (!fullNameValid) {
        return
      }

      const phoneValid = validatePhone(phone)
      if (!phoneValid) {
        return
      }

      if (!avatar) {
        setAvatarError(true)
        setError(false)
        return
      }

      setLoading(true)

      const data: movininTypes.CreateUserPayload = {
        email,
        fullName,
        phone,
        location,
        bio,
        language: UserService.getLanguage(),
        type: movininTypes.RecordType.Agency,
        avatar,
        payLater,
      }

      const status = await UserService.create(data)

      if (status === 200) {
        navigate('/agencies')
      } else {
        setError(true)
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Master onLoad={onLoad} strict admin={true}>
      <div className="create-agency">
        <Paper className="agency-form agency-form-wrapper" elevation={10} style={visible ? {} : { display: 'none' }}>
          <h1 className="agency-form-title"> {strings.CREATE_AGENCY_HEADING} </h1>
          <form onSubmit={handleSubmit}>
            <Avatar
              type={movininTypes.RecordType.Agency}
              mode="create"
              record={null}
              size="large"
              readonly={false}
              onBeforeUpload={onBeforeUpload}
              onChange={onAvatarChange}
              color="disabled"
              className="avatar-ctn"
            />

            <div className="info">
              <InfoIcon />
              <label>{strings.RECOMMENDED_IMAGE_SIZE}</label>
            </div>

            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
              <Input
                id="full-name"
                type="text"
                error={fullNameError}
                required
                onBlur={handleFullNameBlur}
                onChange={handleFullNameChange}
                autoComplete="off" />
              <FormHelperText error={fullNameError}>{(fullNameError && strings.INVALID_AGENCY_NAME) || ''}</FormHelperText>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
              <Input
                id="email"
                type="text"
                error={!emailValid || emailError}
                onBlur={handleEmailBlur}
                onChange={handleEmailChange}
                autoComplete="off"
                required />
              <FormHelperText error={!emailValid || emailError}>
                {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
              </FormHelperText>
            </FormControl>

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

            <div className="info">
              <InfoIcon />
              <label>{commonStrings.OPTIONAL}</label>
            </div>

            <FormControl fullWidth margin="dense">
              <InputLabel>{commonStrings.PHONE}</InputLabel>
              <Input id="phone" type="text" onChange={handlePhoneChange} onBlur={handlePhoneBlur} autoComplete="off" error={!phoneValid} />
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
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Master>
  )
}

export default CreateAgency
