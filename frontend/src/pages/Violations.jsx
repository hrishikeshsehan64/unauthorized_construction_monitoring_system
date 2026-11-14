import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../data/api';
import { SEV } from '../components/MapView';

export default function Violations() {
  const { data: all } = useApi('incidents');
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') || '').trim().toLowerCase();
  const data = q ? all.filter(i => [i.id, i.ward, i.type, i.status, i.severity].join(' ').toLowerCase().includes(q)) : all;
  return (
    <div className="panel h-full flex flex-col">
      <div className="px-5 py-4 border-b border-line flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Violations</h2><span className="flex items-center gap-3 text-xs text-mute font-mono">{q && <button onClick={() => setParams({})} className="chip bg-accent/15 text-accent2">“{params.get('q')}” ✕</button>}{data.length} records</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card text-left panel-title"><tr>
            {['ID', 'Type', 'Ward', 'Severity', 'Status', 'Match', 'Detected'].map(h => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-mute">No violations match your search.</td></tr>}
            {data.map(i => (
              <tr key={i.id} className="border-t border-line hover:bg-white/[.03]">
                <td className="px-5 py-3 font-mono text-accent2">{i.id}</td>
                <td className="px-5 py-3">{i.type}</td>
                <td className="px-5 py-3 text-mute">{i.ward}</td>
                <td className="px-5 py-3"><span className="chip" style={{ color: SEV[i.severity], background: SEV[i.severity] + '1a' }}>{i.severity}</span></td>
                <td className="px-5 py-3 text-mute">{i.status}</td>
                <td className="px-5 py-3 font-mono">{i.confidence}%</td>
                <td className="px-5 py-3 text-mute">{i.detected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
