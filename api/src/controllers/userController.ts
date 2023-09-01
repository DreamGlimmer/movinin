import path from 'node:path'
import fs from 'node:fs/promises'
import process from 'node:process'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v1 as uuid } from 'uuid'
import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import { Request, Response } from 'express'
import strings from '../config/app.config'
import * as Env from '../config/env.config'
import User from '../models/User'
import Booking from '../models/Booking'
import Token from '../models/Token'
import PushNotification from '../models/PushNotification'
import * as Helper from '../common/helper'
import NotificationCounter from '../models/NotificationCounter'
import Notification from '../models/Notification'
import Property from '../models/Property'
import * as MovininTypes from 'movinin-types'

const DEFAULT_LANGUAGE = String(process.env.MI_DEFAULT_LANGUAGE)
const HTTPS = Helper.StringToBoolean(String(process.env.MI_HTTPS))
const JWT_SECRET = String(process.env.MI_JWT_SECRET)
const JWT_EXPIRE_AT = Number.parseInt(String(process.env.MI_JWT_EXPIRE_AT), 10)
const SMTP_FROM = String(process.env.MI_SMTP_FROM)
const CDN = String(process.env.MI_CDN_USERS)
const CDN_TEMP = String(process.env.MI_CDN_TEMP_USERS)
const CDN_PROPERTIES = String(process.env.MI_CDN_PROPERTIES)
const Backend_HOST = String(process.env.MI_Backend_HOST)
const Frontend_HOST = String(process.env.MI_Frontend_HOST)

const getStatusMessage = (lang: string, msg: string): string => (
  `<!DOCTYPE html><html lang="' ${lang}'"><head></head><body><p>${msg}</p></body></html>`
)

export async function signup(req: Request, res: Response) {
  const body: MovininTypes.FrontendSignUpBody = req.body

  try {
    body.active = true
    body.verified = false
    body.blacklisted = false
    body.type = Env.UserType.User

    const salt = await bcrypt.genSalt(10)
    const password = body.password
    const passwordHash = await bcrypt.hash(password, salt)
    body.password = passwordHash

    const user = new User(body)
    await user.save()

    if (body.avatar) {
      const avatar = path.join(CDN_TEMP, body.avatar)
      if (await Helper.exists(avatar)) {
        const filename = `${user._id}_${Date.now()}${path.extname(body.avatar)}`
        const newPath = path.join(CDN, filename)

        await fs.rename(avatar, newPath)
        user.avatar = filename
        await user.save()
      }
    }

    // generate token and save
    const token = new Token({ user: user._id, token: uuid() })

    await token.save()

    // Send email
    strings.setLanguage(user.language)

    const mailOptions = {
      from: SMTP_FROM,
      to: user.email,
      subject: strings.ACCOUNT_ACTIVATION_SUBJECT,
      html:
        `<p>${strings.HELLO}${user.fullName},<br><br>
        ${strings.ACCOUNT_ACTIVATION_LINK}<br><br>
        http${HTTPS ? 's' : ''}://${req.headers.host}/api/confirm-email/${user.email}/${token.token}<br><br>
        ${strings.REGARDS}<br></p>`,
    }
    await Helper.sendMail(mailOptions)
    return res.sendStatus(200)
  } catch (err) {
    console.error(`[user.signup] ${strings.DB_ERROR} ${body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function adminSignup(req: Request, res: Response) {
  const body: MovininTypes.BackendSignUpBody = req.body

  try {
    body.active = true
    body.verified = false
    body.blacklisted = false
    body.type = Env.UserType.Admin

    const salt = await bcrypt.genSalt(10)
    const password = body.password
    const passwordHash = await bcrypt.hash(password, salt)
    body.password = passwordHash

    const user = new User(body)
    await user.save()

    if (body.avatar) {
      const avatar = path.join(CDN_TEMP, body.avatar)
      if (await Helper.exists(avatar)) {
        const filename = `${user._id}_${Date.now()}${path.extname(body.avatar)}`
        const newPath = path.join(CDN, filename)

        try {
          await fs.rename(avatar, newPath)
          user.avatar = filename
          await user.save()
        } catch (err) {
          console.error(strings.ERROR, err)
          res.status(400).send(strings.ERROR + err)
        }
      }
    }

    // generate token and save
    const token = new Token({ user: user._id, token: uuid() })
    await token.save()

    // Send email
    strings.setLanguage(user.language)

    const mailOptions = {
      from: SMTP_FROM,
      to: user.email,
      subject: strings.ACCOUNT_ACTIVATION_SUBJECT,
      html:
        `<p>${strings.HELLO}${user.fullName},<br><br>
        ${strings.ACCOUNT_ACTIVATION_LINK}<br><br>
        http${HTTPS ? 's' : ''}://${req.headers.host}/api/confirm-email/${user.email}/${token.token}<br><br>
        ${strings.REGARDS}<br></p>`,
    }

    await Helper.sendMail(mailOptions)
    return res.sendStatus(200)
  } catch (err) {
    console.error(`[user.adminSignup] ${strings.DB_ERROR} ${body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function create(req: Request, res: Response) {
  const body: MovininTypes.CreateUserBody = req.body

  try {
    body.verified = false
    body.blacklisted = false

    if (body.password) {
      const salt = await bcrypt.genSalt(10)
      const password = body.password
      const passwordHash = await bcrypt.hash(password, salt)
      body.password = passwordHash
    }

    const user = new User(body)
    await user.save()

    // avatar
    if (body.avatar) {
      const avatar = path.join(CDN_TEMP, body.avatar)
      if (await Helper.exists(avatar)) {
        const filename = `${user._id}_${Date.now()}${path.extname(body.avatar)}`
        const newPath = path.join(CDN, filename)

        try {
          await fs.rename(avatar, newPath)
          user.avatar = filename
          await user.save()
        } catch (err) {
          console.error(strings.ERROR, err)
          res.status(400).send(strings.ERROR + err)
        }
      }
    }

    if (body.password) {
      return res.sendStatus(200)
    }

    // generate token and save
    const token = new Token({ user: user._id, token: uuid() })
    await token.save()

    // Send email
    strings.setLanguage(user.language)

    const mailOptions = {
      from: SMTP_FROM,
      to: user.email,
      subject: strings.ACCOUNT_ACTIVATION_SUBJECT,
      html:
        `<p>${strings.HELLO}${user.fullName},<br><br>
        ${strings.ACCOUNT_ACTIVATION_LINK}<br><br>
        ${Helper.joinURL(
          user.type === Env.UserType.User ? Frontend_HOST : Backend_HOST,
          'activate',
        )}/?u=${encodeURIComponent(user._id.toString())}&e=${encodeURIComponent(user.email)}&t=${encodeURIComponent(token.token)}<br><br>
        ${strings.REGARDS}<br></p>`,
    }

    await Helper.sendMail(mailOptions)
    return res.sendStatus(200)
  } catch (err) {
    console.error(`[user.create] ${strings.DB_ERROR} ${body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function checkToken(req: Request, res: Response) {
  const { userId, email } = req.params

  try {
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      email,
    })

    if (user) {
      if (
        ![Env.AppType.Frontend.toString(), Env.AppType.Backend.toString()].includes(req.params.type.toUpperCase()) ||
        (req.params.type === Env.AppType.Backend && user.type === Env.UserType.User) ||
        (req.params.type === Env.AppType.Frontend && user.type !== Env.UserType.User) ||
        user.active
      ) {
        return res.sendStatus(403)
      } else {
        const token = await Token.findOne({
          user: new mongoose.Types.ObjectId(req.params.userId),
          token: req.params.token,
        })

        if (token) {
          return res.sendStatus(200)
        } else {
          return res.sendStatus(204)
        }
      }
    } else {
      return res.sendStatus(403)
    }
  } catch (err) {
    console.error(`[user.checkToken] ${strings.DB_ERROR} ${req.params}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function deleteTokens(req: Request, res: Response) {
  const { userId } = req.params

  try {
    const result = await Token.deleteMany({
      user: new mongoose.Types.ObjectId(userId),
    })

    if (result.deletedCount > 0) {
      return res.sendStatus(200)
    } else {
      return res.sendStatus(400)
    }
  } catch (err) {
    console.error(`[user.deleteTokens] ${strings.DB_ERROR} ${userId}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function resend(req: Request, res: Response) {
  const { email } = req.params

  try {
    const user = await User.findOne({ email })

    if (user) {
      if (
        ![Env.AppType.Frontend.toString(), Env.AppType.Backend.toString()].includes(req.params.type.toUpperCase()) ||
        (req.params.type === Env.AppType.Backend && user.type === Env.UserType.User) ||
        (req.params.type === Env.AppType.Frontend && user.type !== Env.UserType.User)
      ) {
        return res.sendStatus(403)
      } else {
        user.active = false
        await user.save()

        // generate token and save
        const token = new Token({ user: user._id, token: uuid() })
        await token.save()

        // Send email
        strings.setLanguage(user.language)

        const reset = req.params.reset === 'true'

        const mailOptions = {
          from: SMTP_FROM,
          to: user.email,
          subject: reset ? strings.PASSWORD_RESET_SUBJECT : strings.ACCOUNT_ACTIVATION_SUBJECT,
          html:
            `<p>${strings.HELLO}${user.fullName},<br><br>
            ${reset ? strings.PASSWORD_RESET_LINK : strings.ACCOUNT_ACTIVATION_LINK}<br><br>
            ${Helper.joinURL(
              user.type === Env.UserType.User ? Frontend_HOST : Backend_HOST,
              reset ? 'reset-password' : 'activate',
            )}/?u=${encodeURIComponent(user._id.toString())}&e=${encodeURIComponent(user.email)}&t=${encodeURIComponent(token.token)}<br><br>
            ${strings.REGARDS}<br></p>`,
        }

        await Helper.sendMail(mailOptions)
        return res.sendStatus(200)
      }
    } else {
      return res.sendStatus(204)
    }
  } catch (err) {
    console.error(`[user.resend] ${strings.DB_ERROR} ${email}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function activate(req: Request, res: Response) {
  const userId: string = req.body.userId

  try {
    const user = await User.findById(userId)

    if (user) {
      const token = await Token.find({ token: req.body.token })

      if (token) {
        const salt = await bcrypt.genSalt(10)
        const password = req.body.password
        const passwordHash = await bcrypt.hash(password, salt)
        user.password = passwordHash

        user.active = true
        user.verified = true
        await user.save()

        return res.sendStatus(200)
      }
    }

    return res.sendStatus(204)
  } catch (err) {
    console.error(`[user.activate] ${strings.DB_ERROR} ${userId}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function signin(req: Request, res: Response) {
  const email: string = req.body.email

  try {
    const user = await User.findOne({ email })

    if (
      !req.body.password ||
      !user ||
      !user.password ||
      ![Env.AppType.Frontend.toString(), Env.AppType.Backend.toString()].includes(req.params.type.toUpperCase()) ||
      (req.params.type === Env.AppType.Backend && user.type === Env.UserType.User) ||
      (req.params.type === Env.AppType.Frontend && user.type !== Env.UserType.User)
    ) {
      return res.sendStatus(204)
    } else {
      const passwordMatch = await bcrypt.compare(req.body.password, user.password)

      if (passwordMatch) {
        const payload = { id: user._id }

        let options: { expiresIn?: number } = { expiresIn: JWT_EXPIRE_AT }
        if (req.body.stayConnected) {
          options = {}
        }

        const token = jwt.sign(payload, JWT_SECRET, options)

        return res.status(200).send({
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          language: user.language,
          enableEmailNotifications: user.enableEmailNotifications,
          accessToken: token,
          blacklisted: user.blacklisted,
          avatar: user.avatar,
        })
      }
    }

    return res.sendStatus(204)
  } catch (err) {
    console.error(`[user.signin] ${strings.DB_ERROR} ${email}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function pushToken(req: Request, res: Response) {
  const { userId } = req.params

  try {
    const pushNotification = await PushNotification.findOne({ user: userId })
    if (pushNotification) {
      return res.status(200).json(pushNotification.token)
    }

    return res.sendStatus(204)
  } catch (err) {
    console.error(`[user.pushToken] ${strings.DB_ERROR} ${userId}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function createPushToken(req: Request, res: Response) {
  const { userId, token } = req.params

  try {
    const exist = await PushNotification.exists({ user: userId })

    if (!exist) {
      const pushNotification = new PushNotification({
        user: userId,
        token,
      })
      await pushNotification.save()
      return res.sendStatus(200)
    }

    return res.status(400).send('Push Token already exists.')
  } catch (err) {
    console.error(`[user.createPushToken] ${strings.DB_ERROR} ${userId}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function deletePushToken(req: Request, res: Response) {
  const { userId } = req.params

  try {
    await PushNotification.deleteMany({ user: userId })
    return res.sendStatus(200)
  } catch (err) {
    console.error(`[user.deletePushToken] ${strings.DB_ERROR} ${userId}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function validateEmail(req: Request, res: Response) {
  const email: string = req.body.email

  try {
    const exists = await User.exists({ email })

    if (exists) {
      return res.sendStatus(204)
    } else {
      // email does not exist in db (can be added)
      return res.sendStatus(200)
    }
  } catch (err) {
    console.error(`[user.validateEmail] ${strings.DB_ERROR} ${email}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export const validateAccessToken = (req: Request, res: Response) => res.sendStatus(200)

export async function confirmEmail(req: Request, res: Response) {
  try {
    const { token: _token, email: _email } = req.params
    const user = await User.findOne({ email: _email })

    if (!user) {
      console.error('[user.confirmEmail] User not found', req.params)
      return res.status(204).send(strings.ACCOUNT_ACTIVATION_LINK_ERROR)
    }

    strings.setLanguage(user.language)
    const token = await Token.findOne({ token: _token })

    // token is not found into database i.e. token may have expired
    if (!token) {
      console.error(strings.ACCOUNT_ACTIVATION_LINK_EXPIRED, req.params)
      return res.status(400).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_LINK_EXPIRED))
    } else {
      // if token is found then check valid user
      // not valid user
      if (user.verified) {
        // user is already verified
        return res.status(200).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_ACCOUNT_VERIFIED))
      } else {
        // verify user
        // change verified to true
        user.verified = true
        user.verifiedAt = new Date()
        await user.save()
        return res.status(200).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_SUCCESS))
      }
    }
  } catch (err) {
    console.error(`[user.confirmEmail] ${strings.DB_ERROR} ${req.params}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function resendLink(req: Request, res: Response) {
  const email: string = req.body.email

  try {
    const user = await User.findOne({ email })

    // user is not found into database
    if (!user) {
      console.error('[user.resendLink] User not found:', req.params)
      return res.status(400).send(getStatusMessage(DEFAULT_LANGUAGE, strings.ACCOUNT_ACTIVATION_RESEND_ERROR))
    } else if (user.verified) {
      // user has been already verified
      return res.status(200).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_ACCOUNT_VERIFIED))
    } else {
      // send verification link
      // generate token and save
      const token = new Token({ user: user._id, token: uuid() })
      await token.save()

      // Send email
      strings.setLanguage(user.language)
      const mailOptions = {
        from: SMTP_FROM,
        to: user.email,
        subject: strings.ACCOUNT_ACTIVATION_SUBJECT,
        html:
          `<p>${strings.HELLO}${user.fullName},<br><br>
          ${strings.ACCOUNT_ACTIVATION_LINK}<br><br>
          http${HTTPS ? 's' : ''}://${req.headers.host}/api/confirm-email/${user.email}/${token.token}<br><br>
          ${strings.REGARDS}<br></p>`,
      }

      await Helper.sendMail(mailOptions)
      return res.status(200).send(getStatusMessage(user.language, strings.ACCOUNT_ACTIVATION_EMAIL_SENT_PART_1 + user.email + strings.ACCOUNT_ACTIVATION_EMAIL_SENT_PART_2))
    }
  } catch (err) {
    console.error(`[user.resendLink] ${strings.DB_ERROR} ${email}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function update(req: Request, res: Response) {
  try {
    const body: MovininTypes.UpdateUserBody = req.body
    const _id: string = body._id
    const user = await User.findById(_id)

    if (!user) {
      console.error('[user.update] User not found:', req.body.email)
      return res.sendStatus(204)
    } else {
      const {
        fullName,
        phone,
        bio,
        location,
        type,
        birthDate,
        enableEmailNotifications,
        payLater
      } = body

      if (fullName) {
        user.fullName = fullName
      }
      user.phone = phone
      user.location = location
      user.bio = bio
      user.birthDate = new Date(birthDate)
      if (type) {
        user.type = type
      }
      if (typeof enableEmailNotifications !== 'undefined') {
        user.enableEmailNotifications = enableEmailNotifications
      }
      if (typeof payLater !== 'undefined') {
        user.payLater = payLater
      }

      await user.save()
      return res.sendStatus(200)
    }
  } catch (err) {
    console.error(`[user.update] ${strings.DB_ERROR} ${req.body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function updateEmailNotifications(req: Request, res: Response) {
  try {
    const _id: string = req.body
    const user = await User.findById(_id)
    if (!user) {
      console.error('[user.updateEmailNotifications] User not found:', req.body)
      return res.sendStatus(204)
    } else {
      const enableEmailNotifications: boolean = req.body.enableEmailNotifications
      user.enableEmailNotifications = enableEmailNotifications
      await user.save()
      return res.sendStatus(200)
    }
  } catch (err) {
    console.error(`[user.updateEmailNotifications] ${strings.DB_ERROR} ${req.body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function updateLanguage(req: Request, res: Response) {
  try {
    const id: string = req.body
    const language: string = req.body
    const user = await User.findById(id)

    if (!user) {
      console.error('[user.updateLanguage] User not found:', id)
      return res.sendStatus(204)
    } else {
      user.language = language
      await user.save()
      return res.sendStatus(200)
    }
  } catch (err) {
    console.error(`[user.updateLanguage] ${strings.DB_ERROR} ${req.body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function getUser(req: Request, res: Response) {
  const { id } = req.params
  try {
    const user = await User.findById(id, {
      company: 1,
      email: 1,
      phone: 1,
      fullName: 1,
      verified: 1,
      language: 1,
      enableEmailNotifications: 1,
      avatar: 1,
      bio: 1,
      location: 1,
      type: 1,
      blacklisted: 1,
      birthDate: 1,
      payLater: 1,
    }).lean()

    if (!user) {
      console.error('[user.getUser] User not found:', req.params)
      return res.sendStatus(204)
    } else {
      return res.json(user)
    }
  } catch (err) {
    console.error(`[user.getUser] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function createAvatar(req: Request, res: Response) {
  try {
    if (!req.file) {
      const msg = 'req.file not found'
      console.error(`[user.createAvatar] ${msg}`)
      return res.status(204).send(msg)
    }

    if (!(await Helper.exists(CDN_TEMP))) {
      await fs.mkdir(CDN_TEMP, { recursive: true })
    }

    const filename = `${uuid()}_${Date.now()}${path.extname(req.file.originalname)}`
    const filepath = path.join(CDN_TEMP, filename)

    await fs.writeFile(filepath, req.file.buffer)
    return res.json(filename)
  } catch (err) {
    console.error(`[user.createAvatar] ${strings.DB_ERROR} ${req.file && req.file.originalname}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function updateAvatar(req: Request, res: Response) {
  const { userId } = req.params

  try {
    if (!req.file) {
      const msg = 'req.file not found'
      console.error(`[user.createAvatar] ${msg}`)
      return res.status(204).send(msg)
    }

    const user = await User.findById(userId)

    if (user) {
      if (!(await Helper.exists(CDN))) {
        await fs.mkdir(CDN, { recursive: true })
      }

      if (user.avatar && !user.avatar.startsWith('http')) {
        const avatar = path.join(CDN, user.avatar)

        if (await Helper.exists(avatar)) {
          await fs.unlink(avatar)
        }
      }

      const filename = `${user._id}_${Date.now()}${path.extname(req.file.originalname)}`
      const filepath = path.join(CDN, filename)

      await fs.writeFile(filepath, req.file.buffer)
      user.avatar = filename
      await user.save()
      return res.sendStatus(200)
    } else {
      console.error('[user.updateAvatar] User not found:', userId)
      return res.sendStatus(204)
    }
  } catch (err) {
    console.error(`[user.updateAvatar] ${strings.DB_ERROR} ${userId}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function deleteAvatar(req: Request, res: Response) {
  const { userId } = req.params

  try {
    const user = await User.findById(userId)

    if (user) {
      if (user.avatar && !user.avatar.startsWith('http')) {
        const avatar = path.join(CDN, user.avatar)
        if (await Helper.exists(avatar)) {
          await fs.unlink(avatar)
        }
      }
      user.avatar = null

      await user.save()
      return res.sendStatus(200)
    } else {
      console.error('[user.deleteAvatar] User not found:', userId)
      return res.sendStatus(204)
    }
  } catch (err) {
    console.error(`[user.deleteAvatar] ${strings.DB_ERROR} ${userId}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function deleteTempAvatar(req: Request, res: Response) {
  const { avatar } = req.params

  try {
    const avatarFile = path.join(CDN_TEMP, avatar)
    if (await Helper.exists(avatarFile)) {
      await fs.unlink(avatarFile)
    }

    return res.sendStatus(200)
  } catch (err) {
    console.error(`[user.deleteTempAvatar] ${strings.DB_ERROR} ${avatar}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function changePassword(req: Request, res: Response) {
  const body: MovininTypes.changePasswordBody = req.body
  const { _id, password: currentPassword, newPassword, strict } = body

  try {
    const user = await User.findOne({ _id })
    if (!user) {
      console.error('[user.changePassword] User not found:', _id)
      return res.sendStatus(204)
    }

    if (!user.password) {
      console.error('[user.changePassword] User.password not found:', _id)
      return res.sendStatus(204)
    }

    const _changePassword = async () => {
      const salt = await bcrypt.genSalt(10)
      const password = newPassword
      const passwordHash = await bcrypt.hash(password, salt)
      user.password = passwordHash
      await user.save()
      return res.sendStatus(200)
    }

    if (strict) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (passwordMatch) {
        return _changePassword()
      } else {
        return res.sendStatus(204)
      }
    } else {
      return _changePassword()
    }
  } catch (err) {
    console.error(`[user.changePassword] ${strings.DB_ERROR} ${_id}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function checkPassword(req: Request, res: Response) {
  const { id, password } = req.params

  try {
    const user = await User.findById(id)

    if (user) {
      if (!user.password) {
        console.error('[user.changePassword] User.password not found')
        return res.sendStatus(204)
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if (passwordMatch) {
        return res.sendStatus(200)
      } else {
        return res.sendStatus(204)
      }
    } else {
      console.error('[user.checkPassword] User not found:', id)
      return res.sendStatus(204)
    }
  } catch (err) {
    console.error(`[user.checkPassword] ${strings.DB_ERROR} ${id}`, err)
    return res.status(400).send(strings.ERROR + err)
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const keyword: string = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'
    const page: number = Number.parseInt(req.params.page, 10)
    const size: number = Number.parseInt(req.params.size, 10)
    const types: string[] = req.body.types
    const userId: string = req.body.user

    const $match: mongoose.FilterQuery<any> = {
      $and: [
        {
          type: { $in: types },
        },
        {
          fullName: { $regex: keyword, $options: options },
        },
      ],
    }

    if ($match.$and && userId) {
      $match.$and.push({ _id: { $ne: new mongoose.Types.ObjectId(userId) } })
    }

    const users = await User.aggregate(
      [
        {
          $match,
        },
        {
          $project: {
            company: 1,
            email: 1,
            phone: 1,
            fullName: 1,
            verified: 1,
            language: 1,
            enableEmailNotifications: 1,
            avatar: 1,
            bio: 1,
            location: 1,
            type: 1,
            blacklisted: 1,
            birthDate: 1,
          },
        },
        {
          $facet: {
            resultData: [{ $sort: { fullName: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
            pageInfo: [
              {
                $count: 'totalRecords',
              },
            ],
          },
        },
      ],
      { collation: { locale: Env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    return res.json(users)
  } catch (err) {
    console.error(`[user.getUsers] ${strings.DB_ERROR}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}

export async function deleteUsers(req: Request, res: Response) {
  try {
    const body: string[] = req.body
    const ids: mongoose.Types.ObjectId[] = body.map((id: string) => new mongoose.Types.ObjectId(id))

    for (const id of ids) {
      const user = await User.findByIdAndDelete(id)

      if (!user) {
        console.error('User not found:', id)
        continue
      }

      if (user.avatar) {
        const avatar = path.join(CDN, user.avatar)
        if (await Helper.exists(avatar)) {
          await fs.unlink(avatar)
        }
      }

      if (user.type === Env.UserType.Agency) {
        await Booking.deleteMany({ company: id })
        const properties = await Property.find({ agency: id })
        await Property.deleteMany({ agency: id })
        for (const property of properties) {
          const image = path.join(CDN_PROPERTIES, property.image)
          if (await Helper.exists(image)) {
            await fs.unlink(image)
          }
        }
      } else if (user.type === Env.UserType.User) {
        await Booking.deleteMany({ driver: id })
      }

      await NotificationCounter.deleteMany({ user: id })
      await Notification.deleteMany({ user: id })
    }

    return res.sendStatus(200)
  } catch (err) {
    console.error(`[user.delete] ${strings.DB_ERROR} ${req.body}`, err)
    return res.status(400).send(strings.DB_ERROR + err)
  }
}
