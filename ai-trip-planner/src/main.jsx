import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom'

import CreateTrip from './create-trip/index.jsx'
import Header from './custom/Header.jsx'
import { Toaster } from 'sonner'

import { GoogleOAuthProvider } from '@react-oauth/google';

import ViewTrip from './view-trip/[tripID]'
import HotelDescription from './view-trip/components/HotelDescription'
import MyTrips from './my-trips/index.jsx'

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <App />
      },
      {
        path: "/create-trip",
        element: <CreateTrip />
      },
      {
        path: "/view-trip/:tripID",
        element: <ViewTrip />
      },
      {
        path: "/hotel-description",
        element: <HotelDescription />
      },
      {
        path: "/my-trips",
        element: <MyTrips />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}
    >
      <Toaster />
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </StrictMode>,
)