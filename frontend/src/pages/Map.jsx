import React from 'react';
import MapView from '../components/MapView';
import { useApi } from '../data/api';

export default function MapPage() {
  const { data } = useApi('incidents');
  const { data: d } = useApi('dashboard');
  return <div className="panel h-full overflow-hidden"><MapView incidents={data} center={d.center} zoom={13} /></div>;
}
