import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import env from './config/env.config'
import { GlobalProvider } from './context/GlobalContext'
import { init as initGA } from './common/ga4'

if (env.GOOGLE_ANALYTICS_ENABLED) {
  initGA()
}

const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Activate = lazy(() => import('./pages/Activate'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const Property = lazy(() => import('./pages/Property'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSession = lazy(() => import('./pages/CheckoutSession'))
const Bookings = lazy(() => import('./pages/Bookings'))
const Booking = lazy(() => import('./pages/Booking'))
const Settings = lazy(() => import('./pages/Settings'))
const Notifications = lazy(() => import('./pages/Notifications'))
const ToS = lazy(() => import('./pages/ToS'))
const About = lazy(() => import('./pages/About'))
const ChangePassword = lazy(() => import('./pages/ChangePassword'))
const Contact = lazy(() => import('./pages/Contact'))
const NoMatch = lazy(() => import('./pages/NoMatch'))

const App = () => (
  <GlobalProvider>
    <Router>
      <div className="app">
        <Suspense fallback={<></>}>
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/activate" element={<Activate />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/property" element={<Property />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-session/:sessionId" element={<CheckoutSession />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/tos" element={<ToS />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="*" element={<NoMatch />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  </GlobalProvider>
)

export default App
