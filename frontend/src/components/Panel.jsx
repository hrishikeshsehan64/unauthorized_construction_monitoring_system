import React from 'react';
import { Plus } from './Icons';

export default function Panel({ title, right, children, className = '' }) {
  return (
    <section className={`panel flex flex-col min-h-0 ${className}`}>
      <header className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="panel-title">{title}</h3>
        {right ?? <Plus width={13} height={13} className="text-mute" />}
      </header>
      <div className="flex-1 min-h-0 px-4 pb-3">{children}</div>
    </section>
  );
}
