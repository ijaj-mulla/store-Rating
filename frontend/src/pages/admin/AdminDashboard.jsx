import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockUsers, mockStores, mockRatings } from '@/data/mockData';
import { useEffect, useState } from 'react';
import { getAdminDashboard } from '@/lib/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ users: mockUsers.length, stores: mockStores.length, ratings: mockRatings.length });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAdminDashboard();
        if (mounted) {
          setMetrics({
            users: Number(data.users) || 0,
            stores: Number(data.stores) || 0,
            ratings: mockRatings.length,
          });
        }
      } catch (_err) {
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>

        {/* Metrics cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border shadow-sm p-5 bg-white">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{metrics.users}</p>
          </div>
          <div className="rounded-lg border shadow-sm p-5 bg-white">
            <p className="text-sm text-gray-600">Total Stores</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{metrics.stores}</p>
          </div>
          <div className="rounded-lg border shadow-sm p-5 bg-white">
            <p className="text-sm text-gray-600">Total Ratings</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{metrics.ratings}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
