import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import PasswordInput from '@/components/ui/password-input';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, changePassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    return;
    }
  }, [user, navigate]);

  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && password.length <= 16 && hasUppercase && hasSpecial;
  };

  const passwordError = formData.newPassword && !validatePassword(formData.newPassword)
    ? 'Password: 8-16 chars, 1 uppercase, 1 special'
    : '';
  const confirmError = formData.confirmPassword && formData.newPassword !== formData.confirmPassword
    ? 'Passwords do not match'
    : '';

  const isValid =
    formData.currentPassword &&
    validatePassword(formData.newPassword) &&
    formData.newPassword === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    const result = await changePassword(formData.currentPassword, formData.newPassword);

    if (result.success) {
      toast({
        title: "Success",
        description: "Password changed successfully",
        variant: "default",
      });
      navigate(-1);
    } else {
      setError(result.error || 'Failed');
    }
    setIsSubmitting(false);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '20px' }}>Change Password</h1>

      <div style={{ maxWidth: '400px' }}>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Current Password</label>
            <PasswordInput
              value={formData.currentPassword}
              onChange={handleChange('currentPassword')}
              placeholder="Enter current password"
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
            <PasswordInput
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              placeholder="Enter new password"
              required
            />
            {passwordError && <span style={{ color: 'red', fontSize: '12px' }}>{passwordError}</span>}
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              8-16 chars, 1 uppercase, 1 special character
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password</label>
            <PasswordInput
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Confirm new password"
              required
            />
            {confirmError && <span style={{ color: 'red', fontSize: '12px' }}>{confirmError}</span>}
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            style={{
              padding: '10px 20px',
              background: isValid ? '#555' : '#ccc',
              color: '#fff',
              border: 'none',
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
