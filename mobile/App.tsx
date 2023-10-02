import 'react-native-gesture-handler'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RootSiblingParent } from 'react-native-root-siblings'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-native-paper'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import DrawerNavigator from './components/DrawerNavigator'
import * as Helper from './common/Helper'
import * as NotificationService from './services/NotificationService'
import * as UserService from './services/UserService'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Prevent native splash screen from autohiding before App component declaration
SplashScreen.preventAutoHideAsync()
  .then((result) => console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`))
  .catch(console.warn) // it's good to explicitly catch and inspect any error

function App() {
  const [appIsReady, setAppIsReady] = useState(false)
  const responseListener = useRef<Notifications.Subscription>()
  const navigationRef = useRef<NavigationContainerRef<StackParams>>(null)

  useEffect(() => {
    async function register() {
      const loggedIn = await UserService.loggedIn()
      if (loggedIn) {
        const currentUser = await UserService.getCurrentUser()
        if (currentUser?._id) {
          await Helper.registerPushToken(currentUser._id)
        } else {
          Helper.error()
        }
      }
    }

    // Register push notifiations token
    register()

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        if (navigationRef.current) {
          const { data } = response.notification.request.content

          if (data.booking) {
            if (data.user && data.notification) {
              await NotificationService.markAsRead(data.user, [data.notification])
            }
            navigationRef.current.navigate('Booking', { id: data.booking })
          } else {
            navigationRef.current.navigate('Notifications', {})
          }
        }
      } catch (err) {
        Helper.error(err, false)
      }
    })

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

  setTimeout(() => {
    setAppIsReady(true)
  }, 500)

  const onReady = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <SafeAreaProvider>
      <Provider>
        <RootSiblingParent>
          <NavigationContainer ref={navigationRef} onReady={onReady}>
            <ExpoStatusBar style="light" backgroundColor="rgba(0, 0, 0, .9)" />
            <DrawerNavigator />
          </NavigationContainer>
        </RootSiblingParent>
      </Provider>
    </SafeAreaProvider>
  )
}

export default App
