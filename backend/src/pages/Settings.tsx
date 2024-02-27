import React, { useState } from 'react'
import {
  Input,
  InputLabel,
  FormHelperText,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Paper
} from '@mui/material'
import validator from 'validator'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'
import Master from '../components/Master'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/settings'
import * as UserService from '../services/UserService'
import Backdrop from '../components/SimpleBackdrop'
import Avatar from '../components/Avatar'
import * as Helper from '../common/Helper'

import '../assets/css/settings.css'

const Settings = () => {
  const [user, setUser] = useState<movininTypes.User>()
  const [admin, setAdmin] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(false)

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value)

    if (!e.target.value) {
      setPhoneValid(true)
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value)
  }

  const handleEmailNotificationsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (user) {
        setEnableEmailNotifications(e.target.checked)

        user.enableEmailNotifications = e.target.checked

        const payload: movininTypes.UpdateEmailNotificationsPayload = {
          _id: user._id as string,
          enableEmailNotifications: user.enableEmailNotifications
        }
        const status = await UserService.updateEmailNotifications(payload)

        if (status === 200) {
          setUser(user)
          Helper.info(strings.SETTINGS_UPDATED)
        } else {
          Helper.error()
        }
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onBeforeUpload = () => {
    setLoading(true)
  }

  const onAvatarChange = (avatar: string) => {
    const _user = movininHelper.clone(user)
    _user.avatar = avatar
    setUser(_user)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      if (!user) {
        Helper.error()
        return
      }

      const _phoneValid = validatePhone(phone)
      if (!_phoneValid) {
        return
      }

      const data: movininTypes.UpdateUserPayload = {
        _id: user._id as string,
        fullName,
        phone,
        location,
        bio,
      }

      const status = await UserService.updateUser(data)

      if (status === 200) {
        Helper.info(strings.SETTINGS_UPDATED)
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err)
    }
  }

  const onLoad = (_user?: movininTypes.User) => {
    if (_user) {
      setUser(_user)
      setAdmin(Helper.admin(_user))
      setFullName(_user.fullName)
      setPhone(_user.phone || '')
      setLocation(_user.location || '')
      setBio(_user.bio || '')
      setEnableEmailNotifications(_user.enableEmailNotifications || false)
      setVisible(true)
      setLoading(false)
    }
  }

  return (
    <Master onLoad={onLoad} user={user} strict>
      {visible && user && (
        <div className="settings">
          <Paper className="settings-form settings-form-wrapper" elevation={10}>
            <form onSubmit={handleSubmit}>
              <Avatar
                type={user.type}
                mode="update"
                record={user}
                size="large"
                readonly={false}
                onBeforeUpload={onBeforeUpload}
                onChange={onAvatarChange}
                hideDelete={!admin}
                color="disabled"
                className="avatar-ctn"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                <Input id="full-name" type="text" required onChange={handleFullNameChange} autoComplete="off" value={fullName} />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                <Input id="email" type="text" value={user.email} disabled />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>{commonStrings.PHONE}</InputLabel>
                <Input id="phone" type="text" error={!phoneValid} onChange={handlePhoneChange} autoComplete="off" value={phone} />
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
              <div className="buttons">
                <Button type="submit" variant="contained" className="btn-primary btn-margin btn-margin-bottom" size="small" href="/change-password">
                  {commonStrings.RESET_PASSWORD}
                </Button>
                <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                  {commonStrings.SAVE}
                </Button>
                <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/">
                  {commonStrings.CANCEL}
                </Button>
              </div>
            </form>
          </Paper>
          <Paper className="settings-net settings-net-wrapper" elevation={10}>
            <h1 className="settings-form-title">
              {' '}
              {strings.NETWORK_SETTINGS}
              {' '}
            </h1>
            <FormControl component="fieldset">
              <FormControlLabel control={<Switch checked={enableEmailNotifications} onChange={handleEmailNotificationsChange} />} label={strings.SETTINGS_EMAIL_NOTIFICATIONS} />
            </FormControl>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Master>
  )
}

export default Settings
