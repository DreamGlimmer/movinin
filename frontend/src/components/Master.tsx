import React, { useState, useEffect, ReactNode } from 'react'
import { Button } from '@mui/material'
import * as movininTypes from 'movinin-types'
import { strings } from '../lang/master'
import Header from '../components/Header'
import * as UserService from '../services/UserService'
import * as Helper from '../common/Helper'
import { useInit } from '../common/customHooks'

function Master({
  user: masterUser,
  strict,
  hideSignin,
  notificationCount,
  children,
  onLoad
}: {
  user?: movininTypes.User
  strict?: boolean
  hideSignin?: boolean
  notificationCount?: number
  children: ReactNode
  onLoad?: (user?: movininTypes.User) => void
}) {
  const [user, setUser] = useState<movininTypes.User>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (masterUser && user && user.avatar !== masterUser.avatar) {
      setUser(masterUser)
    }
  }, [masterUser, user])

  useInit(async () => {
    const exit = () => {
      if (strict) {
        UserService.signout(false, true)
      } else {
        setLoading(false)

        UserService.signout(false, false)

        if (onLoad) {
          onLoad()
        }
      }
    }

    const currentUser = UserService.getCurrentUser()

    if (currentUser) {
      try {
        const status = await UserService.validateAccessToken()

        if (status === 200) {
          const _user = await UserService.getUser(currentUser._id)

          if (_user) {
            if (_user.blacklisted) {
              exit()
              return
            }

            setUser(_user)
            setLoading(false)

            if (onLoad) {
              onLoad(_user)
            }
          } else {
            exit()
          }
        } else {
          exit()
        }
      } catch {
        exit()
      }
    } else {
      exit()
    }
  }, [])

  const handleResend = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    try {
      if (user) {
        const data = { email: user.email }

        const status = await UserService.resendLink(data)
        if (status === 200) {
          Helper.info(strings.VALIDATION_EMAIL_SENT)
        } else {
          Helper.error(null, strings.VALIDATION_EMAIL_ERROR)
        }
      }
    } catch (err) {
      Helper.error(err, strings.VALIDATION_EMAIL_ERROR)
    }
  }

  return (
    <>
      <Header user={user} hidden={loading} hideSignin={hideSignin} notificationCount={notificationCount} />
      {(!user && !loading) || (user && user.verified) ? (
        <div className="content">{children}</div>
      ) : (
        !loading && (
          <div className="validate-email">
            <span>{strings.VALIDATE_EMAIL}</span>
            <Button type="button" variant="contained" size="small" className="btn-primary btn-resend" onClick={handleResend}>
              {strings.RESEND}
            </Button>
          </div>
        )
      )}
    </>
  )
}

export default Master
