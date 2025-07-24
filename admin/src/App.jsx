import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import ManageOrders from './pages/ManageOrders'
import Login from './components/Login'
import AdminProfile from './pages/AdminProfile'
import OwnerProfile from './pages/OwnerProfile'
import AddAdmin from './pages/AddAdmin'
import ListAdmin from './pages/ListAdmin'
import UpdateAdmin from './pages/UpdateAdmin'
import UpdateProduct from './pages/UpdateProduct'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ViewDashboard from './pages/ViewDashboard'

export const backendUrl = import.meta.env.VITE_BACKEND_URL

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') ? localStorage.getItem('userRole') : '');
  const [adminData, setAdminData] = useState(localStorage.getItem('adminData') ? JSON.parse(localStorage.getItem('adminData')) : null);

  useEffect(() => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('adminData', JSON.stringify(adminData));
  }, [token, userRole, adminData]);

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} setUserRole={setUserRole} setAdminData={setAdminData} />
        : (
          <div className='flex w-full'>
            <Sidebar userRole={userRole} onLogout={() => {
              setToken('');
              setUserRole('');
              setAdminData(null);
            }} />
            <div className='w-[70%] mx-auto ml-[max(5vw, 25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/viewDashBoard' element={<ViewDashboard token={token}/>} />
                <Route path='/add' element={<Add token={token} adminData={adminData} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<ManageOrders token={token} />} />
                <Route path='/edit/:productID' element={<UpdateProduct />} />
                <Route path='/profile' element={
                  userRole === 'owner' 
                    ? <OwnerProfile token={token} adminData={adminData} />
                    : <AdminProfile token={token} adminData={adminData} />
                } />
                {userRole === 'owner' && (
                  <>
                    <Route path='/add-admin' element={<AddAdmin token={token} />} />
                    <Route path='/list-admin' element={<ListAdmin token={token} />} />
                    <Route path='/update-admin/:id' element={<UpdateAdmin token={token} />} />
                  </>
                )}
              </Routes>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default App
