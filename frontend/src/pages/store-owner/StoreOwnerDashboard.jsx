import React, { useMemo, useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { StarRating } from '@/components/ui/star-rating';
import { getMyStores, getStoreRatingsWithUserNames } from '@/lib/api';

export default function StoreOwnerDashboard() {
  const { user } = useAuth();
  const [myStore, setMyStore] = useState(null);
  const [storeRatings, setStoreRatings] = useState([]);
  
  console.log('StoreOwnerDashboard component loaded at:', new Date().toISOString());

  const refetch = () => {
    let mounted = true;
    getMyStores()
      .then((stores) => {
        if (!mounted) return;
        const store = stores[0] || null;
        setMyStore(store);
        if (store) {
          return getStoreRatingsWithUserNames(store.id);
        }
        return { ratings: [] };
      })
      .then((response) => {
        if (!mounted) return;
        const ratings = Array.isArray(response) ? response : (response.ratings || []);
        setStoreRatings(ratings);
      })
      .catch((err) => {
        if (mounted) {
          setMyStore(null);
          setStoreRatings([]);
        }
      });
    return () => { mounted = false; };
  };

  useEffect(() => {
    refetch();
    const handleRatingSubmitted = () => refetch();
    window.addEventListener('rating:submitted', handleRatingSubmitted);
    return () => {
      window.removeEventListener('rating:submitted', handleRatingSubmitted);
    };
  }, [user?.id]);

  const [sortKey, setSortKey] = useState('userName');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const ratings = useMemo(() => {
    const data = [...storeRatings];
    data.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'rating') {
        cmp = a.rating - b.rating;
      } else {
        cmp = (a.user_name || '').localeCompare(b.user_name || '', undefined, { numeric: true, sensitivity: 'base' });
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [storeRatings, sortKey, sortDir]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Store Dashboard</h1>

        {/* Top highlighted box with average rating (stars) and count */}
        {myStore ? (
          <div className="rounded-lg border shadow-sm bg-white p-5">
            <div className="mb-2">
              <p className="text-sm text-gray-600">Store Name</p>
              <p className="font-semibold text-gray-800">{myStore.name}</p>
            </div>
            {myStore.address && (
              <div className="mb-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-gray-800">{myStore.address}</p>
              </div>
            )}
            <div className="mb-2">
              <p className="text-sm text-gray-600">Owner Email</p>
              <p className="text-gray-800">{user?.email}</p>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-600">Average Store Rating</p>
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={Number(myStore.rating_average || 0)} size="md" />
                <span className="text-sm font-medium text-gray-800">{Number(myStore.rating_average || 0).toFixed(1)}</span>
                <span className="text-sm text-gray-500">({myStore.rating_count || 0} {myStore.rating_count === 1 ? 'review' : 'reviews'})</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border shadow-sm bg-white p-5">
            <p className="text-sm text-gray-600">No store found</p>
          </div>
        )}

        {/* Ratings table: User Name | Rating (stars) */}
        <div className="rounded-lg border bg-white">
          {storeRatings.length === 0 ? (
            <p className="p-5 text-sm text-gray-600">No ratings yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th onClick={() => handleSort('userName')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer">
                    <span>User Name</span>
                    <span className="ml-1 text-[12px] text-gray-500">{sortKey === 'userName' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </th>
                  <th onClick={() => handleSort('rating')} className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer">
                    <span>Rating</span>
                    <span className="ml-1 text-[12px] text-gray-500">{sortKey === 'rating' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ratings.map(rating => (
                  <tr key={rating.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{rating.user_name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating rating={rating.rating} size="sm" />
                        <span className="text-xs font-medium text-gray-700">{rating.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
