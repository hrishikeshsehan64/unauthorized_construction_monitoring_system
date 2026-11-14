import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUSMS } from '../context/USMSContext';
import { Shield, Plus, Trash, Edit, Alert, Building, Radar, X, Calendar, Clock } from '../components/Icons';

export default function Investigations() {
  const {
    investigations,
    reports,
    addInvestigation,
    updateInvestigation,
    deleteInvestigation,
  } = useUSMS();

  const nav = useNavigate();
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInv, setEditingInv] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    report_id: '',
    investigation_date: new Date().toISOString().slice(0, 16),
    investigation_notes: '',
    investigation_status: 'IN_PROGRESS',
  });

  const [saving, setSaving] = useState(false);

  // Reports that don't have an investigation yet (enforcing 1-to-1 unique relation)
  const unassignedReports = useMemo(() => {
    const assignedIds = new Set(investigations.map((i) => i.report_id));
    return reports.filter((r) => !assignedIds.has(r.report_id));
  }, [reports, investigations]);

  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv) => {
      if (statusFilter === 'ALL') return true;
      return inv.investigation_status === statusFilter;
    });
  }, [investigations, statusFilter]);

  const handleOpenCreate = () => {
    setFormData({
      report_id: unassignedReports[0]?.report_id || '',
      investigation_date: new Date().toISOString().slice(0, 16),
      investigation_notes: '',
      investigation_status: 'IN_PROGRESS',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingInv(inv);
    setFormData({
      report_id: inv.report_id,
      investigation_date: inv.investigation_date
        ? new Date(inv.investigation_date).toISOString().slice(0, 16)
        : '',
      investigation_notes: inv.investigation_notes || '',
      investigation_status: inv.investigation_status,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.report_id) return;
    setSaving(true);

    if (editingInv) {
      await updateInvestigation(editingInv.investigation_id, {
        investigation_date: formData.investigation_date,
        investigation_notes: formData.investigation_notes,
        investigation_status: formData.investigation_status,
      });
      setEditingInv(null);
    } else {
      await addInvestigation(formData);
      setIsCreateOpen(false);
    }
    setSaving(false);
  };

  const handleStatusChange = async (inv, newStatus) => {
    await updateInvestigation(inv.investigation_id, {
      investigation_status: newStatus,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-ok/15 text-ok border-ok/30';
      case 'IN_PROGRESS':
        return 'bg-accent/15 text-accent2 border-accent/30';
      case 'NOT_STARTED':
      default:
        return 'bg-mute/15 text-mute border-line';
    }
  };

  return (
    <div className="panel h-full flex flex-col overflow-hidden bg-card">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-surface/50">
        <div>
          <h2 className="text-base font-semibold text-ink flex items-center gap-2">
            <Shield width={16} height={16} className="text-accent2" />
            Enforcement & Investigations
          </h2>
          <p className="text-xs text-mute mt-0.5">
            On-site physical verifications, legal notices, and compliance orders
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Tabs */}
          <div className="flex rounded bg-bg p-0.5 border border-line text-xs">
            {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded font-medium transition text-[11px] ${
                  statusFilter === st
                    ? 'bg-card text-ink shadow-sm'
                    : 'text-mute hover:text-ink'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenCreate}
            disabled={unassignedReports.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-accent hover:bg-accent/90 disabled:opacity-50 text-white transition shadow-sm"
            title={
              unassignedReports.length === 0
                ? 'All reports currently have an investigation assigned'
                : 'Open new investigation'
            }
          >
            <Plus width={13} height={13} />
            Open Investigation
          </button>
        </div>
      </div>

      {/* Grid of Investigation Cards */}
      <div className="flex-1 overflow-auto p-4">
        {filteredInvestigations.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-mute text-xs">
            <Shield width={28} height={28} className="text-line mb-2" />
            No investigations match this filter.
          </div>
        ) : (
          <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(330px,1fr))]">
            {filteredInvestigations.map((inv) => {
              const report = inv.report;
              return (
                <article
                  key={inv.investigation_id}
                  className="panel p-4 flex flex-col justify-between hover:border-line/90 transition bg-surface/40"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-line">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-accent2">
                            INV-#{inv.investigation_id}
                          </span>
                          {report && (
                            <span className="chip bg-white/[0.04] text-mute font-mono text-[9px]">
                              REP-#{report.report_id}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-ink mt-1">
                          {report?.site?.site_name || 'Associated Construction Site'}
                        </h4>
                        <p className="text-[11px] text-mute truncate max-w-[240px]">
                          {report?.site?.address}
                        </p>
                      </div>

                      {/* Status badge with switcher */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`chip border font-mono text-[10px] ${getStatusBadge(
                            inv.investigation_status
                          )}`}
                        >
                          {inv.investigation_status.replace('_', ' ')}
                        </span>
                        <select
                          value={inv.investigation_status}
                          onChange={(e) => handleStatusChange(inv, e.target.value)}
                          className="bg-transparent text-[10px] text-mute hover:text-ink cursor-pointer focus:outline-none"
                        >
                          <option value="NOT_STARTED">NOT STARTED</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>
                    </div>

                    {/* Report Description */}
                    {report && (
                      <div className="mt-3 p-2 rounded bg-black/20 text-xs border border-line/40">
                        <span className="text-[10px] text-mute font-semibold uppercase tracking-wider block mb-0.5">
                          Alleged Violation:
                        </span>
                        <p className="text-ink text-[11px] leading-relaxed line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    )}

                    {/* Investigation Notes */}
                    <div className="mt-3 text-xs">
                      <span className="text-[10px] text-mute font-semibold uppercase tracking-wider block mb-1">
                        Investigation Notes & Findings:
                      </span>
                      <p className="text-mute text-xs leading-relaxed italic bg-white/[0.02] p-2 rounded border border-line/40 line-clamp-3">
                        {inv.investigation_notes || 'No case findings logged yet.'}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-2.5 border-t border-line flex items-center justify-between text-[11px] text-mute">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar width={11} height={11} />
                      {inv.investigation_date
                        ? new Date(inv.investigation_date).toLocaleDateString()
                        : 'Unscheduled'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(inv)}
                        className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-ink font-medium transition"
                      >
                        Edit Notes
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete Investigation #${inv.investigation_id}?`
                            )
                          ) {
                            deleteInvestigation(inv.investigation_id);
                          }
                        }}
                        className="p-1 rounded text-mute hover:text-crit hover:bg-crit/10 transition"
                        title="Delete investigation"
                      >
                        <Trash width={12} height={12} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {(isCreateOpen || editingInv) && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-card border border-line shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Shield width={15} height={15} className="text-accent2" />
                {editingInv
                  ? `Edit Investigation #${editingInv.investigation_id}`
                  : 'Open Formal Investigation'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingInv(null);
                }}
                className="text-mute hover:text-ink"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-mute font-medium mb-1">
                  Violation Report <span className="text-crit">*</span>
                </label>
                {editingInv ? (
                  <div className="p-2 rounded bg-surface border border-line text-ink">
                    Report #{editingInv.report_id} -{' '}
                    {editingInv.report?.description?.slice(0, 60)}...
                  </div>
                ) : (
                  <select
                    required
                    value={formData.report_id}
                    onChange={(e) =>
                      setFormData({ ...formData, report_id: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="">Select report to investigate...</option>
                    {unassignedReports.map((r) => (
                      <option key={r.report_id} value={r.report_id}>
                        REP-#{r.report_id} ({r.site?.site_name}):{' '}
                        {r.description.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mute font-medium mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.investigation_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        investigation_date: e.target.value,
                      })
                    }
                    className="w-full h-8 px-2 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-mute font-medium mb-1">Status</label>
                  <select
                    value={formData.investigation_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        investigation_status: e.target.value,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="NOT_STARTED">NOT STARTED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-mute font-medium mb-1">
                  Investigation Findings & Directives
                </label>
                <textarea
                  rows={4}
                  value={formData.investigation_notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      investigation_notes: e.target.value,
                    })
                  }
                  placeholder="Record physical inspection observations, structural deviations, notices served, or hearing outcomes..."
                  className="w-full p-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingInv(null);
                  }}
                  className="px-3 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-mute hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-accent hover:bg-accent/90 text-white font-semibold"
                >
                  {saving
                    ? 'Saving...'
                    : editingInv
                    ? 'Update Investigation'
                    : 'Open Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
