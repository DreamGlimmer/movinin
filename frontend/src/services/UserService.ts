import axios from 'axios'
import Env from '../config/env.config'
import * as movininTypes from 'movinin-types'

export const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')

  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken }
  } else {
    return {}
  }
}

export const signup = (data: movininTypes.BackendSignUpPayload): Promise<number> =>
  axios
    .post(`${Env.API_HOST}/api/sign-up/ `,
      data
    )
    .then((res) => res.status)

export const checkToken = (userId: string, email: string, token: string): Promise<number> =>
  axios
    .get(
      `${Env.API_HOST}/api/check-token/${Env.APP_TYPE}/${encodeURIComponent(userId)}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`
    )
    .then((res) => res.status)

export const deleteTokens = (userId: string): Promise<number> =>
  axios
    .delete(
      `${Env.API_HOST}/api/delete-tokens/${encodeURIComponent(userId)}`
    )
    .then((res) => res.status)

export const resend = (email?: string, reset = false): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/resend/${Env.APP_TYPE}/${encodeURIComponent(email || '')}/${reset}`
    )
    .then((res) => res.status)

export const activate = (data: movininTypes.ActivatePayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/activate/ `,
      data,
      { headers: authHeader() }
    )
    .then((res) => res.status)

export const validateEmail = (data: movininTypes.ValidateEmailPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/validate-email`,
      data
    )
    .then((exist) => exist.status)

export const signin = (data: movininTypes.SignInPayload): Promise<{ status: number, data: movininTypes.User }> =>
  axios
    .post(
      `${Env.API_HOST}/api/sign-in/frontend`,
      data
    )
    .then((res) => {
      if (res.data.accessToken) {
        localStorage.setItem('bc-user', JSON.stringify(res.data))
      }
      return { status: res.status, data: res.data }
    })

export const signout = (redirect = true, redirectSignin = false) => {
  const _signout = () => {
    const deleteAllCookies = () => {
      const cookies = document.cookie.split('')

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
        document.cookie = name + '=expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }

    sessionStorage.clear()
    localStorage.removeItem('bc-user')
    deleteAllCookies()

    if (redirect) {
      window.location.href = '/'
    }
    if (redirectSignin) {
      window.location.href = '/sign-in'
    }
  }

  _signout()
}

export const validateAccessToken = (): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/validate-access-token`,
      null,
      { headers: authHeader() }
    )
    .then((res) => res.status)


export const confirmEmail = (email: string, token: string): Promise<number> => (
  axios
    .post(
      `${Env.API_HOST}/api/confirm-email/` + encodeURIComponent(email) + '/' + encodeURIComponent(token)
    )
    .then((res) => res.status)
)

export const resendLink = (data: movininTypes.ResendLinkPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/resend-link`,
      data,
      { headers: authHeader() }
    )
    .then((res) => res.status)

export const getLanguage = () => {
  const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')

  if (user && user.language) {
    return user.language
  } else {
    const lang = localStorage.getItem('bc-language')
    if (lang && lang.length === 2) {
      return lang
    }
    return Env.DEFAULT_LANGUAGE
  }
}

export const getQueryLanguage = () => {
  const params = new URLSearchParams(window.location.search)
  if (params.has('l')) {
    return params.get('l')
  }
  return ''
}

export const updateLanguage = (data: movininTypes.UpdateLanguagePayload) =>
  axios
    .post(`${Env.API_HOST}/api/update-language`, data, {
      headers: authHeader(),
    })
    .then((res) => {
      if (res.status === 200) {
        const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')
        user.language = data.language
        localStorage.setItem('bc-user', JSON.stringify(user))
      }
      return res.status
    })


export const setLanguage = (lang: string) => {
  localStorage.setItem('bc-language', lang)
}

export const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')
  if (user && user.accessToken) {
    return user
  }
  return null
}

export const getUser = (id: string): Promise<movininTypes.User> =>
  axios
    .get(
      `${Env.API_HOST}/api/user/` + encodeURIComponent(id),
      { headers: authHeader() }
    )
    .then((res) => res.data)

export const updateUser = (data: movininTypes.UpdateUserPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/update-user`,
      data,
      { headers: authHeader() }
    )
    .then((res) => res.status)


export const updateEmailNotifications = (data: movininTypes.UpdateEmailNotificationsPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/update-email-notifications`,
      data,
      { headers: authHeader() }
    )
    .then((res) => {
      if (res.status === 200) {
        const user = getCurrentUser()
        user.enableEmailNotifications = data.enableEmailNotifications
        localStorage.setItem('bc-user', JSON.stringify(user))
      }
      return res.status
    })


export const updateAvatar = (userId: string, file: Blob): Promise<number> => {
  const user = getCurrentUser()
  const formData = new FormData()
  formData.append('image', file)

  return axios
    .post(
      `${Env.API_HOST}/api/update-avatar/${encodeURIComponent(userId)}`,
      formData,
      user && user.accessToken
        ? {
          headers: {
            'x-access-token': user.accessToken,
            'Content-Type': 'multipart/form-data',
          },
        }
        : { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    .then((res) => res.status)
}

export const deleteAvatar = (userId: string): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/delete-avatar/${encodeURIComponent(userId)}`,
      null,
      { headers: authHeader() }
    )
    .then((res) => res.status)

export const checkPassword = (id: string, pass: string): Promise<number> =>
  axios
    .get(
      `${Env.API_HOST}/api/check-password/${encodeURIComponent(id)}/${encodeURIComponent(pass)}`,
      { headers: authHeader() }
    )
    .then((res) => res.status)

export const changePassword = (data: movininTypes.ChangePasswordPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/change-password/ `,
      data,
      { headers: authHeader() }
    )
    .then((res) => res.status)
