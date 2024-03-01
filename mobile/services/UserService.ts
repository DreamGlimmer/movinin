import { Platform } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Localization from 'expo-localization'
import axiosInstance from './axiosInstance'
import * as env from '../config/env.config'
import * as AsyncStorage from '../common/AsyncStorage'
import * as AxiosHelper from '../common/AxiosHelper'
import * as ToastHelper from '../common/ToastHelper'
import * as movininTypes from '../miscellaneous/movininTypes'

AxiosHelper.init(axiosInstance)

/**
 * Get authentication header.
 *
 * @async
 * @returns {unknown}
 */
export const authHeader = async () => {
  const user = await getCurrentUser()

  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken }
  }
  return {}
}

/**
 * Sign up.
 *
 * @param {movininTypes.FrontendSignUpPayload} data
 * @returns {Promise<number>}
 */
export const signup = (data: movininTypes.FrontendSignUpPayload): Promise<number> =>
  axiosInstance
    .post(
      '/api/sign-up',
      data
    )
    .then((res) => res.status)

/**
 * Check validation token.
 *
 * @param {string} userId
 * @param {string} email
 * @param {string} token
 * @returns {Promise<number>}
 */
export const checkToken = (userId: string, email: string, token: string): Promise<number> =>
  axiosInstance
    .get(
      `/api/check-token/${env.APP_TYPE}/${encodeURIComponent(userId)}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`
    )
    .then((res) => res.status)

/**
 * Delete validation tokens.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const deleteTokens = (userId: string): Promise<number> =>
  axiosInstance
    .delete(`/api/delete-tokens/${encodeURIComponent(userId)}`)
    .then((res) => res.status)

/**
 * Resend a forgotten password or activation email.
 *
 * @param {string} email
 * @param {boolean} [reset=false]
 * @returns {Promise<number>}
 */
export const resend = (email: string, reset = false): Promise<number> =>
  axiosInstance
    .post(
      `/api/resend/${env.APP_TYPE}/${encodeURIComponent(email)}/${reset}`
    )
    .then((res) => res.status)

/**
 * Activate an account.
 *
 * @async
 * @param {movininTypes.ActivatePayload} data
 * @returns {Promise<number>}
 */
export const activate = async (data: movininTypes.ActivatePayload): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      '/api/activate',
      data,
      { headers }
    )
    .then((res) => res.status)
}

/**
 * Validate an email.
 *
 * @param {movininTypes.ValidateEmailPayload} data
 * @returns {Promise<number>}
 */
export const validateEmail = (data: movininTypes.ValidateEmailPayload): Promise<number> =>
  axiosInstance
    .post(
      '/api/validate-email',
      data
    )
    .then((res) => res.status)

/**
 * Sign in.
 *
 * @async
 * @param {movininTypes.SignInPayload} data
 * @returns {Promise<{ status: number, data: movininTypes.User }>}
 */
export const signin = async (data: movininTypes.SignInPayload): Promise<{ status: number, data: movininTypes.User }> =>
  axiosInstance
    .post(
      '/api/sign-in/frontend',
      data
    )
    .then(async (res) => {
      if (res.data.accessToken) {
        await AsyncStorage.storeObject('mi-user', res.data)
      }
      return { status: res.status, data: res.data }
    })

/**
 * Get push notification token.
 *
 * @async
 * @param {string} userId
 * @returns {Promise<{ status: number, data: string }>}
 */
export const getPushToken = async (userId: string): Promise<{ status: number, data: string }> => {
  const headers = await authHeader()
  return axiosInstance
    .get(
      `/api/push-token/${encodeURIComponent(userId)}`,
      { headers }
    )
    .then((res) => ({ status: res.status, data: res.data }))
}

/**
 * Create a push notification token.
 *
 * @async
 * @param {string} userId
 * @param {string} token
 * @returns {Promise<number>}
 */
export const createPushToken = async (userId: string, token: string): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      `/api/create-push-token/${encodeURIComponent(userId)}/${encodeURIComponent(token)}`,
      null,
      { headers }
    )
    .then((res) => res.status)
}

/**
 * Delete a push token.
 *
 * @async
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const deletePushToken = async (userId: string): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      `/api/delete-push-token/${encodeURIComponent(userId)}`,
      null,
      { headers }
    )
    .then((res) => res.status)
}

/**
 * Sign out.
 *
 * @async
 * @param {NativeStackNavigationProp<StackParams, keyof StackParams>} navigation
 * @param {boolean} [redirect=true]
 * @param {boolean} [redirectSignin=false]
 * @returns {void}
 */
export const signout = async (
  navigation: NativeStackNavigationProp<StackParams, keyof StackParams>,
  redirect = true,
  redirectSignin = false
) => {
  await AsyncStorage.removeItem('mi-user')

  if (redirect) {
    navigation.navigate('Home', { d: new Date().getTime() })
  }
  if (redirectSignin) {
    navigation.navigate('SignIn', {})
  }
}

/**
 * Validate authentication access token.
 *
 * @async
 * @returns {Promise<number>}
 */
export const validateAccessToken = async (): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      '/api/validate-access-token',
      null,
      {
        headers,
        timeout: env.AXIOS_TIMEOUT,
      }
    )
    .then((res) => res.status)
}

/**
 * Confirm an email.
 *
 * @param {string} email
 * @param {string} token
 * @returns {Promise<number>}
 */
export const confirmEmail = (email: string, token: string): Promise<number> =>
  axiosInstance
    .post(
      `/api/confirm-email/${encodeURIComponent(email)}/${encodeURIComponent(token)}`
    )
    .then((res) => res.status)

/**
 * Resend validation email.
 *
 * @async
 * @param {movininTypes.ResendLinkPayload} data
 * @returns {Promise<number>}
 */
export const resendLink = async (data: movininTypes.ResendLinkPayload): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      '/api/resend-link',
      data,
      { headers }
    )
    .then((res) => res.status)
}

/**
 * Get current language.
 *
 * @async
 * @returns {unknown}
 */
export const getLanguage = async () => {
  const user = await AsyncStorage.getObject<movininTypes.User>('mi-user')

  if (user && user.language) {
    return user.language
  }
  let lang = await AsyncStorage.getString('mi-language')

  if (lang && lang.length === 2) {
    return lang
  }

  lang = Localization.locale.includes('fr') ? 'fr' : env.DEFAULT_LANGUAGE
  return lang
}

/**
 * Update user's langauge.
 *
 * @async
 * @param {movininTypes.UpdateLanguagePayload} data
 * @returns {Promise<number>}
 */
export const updateLanguage = async (data: movininTypes.UpdateLanguagePayload) => {
  const headers = await authHeader()
  return axiosInstance
    .post('/api/update-language', data, { headers }).then(async (res) => {
      if (res.status === 200) {
        const user = await AsyncStorage.getObject<movininTypes.User>('mi-user')
        if (user) {
          user.language = data.language
          await AsyncStorage.storeObject('mi-user', user)
        } else {
          ToastHelper.error()
        }
      }
      return res.status
    })
}

/**
 * Set language.
 *
 * @async
 * @param {string} lang
 * @returns {void}
 */
export const setLanguage = async (lang: string) => {
  await AsyncStorage.storeString('mi-language', lang)
}

/**
 * Get current User.
 *
 * @async
 * @returns {movininTypes.User|null}
 */
export const getCurrentUser = async () => {
  const user = await AsyncStorage.getObject<movininTypes.User>('mi-user')
  if (user && user.accessToken) {
    return user
  }
  return null
}

/**
 * Get User by ID.
 *
 * @async
 * @param {string} id
 * @returns {Promise<movininTypes.User>}
 */
export const getUser = async (id: string): Promise<movininTypes.User> => {
  const headers = await authHeader()
  return axiosInstance
    .get(`/api/user/${encodeURIComponent(id)}`, {
      headers,
    })
    .then((res) => res.data)
}

/**
 * Update a User.
 *
 * @async
 * @param {movininTypes.UpdateUserPayload} data
 * @returns {Promise<number>}
 */
export const updateUser = async (data: movininTypes.UpdateUserPayload): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      '/api/update-user',
      data,
      { headers }
    )
    .then((res) => res.status)
}

/**
 * Update email notifications flag.
 *
 * @async
 * @param {movininTypes.UpdateEmailNotificationsPayload} data
 * @returns {Promise<number>}
 */
export const updateEmailNotifications = async (data: movininTypes.UpdateEmailNotificationsPayload): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      '/api/update-email-notifications',
      data,
      { headers }
    )
    .then(async (res) => {
      if (res.status === 200) {
        const user = await getCurrentUser()
        if (user) {
          user.enableEmailNotifications = data.enableEmailNotifications
          await AsyncStorage.storeObject('mi-user', user)
        }
      }
      return res.status
    })
}

/**
 * Check password.
 *
 * @async
 * @param {string} id
 * @param {string} pass
 * @returns {Promise<number>}
 */
export const checkPassword = async (id: string, pass: string): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .get(
      `/api/check-password/${encodeURIComponent(id)}/${encodeURIComponent(pass)}`,
      { headers }
    )
    .then((res) => res.status)
}

/**
 * Change password.
 *
 * @async
 * @param {movininTypes.ChangePasswordPayload} data
 * @returns {Promise<number>}
 */
export const changePassword = async (data: movininTypes.ChangePasswordPayload): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      '/api/change-password',
      data,
      { headers }
    )
    .then((res) => res.status)
}

/**
 * Update avatar.
 *
 * @async
 * @param {string} userId
 * @param {BlobInfo} file
 * @returns {Promise<number | undefined>}
 */
export const updateAvatar = async (userId: string, file: BlobInfo): Promise<number> => {
  const user = await AsyncStorage.getObject<movininTypes.User>('mi-user')
  const uri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '')
  const formData = new FormData()
  formData.append('image', {
    uri,
    name: file.name,
    type: file.type,
  } as any)
  return axiosInstance
    .post(
      `/api/update-avatar/${encodeURIComponent(userId)}`,
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

/**
 * Delete avatar.
 *
 * @async
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const deleteAvatar = async (userId: string): Promise<number> => {
  const headers = await authHeader()
  return axiosInstance
    .post(
      `/api/delete-avatar/${encodeURIComponent(userId)}`,
      null,
      { headers }
    )
    .then((res) => res.status)
}

/**
 * Check whether the current user is logged in or not.
 *
 * @async
 * @returns {unknown}
 */
export const loggedIn = async () => {
  const currentUser = await getCurrentUser()
  if (currentUser) {
    const status = await validateAccessToken()
    if (status === 200 && currentUser._id) {
      const user = await getUser(currentUser._id)
      if (user) {
        return true
      }
    }
  }

  return false
}
