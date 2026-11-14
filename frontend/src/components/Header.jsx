import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Shield } from './Icons';
import { useApi } from '../data/api';
import { SEV } from './MapView';

function useOutside(ref, close) {
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const k = e => e.key === 'Escape' && close();
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [ref, close]);
}

const Dot = ({ s }) => <i className="h-2 w-2 rounded-full shrink-0" style={{ background: SEV[s], boxShadow: `0 0 6px ${SEV[s]}` }} />;

function SearchBox() {
  const { data } = useApi('incidents');
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));

  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return data.filter(i => [i.id, i.ward, i.type, i.status, i.severity].join(' ').toLowerCase().includes(t));
  }, [q, data]);

  const go = (term) => { setOpen(false); nav(`/violations?q=${encodeURIComponent(term)}`); };

  return (
    <div ref={ref} className="flex-1 max-w-md ml-6 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" width={14} height={14} />
      <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onKeyDown={e => e.key === 'Enter' && q.trim() && go(q.trim())}
        placeholder="Search site ID, ward, type…"
        className="w-full h-9 pl-9 pr-3 rounded-md bg-bg border border-line text-sm placeholder:text-mute/70 focus:outline-none focus:border-accent" />
      {open && q.trim() && (
        <div className="absolute z-[1000] top-11 inset-x-0 panel shadow-2xl overflow-hidden">
          {hits.length === 0 ? <div className="px-4 py-3 text-sm text-mute">No matches for “{q}”</div> : <>
            {hits.slice(0, 6).map(i => (
              <button key={i.id} onClick={() => go(i.id)} className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 border-b border-line last:border-0">
                <Dot s={i.severity} />
                <span className="font-mono text-xs text-accent2">{i.id}</span>
                <span className="text-sm truncate">{i.type}</span>
                <span className="ml-auto text-xs text-mute">{i.ward}</span>
              </button>
            ))}
            <button onClick={() => go(q.trim())} className="w-full text-left px-4 py-2 text-xs text-accent hover:bg-white/5">See all {hits.length} results →</button>
          </>}
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { data } = useApi('incidents');
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  const alerts = useMemo(() => data.filter(i => i.severity === 'critical' || i.severity === 'high').slice(0, 8), [data]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(o => !o); setSeen(true); }} className="relative text-mute hover:text-ink" aria-label="Notifications">
        <Bell />
        {!seen && alerts.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-crit text-[9px] font-bold text-white flex items-center justify-center">{alerts.length}</span>}
      </button>
      {open && (
        <div className="absolute z-[1000] right-0 top-9 w-80 panel shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex justify-between"><span className="panel-title">Alerts</span><span className="text-xs text-mute">{alerts.length} high priority</span></div>
          <div className="max-h-80 overflow-auto">
            {alerts.map(i => (
              <button key={i.id} onClick={() => { setOpen(false); nav(`/violations?q=${i.id}`); }} className="w-full text-left px-4 py-3 flex gap-3 hover:bg-white/5 border-b border-line last:border-0">
                <Dot s={i.severity} />
                <div className="min-w-0">
                  <div className="text-sm"><span className="font-mono text-accent2">{i.id}</span> · {i.type}</div>
                  <div className="text-xs text-mute">{i.ward} · {i.detected} · {i.confidence}% match</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Account() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  const signOut = () => { try { localStorage.removeItem('token'); } catch {} setOpen(false); nav('/dashboard'); window.location.reload(); };
  const Item = ({ children, onClick }) => <button onClick={onClick} className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5">{children}</button>;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} aria-label="Account" className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent2 text-[11px] font-bold flex items-center justify-center">AD</button>
      {open && (
        <div className="absolute z-[1000] right-0 top-10 w-56 panel shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-line"><div className="text-sm font-semibold">Admin</div><div className="text-xs text-mute">Enforcement officer</div></div>
          <Item onClick={() => { setOpen(false); nav('/investigations'); }}>My investigations</Item>
          <Item onClick={() => { setOpen(false); nav('/violations'); }}>All violations</Item>
          <div className="border-t border-line"><button onClick={signOut} className="w-full text-left px-4 py-2.5 text-sm text-crit hover:bg-white/5">Sign out</button></div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <header className="h-14 shrink-0 relative z-[1000] flex items-center gap-6 px-5 border-b border-line bg-surface">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-md bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shadow-glow"><Shield /></div>
        <div className="leading-tight">
          <div className="font-bold tracking-[.2em] text-sm">USMS</div>
          <div className="text-[10px] text-mute uppercase tracking-widest">Unauthorized Construction Monitoring</div>
        </div>
      </div>
      <SearchBox />
      <div className="ml-auto flex items-center gap-4">
        <span className="chip bg-ok/10 text-ok"><span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />Live</span>
        <Notifications />
        <Account />
      </div>
    </header>
  );
}
