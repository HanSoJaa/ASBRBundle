import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import { ToastContainer } from 'react-toastify';
import Payment from './pages/Payment'
import UserOrder from './pages/UserOrder'

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <Navbar/>
      <SearchBar/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/collection' element={<Collection/>} />
        <Route path='/product/:productId' element={<Product/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/forgot-password' element={<ForgotPassword/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/place-order' element={<Payment />} />
        <Route path='/UserOrders' element={<UserOrder/>} />
      </Routes>
      <ToastContainer />
      
    </div>
  )
}

export default App
