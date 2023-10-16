import React, { useState, useEffect, CSSProperties, ReactNode } from 'react'
import { Button } from '@mui/material'
import * as movininTypes from 'movinin-types'
import { strings } from '../lang/master'
import Header from './Header'
import * as UserService from '../services/UserService'
import Unauthorized from '../components/Unauthorized'
import * as Helper from '../common/Helper'
import { useInit } from '../common/customHooks'

interface MasterProps {
  user?: movininTypes.User
  strict?: boolean
  admin?: boolean
  hideHeader?: boolean
  notificationCount?: number
  style?: CSSProperties
  children: ReactNode
  onLoad?: (user?: movininTypes.User) => void
}

function Master({
  user: masterUser,
  strict,
  admin,
  hideHeader,
  notificationCount,
  style,
  children,
  onLoad
}: MasterProps) {
  const [user, setUser] = useState<movininTypes.User>()
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    if (masterUser && user && user.avatar !== masterUser.avatar) {
      setUser(masterUser)
    }
  }, [masterUser, user])

  useInit(async () => {
    const exit = async () => {
      if (strict) {
        await UserService.signout()
      } else {
        await UserService.signout(false)
        setLoading(false)

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
              setUser(_user)
              setUnauthorized(true)
              setLoading(false)
              return
            }

            if (admin && _user.type !== movininTypes.RecordType.Admin) {
              setUser(_user)
              setUnauthorized(true)
              setLoading(false)
              return
            }

            setUser(_user)
            setLoading(false)

            if (onLoad) {
              onLoad(_user)
            }
          } else {
            await exit()
          }
        } else {
          await exit()
        }
      } catch (err) {
        await exit()
      }
    } else {
      await exit()
    }
  })

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
      } else {
        Helper.error()
      }
    } catch (err) {
      Helper.error(err, strings.VALIDATION_EMAIL_ERROR)
    }
  }

  return (
    <>
      <Header user={user} hidden={hideHeader || loading} notificationCount={notificationCount} />
      {((!user && !loading) || (user && user.verified) || !strict) && !unauthorized ? (
        <div className="content" style={style}>
          {children}
        </div>
      ) : (
        !loading
        && !unauthorized && (
          <div className="validate-email">
            <span>{strings.VALIDATE_EMAIL}</span>
            <Button type="button" variant="contained" size="small" className="btn-primary btn-resend" onClick={handleResend}>
              {strings.RESEND}
            </Button>
          </div>
        )
      )}
      {unauthorized && <Unauthorized style={{ marginTop: '75px' }} />}
    </>
  )
}

export default Master
