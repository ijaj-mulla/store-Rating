import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminListUsers } from '@/lib/api';
import { format } from 'date-fns';

export default function ManageUsersPage() {
  const navigate = useNavigate();
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    adminListUsers()
      .then((list) => {
        if (!mounted) return;
        // Map backend fields to UI shape
        const mapped = list.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          address: u.address || '',
          role: u.role,
          createdAt: u.created_at,
        }));
        setRows(mapped);
      })
      .catch(() => setRows([]));
    return () => { mounted = false; };
  }, []);

  const filteredUsers = rows.filter(user => {
    if (nameFilter && !user.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (emailFilter && !user.email.toLowerCase().includes(emailFilter.toLowerCase())) return false;
    if (roleFilter && user.role !== roleFilter) return false;
    return true;
  });

  // Sorting
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const users = useMemo(() => {
    const data = [...filteredUsers];
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (sortKey === 'createdAt') {
        cmp = new Date(av).getTime() - new Date(bv).getTime();
      } else {
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [filteredUsers, sortKey, sortDir]);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Users</h1>
        <button
          onClick={() => navigate('/admin/users/add')}
          style={{ padding: '8px 16px', background: '#555', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <input
          placeholder="Filter by name"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          style={{ padding: '6px', border: '1px solid #ccc' }}
        />
        <input
          placeholder="Filter by email"
          value={emailFilter}
          onChange={e => setEmailFilter(e.target.value)}
          style={{ padding: '6px', border: '1px solid #ccc' }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: '6px', border: '1px solid #ccc' }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th onClick={() => handleSort('name')} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>
              <span>Name</span>
              <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>{sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th onClick={() => handleSort('email')} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>
              <span>Email</span>
              <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>{sortKey === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
              <span>Address</span>
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
              <span>Role</span>
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', maxWidth: '200px' }}>{user.address}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role.replace('_', ' ')}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button
                  onClick={() => setSelectedUser(user)}
                  style={{ padding: '4px 8px', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #ddd' }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Inline User Details */}
      {selectedUser && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', background: '#fafafa' }}>
          <h3 style={{ marginBottom: '10px' }}>User Details</h3>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Address:</strong> {selectedUser.address}</p>
          <p><strong>Role:</strong> {selectedUser.role.replace('_', ' ')}</p>
          <p><strong>Joined:</strong> {format(new Date(selectedUser.createdAt), 'MMM d, yyyy')}</p>
          <button
            onClick={() => setSelectedUser(null)}
            style={{ marginTop: '10px', padding: '6px 12px', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #ddd' }}
          >
            Close
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
