import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  MenuItem,
  Menu,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Menu as MenuIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  More as MoreIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  InfoTwoTone as AboutIcon,
  DescriptionTwoTone as TosIcon,
  ExitToApp as SignoutIcon,
  Login as LoginIcon,
  EventSeat as BookingsIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as movininTypes from ':movinin-types'
import env from '../config/env.config'
import { strings } from '../lang/header'
import { strings as commonStrings } from '../lang/common'
import * as UserService from '../services/UserService'
import * as NotificationService from '../services/NotificationService'
import Avatar from './Avatar'
import * as langHelper from '../common/langHelper'
import * as helper from '../common/helper'
import { useGlobalContext, GlobalContextType } from '../context/GlobalContext'

import '../assets/css/header.css'

interface HeaderProps {
  user?: movininTypes.User
  hidden?: boolean
  hideSignin?: boolean
}

const ListItemLink = (props: any) => <ListItemButton component="a" {...props} />

const Header = ({
  user,
  hidden,
  hideSignin,
}: HeaderProps) => {
  const navigate = useNavigate()
  const { notificationCount, setNotificationCount } = useGlobalContext() as GlobalContextType

  const [lang, setLang] = useState(helper.getLanguage(env.DEFAULT_LANGUAGE))
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [langAnchorEl, setLangAnchorEl] = useState<HTMLElement | null>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null)
  const [sideAnchorEl, setSideAnchorEl] = useState<HTMLElement | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [loading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
  const isLangMenuOpen = Boolean(langAnchorEl)
  const isSideMenuOpen = Boolean(sideAnchorEl)

  const classes = {
    list: {
      width: 250,
    },
    formControl: {
      margin: 1,
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: 2,
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: 2,
    },
  }

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget)
  }

  const refreshPage = () => {
    const params = new URLSearchParams(window.location.search)

    if (params.has('l')) {
      params.delete('l')
      window.location.href = window.location.href.split('?')[0] + ([...params].length > 0 ? `?${params}` : '')
    } else {
      window.location.reload()
    }
  }

  const handleLangMenuClose = async (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(null)

    const { code } = event.currentTarget.dataset
    if (code) {
      setLang(helper.getLanguage(code))
      const currentLang = UserService.getLanguage()
      if (isSignedIn && user) {
        // Update user language
        const data: movininTypes.UpdateLanguagePayload = {
          id: user._id as string,
          language: code,
        }
        const status = await UserService.updateLanguage(data)
        if (status === 200) {
          UserService.setLanguage(code)
          if (code && code !== currentLang) {
            // Refresh page
            refreshPage()
          }
        } else {
          toast(commonStrings.CHANGE_LANGUAGE_ERROR, { type: 'error' })
        }
      } else {
        UserService.setLanguage(code)
        if (code && code !== currentLang) {
          // Refresh page
          refreshPage()
        }
      }
    }
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  const handleSignout = async () => {
    await UserService.signout()
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const handleSideMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSideAnchorEl(event.currentTarget)
  }

  const handleSideMenuClose = () => {
    setSideAnchorEl(null)
  }

  const handleNotificationsClick = () => {
    navigate('/notifications')
  }

  useEffect(() => {
    const language = langHelper.getLanguage()
    setLang(helper.getLanguage(language))
    langHelper.setLanguage(strings, language)
  }, [])

  useEffect(() => {
    if (!hidden) {
      if (user) {
        NotificationService.getNotificationCounter(user._id as string).then((notificationCounter) => {
          setIsSignedIn(true)
          setNotificationCount(notificationCounter.count)
          setIsLoading(false)
          setIsLoaded(true)
        })
      } else {
        setIsLoading(false)
        setIsLoaded(true)
      }
    }
  }, [hidden, user, setNotificationCount])

  const menuId = 'primary-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleSettingsClick}>
        <SettingsIcon className="header-action" />
        {strings.SETTINGS}
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        <SignoutIcon className="header-action" />
        <Typography>{strings.SIGN_OUT}</Typography>
      </MenuItem>
    </Menu>
  )

  const mobileMenuId = 'mobile-menu'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleSettingsClick}>
        <SettingsIcon className="header-action" />
        <p>{strings.SETTINGS}</p>
      </MenuItem>
      <MenuItem onClick={handleLangMenuOpen}>
        <IconButton aria-label="language of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
          <LanguageIcon />
        </IconButton>
        <p>{strings.LANGUAGE}</p>
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        <IconButton color="inherit">
          <SignoutIcon />
        </IconButton>
        <Typography>{strings.SIGN_OUT}</Typography>
      </MenuItem>
    </Menu>
  )

  const languageMenuId = 'language-menu'
  const renderLanguageMenu = (
    <Menu
      anchorEl={langAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={languageMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isLangMenuOpen}
      onClose={handleLangMenuClose}
    >
      {
        env._LANGUAGES.map((language) => (
          <MenuItem onClick={handleLangMenuClose} data-code={language.code} key={language.code}>
            {language.label}
          </MenuItem>
        ))
      }
    </Menu>
  )

  return (
    (!hidden && (
      <div style={classes.grow} className="header">
        <AppBar position="fixed" sx={{ bgcolor: '#0D63C9' }}>
          <Toolbar className="toolbar">
            {isLoaded && !loading && (
              <IconButton edge="start" sx={classes.menuButton} color="inherit" aria-label="open drawer" onClick={handleSideMenuOpen}>
                <MenuIcon />
              </IconButton>
            )}
            <>
              <Drawer open={isSideMenuOpen} onClose={handleSideMenuClose}>
                <List sx={classes.list}>
                  <ListItemLink href="/">
                    <ListItemIcon><HomeIcon /></ListItemIcon>
                    <ListItemText primary={strings.HOME} />
                  </ListItemLink>
                  {isSignedIn && (
                    <ListItemLink href="/bookings">
                      <ListItemIcon><BookingsIcon /></ListItemIcon>
                      <ListItemText primary={strings.BOOKINGS} />
                    </ListItemLink>
                  )}
                  <ListItemLink href="/about">
                    <ListItemIcon><AboutIcon /></ListItemIcon>
                    <ListItemText primary={strings.ABOUT} />
                  </ListItemLink>
                  <ListItemLink href="/tos">
                    <ListItemIcon><TosIcon /></ListItemIcon>
                    <ListItemText primary={strings.TOS} />
                  </ListItemLink>
                  <ListItemLink href="/contact">
                    <ListItemIcon><MailIcon /></ListItemIcon>
                    <ListItemText primary={strings.CONTACT} />
                  </ListItemLink>
                  {env.isMobile() && !hideSignin && !isSignedIn && isLoaded && !loading && (
                    <ListItemLink href="/sign-in">
                      <ListItemIcon><LoginIcon /></ListItemIcon>
                      <ListItemText primary={strings.SIGN_IN} />
                    </ListItemLink>
                  )}
                </List>
              </Drawer>
            </>
            <div style={classes.grow} />
            <div className="header-desktop">
              {isSignedIn && (
                <IconButton aria-label="" color="inherit" onClick={handleNotificationsClick}>
                  <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              {!hideSignin && !isSignedIn && isLoaded && !loading && (
                <Button variant="contained" startIcon={<LoginIcon />} href="/sign-in" disableElevation fullWidth className="btn-primary" style={{ minWidth: '180px' }}>
                  {strings.SIGN_IN}
                </Button>
              )}
              {isLoaded && !loading && (
                <Button variant="contained" startIcon={<LanguageIcon />} onClick={handleLangMenuOpen} disableElevation fullWidth className="btn-primary">
                  {lang?.label}
                </Button>
              )}
              {isSignedIn && (
                <IconButton edge="end" aria-label="account" aria-controls={menuId} aria-haspopup="true" onClick={handleAccountMenuOpen} color="inherit">
                  <Avatar loggedUser={user} user={user} size="small" readonly />
                </IconButton>
              )}
            </div>
            <div className="header-mobile">
              {!isSignedIn && !loading && (
                <Button variant="contained" startIcon={<LanguageIcon />} onClick={handleLangMenuOpen} disableElevation fullWidth className="btn-primary">
                  {lang?.label}
                </Button>
              )}
              {isSignedIn && (
                <IconButton color="inherit" onClick={handleNotificationsClick}>
                  <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="secondary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              {isSignedIn && (
                <IconButton aria-label="show more" aria-controls={mobileMenuId} aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit">
                  <MoreIcon />
                </IconButton>
              )}
            </div>
          </Toolbar>
        </AppBar>

        {renderMobileMenu}
        {renderMenu}
        {renderLanguageMenu}
      </div>
    )) || <></>
  )
}

export default Header
