import React, { useState, useEffect } from 'react'
import {
  Button,
  Avatar as MaterialAvatar,
  Badge,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material'
import {
  AccountCircle,
  PhotoCamera as PhotoCameraIcon,
  BrokenImageTwoTone as DeleteIcon,
  CorporateFare as AgencyIcon,
  DirectionsCar as PropertyIcon,
  Check as VerifiedIcon,
} from '@mui/icons-material'
import * as movininTypes from ':movinin-types'
import * as movininHelper from ':movinin-helper'
import env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import * as helper from '../common/helper'
import * as UserService from '../services/UserService'
import * as PropertyService from '../services/PropertyService'

interface AvatarProps {
  width?: number
  height?: number
  mode?: 'create' | 'update'
  type?: string
  record?: movininTypes.User | movininTypes.Property | null
  size: 'small' | 'medium' | 'large'
  readonly?: boolean
  color?: 'disabled' | 'action' | 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  className?: string
  verified?: boolean
  hideDelete?: boolean
  onValidate?: (valid: boolean) => void
  onBeforeUpload?: () => void
  onChange?: (param: string) => void
}

const Avatar = ({
  width,
  height,
  mode,
  type,
  record,
  size,
  readonly,
  color,
  className,
  verified,
  hideDelete,
  onValidate,
  onBeforeUpload,
  onChange,
}: AvatarProps) => {
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [openTypeDialog, setOpenTypeDialog] = useState(false)
  const [avatarRecord, setAvatarRecord] = useState<movininTypes.User | movininTypes.Property>()
  const [avatar, setAvatar] = useState<string | undefined | null>(null)
  const [loading, setIsLoading] = useState(true)

  const validate = async (file: Blob, onValid: () => void) => {
    if (width && height) {
      const _URL = window.URL || window.webkitURL
      const img = new Image()
      const objectUrl = _URL.createObjectURL(file)
      img.onload = async () => {
        if (width !== img.width || height !== img.height) {
          if (onValidate) {
            onValidate(false)
          }
        } else {
          if (onValidate) {
            onValidate(true)
          }
          if (onValid) {
            await onValid()
          }
        }
        _URL.revokeObjectURL(objectUrl)
      }
      img.src = objectUrl
    } else if (onValid) {
      onValid()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      helper.error()
      return
    }

    if (onBeforeUpload) {
      onBeforeUpload()
    }

    const reader = new FileReader()
    const file = e.target.files[0]

    reader.onloadend = async () => {
      if (type === movininTypes.RecordType.Admin
        || type === movininTypes.RecordType.Agency
        || type === movininTypes.RecordType.User) {
        if (mode === 'create') {
          const createAvatar = async () => {
            try {
              const data = await UserService.createAvatar(file)

              setAvatar(data)

              if (onChange) {
                onChange(data)
              }
            } catch (err) {
              helper.error(err)
            }
          }

          await validate(file, createAvatar)
        } else if (avatarRecord && mode === 'update') {
          const updateAvatar = async () => {
            try {
              const { _id } = avatarRecord

              if (!_id) {
                helper.error()
                return
              }

              const status = await UserService.updateAvatar(_id, file)

              if (status === 200) {
                const user = await UserService.getUser(_id)

                if (user) {
                  setAvatarRecord(user)
                  setAvatar(user.avatar || '')

                  if (onChange) {
                    onChange(user.avatar || '')
                  }
                } else {
                  helper.error()
                }
              } else {
                helper.error()
              }
            } catch (err) {
              helper.error(err)
            }
          }

          await validate(file, updateAvatar)
        }
      }
    }

    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!type) {
      setOpenTypeDialog(true)
      return
    }

    const upload = document.getElementById('upload') as HTMLInputElement
    upload.value = ''
    setTimeout(() => {
      upload.click()
    }, 0)
  }

  const handleCloseDialog = () => {
    setOpenTypeDialog(false)
  }

  const openDialog = () => {
    setOpen(true)
  }

  const handleDeleteAvatar = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    openDialog()
  }

  const closeDialog = () => {
    setOpen(false)
  }

  const handleCancelDelete = () => {
    closeDialog()
  }

  const handleDelete = async () => {
    try {
      if (type === movininTypes.RecordType.Admin || type === movininTypes.RecordType.Agency || type === movininTypes.RecordType.User) {
        if (avatarRecord && mode === 'update') {
          const { _id } = avatarRecord

          if (!_id) {
            helper.error()
            return
          }

          const status = await UserService.deleteAvatar(_id)

          if (status === 200) {
            const user = await UserService.getUser(_id)

            if (user) {
              setAvatarRecord(user)
              setAvatar(null)

              if (onChange) {
                onChange('')
              }
              closeDialog()
            } else {
              helper.error()
            }
          } else {
            helper.error()
          }
        } else if (!avatarRecord && mode === 'create') {
          const status = await UserService.deleteTempAvatar(avatar as string)

          if (status === 200) {
            setAvatar(null)
            if (onChange) {
              onChange('')
            }
            closeDialog()
          } else {
            helper.error()
          }
        }
      } else if (type === movininTypes.RecordType.Property) {
        if (!avatarRecord && mode === 'create') {
          const status = await PropertyService.deleteTempImage(avatar as string)

          if (status === 200) {
            setAvatar(null)
            if (onChange) {
              onChange('')
            }
            closeDialog()
          } else {
            helper.error()
          }
        } else if (avatarRecord && mode === 'update') {
          const { _id } = avatarRecord

          if (!_id) {
            helper.error()
            return
          }

          const status = await PropertyService.deleteImage(_id)

          if (status === 200) {
            const property = await UserService.getUser(_id)

            if (property) {
              setAvatarRecord(property)
              setAvatar(null)
              if (onChange) {
                onChange('')
              }
              closeDialog()
            } else {
              helper.error()
            }
          } else {
            helper.error()
          }
        }
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const cdn = () => {
    if (type === movininTypes.RecordType.Property) {
      return mode === 'create' ? env.CDN_TEMP_PROPERTIES : env.CDN_PROPERTIES
    }
    return mode === 'create' ? env.CDN_TEMP_USERS : env.CDN_USERS
  }

  useEffect(() => {
    const language = UserService.getLanguage()
    commonStrings.setLanguage(language)

    const currentUser = UserService.getCurrentUser()
    if (currentUser) {
      if (record) {
        setAvatarRecord(record)
        if (type === movininTypes.RecordType.Property) {
          setAvatar((record as movininTypes.Property).image)
        } else {
          setAvatar(record.avatar)
        }
        setIsLoading(false)
      } else if (mode === 'create') {
        setIsLoading(false)
      }
    } else {
      setError(true)
      helper.error()
    }
  }, [record, type, mode])

  const agencyImageStyle = { width: env.AGENCY_IMAGE_WIDTH }

  const propertyImageStyle = { width: env.PROPERTY_IMAGE_WIDTH }

  const userAvatar = avatar ? <MaterialAvatar src={movininHelper.joinURL(cdn(), avatar)} className={size ? `avatar-${size}` : 'avatar'} /> : <></>

  const emptyAvatar = <AccountCircle className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />

  return !error && !loading ? (
    <div className={className}>
      {avatar ? (
        readonly ? (
          type === movininTypes.RecordType.Property ? (
            <img style={propertyImageStyle} src={movininHelper.joinURL(cdn(), avatar)} alt={avatarRecord && (avatarRecord as movininTypes.Property).name} />
          ) : type === movininTypes.RecordType.Agency ? (
            <div className="agency-avatar-readonly">
              <img src={movininHelper.joinURL(cdn(), avatar)} alt={avatarRecord && avatarRecord.fullName} />
            </div>
          ) : verified && avatarRecord && avatarRecord.verified ? (
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={(
                <Tooltip title={commonStrings.VERIFIED}>
                  <Box borderRadius="50%" className={size ? `user-avatar-verified-${size}` : 'user-avatar-verified-medium'}>
                    <VerifiedIcon className={size ? `user-avatar-verified-icon-${size}` : 'user-avatar-verified-icon-medium'} />
                  </Box>
                </Tooltip>
              )}
            >
              {userAvatar}
            </Badge>
          ) : (
            userAvatar
          )
        ) : (
          //! readonly
          <Badge
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            badgeContent={
              hideDelete ? (
                <></>
              ) : (
                <Tooltip title={commonStrings.DELETE_IMAGE}>
                  <Box borderRadius="50%" className="avatar-action-box" onClick={handleDeleteAvatar}>
                    <DeleteIcon className="avatar-action-icon" />
                  </Box>
                </Tooltip>
              )
            }
          >
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              className={type === movininTypes.RecordType.Agency ? 'agency-avatar' : ''}
              badgeContent={(
                <Tooltip title={commonStrings.UPLOAD_IMAGE}>
                  <Box borderRadius="50%" className="avatar-action-box" onClick={handleUpload}>
                    <PhotoCameraIcon className="avatar-action-icon" />
                  </Box>
                </Tooltip>
              )}
            >
              {type === movininTypes.RecordType.Property ? (
                <div className="property-avatar">
                  <img src={movininHelper.joinURL(cdn(), avatar)} alt={avatarRecord && (avatarRecord as movininTypes.Property).name} />
                </div>
              ) : type === movininTypes.RecordType.Agency ? (
                <img style={agencyImageStyle} src={movininHelper.joinURL(cdn(), avatar)} alt={avatarRecord && avatarRecord.fullName} />
              ) : (
                <MaterialAvatar src={movininHelper.joinURL(cdn(), avatar)} className={size ? `avatar-${size}` : 'avatar'} />
              )}
            </Badge>
          </Badge>
        )
      ) // !avatar
        : readonly ? (
          type === movininTypes.RecordType.Property ? (
            <PropertyIcon style={propertyImageStyle} color={color || 'inherit'} />
          ) : type === movininTypes.RecordType.Agency ? (
            <AgencyIcon style={agencyImageStyle} color={color || 'inherit'} />
          ) : verified && avatarRecord && avatarRecord.verified ? (
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={(
                <Tooltip title={commonStrings.VERIFIED}>
                  <Box borderRadius="50%" className={size ? `user-avatar-verified-${size}` : 'user-avatar-verified-medium'}>
                    <VerifiedIcon className={size ? `user-avatar-verified-icon-${size}` : 'user-avatar-verified-icon-medium'} />
                  </Box>
                </Tooltip>
              )}
            >
              {emptyAvatar}
            </Badge>
          ) : (
            emptyAvatar
          )
        ) : (
          //! readonly
          <Badge
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={(
                <Tooltip title={commonStrings.UPLOAD_IMAGE}>
                  <Box borderRadius="50%" className="avatar-action-box" onClick={handleUpload}>
                    <PhotoCameraIcon className="avatar-action-icon" />
                  </Box>
                </Tooltip>
              )}
            >
              {type === movininTypes.RecordType.Property ? (
                <PropertyIcon className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />
              ) : type === movininTypes.RecordType.Agency ? (
                <AgencyIcon className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />
              ) : (
                <AccountCircle className={size ? `avatar-${size}` : 'avatar'} color={color || 'inherit'} />
              )}
            </Badge>
          </Badge>
        )}
      <Dialog disableEscapeKeyDown maxWidth="xs" open={openTypeDialog}>
        <DialogTitle className="dialog-header">{commonStrings.INFO}</DialogTitle>
        <DialogContent>{commonStrings.USER_TYPE_REQUIRED}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCloseDialog} variant="contained" className="btn-secondary">
            {commonStrings.CLOSE}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog disableEscapeKeyDown maxWidth="xs" open={open}>
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{commonStrings.DELETE_AVATAR_CONFIRM}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={handleCancelDelete} className="btn-secondary">
            {commonStrings.CANCEL}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {commonStrings.DELETE}
          </Button>
        </DialogActions>
      </Dialog>
      {!readonly && <input id="upload" type="file" hidden onChange={handleChange} />}
    </div>
  ) : null
}

export default Avatar
