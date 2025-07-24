import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBoxOpen, FaList, FaClipboardList, FaUser, FaUserShield, FaUsers, FaCog, FaSignOutAlt, FaPlus } from 'react-icons/fa';

const menu = [
  { to: '/viewDashBoard', label: 'Overview', icon: <FaTachometerAlt /> },
  { to: '/add', label: 'Add Product', icon: <FaPlus /> },
  { to: '/list', label: 'List Products', icon: <FaList /> },
  { to: '/orders', label: 'Orders', icon: <FaClipboardList /> },
  { to: '/profile', label: 'Profile', icon: <FaUser /> },
];

const adminMenu = [
  { to: '/add-admin', label: 'Add Admin', icon: <FaUserShield /> },
  { to: '/list-admin', label: 'List Admins', icon: <FaUsers /> },
];

const Sidebar = ({ userRole, onLogout }) => {
  const location = useLocation();
  return (
    <div className="flex flex-col justify-between min-h-screen h-full w-[250px] bg-[#181A20] py-6 px-3 rounded-tr-3xl rounded-br-3xl shadow-xl">
      <div>
        <div className="mb-8 flex items-center gap-3 px-3">
          
          <span className="text-white text-xl font-bold tracking-wide">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-2">
          {menu.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all text-base ${active ? 'bg-white text-black shadow' : 'text-white hover:bg-[#23262F] hover:text-white'}`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          {userRole === 'owner' && (
            <>
              <div className="mt-6 mb-2 px-4 text-xs text-gray-400 uppercase tracking-widest">Admin Management</div>
              {adminMenu.map(item => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all text-base ${active ? 'bg-white text-black shadow' : 'text-white hover:bg-[#23262F] hover:text-white'}`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </div>
      <div className="flex flex-col gap-2 px-2 mt-8">
        <button
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#23262F] transition-all"
          onClick={onLogout}
        >
          <FaSignOutAlt className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
