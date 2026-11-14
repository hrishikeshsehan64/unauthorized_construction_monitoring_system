import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUSMS } from '../context/USMSContext';
import { Building, Plus, Trash, Edit, Search, MapPin, Radar, Alert, X } from '../components/Icons';

export default function Sites() {
  const { sites, addSite, updateSite, deleteSite, addSurvey, addReport } = useUSMS();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();

  const searchQuery = (params.get('search') || '').trim().toLowerCase();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [surveyModalSite, setSurveyModalSite] = useState(null);
  const [reportModalSite, setReportModalSite] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    site_name: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [surveyData, setSurveyData] = useState({
    remarks: '',
    survey_status: 'PENDING',
  });

  const [reportData, setReportData] = useState({
    description: '',
    status: 'PENDING',
  });

  const [saving, setSaving] = useState(false);

  const filteredSites = sites.filter((s) => {
    if (!searchQuery) return true;
    return (
      s.site_name.toLowerCase().includes(searchQuery) ||
      s.address.toLowerCase().includes(searchQuery) ||
      String(s.site_id).includes(searchQuery)
    );
  });

  // Open Create
  const handleOpenCreate = () => {
    setFormData({
      site_name: '',
      address: '',
      latitude: '',
      longitude: '',
    });
    setIsCreateOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (site) => {
    setEditingSite(site);
    setFormData({
      site_name: site.site_name,
      address: site.address,
      latitude: site.latitude,
      longitude: site.longitude,
    });
  };

  // Submit Site Form
  const handleSubmitSite = async (e) => {
    e.preventDefault();
    if (!formData.site_name.trim() || !formData.address.trim()) return;

    setSaving(true);
    if (editingSite) {
      await updateSite(editingSite.site_id, formData);
      setEditingSite(null);
    } else {
      await addSite(formData);
      setIsCreateOpen(false);
    }
    setSaving(false);
  };

  // Quick Survey Submission
  const handleSubmitSurvey = async (e) => {
    e.preventDefault();
    if (!surveyModalSite) return;
    setSaving(true);
    await addSurvey({
      site_id: surveyModalSite.site_id,
      remarks: surveyData.remarks,
      survey_status: surveyData.survey_status,
      survey_date: new Date().toISOString(),
    });
    setSaving(false);
    setSurveyModalSite(null);
    setSurveyData({ remarks: '', survey_status: 'PENDING' });
  };

  // Quick Report Submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportModalSite || !reportData.description.trim()) return;
    setSaving(true);
    await addReport({
      site_id: reportModalSite.site_id,
      description: reportData.description,
      status: reportData.status,
      report_date: new Date().toISOString(),
    });
    setSaving(false);
    setReportModalSite(null);
    setReportData({ description: '', status: 'PENDING' });
  };

  // Preset Pune Coordinates helper
  const setSampleCoords = () => {
    const randomOffsetLat = (Math.random() - 0.5) * 0.08;
    const randomOffsetLng = (Math.random() - 0.5) * 0.08;
    setFormData((prev) => ({
      ...prev,
      latitude: (18.5204 + randomOffsetLat).toFixed(4),
      longitude: (73.8567 + randomOffsetLng).toFixed(4),
    }));
  };

  return (
    <div className="panel h-full flex flex-col overflow-hidden bg-card">
      {/* Top Action Header */}
      <div className="px-5 py-3.5 border-b border-line flex flex-wrap items-center justify-between gap-3 bg-surface/50">
        <div>
          <h2 className="text-base font-semibold text-ink flex items-center gap-2">
            <Building width={16} height={16} className="text-accent2" />
            Monitored Construction Sites
          </h2>
          <p className="text-xs text-mute mt-0.5">
            Registered sites undergoing satellite and drone surveillance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              width={13}
              height={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mute"
            />
            <input
              value={searchQuery}
              onChange={(e) => {
                if (e.target.value) {
                  setParams({ search: e.target.value });
                } else {
                  setParams({});
                }
              }}
              placeholder="Filter sites..."
              className="h-8 pl-8 pr-3 text-xs rounded bg-bg border border-line text-ink placeholder:text-mute/60 focus:outline-none focus:border-accent w-48 sm:w-60"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-accent hover:bg-accent/90 text-white transition shadow-sm"
          >
            <Plus width={13} height={13} />
            Register Site
          </button>
        </div>
      </div>

      {/* Sites Table / List */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-card z-10 border-b border-line text-mute uppercase font-mono text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">Site Name</th>
              <th className="px-5 py-3 font-semibold">Address</th>
              <th className="px-5 py-3 font-semibold">Coordinates</th>
              <th className="px-5 py-3 font-semibold">Surveillance</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {filteredSites.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-mute">
                  No construction sites match your query.
                </td>
              </tr>
            ) : (
              filteredSites.map((site) => (
                <tr key={site.site_id} className="hover:bg-white/[0.02] transition">
                  <td className="px-5 py-3 font-mono font-bold text-accent2">
                    #{site.site_id}
                  </td>
                  <td className="px-5 py-3 font-medium text-ink">
                    {site.site_name}
                  </td>
                  <td className="px-5 py-3 text-mute max-w-xs truncate" title={site.address}>
                    {site.address}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-mute">
                    <button
                      onClick={() => nav(`/map?site=${site.site_id}`)}
                      className="inline-flex items-center gap-1 hover:text-accent2 transition"
                      title="Inspect on Live Map"
                    >
                      <MapPin width={11} height={11} className="text-accent2" />
                      {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="chip bg-white/[0.05] text-mute"
                        title={`${site.surveysCount} Drone surveys`}
                      >
                        <Radar width={10} height={10} />
                        {site.surveysCount} surveys
                      </span>
                      {site.reportsCount > 0 && (
                        <span
                          className="chip bg-crit/15 text-crit"
                          title={`${site.reportsCount} Violations reported`}
                        >
                          <Alert width={10} height={10} />
                          {site.reportsCount} violations
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {site.hasViolations ? (
                      <span className="chip bg-crit/10 text-crit border border-crit/20">
                        Under Flag
                      </span>
                    ) : (
                      <span className="chip bg-ok/10 text-ok border border-ok/20">
                        Compliant
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setSurveyModalSite(site)}
                        className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-accent2 text-[11px] font-medium transition"
                        title="Schedule Aerial Drone Survey"
                      >
                        + Survey
                      </button>
                      <button
                        onClick={() => setReportModalSite(site)}
                        className="px-2 py-1 rounded bg-crit/10 hover:bg-crit/20 text-crit text-[11px] font-medium transition"
                        title="File Violation Report"
                      >
                        + Report
                      </button>
                      <button
                        onClick={() => handleOpenEdit(site)}
                        className="p-1 rounded text-mute hover:text-ink hover:bg-white/5 transition"
                        title="Edit site details"
                      >
                        <Edit width={13} height={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete site #${site.site_id} (${site.site_name})?`
                            )
                          ) {
                            deleteSite(site.site_id);
                          }
                        }}
                        className="p-1 rounded text-mute hover:text-crit hover:bg-crit/10 transition"
                        title="Delete site"
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

      {/* CREATE / EDIT SITE MODAL */}
      {(isCreateOpen || editingSite) && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-card border border-line shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink">
                {editingSite ? `Edit Site #${editingSite.site_id}` : 'Register New Construction Site'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingSite(null);
                }}
                className="text-mute hover:text-ink"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitSite} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-mute font-medium mb-1">
                  Site Name <span className="text-crit">*</span>
                </label>
                <input
                  required
                  value={formData.site_name}
                  onChange={(e) =>
                    setFormData({ ...formData, site_name: e.target.value })
                  }
                  placeholder="e.g. Apex High-Rise Tower"
                  className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-mute font-medium mb-1">
                  Address / Location <span className="text-crit">*</span>
                </label>
                <input
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g. Plot 15, Viman Nagar, Pune"
                  className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mute font-medium mb-1">
                    Latitude (-90 to 90) <span className="text-crit">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    placeholder="18.5204"
                    className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink font-mono focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-mute font-medium mb-1">
                    Longitude (-180 to 180) <span className="text-crit">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    placeholder="73.8567"
                    className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={setSampleCoords}
                  className="text-[11px] text-accent2 hover:underline"
                >
                  ⚡ Use sample coordinates
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingSite(null);
                  }}
                  className="px-3 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-mute hover:text-ink font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-accent hover:bg-accent/90 text-white font-semibold transition"
                >
                  {saving ? 'Saving...' : editingSite ? 'Update Site' : 'Register Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK SURVEY MODAL */}
      {surveyModalSite && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-card border border-line shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Radar width={15} height={15} className="text-accent2" />
                Schedule Drone Survey
              </h3>
              <button
                onClick={() => setSurveyModalSite(null)}
                className="text-mute hover:text-ink"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="mt-2 text-xs text-mute">
              Target Site: <strong className="text-ink">{surveyModalSite.site_name}</strong> (#{surveyModalSite.site_id})
            </div>

            <form onSubmit={handleSubmitSurvey} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-mute font-medium mb-1">
                  Survey Initial Status
                </label>
                <select
                  value={surveyData.survey_status}
                  onChange={(e) =>
                    setSurveyData({ ...surveyData, survey_status: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                >
                  <option value="PENDING">PENDING (Scheduled)</option>
                  <option value="COMPLETED">COMPLETED (Captured)</option>
                </select>
              </div>

              <div>
                <label className="block text-mute font-medium mb-1">
                  Flight Remarks / Mission Notes
                </label>
                <textarea
                  rows={3}
                  value={surveyData.remarks}
                  onChange={(e) =>
                    setSurveyData({ ...surveyData, remarks: e.target.value })
                  }
                  placeholder="e.g. Orthomosaic sweep of top floor slab elevation..."
                  className="w-full p-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setSurveyModalSite(null)}
                  className="px-3 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-mute hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-accent hover:bg-accent/90 text-white font-semibold"
                >
                  {saving ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK REPORT MODAL */}
      {reportModalSite && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="panel max-w-md w-full bg-card border border-line shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Alert width={15} height={15} className="text-crit" />
                File Unauthorized Construction Report
              </h3>
              <button
                onClick={() => setReportModalSite(null)}
                className="text-mute hover:text-ink"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="mt-2 text-xs text-mute">
              Target Site: <strong className="text-ink">{reportModalSite.site_name}</strong> (#{reportModalSite.site_id})
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-mute font-medium mb-1">
                  Violation Description <span className="text-crit">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportData.description}
                  onChange={(e) =>
                    setReportData({ ...reportData, description: e.target.value })
                  }
                  placeholder="Describe detected unauthorized construction, setback violation, extra floor, or zoning deviation..."
                  className="w-full p-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-mute font-medium mb-1">
                  Initial Status
                </label>
                <select
                  value={reportData.status}
                  onChange={(e) =>
                    setReportData({ ...reportData, status: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded bg-bg border border-line text-ink focus:outline-none focus:border-accent"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setReportModalSite(null)}
                  className="px-3 py-1.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-mute hover:text-ink font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-crit hover:bg-crit/90 text-white font-semibold"
                >
                  {saving ? 'Logging...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
