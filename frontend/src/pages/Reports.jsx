import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUSMS } from '../context/USMSContext';
import { Alert, Plus, Trash, Edit, Search, Shield, Radar, Building, X, Calendar } from '../components/Icons';

export default function Reports() {
  const {
    reports,
    sites,
    surveys,
    investigations,
    addReport,
    updateReport,
    deleteReport,
    addInvestigation,
  } = useUSMS();

  const [params, setParams] = useSearchParams();
  const nav = useNavigate();

  const searchParam = (params.get('q') || '').trim().toLowerCase();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [siteFilter, setSiteFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [investigateReport, setInvestigateReport] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    site_id: '',
    survey_id: '',
    description: '',
    status: 'PENDING',
    report_date: new Date().toISOString().slice(0, 16),
  });

  const [invFormData, setInvFormData] = useState({
    investigation_date: new Date().toISOString().slice(0, 16),
    investigation_notes: '',
    investigation_status: 'IN_PROGRESS',
  });

  const [saving, setSaving] = useState(false);

  // Available surveys for currently selected site in the modal
  const availableSurveys = useMemo(() => {
    if (!formData.site_id) return [];
    return surveys.filter((s) => String(s.site_id) === String(formData.site_id));
  }, [surveys, formData.site_id]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchSite = siteFilter === 'ALL' || String(r.site_id) === String(siteFilter);

      const matchSearch =
        !searchParam ||
        r.description.toLowerCase().includes(searchParam) ||
        r.site?.site_name?.toLowerCase().includes(searchParam) ||
        r.site?.address?.toLowerCase().includes(searchParam) ||
        String(r.report_id).includes(searchParam);

      return matchStatus && matchSite && matchSearch;
    });
  }, [reports, statusFilter, siteFilter, searchParam]);

  const handleOpenCreate = () => {
    const defaultSite = sites[0]?.site_id || '';
    setFormData({
      site_id: defaultSite,
      survey_id: '',
      description: '',
      status: 'PENDING',
      report_date: new Date().toISOString().slice(0, 16),
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (report) => {
    setEditingReport(report);
    setFormData({
      site_id: report.site_id,
      survey_id: report.survey_id || '',
      description: report.description,
      status: report.status,
      report_date: report.report_date
        ? new Date(report.report_date).toISOString().slice(0, 16)
        : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.site_id || !formData.description.trim()) return;

    setSaving(true);
    if (editingReport) {
      await updateReport(editingReport.report_id, {
        site_id: formData.site_id,
        survey_id: formData.survey_id || null,
        description: formData.description,
        status: formData.status,
        report_date: formData.report_date,
      });
      setEditingReport(null);
    } else {
      await addReport(formData);
      setIsCreateOpen(false);
    }
    setSaving(false);
  };

  const handleStatusChange = async (report, newStatus) => {
    await updateReport(report.report_id, { status: newStatus });
  };

  const handleLaunchInvestigation = async (e) => {
    e.preventDefault();
    if (!investigateReport) return;

    setSaving(true);
    await addInvestigation({
      report_id: investigateReport.report_id,
      investigation_date: invFormData.investigation_date,
      investigation_notes: invFormData.investigation_notes,
      investigation_status: invFormData.investigation_status,
    });
    setSaving(false);
    setInvestigateReport(null);
    nav('/investigations');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-crit/15 text-crit border-crit/30';
      case 'UNDER_INVESTIGATION':
        return 'bg-accent2/15 text-accent2 border-accent2/30';
      case 'REJECTED':
        return 'bg-mute/15 text-mute border-line';
      case 'PENDING':
      default:
        return 'bg-warn/15 text-warn border-warn/30';
    }
  };

  return (
    <div className="panel h-full flex flex-col overflow-hidden bg-card">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-surface/50">
        <div>
          <h2 className="text-base font-semibold text-ink flex items-center gap-2">
            <Alert width={16} height={16} className="text-crit" />
            Unauthorized Construction Reports
          </h2>
          <p className="text-xs text-mute mt-0.5">
            Reported violations, zoning deviations, and unpermitted building activity
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              width={13}
              height={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mute"
            />
            <input
              value={searchParam}
              onChange={(e) => {
                if (e.target.value) setParams({ q: e.target.value });
                else setParams({});
              }}
              placeholder="Search reports..."
              className="h-8 pl-8 pr-3 text-xs rounded bg-bg border border-line text-ink placeholder:text-mute/60 focus:outline-none focus:border-accent w-40 sm:w-52"
            />
          </div>

          {/* Site Filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="h-8 px-2 text-xs rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Sites</option>
            {sites.map((s) => (
              <option key={s.site_id} value={s.site_id}>
                #{s.site_id} {s.site_name}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex rounded bg-bg p-0.5 border border-line text-xs">
            {['ALL', 'PENDING', 'UNDER_INVESTIGATION', 'VERIFIED', 'REJECTED'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded font-medium transition text-[11px] ${
                    statusFilter === st
                      ? 'bg-card text-ink shadow-sm'
                      : 'text-mute hover:text-ink'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              )
            )}
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-crit hover:bg-crit/90 text-white transition shadow-sm"
          >
            <Plus width={13} height={13} />
            File Report
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-card z-10 border-b border-line text-mute uppercase font-mono text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3 font-semibold">Report ID</th>
              <th className="px-5 py-3 font-semibold">Target Site</th>
              <th className="px-5 py-3 font-semibold">Violation Description</th>
              <th className="px-5 py-3 font-semibold">Drone Survey</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Investigation</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-mute">
                  No reports match the current filters.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const linkedInv = report.investigation;
                return (
                  <tr key={report.report_id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3 font-mono font-bold text-accent2 whitespace-nowrap">
                      REP-#{report.report_id}
                    </td>

                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">
                        {report.site?.site_name || `Site #${report.site_id}`}
                      </div>
                      <div className="text-[11px] text-mute truncate max-w-xs">
                        {report.site?.address}
                      </div>
                    </td>

                    <td className="px-5 py-3 text-ink max-w-sm">
                      <p className="line-clamp-2 leading-relaxed font-normal">
                        {report.description}
                      </p>
                      <div className="text-[10px] text-mute/80 mt-1 flex items-center gap-1 font-mono">
                        <Calendar width={10} height={10} />
                        {new Date(report.report_date).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap">
                      {report.survey_id ? (
                        <span className="chip bg-accent/15 text-accent2 border border-accent/25">
                          <Radar width={10} height={10} />
                          SURV-#{report.survey_id}
                        </span>
                      ) : (
                        <span className="text-mute/60 italic text-[11px]">Direct / Field</span>
                      )}
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`chip border font-mono ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status.replace('_', ' ')}
                        </span>
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report, e.target.value)}
                          className="bg-transparent text-[10px] text-mute hover:text-ink cursor-pointer focus:outline-none"
                          title="Quick update report status"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap">
                      {linkedInv ? (
                        <button
                          onClick={() => nav('/investigations')}
                          className="chip bg-surface hover:bg-white/10 text-accent2 border border-line cursor-pointer transition"
                          title="View case details in Investigations"
                        >
                          <Shield width={10} height={10} />
                          Inv #{linkedInv.investigation_id} ({linkedInv.investigation_status.replace('_', ' ')})
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setInvestigateReport(report);
                            setInvFormData({
                              investigation_date: new Date().toISOString().slice(0, 16),
                              investigation_notes: `Initial case review opened for Report #${report.report_id}: ${report.description}`,
                              investigation_status: 'IN_PROGRESS',
                            });
                          }}
                          className="px-2 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent2 text-[11px] font-medium transition"
                          title="Open formal investigation for this report"
                        >
                          + Investigate
                        </button>
                      )}
                    </td>

                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(report)}
                          className="p-1 rounded text-mute hover:text-ink hover:bg-white/5 transition"
                          title="Edit report"
                        >
                          <Edit width={13} height={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete Report #${report.report_id}? This will also delete associated investigation.`
                              )
                            ) {
                              deleteReport(report.report_id);
                            }
                          }}
                          className="p-1 rounded text-mute hover:text-crit hover:bg-crit/10 transition"
                          title="Delete report"
                        >
                          <Trash width={13} height={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT REPORT MODAL */}
      {(isCreateOpen || editingReport) && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-card border border-line shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Alert width={15} height={15} className="text-crit" />
                {editingReport
                  ? `Edit Report #${editingReport.report_id}`
                  : 'File Violation Report'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingReport(null);
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
                  required
                  value={formData.site_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      site_id: e.target.value,
                      survey_id: '', // reset survey selection if site changes
                    })
                  }
                  className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                >
                  <option value="">Select construction site...</option>
                  {sites.map((s) => (
                    <option key={s.site_id} value={s.site_id}>
                      #{s.site_id} {s.site_name} ({s.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mute font-medium mb-1">
                  Associated Drone Survey (Optional)
                </label>
                <select
                  value={formData.survey_id}
                  onChange={(e) =>
                    setFormData({ ...formData, survey_id: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                >
                  <option value="">None (Direct field detection)</option>
                  {availableSurveys.map((sv) => (
                    <option key={sv.survey_id} value={sv.survey_id}>
                      SURV-#{sv.survey_id} (
                      {new Date(sv.survey_date).toLocaleDateString()}) -{' '}
                      {sv.survey_status}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-mute mt-1">
                  *Only surveys conducted on the selected site are shown.
                </p>
              </div>

              <div>
                <label className="block text-mute font-medium mb-1">
                  Violation Description <span className="text-crit">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detail the unauthorized construction, deviation from permit, unapproved levels, or encroachment..."
                  className="w-full p-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mute font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-mute font-medium mb-1">
                    Report Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.report_date}
                    onChange={(e) =>
                      setFormData({ ...formData, report_date: e.target.value })
                    }
                    className="w-full h-8 px-2 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingReport(null);
                  }}
                  className="px-3 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-mute hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-crit hover:bg-crit/90 text-white font-semibold"
                >
                  {saving ? 'Saving...' : editingReport ? 'Update Report' : 'File Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* START INVESTIGATION MODAL */}
      {investigateReport && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-card border border-line shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Shield width={15} height={15} className="text-accent2" />
                Launch Investigation for Report #{investigateReport.report_id}
              </h3>
              <button
                onClick={() => setInvestigateReport(null)}
                className="text-mute hover:text-ink"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="mt-3 p-2.5 rounded bg-surface border border-line text-xs text-mute space-y-1">
              <div>
                Target Site:{' '}
                <strong className="text-ink">
                  {investigateReport.site?.site_name}
                </strong>
              </div>
              <div className="text-ink/90 font-medium">
                {investigateReport.description}
              </div>
            </div>

            <form onSubmit={handleLaunchInvestigation} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mute font-medium mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="datetime-local"
                    value={invFormData.investigation_date}
                    onChange={(e) =>
                      setInvFormData({
                        ...invFormData,
                        investigation_date: e.target.value,
                      })
                    }
                    className="w-full h-8 px-2 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-mute font-medium mb-1">
                    Initial Status
                  </label>
                  <select
                    value={invFormData.investigation_status}
                    onChange={(e) =>
                      setInvFormData({
                        ...invFormData,
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
                  Investigation Directives / Field Notes
                </label>
                <textarea
                  rows={3}
                  value={invFormData.investigation_notes}
                  onChange={(e) =>
                    setInvFormData({
                      ...invFormData,
                      investigation_notes: e.target.value,
                    })
                  }
                  placeholder="Directives for inspecting officer, physical survey requirements, demolition notices..."
                  className="w-full p-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setInvestigateReport(null)}
                  className="px-3 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-mute hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-accent hover:bg-accent/90 text-white font-semibold"
                >
                  {saving ? 'Opening...' : 'Launch Investigation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
