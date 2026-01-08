import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { adminCreateStore } from '@/lib/api';

export default function AddStorePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  const errors = {
    name: formData.name && formData.name.length < 3 ? 'Name required (min 3 chars)' : '',
    email: formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Invalid email' : '',
    address: formData.address && formData.address.length < 10 ? 'Address required (min 10 chars)' : '',
  };

  const isValid =
    formData.name.length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.address.length >= 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await adminCreateStore({
        name: formData.name,
        ownerEmail: formData.email,
        address: formData.address,
      });
      toast({ description: 'Store created' });
      navigate('/admin/stores');
    } catch (err) {
      toast({ description: err.message || 'Failed to create store', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '20px' }}>Add New Store</h1>

      <div style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Store Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
            />
            {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
            />
            {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Address</label>
            <textarea
              value={formData.address}
              onChange={handleChange('address')}
              rows={3}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', resize: 'none' }}
            />
            {errors.address && <span style={{ color: 'red', fontSize: '12px' }}>{errors.address}</span>}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              style={{
                padding: '8px 16px',
                background: isValid ? '#555' : '#ccc',
                color: '#fff',
                border: 'none',
                cursor: isValid ? 'pointer' : 'not-allowed',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
