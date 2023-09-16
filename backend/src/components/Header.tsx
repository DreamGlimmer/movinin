import React, { useState, useEffect } from 'react'
import Env from '../config/env.config'
import { strings } from '../lang/header'
import { strings as commonStrings } from '../lang/common'
import * as UserService from '../services/UserService'
import * as NotificationService from '../services/NotificationService'
import { toast } from 'react-toastify'
import Avatar from './Avatar'
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
  Dashboard as DashboardIcon,
  CorporateFare as AgenciesIcon,
  LocationOn as LocationsIcon,
  DirectionsCar as PropertiesIcon,
  People as UsersIcon,
  InfoTwoTone as AboutIcon,
  DescriptionTwoTone as TosIcon,
  ExitToApp as SignoutIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as LangHelper from '../common/LangHelper'
import * as movininTypes from 'movinin-types'

import '../assets/css/header.css'

const ListItemLink = (props: any) => <ListItemButton component="a" {...props} />

const Header = (
  {
    user,
    hidden,
    notificationCount: headerNotificationCount
  }: {
    user?: movininTypes.User
    hidden?: boolean
    notificationCount?: number
  }
) => {
  const navigate = useNavigate()
  const [lang, setLang] = useState(Env.DEFAULT_LANGUAGE)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [langAnchorEl, setLangAnchorEl] = useState<HTMLElement | null>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null)
  const [sideAnchorEl, setSideAnchorEl] = useState<HTMLElement | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
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
      window.location.href = window.location.href.split('?')[0] + ([...params].length > 0 ? '?' + params : '')
    } else {
      window.location.reload()
    }
  }

  const handleLangMenuClose = async (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(null)

    const { code } = event.currentTarget.dataset
    if (code) {
      setLang(code)
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

  const getLang = (lang: string) => {
    switch (lang) {
      case 'fr':
        return strings.LANGUAGE_FR
      case 'en':
        return strings.LANGUAGE_EN
      default:
        return Env.DEFAULT_LANGUAGE
    }
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  const handleSignout = () => {
    UserService.signout()
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
    const language = LangHelper.getLanguage()
    setLang(language)
    LangHelper.setLanguage(strings, language)
  }, [])

  useEffect(() => {
    if (!hidden) {
      if (user) {
        NotificationService.getNotificationCounter(user._id as string)
          .then((notificationCounter) => {
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
  }, [hidden, user])

  useEffect(() => {
    if (!hidden) {
      if (headerNotificationCount) {
        setNotificationCount(headerNotificationCount)
      } else {
        setNotificationCount(0)
      }
    }
  }, [hidden, headerNotificationCount])

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
        <Typography>{strings.SETTINGS}</Typography>
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        {<SignoutIcon className="header-action" />}
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
        <LanguageIcon className="header-action" />
        <p>{strings.LANGUAGE}</p>
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        <SignoutIcon className="header-action" />
        <p>{strings.SIGN_OUT}</p>
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
      <MenuItem onClick={handleLangMenuClose} data-code="fr">
        {strings.LANGUAGE_FR}
      </MenuItem>
      <MenuItem onClick={handleLangMenuClose} data-code="en">
        {strings.LANGUAGE_EN}
      </MenuItem>
    </Menu>
  )

  return (
    <div style={hidden ? { display: 'none' } : classes.grow} className="header">
      <AppBar position="fixed" sx={{ bgcolor: '#121212' }}>
        <Toolbar className="toolbar">
          {isLoaded && !loading && isSignedIn && (
            <IconButton edge="start" sx={classes.menuButton} color="inherit" aria-label="open drawer" onClick={handleSideMenuOpen}>
              <MenuIcon />
            </IconButton>
          )}
          <React.Fragment>
            <Drawer open={isSideMenuOpen} onClose={handleSideMenuClose}>
              <List sx={classes.list}>
                <ListItemLink href="/">
                  <ListItemIcon>{<DashboardIcon />}</ListItemIcon>
                  <ListItemText primary={strings.DASHBOARD} />
                </ListItemLink>
                <ListItemLink href="/agencies">
                  <ListItemIcon>{<AgenciesIcon />}</ListItemIcon>
                  <ListItemText primary={strings.AGENCIES} />
                </ListItemLink>
                <ListItemLink href="/locations">
                  <ListItemIcon>{<LocationsIcon />}</ListItemIcon>
                  <ListItemText primary={strings.LOCATIONS} />
                </ListItemLink>
                <ListItemLink href="/properties">
                  <ListItemIcon>{<PropertiesIcon />}</ListItemIcon>
                  <ListItemText primary={strings.PROPERTIES} />
                </ListItemLink>
                <ListItemLink href="/users">
                  <ListItemIcon>{<UsersIcon />}</ListItemIcon>
                  <ListItemText primary={strings.USERS} />
                </ListItemLink>
                <ListItemLink href="/about">
                  <ListItemIcon>{<AboutIcon />}</ListItemIcon>
                  <ListItemText primary={strings.ABOUT} />
                </ListItemLink>
                <ListItemLink href="/tos">
                  <ListItemIcon>{<TosIcon />}</ListItemIcon>
                  <ListItemText primary={strings.TOS} />
                </ListItemLink>
                <ListItemLink href="/contact">
                  <ListItemIcon>{<MailIcon />}</ListItemIcon>
                  <ListItemText primary={strings.CONTACT} />
                </ListItemLink>
              </List>
            </Drawer>
          </React.Fragment>
          <div style={classes.grow} />
          <div className="header-desktop">
            {isSignedIn && (
              <IconButton aria-label="" color="inherit" onClick={handleNotificationsClick}>
                <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}
            {isLoaded && !loading && (
              <Button variant="contained" startIcon={<LanguageIcon />} onClick={handleLangMenuOpen} disableElevation fullWidth className="btn-primary">
                {getLang(lang)}
              </Button>
            )}
            {isSignedIn && user && (
              <IconButton edge="end" aria-label="account" aria-controls={menuId} aria-haspopup="true" onClick={handleAccountMenuOpen} color="inherit">
                <Avatar record={user} type={user.type} size="small" readonly />
              </IconButton>
            )}
          </div>
          <div className="header-mobile">
            {!isSignedIn && !loading && (
              <Button variant="contained" startIcon={<LanguageIcon />} onClick={handleLangMenuOpen} disableElevation fullWidth className="btn-primary">
                {getLang(lang)}
              </Button>
            )}
            {isSignedIn && (
              <IconButton color="inherit" onClick={handleNotificationsClick}>
                <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
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
  )
}

export default Header
