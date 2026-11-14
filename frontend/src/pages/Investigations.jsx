import React from 'react';
import { useApi } from '../data/api';
import { SEV } from '../components/MapView';

export default function Investigations() {
  const { data } = useApi('investigations');
  return (
    <div className="h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Active Investigations</h2>
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {data.map(i => (
          <article key={i.id} className="panel p-4 hover:border-accent/60 transition">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-accent2">{i.id}</span>
              <span className="chip" style={{ color: SEV[i.severity], background: SEV[i.severity] + '1a' }}>{i.severity}</span>
            </div>
            <p className="mt-2 text-sm">{i.type}</p>
            <p className="text-xs text-mute">{i.ward} · {i.status}</p>
            <div className="mt-4 pt-3 border-t border-line flex justify-between text-xs text-mute">
              <span>Officer: <b className="text-ink font-medium">{i.officer}</b></span><span>Due {i.due}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
