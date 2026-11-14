import React from 'react';
import { NavLink } from 'react-router-dom';
import { Grid, Alert, MapIcon, Shield, Radar } from './Icons';

const items = [
  { to: '/dashboard', label: 'Command Center', icon: Grid },
  { to: '/violations', label: 'Violations', icon: Alert },
  { to: '/map', label: 'Live Map', icon: MapIcon },
  { to: '/investigations', label: 'Investigations', icon: Shield },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-surface border-r border-line flex flex-col p-3">
      <div className="panel-title px-3 py-3">Operations</div>
      <nav className="space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition
              ${isActive ? 'bg-accent text-white shadow-glow' : 'text-mute hover:text-ink hover:bg-white/5'}`}>
            <Icon /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto panel p-3">
        <div className="flex items-center gap-2 text-accent2 text-xs font-semibold"><Radar /> Satellite sweep</div>
        <p className="text-[11px] text-mute mt-1.5">Next pass in 42 min. 6 wards queued for change detection.</p>
      </div>
    </aside>
  );
}
