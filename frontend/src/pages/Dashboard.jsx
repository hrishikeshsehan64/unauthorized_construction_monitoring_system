import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import Panel from '../components/Panel';
import Ring from '../components/Ring';
import MapView, { SEV } from '../components/MapView';
import { useApi } from '../data/api';

const tip = { contentStyle: { background: '#0d1420', border: '1px solid #1d2b4a', borderRadius: 6, fontSize: 12 }, cursor: { fill: 'rgba(47,123,255,.08)' }, labelStyle: { color: '#7a8aa8' } };
const axis = { stroke: '#7a8aa8', fontSize: 10, tickLine: false, axisLine: false };

function Stat({ label, value, tone = 'text-ink' }) {
  return (
    <div>
      <div className={`font-mono text-2xl font-bold leading-none ${tone}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-mute mt-1.5">{label}</div>
    </div>
  );
}

function Bars({ label, value, max }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1"><span className="text-mute">{label}</span><span className="font-mono">{value}</span></div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent to-accent2" style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
}

export default function Dashboard() {
  const { data: d } = useApi('dashboard');
  const { data: incidents } = useApi('incidents');
  const k = d.kpis;
  const crit = incidents.filter(i => i.severity === 'critical').length;

  return (
    <div className="h-full grid gap-3 grid-cols-[minmax(0,1fr)_320px] grid-rows-[minmax(0,1fr)_230px]">
      {/* Map */}
      <section className="panel relative overflow-hidden row-span-1">
        <MapView incidents={incidents} center={d.center} />
        <div className="absolute top-3 left-3 z-[500] panel px-3 py-2 backdrop-blur bg-card/90">
          <div className="panel-title">{d.region || 'Monitored zones'}</div>
          <div className="text-xs mt-1"><span className="font-mono font-bold text-crit">{crit}</span> critical · <span className="font-mono font-bold">{incidents.length}</span> tracked sites</div>
        </div>
        <div className="absolute bottom-3 left-3 z-[500] panel px-3 py-2 bg-card/90 flex gap-4">
          {Object.entries(SEV).map(([s, c]) => (
            <span key={s} className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-mute">
              <i className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />{s}
            </span>
          ))}
        </div>
      </section>

      {/* Right column */}
      <div className="row-span-1 grid grid-rows-3 gap-3 min-h-0">
        <Panel title="Detection Rate">
          <div className="flex items-center gap-5 h-full">
            <Ring value={d.detectionRate} unit="%" label="accuracy" size={96} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 flex-1">
              <Stat label="Active sites" value={k.activeSites} />
              <Stat label="New today" value={k.newToday} tone="text-crit" />
              <Stat label="Resolved" value={k.resolved} tone="text-ok" />
              <Stat label="Pending" value={k.pending} tone="text-warn" />
            </div>
          </div>
        </Panel>
        <Panel title="Violations by Ward">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.byWard} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
              <defs><linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#1d4ed8" /></linearGradient></defs>
              <CartesianGrid stroke="#16213a" vertical={false} />
              <XAxis dataKey="name" {...axis} interval={0} tick={{ fontSize: 9, fill: '#7a8aa8' }} />
              <YAxis {...axis} />
              <Tooltip {...tip} />
              <Bar dataKey="count" fill="url(#bw)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Review Progress">
          <div className="flex items-center gap-5 h-full">
            <Ring value={d.inspectionLoad} unit="%" label="reviewed" size={96} />
            <div className="flex-1 space-y-3">{d.status.slice(0, 3).map(s => <Bars key={s.label} {...s} />)}</div>
          </div>
        </Panel>
      </div>

      {/* Bottom row */}
      <div className="col-span-2 grid grid-cols-4 gap-3 min-h-0">
        <Panel title="Compliance Score">
          <div className="flex items-center justify-center h-full"><Ring value={d.compliance} unit="%" label="compliant" size={130} stroke={12} /></div>
        </Panel>
        <Panel title="Weekly Detections">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.trend} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
              <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f7bff" stopOpacity=".55" /><stop offset="1" stopColor="#2f7bff" stopOpacity="0" /></linearGradient></defs>
              <CartesianGrid stroke="#16213a" vertical={false} />
              <XAxis dataKey="d" {...axis} /><YAxis {...axis} /><Tooltip {...tip} />
              <Area type="monotone" dataKey="v" stroke="#38bdf8" strokeWidth={2} fill="url(#ar)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Enforcement Status">
          <div className="space-y-3.5 pt-1">{d.status.map(s => <Bars key={s.label} {...s} />)}</div>
        </Panel>
        <Panel title="Resolved vs. New">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d.trend} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
              <defs><linearGradient id="ar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2dd4a0" stopOpacity=".4" /><stop offset="1" stopColor="#2dd4a0" stopOpacity="0" /></linearGradient></defs>
              <CartesianGrid stroke="#16213a" vertical={false} />
              <XAxis dataKey="d" {...axis} /><YAxis {...axis} /><Tooltip {...tip} />
              <Area type="monotone" dataKey="v" stroke="#38bdf8" strokeWidth={2} fill="transparent" />
              <Area type="monotone" dataKey="w" stroke="#2dd4a0" strokeWidth={2} fill="url(#ar2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
