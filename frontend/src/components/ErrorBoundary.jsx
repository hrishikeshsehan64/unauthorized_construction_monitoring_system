import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="panel p-6 m-3 text-sm">
        <div className="text-crit font-semibold mb-2">Something went wrong rendering this page</div>
        <pre className="text-mute whitespace-pre-wrap font-mono text-xs">{String(this.state.err?.stack || this.state.err)}</pre>
      </div>
    );
  }
}
