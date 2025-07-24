import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ListAdmin = ({ token }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${backendUrl}/api/admin/list`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setAdmins(response.data.admins);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error(error.response?.data?.message || 'Error fetching admins');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            try {
                const response = await axios.delete(
                    `${backendUrl}/api/admin/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    toast.success('Admin deleted successfully');
                    fetchAdmins();
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error('Error deleting admin:', error);
                toast.error(error.response?.data?.message || 'Error deleting admin');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#4682A9] p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4682A9]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#232526] to-[#4682A9] p-2">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">Admin List</h2>
                <Link
                    to="/add-admin"
                        className="rounded-full bg-[#4682A9] text-white font-bold px-4 py-2 shadow-lg hover:bg-[#35607a] hover:scale-105 transition-all duration-200 text-sm"
                >
                    Add New Admin
                </Link>
            </div>
            {admins.length === 0 ? (
                    <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl p-4 text-center">
                        <p className="text-white/70 text-base">No admins found</p>
                </div>
            ) : (
                    <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/20 text-sm">
                            <thead className="bg-white/10">
                            <tr>
                                    <th className="px-3 py-2 text-left font-bold text-white/70 uppercase tracking-wider">Profile</th>
                                    <th className="px-3 py-2 text-left font-bold text-white/70 uppercase tracking-wider">Admin ID</th>
                                    <th className="px-3 py-2 text-left font-bold text-white/70 uppercase tracking-wider">Name</th>
                                    <th className="px-3 py-2 text-left font-bold text-white/70 uppercase tracking-wider">Email</th>
                                    <th className="px-3 py-2 text-left font-bold text-white/70 uppercase tracking-wider">Phone</th>
                                    <th className="px-3 py-2 text-left font-bold text-white/70 uppercase tracking-wider">Role</th>
                                    <th className="px-3 py-2 text-left font-bold text-white/70 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                            <tbody className="bg-white/5 divide-y divide-white/10">
                            {admins.map((admin) => (
                                <tr key={admin._id}>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-[#4682A9] bg-white/30 flex items-center justify-center shadow">
                                            <img
                                                    className="h-8 w-8 object-cover"
                                                    src={admin.profilePicture ? `${backendUrl}/${admin.profilePicture}` : 'https://via.placeholder.com/32'}
                                                alt={admin.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/32';
                                                }}
                                            />
                                        </div>
                                    </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-white/80 font-mono">{admin.adminID}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-white">{admin.name}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-white/80">{admin.email}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-white/80">{admin.phoneNum}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-block rounded-full text-xs font-bold shadow ${admin.role === 'owner' ? 'bg-purple-600 text-white' : 'bg-[#4682A9] text-white'}`}>{admin.role}</span>
                                    </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium flex gap-1">
                                        <Link
                                            to={`/update-admin/${admin._id}`}
                                                className="rounded-full bg-white/20 text-[#4682A9] font-bold px-2 py-1 hover:bg-[#4682A9] hover:text-white transition-all duration-200"
                                        >
                                            Edit
                                        </Link>
                                        {admin.role !== 'owner' && (
                                            <button
                                                onClick={() => handleDelete(admin._id)}
                                                    className="rounded-full bg-white/20 text-red-500 font-bold px-2 py-1 hover:bg-red-600 hover:text-white transition-all duration-200"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </div>
        </div>
    );
};

export default ListAdmin; 