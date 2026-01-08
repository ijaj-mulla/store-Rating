import React, { useState } from 'react';

export default function PasswordInput({ value, onChange, placeholder, required = false, style = {}, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '8px',
          paddingRight: '40px', // Space for eye icon
          border: '1px solid #ccc',
          boxSizing: 'border-box',
          ...style
        }}
        {...props}
      />
      <button
        type="button"
        onClick={togglePassword}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          fontSize: '16px',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s ease'
        }}
        tabIndex="-1"
        onMouseEnter={(e) => e.target.style.color = '#333'}
        onMouseLeave={(e) => e.target.style.color = '#666'}
        title={showPassword ? 'Hide password' : 'Show password'}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          // Eye closed icon
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11.94-5.56-11.94-12.94A10.07 10.07 0 0 1 12 4c7 0 11.94 5.56 11.94 12.94z"/>
            <path d="M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4z"/>
          </svg>
        ) : (
          // Eye open icon
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8-11 8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}
