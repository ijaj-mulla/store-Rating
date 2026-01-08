import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PasswordInput from '@/components/ui/password-input';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
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
    address: formData.address && formData.address.length > 400
      ? 'Address too long (max 400)'
      : '',
    password: formData.password && !validatePassword(formData.password)
      ? 'Password: 8-16 chars, 1 uppercase, 1 special'
      : '',
  };

  const isValid =
    formData.name.length >= 20 && formData.name.length <= 60 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.address.length >= 10 && formData.address.length <= 400 &&
    validatePassword(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    const result = await signup(formData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Signup failed');
    }
    setIsSubmitting(false);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Sign Up</h1>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

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

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          style={{
            width: '100%',
            padding: '10px',
            background: isValid ? '#555' : '#ccc',
            color: '#fff',
            border: 'none',
            cursor: isValid ? 'pointer' : 'not-allowed',
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
