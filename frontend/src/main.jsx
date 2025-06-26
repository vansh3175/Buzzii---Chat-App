import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Home from "./pages/Home.jsx"
import Profile from "./pages/Profile.jsx"
import AuthLayout from './pages/AuthLayout.jsx'
import { Provider } from 'react-redux'
import store  from './store/store.js'

const router = createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[{
      path:'/',
      element:
      <AuthLayout>
      <Home/>
      </AuthLayout>
    },
    {
      path:'/login',
      element:<Login/>

    },
    {
      path:'/signup',
      element:<Signup/>
    },
    {
      path:'/profile',
      element:
      <AuthLayout>
        <Profile/>
      </AuthLayout>
    }]
  }
])

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router}/>
      </Provider>
    </StrictMode>
  
)
