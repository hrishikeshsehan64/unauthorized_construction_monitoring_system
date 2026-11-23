import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Building, Radar, Alert, MapIcon, Refresh, User, Lock, LogOut } from './Icons';
import { useUSMS } from '../context/USMSContext';

export default function Header() {
  const {
    sites,
    surveys,
    reports,
    investigations,
    isLiveBackend,
    refreshFromBackend,
    user,
    isAuthenticated,
    setLoginModalOpen,
    logout,
  } = useUSMS();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFromBackend();
    setTimeout(() => setRefreshing(false), 500);
  };

  const navItems = [
    { to: '/sites', label: 'Sites', icon: Building, count: sites.length },
    { to: '/surveys', label: 'Drone Surveys', icon: Radar, count: surveys.length },
    {
      to: '/reports',
      label: 'Reports',
      icon: Alert,
      count: reports.length,
      alert: reports.some((r) => r.status === 'PENDING'),
    },
    {
      to: '/investigations',
      label: 'Investigations',
      icon: Shield,
      count: investigations.length,
    },
    { to: '/map', label: 'Map', icon: MapIcon },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-14 shrink-0 bg-surface border-b border-line px-3 sm:px-5 flex items-center justify-between gap-3 select-none z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-md bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shadow-glow">
          <Shield width={16} height={16} />
        </div>
        <div>
          <span className="font-bold tracking-widest text-sm text-ink font-mono">
            USMS
          </span>
          <span className="hidden lg:inline text-xs text-mute ml-2 border-l border-line pl-2">
            Unauthorized Construction Monitoring
          </span>
        </div>
      </div>

      {/* Primary Minimal Navigation Tabs */}
      <nav className="flex items-center gap-1 sm:gap-1.5">
        {navItems.map(({ to, label, icon: Icon, count, alert }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-mute hover:text-ink hover:bg-white/[0.04]'
              }`
            }
          >
            <Icon width={13} height={13} />
            <span className="hidden sm:inline">{label}</span>
            {count !== undefined && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  alert
                    ? 'bg-crit/20 text-crit font-bold'
                    : 'bg-white/[0.08] text-inherit'
                }`}
              >
                {count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right Controls: Backend Status & User Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Status Indicator */}
        <div className="hidden md:flex items-center">
          {isLiveBackend ? (
            <span className="chip bg-ok/10 text-ok border border-ok/25 text-[10px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />
              API Connected
            </span>
          ) : (
            <button
              onClick={handleRefresh}
              title="Backend unreachable on port 5001. Running in local state mode. Click to retry connection."
              className="chip bg-warn/10 text-warn border border-warn/25 hover:bg-warn/20 transition cursor-pointer text-[10px] font-mono flex items-center gap-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warn" />
              Local Mode
              <Refresh
                width={10}
                height={10}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
          )}
        </div>

        {/* User Authentication Menu */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-line">
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold font-mono text-[11px] flex items-center justify-center shrink-0"
                title={`${user.name} (${user.email})`}
              >
                {getInitials(user.name)}
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <div className="text-xs font-semibold text-ink truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[9px] font-mono uppercase text-accent2">
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded text-mute hover:text-crit hover:bg-crit/10 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut width={13} height={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-accent hover:bg-accent/90 text-white transition shadow-sm"
          >
            <Lock width={12} height={12} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
