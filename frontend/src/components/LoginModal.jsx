import React, { useState } from 'react';
import { useUSMS } from '../context/USMSContext';
import { Shield, Lock, User, Eye, EyeOff, X, Check } from './Icons';

export default function LoginModal({ isOpen, onClose }) {
  const { login, register } = useUSMS();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('OFFICER');

  if (!isOpen) return null;

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login({ email, password });
        if (!res.success) {
          setError(res.error || 'Invalid email or password');
        } else {
          onClose();
        }
      } else {
        const res = await register({ name, email, password, role });
        if (!res.success) {
          setError(res.error || 'Failed to create account');
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="panel max-w-sm w-full bg-card border border-line shadow-2xl p-5 select-none relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-accent/15 border border-accent/40 flex items-center justify-center text-accent">
              <Lock width={14} height={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink font-mono tracking-wide">
                USMS AUTH
              </h3>
              <p className="text-[10px] text-mute uppercase tracking-wider">
                {mode === 'login' ? 'Officer & Staff Login' : 'Register New Account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-mute hover:text-ink transition p-1 rounded hover:bg-white/5"
            aria-label="Close"
          >
            <X width={16} height={16} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded bg-bg text-xs font-medium border border-line mt-3.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-1 rounded text-center transition ${
              mode === 'login'
                ? 'bg-card text-ink shadow-sm'
                : 'text-mute hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-1 rounded text-center transition ${
              mode === 'register'
                ? 'bg-card text-ink shadow-sm'
                : 'text-mute hover:text-ink'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-2 rounded bg-crit/15 border border-crit/30 text-crit text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mt-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-mute font-medium mb-1">
                Full Name <span className="text-crit">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Officer K. Sharma"
                  className="w-full h-8 pl-8 pr-2.5 rounded bg-bg border border-line text-ink placeholder:text-mute/50 focus:outline-none focus:border-accent text-xs"
                />
                <User
                  width={13}
                  height={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mute"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-mute font-medium mb-1">
              Email Address <span className="text-crit">*</span>
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@usms.gov"
              className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink placeholder:text-mute/50 focus:outline-none focus:border-accent text-xs"
            />
          </div>

          <div>
            <label className="block text-mute font-medium mb-1">
              Password <span className="text-crit">*</span>
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-8 pl-2.5 pr-8 rounded bg-bg border border-line text-ink placeholder:text-mute/50 focus:outline-none focus:border-accent text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff width={13} height={13} />
                ) : (
                  <Eye width={13} height={13} />
                )}
              </button>
            </div>
            {mode === 'register' && (
              <p className="text-[10px] text-mute mt-1">
                Passwords are automatically hashed securely using bcrypt (10 rounds).
              </p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-mute font-medium mb-1">
                Operational Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-8 px-2 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent text-xs"
              >
                <option value="OFFICER">OFFICER (Enforcement Officer)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
                <option value="SURVEYOR">SURVEYOR (Drone Operator)</option>
                <option value="VIEWER">VIEWER (Auditor / Public Record)</option>
              </select>
            </div>
          )}

          {/* Quick Demo Credentials (in Login mode) */}
          {mode === 'login' && (
            <div className="pt-1">
              <div className="text-[10px] font-mono text-mute uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Quick Demo Accounts:</span>
                <span className="text-[9px] text-accent2">Bcrypt Hashed</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@usms.gov', 'admin123')}
                  className="px-1.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-ink border border-line text-center transition"
                  title="System Administrator (admin123)"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('officer@usms.gov', 'officer123')}
                  className="px-1.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-ink border border-line text-center transition"
                  title="Enforcement Officer (officer123)"
                >
                  Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('pilot@usms.gov', 'admin123')}
                  className="px-1.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-ink border border-line text-center transition"
                  title="Drone Pilot (admin123)"
                >
                  Pilot
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-8 rounded bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-semibold transition text-xs shadow-sm flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : mode === 'login' ? (
                <>
                  <Lock width={12} height={12} />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <Check width={12} height={12} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
