import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { adminCreateUser } from '@/lib/api';
import PasswordInput from '@/components/ui/password-input';

export default function AddUserPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: '',
  });

  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && password.length <= 16 && hasUppercase && hasSpecial;
  };

  const errors = {
    name: formData.name && (formData.name.length < 20 || formData.name.length > 60)
      ? 'Name must be 20-60 characters'
      : '',
    email: formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ? 'Invalid email'
      : '',
    address: formData.address && (formData.address.length < 10 || formData.address.length > 400)
      ? 'Address must be 10-400 characters'
      : '',
    password: formData.password && !validatePassword(formData.password)
      ? 'Password: 8-16 chars, 1 uppercase, 1 special'
      : '',
  };

  const isValid =
    formData.name.length >= 20 && formData.name.length <= 60 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.address.length >= 10 && formData.address.length <= 400 &&
    validatePassword(formData.password) &&
    formData.role;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await adminCreateUser({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        password: formData.password,
        role: formData.role,
      });
      toast({ description: 'User created' });
      navigate('/admin/users');
    } catch (err) {
      toast({ description: err.message || 'Failed to create user', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '20px' }}>Add New User</h1>

      <div style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Full Name ({formData.name.length}/60)
            </label>
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
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Address ({formData.address.length}/400)
            </label>
            <textarea
              value={formData.address}
              onChange={handleChange('address')}
              rows={3}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', resize: 'none' }}
            />
            {errors.address && <span style={{ color: 'red', fontSize: '12px' }}>{errors.address}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
            <select
              value={formData.role}
              onChange={handleChange('role')}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <PasswordInput
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="Create a password"
              required
            />
            {errors.password && <span style={{ color: 'red', fontSize: '12px' }}>{errors.password}</span>}
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              8-16 chars, 1 uppercase, 1 special character
            </div>
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
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
