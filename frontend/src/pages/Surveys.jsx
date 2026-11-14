import React, { useState, useMemo } from 'react';
import { useUSMS } from '../context/USMSContext';
import { Radar, Plus, Trash, Edit, Alert, Check, X, Clock, Calendar } from '../components/Icons';

export default function Surveys() {
  const { surveys, sites, addSurvey, updateSurvey, deleteSurvey, addReport } = useUSMS();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [reportModalSurvey, setReportModalSurvey] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    site_id: '',
    survey_date: new Date().toISOString().slice(0, 16),
    survey_status: 'PENDING',
    remarks: '',
  });

  const [reportForm, setReportForm] = useState({
    description: '',
    status: 'PENDING',
  });

  const [saving, setSaving] = useState(false);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const matchStatus = statusFilter === 'ALL' || s.survey_status === statusFilter;
      const matchSite = selectedSiteFilter === 'ALL' || String(s.site_id) === String(selectedSiteFilter);
      return matchStatus && matchSite;
    });
  }, [surveys, statusFilter, selectedSiteFilter]);

  const handleOpenSchedule = () => {
    setFormData({
      site_id: sites[0]?.site_id || '',
      survey_date: new Date().toISOString().slice(0, 16),
      survey_status: 'PENDING',
      remarks: '',
    });
    setIsScheduleOpen(true);
  };

  const handleOpenEdit = (survey) => {
    setEditingSurvey(survey);
    setFormData({
      site_id: survey.site_id,
      survey_date: survey.survey_date ? new Date(survey.survey_date).toISOString().slice(0, 16) : '',
      survey_status: survey.survey_status,
      remarks: survey.remarks || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.site_id) return;
    setSaving(true);

    if (editingSurvey) {
      await updateSurvey(editingSurvey.survey_id, {
        survey_status: formData.survey_status,
        remarks: formData.remarks,
        survey_date: formData.survey_date,
      });
      setEditingSurvey(null);
    } else {
      await addSurvey(formData);
      setIsScheduleOpen(false);
    }
    setSaving(false);
  };

  const handleQuickStatusChange = async (survey, newStatus) => {
    await updateSurvey(survey.survey_id, { survey_status: newStatus });
  };

  const handleSubmitReportFromSurvey = async (e) => {
    e.preventDefault();
    if (!reportModalSurvey || !reportForm.description.trim()) return;

    setSaving(true);
    await addReport({
      site_id: reportModalSurvey.site_id,
      survey_id: reportModalSurvey.survey_id,
      description: reportForm.description,
      status: reportForm.status,
      report_date: new Date().toISOString(),
    });
    setSaving(false);
    setReportModalSurvey(null);
    setReportForm({ description: '', status: 'PENDING' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-ok/10 text-ok border-ok/25';
      case 'CANCELLED':
        return 'bg-mute/10 text-mute border-line';
      case 'PENDING':
      default:
        return 'bg-warn/10 text-warn border-warn/25';
    }
  };

  return (
    <div className="panel h-full flex flex-col overflow-hidden bg-card">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-surface/50">
        <div>
          <h2 className="text-base font-semibold text-ink flex items-center gap-2">
            <Radar width={16} height={16} className="text-accent" />
            Drone Aerial Surveillance
          </h2>
          <p className="text-xs text-mute mt-0.5">
            Mission logs, aerial photogrammetry & change detection sweeps
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Site Filter */}
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="h-8 px-2.5 text-xs rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Sites ({sites.length})</option>
            {sites.map((s) => (
              <option key={s.site_id} value={s.site_id}>
                #{s.site_id} {s.site_name}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex rounded bg-bg p-0.5 border border-line text-xs">
            {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  statusFilter === st
                    ? 'bg-card text-ink shadow-sm'
                    : 'text-mute hover:text-ink'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-accent hover:bg-accent/90 text-white transition shadow-sm"
          >
            <Plus width={13} height={13} />
            Schedule Survey
          </button>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-card z-10 border-b border-line text-mute uppercase font-mono text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3 font-semibold">Survey ID</th>
              <th className="px-5 py-3 font-semibold">Target Site</th>
              <th className="px-5 py-3 font-semibold">Date & Time</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Mission Findings / Remarks</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {filteredSurveys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-mute">
                  No drone surveys match the current filter.
                </td>
              </tr>
            ) : (
              filteredSurveys.map((survey) => (
                <tr key={survey.survey_id} className="hover:bg-white/[0.02] transition">
                  <td className="px-5 py-3 font-mono font-bold text-accent2">
                    SURV-#{survey.survey_id}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">
                      {survey.site?.site_name || `Site #${survey.site_id}`}
                    </div>
                    <div className="text-[11px] text-mute truncate max-w-xs">
                      {survey.site?.address}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-mute whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar width={11} height={11} />
                      {new Date(survey.survey_date).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-mute/70 mt-0.5">
                      {new Date(survey.survey_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="inline-flex items-center gap-1.5">
                      <span
                        className={`chip border font-mono ${getStatusBadge(
                          survey.survey_status
                        )}`}
                      >
                        {survey.survey_status}
                      </span>
                      {/* Inline quick switcher */}
                      <select
                        value={survey.survey_status}
                        onChange={(e) =>
                          handleQuickStatusChange(survey, e.target.value)
                        }
                        className="bg-transparent text-[10px] text-mute hover:text-ink cursor-pointer focus:outline-none"
                        title="Quick status change"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink max-w-sm">
                    {survey.remarks ? (
                      <p className="line-clamp-2 leading-relaxed">{survey.remarks}</p>
                    ) : (
                      <span className="text-mute/60 italic">No notes recorded</span>
                    )}
                    {survey.reportsCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-crit font-medium mt-1">
                        <Alert width={10} height={10} />
                        Triggered {survey.reportsCount} report(s)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setReportModalSurvey(survey);
                          setReportForm({
                            description: survey.remarks
                              ? `Flagged from Drone Survey #${survey.survey_id}: ${survey.remarks}`
                              : '',
                            status: 'PENDING',
                          });
                        }}
                        className="px-2 py-1 rounded bg-crit/10 hover:bg-crit/20 text-crit text-[11px] font-medium transition"
                        title="Flag Violation from this Drone Survey"
                      >
                        + Report
                      </button>
                      <button
                        onClick={() => handleOpenEdit(survey)}
                        className="p-1 rounded text-mute hover:text-ink hover:bg-white/5 transition"
                        title="Edit remarks"
                      >
                        <Edit width={13} height={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete Drone Survey #${survey.survey_id}?`
                            )
                          ) {
                            deleteSurvey(survey.survey_id);
                          }
                        }}
                        className="p-1 rounded text-mute hover:text-crit hover:bg-crit/10 transition"
                        title="Delete survey"
                      >
                        <Trash width={13} height={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SCHEDULE / EDIT MODAL */}
      {(isScheduleOpen || editingSurvey) && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-card border border-line shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Radar width={15} height={15} className="text-accent" />
                {editingSurvey
                  ? `Edit Survey #${editingSurvey.survey_id}`
                  : 'Schedule Drone Survey'}
              </h3>
              <button
                onClick={() => {
                  setIsScheduleOpen(false);
                  setEditingSurvey(null);
                }}
                className="text-mute hover:text-ink"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-mute font-medium mb-1">
                  Target Construction Site <span className="text-crit">*</span>
                </label>
                <select
                  disabled={Boolean(editingSurvey)}
                  required
                  value={formData.site_id}
                  onChange={(e) =>
                    setFormData({ ...formData, site_id: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent disabled:opacity-50"
                >
                  <option value="">Select target site...</option>
                  {sites.map((s) => (
                    <option key={s.site_id} value={s.site_id}>
                      #{s.site_id} {s.site_name} ({s.address})
                    </option>
                  ))}
                </select>
                {editingSurvey && (
                  <p className="text-[10px] text-mute mt-1">
                    *Changing the site of an existing survey is not permitted by backend policy.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mute font-medium mb-1">
                    Flight Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.survey_date}
                    onChange={(e) =>
                      setFormData({ ...formData, survey_date: e.target.value })
                    }
                    className="w-full h-8 px-2 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-mute font-medium mb-1">Status</label>
                  <select
                    value={formData.survey_status}
                    onChange={(e) =>
                      setFormData({ ...formData, survey_status: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-mute font-medium mb-1">
                  Mission Remarks & Sensor Findings
                </label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  placeholder="e.g. Completed orthomosaic flight; detected 4th level floor slab without sanctioned permit..."
                  className="w-full p-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduleOpen(false);
                    setEditingSurvey(null);
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
                  {saving ? 'Saving...' : editingSurvey ? 'Update Survey' : 'Schedule Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT FROM SURVEY MODAL */}
      {reportModalSurvey && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-card border border-line shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Alert width={15} height={15} className="text-crit" />
                File Report from Survey #{reportModalSurvey.survey_id}
              </h3>
              <button
                onClick={() => setReportModalSurvey(null)}
                className="text-mute hover:text-ink"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="mt-2 text-xs text-mute">
              Target Site:{' '}
              <strong className="text-ink">
                {reportModalSurvey.site?.site_name}
              </strong>{' '}
              (#{reportModalSurvey.site_id})
            </div>

            <form onSubmit={handleSubmitReportFromSurvey} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-mute font-medium mb-1">
                  Violation Description <span className="text-crit">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-mute font-medium mb-1">Initial Status</label>
                <select
                  value={reportForm.status}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, status: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setReportModalSurvey(null)}
                  className="px-3 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-mute hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-crit hover:bg-crit/90 text-white font-semibold"
                >
                  {saving ? 'Filing...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
