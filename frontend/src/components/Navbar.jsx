import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { clearOldUserData } from '../utils/clearOldData';

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();

    const handleAdminClick = () => {
        window.open('https://asbr-bundle-admin.vercel.app/', '_blank');
    };

    const handleLogin = () => {
        navigate('/login');
    };
    const handleOrders =() =>{
        navigate('/UserOrders');
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleProfile = () => {
        if (clearOldUserData()) {
            toast.error('Please login again to continue');
            navigate('/login');
            return;
        }
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) {
            toast.error('Please login to view your profile');
            navigate('/login');
            return;
        }
        try {
            const user = JSON.parse(userStr);
            if (!user.userID) {
                toast.error('Please login to view your profile');
                navigate('/login');
                return;
            }
            navigate('/profile');
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            toast.error('Please login to view your profile');
            navigate('/login');
        }
    };

  return (
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl shadow-lg border-b border-background-dark/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
                {/* Logo */}
                <Link to='/'>
                    <div className="flex items-center gap-2">
            <span className="w-10 h-10 bg-[#4682A9] rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">A</span>
            <span className="font-extrabold text-2xl text-[#4682A9] tracking-tight hidden sm:inline drop-shadow">SBR</span>
                    </div>
                </Link>
                {/* Desktop Nav */}
                <ul className="hidden sm:flex gap-8 text-base font-medium">
                    <li>
            <NavLink to='/' className={({isActive}) => `pb-1 px-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-[#4682A9] text-white shadow-md scale-105' : 'text-muted hover:bg-[#4682A9] hover:text-white hover:scale-105'}`}>HOME</NavLink>
                    </li>
                    <li>
            <NavLink to='/collection' className={({isActive}) => `pb-1 px-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-[#4682A9] text-white shadow-md scale-105' : 'text-muted hover:bg-[#4682A9] hover:text-white hover:scale-105'}`}>COLLECTION</NavLink>
                    </li>
                    <li>
            <button onClick={handleAdminClick} className="px-4 py-1 border-2 border-[#4682A9] text-[#4682A9] rounded-full bg-white/80 hover:bg-[#4682A9] hover:text-white transition duration-300 shadow">ADMIN</button>
                    </li>
        </ul>
                {/* Right Side Icons */}
                <div className="flex items-center gap-5">
                    {/* Profile Dropdown */}
                    <div className="relative group">
            <button className="hover:bg-primary/10 p-2 rounded-full transition">
              <svg className='w-6 h-6 text-primary' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>
            <div className="hidden group-hover:block absolute right-0 mt-2 w-44 bg-white shadow-xl rounded-2xl py-2 z-50 border border-background-dark/10 before:content-[''] before:absolute before:-top-2 before:right-4 before:w-4 before:h-4 before:bg-white before:rotate-45 before:shadow before:border-t before:border-l before:border-background-dark/10">
              <button onClick={handleProfile} className="block w-full text-left px-5 py-2 text-muted hover:bg-primary/10 hover:text-primary transition rounded-lg">My Profile</button>
              <button onClick={handleOrders} className="block w-full text-left px-5 py-2 text-muted hover:bg-primary/10 hover:text-primary transition rounded-lg">Orders</button>
              <button onClick={handleLogin} className="block w-full text-left px-5 py-2 text-muted hover:bg-primary/10 hover:text-primary transition rounded-lg">LogIn</button>
              <button onClick={handleLogout} className="block w-full text-left px-5 py-2 text-muted hover:bg-danger/10 hover:text-danger transition rounded-lg">Logout</button>
                        </div>
                    </div>
                    {/* Cart Icon */}
          <Link to='/cart' className="relative hover:bg-primary/10 p-2 rounded-full transition">
            <i className="fa-solid fa-cart-shopping text-xl text-primary"></i>
                    </Link>
          {/* Mobile Menu Icon (hidden) */}
          {/* <button onClick={()=>setVisible(true)} className="sm:hidden hover:bg-primary/10 p-2 rounded-full transition">
            <svg className='w-7 h-7 text-primary' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
          </button> */}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
