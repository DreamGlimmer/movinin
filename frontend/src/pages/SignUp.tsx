import React, { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Checkbox,
  Link
} from '@mui/material'
import validator from 'validator'
import { intervalToDuration } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/sign-up'
import * as UserService from '../services/UserService'
import Master from '../components/Master'
import Error from '../components/Error'
import Backdrop from '../components/SimpleBackdrop'
import DatePicker from '../components/DatePicker'
import * as Helper from '../common/Helper'

import '../assets/css/signup.css'

function SignUp() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(Env.DEFAULT_LANGUAGE)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [birthDate, setBirthDate] = useState<Date>()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [reCaptchaToken, setReCaptchaToken] = useState('')
  const [error, setError] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [tosChecked, setTosChecked] = useState(false)
  const [tosError, setTosError] = useState(false)
  const [phoneValid, setPhoneValid] = useState(true)
  const [phone, setPhone] = useState('')
  const [birthDateValid, setBirthDateValid] = useState(true)

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
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
            setError(false)
            return false
        } catch (err) {
          Helper.error(err)
          setEmailError(false)
          setEmailValid(true)
          return false
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

  const handlePhoneBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    validatePhone(e.target.value)
  }

  const validateBirthDate = (date?: Date) => {
    if (date && movininHelper.isDate(date)) {
      const now = new Date()
      const sub = intervalToDuration({ start: date, end: now }).years ?? 0
      const _birthDateValid = sub >= Env.MINIMUM_AGE

      setBirthDateValid(_birthDateValid)
      return _birthDateValid
    }
      setBirthDateValid(true)
      return true
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleRecaptchaVerify = (token: string | null) => {
    setReCaptchaToken(token || '')
    setRecaptchaError(!token)
  }

  const handleTosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTosChecked(e.target.checked)

    if (e.target.checked) {
      setTosError(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const _emailValid = await validateEmail(email)
      if (!_emailValid) {
        return
      }

      const _phoneValid = validatePhone(phone)
      if (!_phoneValid) {
        return
      }

      const _birthDateValid = validateBirthDate(birthDate)
      if (!birthDate || !_birthDateValid) {
        return
      }

      if (password.length < 6) {
        setPasswordError(true)
        setRecaptchaError(false)
        setPasswordsDontMatch(false)
        setError(false)
        setTosError(false)
        return
      }

      if (password !== confirmPassword) {
        setPasswordError(false)
        setRecaptchaError(false)
        setPasswordsDontMatch(true)
        setError(false)
        setTosError(false)
        return
      }

      if (Env.RECAPTCHA_ENABLED && !reCaptchaToken) {
        setPasswordError(false)
        setRecaptchaError(true)
        setPasswordsDontMatch(false)
        setError(false)
        setTosError(false)
        return
      }

      if (!tosChecked) {
        setPasswordError(false)
        setRecaptchaError(false)
        setPasswordsDontMatch(false)
        setError(false)
        setTosError(true)
        return
      }

      setLoading(true)

      const data: movininTypes.FrontendSignUpPayload = {
        email,
        phone,
        password,
        fullName,
        birthDate,
        language: UserService.getLanguage(),
      }

      const status = await UserService.signup(data)

      if (status === 200) {
        const signInResult = await UserService.signin({
          email,
          password,
        })

        if (signInResult.status === 200) {
          navigate(`/${window.location.search}`)
        } else {
          setPasswordError(false)
          setRecaptchaError(false)
          setPasswordsDontMatch(false)
          setError(true)
          setTosError(false)
          setLoading(false)
        }
      } else {
        setPasswordError(false)
        setRecaptchaError(false)
        setPasswordsDontMatch(false)
        setError(true)
        setTosError(false)
      }
    } catch (err) {
      Helper.error(err)
      setPasswordError(false)
      setRecaptchaError(false)
      setPasswordsDontMatch(false)
      setError(true)
      setTosError(false)
    }
  }

  const onLoad = (user?: movininTypes.User) => {
    if (user) {
      navigate('/')
    } else {
      setLanguage(UserService.getLanguage())
      setVisible(true)
    }
  }

  return (
    <Master strict={false} onLoad={onLoad}>
      {visible && (
        <div className="signup">
          <Paper className="signup-form" elevation={10}>
            <h1 className="signup-form-title">
              {' '}
              {strings.SIGN_UP_HEADING}
              {' '}
            </h1>
            <form onSubmit={handleSubmit}>
              <div>
                <FormControl fullWidth margin="dense">
                  <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
                  <OutlinedInput type="text" label={commonStrings.FULL_NAME} value={fullName} required onChange={handleFullNameChange} autoComplete="off" />
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
                  <OutlinedInput
                    type="text"
                    label={commonStrings.EMAIL}
                    error={!emailValid || emailError}
                    value={email}
                    onBlur={handleEmailBlur}
                    onChange={handleEmailChange}
                    required
                    autoComplete="off"
                  />
                  <FormHelperText error={!emailValid || emailError}>
                    {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                    {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
                  </FormHelperText>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel className="required">{commonStrings.PHONE}</InputLabel>
                  <OutlinedInput
                    type="text"
                    label={commonStrings.PHONE}
                    error={!phoneValid}
                    value={phone}
                    onBlur={handlePhoneBlur}
                    onChange={handlePhoneChange}
                    required
                    autoComplete="off"
                  />
                  <FormHelperText error={!phoneValid}>{(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}</FormHelperText>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <DatePicker
                    label={commonStrings.BIRTH_DATE}
                    value={birthDate}
                    variant="outlined"
                    required
                    onChange={(_birthDate) => {
                      if (_birthDate) {
                        const _birthDateValid = validateBirthDate(_birthDate)

                        setBirthDate(_birthDate)
                        setBirthDateValid(_birthDateValid)
                      }
                    }}
                    language={language}
                  />
                  <FormHelperText error={!birthDateValid}>{(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}</FormHelperText>
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel className="required">{commonStrings.PASSWORD}</InputLabel>
                  <OutlinedInput
                    label={commonStrings.PASSWORD}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    type="password"
                    inputProps={{
                      autoComplete: 'new-password',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </FormControl>
                <FormControl fullWidth margin="dense">
                  <InputLabel className="required">{commonStrings.CONFIRM_PASSWORD}</InputLabel>
                  <OutlinedInput
                    label={commonStrings.CONFIRM_PASSWORD}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    type="password"
                    inputProps={{
                      autoComplete: 'new-password',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                </FormControl>

                {Env.RECAPTCHA_ENABLED && (
                  <div className="recaptcha">
                    <ReCAPTCHA
                      sitekey={Env.RECAPTCHA_SITE_KEY || ''}
                      hl={language}
                      onChange={handleRecaptchaVerify}
                    />
                  </div>
                )}

                <div className="signup-tos">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <Checkbox checked={tosChecked} onChange={handleTosChange} color="primary" />
                        </td>
                        <td>
                          <Link href="/tos" target="_blank" rel="noreferrer">
                            {commonStrings.TOS}
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="buttons">
                  <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small">
                    {strings.SIGN_UP}
                  </Button>
                  <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" href="/">
                    {' '}
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </div>
              <div className="form-error">
                {passwordError && <Error message={commonStrings.PASSWORD_ERROR} />}
                {passwordsDontMatch && <Error message={commonStrings.PASSWORDS_DONT_MATCH} />}
                {recaptchaError && <Error message={commonStrings.RECAPTCHA_ERROR} />}
                {tosError && <Error message={commonStrings.TOS_ERROR} />}
                {error && <Error message={strings.SIGN_UP_ERROR} />}
              </div>
            </form>
          </Paper>
        </div>
      )}
      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </Master>
  )
}

export default SignUp
