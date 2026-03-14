import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, toggleUserStatus } from '../Features/UserSlice';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, UserCheck, UserX, Loader2 } from 'lucide-react';
import './UsersList.css';

const UsersList = () => {
    const dispatch = useDispatch();
    const { users, loading, pagination } = useSelector((state) => state.users);
    
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        search: '',
        role: '',
        status: '',
        sortField: 'createdAt',
        sortOrder: 'desc'
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            dispatch(fetchUsers(params));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [params, dispatch]);

    const handleToggleStatus = (id) => {
        dispatch(toggleUserStatus(id));
    };

    const handleSort = (field) => {
        setParams(prev => ({
            ...prev,
            sortField: field,
            sortOrder: prev.sortField === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleParamChange = (name, value) => {
        setParams(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div className="users-list-container">
                    <motion.div
                        className="users-list-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="header-title">
                            <h1>User Management</h1>
                            <p>Manage, filter, and monitor all registered users.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="filters-section"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="search-box">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={params.search}
                                onChange={(e) => handleParamChange('search', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <select
                                value={params.role}
                                onChange={(e) => handleParamChange('role', e.target.value)}
                            >
                                <option value="">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>

                            <select
                                value={params.status}
                                onChange={(e) => handleParamChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </motion.div>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-spinner">
                                <Loader2 className="animate-spin" size={48} />
                            </div>
                        ) : (
                            <>
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th onClick={() => handleSort('name')}>
                                                User {params.sortField === 'name' && (params.sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                            </th>
                                            <th onClick={() => handleSort('role')}>
                                                Role {params.sortField === 'role' && (params.sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                            </th>
                                            <th onClick={() => handleSort('phone')}>Phone</th>
                                            <th onClick={() => handleSort('verifyuser')}>Verified</th>
                                            <th onClick={() => handleSort('active')}>Status / Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {users.map((user) => (
                                                <motion.tr
                                                    key={user._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    layout
                                                >
                                                    <td>
                                                        <div className="user-info">
                                                            <img src={user.image || 'https://placehold.co/40'} alt={user.name} className="user-avatar" />
                                                            <div className="user-details">
                                                                <span className="name">{user.name}</span>
                                                                <span className="email">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`role-badge role-${user.role}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>{user.phone}</td>
                                                    <td>
                                                        <span className={`role-badge ${user.verifyuser ? 'role-admin' : 'role-user'}`}>
                                                            {user.verifyuser ? 'Verified' : 'Not Verified'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={`status-toggle ${user.active ? 'status-active' : 'status-inactive'}`}
                                                            onClick={() => handleToggleStatus(user._id)}
                                                            style={{
                                                                width: '100%',
                                                                justifyContent: 'center',
                                                                padding: '8px',
                                                                borderRadius: '8px',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                fontWeight: '600',
                                                                backgroundColor: user.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                                color: user.active ? '#4ade80' : '#f87171'
                                                            }}
                                                        >
                                                            {user.active ? <UserCheck size={18} /> : <UserX size={18} />}
                                                            {user.active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>

                                <div className="pagination-section">
                                    <div className="pagination-info">
                                        Showing {users.length} of {pagination.total} users
                                    </div>
                                    <div className="pagination-controls">
                                        <button
                                            className="page-btn"
                                            disabled={params.page === 1}
                                            onClick={() => setParams(prev => ({ ...prev, page: prev.page - 1 }))}
                                        >
                                            Previous
                                        </button>
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                className={`page-btn ${params.page === i + 1 ? 'active' : ''}`}
                                                onClick={() => setParams(prev => ({ ...prev, page: i + 1 }))}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            className="page-btn"
                                            disabled={params.page === pagination.pages}
                                            onClick={() => setParams(prev => ({ ...prev, page: prev.page + 1 }))}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UsersList;

