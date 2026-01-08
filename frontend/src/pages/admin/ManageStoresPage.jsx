import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminListStores } from '@/lib/api';
import { StarRating } from '@/components/ui/star-rating';

export default function ManageStoresPage() {
  const navigate = useNavigate();
  const [nameFilter, setNameFilter] = useState('');
  const [rows, setRows] = useState([]);

  const refetch = () => {
    let mounted = true;
    adminListStores()
      .then((list) => {
        if (!mounted) return;
        const mapped = list.map((s) => ({
          id: s.id,
          name: s.name,
          ownerName: s.owner_name,
          ownerEmail: s.owner_email,
          address: s.address || '',
          ratingCount: s.rating_count,
          ratingAverage: Number(s.rating_average || 0).toFixed(1),
          createdAt: s.created_at,
        }));
        setRows(mapped);
      })
      .catch(() => setRows([]));
    return () => { mounted = false; };
  };

  useEffect(() => {
    refetch();
    const handleRatingSubmitted = () => refetch();
    window.addEventListener('rating:submitted', handleRatingSubmitted);
    return () => {
      window.removeEventListener('rating:submitted', handleRatingSubmitted);
    };
  }, []);

  const filteredStores = rows.filter(store => {
    if (nameFilter && !store.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
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

  const stores = useMemo(() => {
    const data = [...filteredStores];
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (sortKey === 'createdAt') {
        cmp = new Date(av).getTime() - new Date(bv).getTime();
      } else if (sortKey === 'averageRating') {
        cmp = Number(av) - Number(bv);
      } else {
        cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [filteredStores, sortKey, sortDir]);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Stores</h1>
        <button
          onClick={() => navigate('/admin/stores/add')}
          style={{ padding: '8px 16px', background: '#555', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Add Store
        </button>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '15px' }}>
        <input
          placeholder="Filter by name"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          style={{ padding: '6px', border: '1px solid #ccc' }}
        />
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th onClick={() => handleSort('name')} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>
              <span>Name</span>
              <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>{sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th onClick={() => handleSort('ownerEmail')} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>
              <span>Owner Email</span>
              <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>{sortKey === 'ownerEmail' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th onClick={() => handleSort('address')} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>
              <span>Address</span>
              <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>{sortKey === 'address' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th onClick={() => handleSort('ratingCount')} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>
              <span>Rating Count</span>
              <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>{sortKey === 'ratingCount' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th onClick={() => handleSort('ratingAverage')} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}>
              <span>Avg Rating</span>
              <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>{sortKey === 'ratingAverage' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {stores.map(store => (
            <tr key={store.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{store.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{store.ownerEmail}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', maxWidth: '200px' }}>{store.address}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{store.ratingCount}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <StarRating rating={Number(store.ratingAverage)} size="sm" />
                <span style={{ marginLeft: 6, fontSize: 12 }}>{store.ratingAverage}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}
