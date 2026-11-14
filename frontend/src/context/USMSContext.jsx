import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { initialSites, initialSurveys, initialReports, initialInvestigations } from '../data/initialData';

const USMSContext = createContext(null);

// Support both /api/* and direct routes via vite proxy or direct connection
const api = axios.create({
  timeout: 3000,
});

export function USMSProvider({ children }) {
  const [sites, setSites] = useState(initialSites);
  const [surveys, setSurveys] = useState(initialSurveys);
  const [reports, setReports] = useState(initialReports);
  const [investigations, setInvestigations] = useState(initialInvestigations);

  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && curr.id ? null : curr));
    }, 4000);
  }, []);

  // Fetch initial data from backend if running
  const refreshFromBackend = useCallback(async () => {
    try {
      // First check health
      const [resSites, resSurveys, resReports, resInvestigations] = await Promise.all([
        api.get('/sites').catch(() => api.get('/api/sites')),
        api.get('/surveys').catch(() => api.get('/api/surveys')),
        api.get('/reports').catch(() => api.get('/api/reports')),
        api.get('/investigations').catch(() => api.get('/api/investigations')),
      ]);

      const fetchedSites = Array.isArray(resSites.data) ? resSites.data : resSites.data?.data;
      const fetchedSurveys = Array.isArray(resSurveys.data) ? resSurveys.data : resSurveys.data?.data;
      const fetchedReports = Array.isArray(resReports.data) ? resReports.data : resReports.data?.data;
      const fetchedInvestigations = Array.isArray(resInvestigations.data) ? resInvestigations.data : resInvestigations.data?.data;

      if (Array.isArray(fetchedSites)) {
        setSites(fetchedSites.length ? fetchedSites : initialSites);
      }
      if (Array.isArray(fetchedSurveys)) {
        setSurveys(fetchedSurveys.length ? fetchedSurveys : initialSurveys);
      }
      if (Array.isArray(fetchedReports)) {
        setReports(fetchedReports.length ? fetchedReports : initialReports);
      }
      if (Array.isArray(fetchedInvestigations)) {
        setInvestigations(fetchedInvestigations.length ? fetchedInvestigations : initialInvestigations);
      }

      setIsLiveBackend(true);
    } catch (err) {
      // Backend not running yet or unreachable - retain initial demo data
      setIsLiveBackend(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
    const interval = setInterval(refreshFromBackend, 15000);
    return () => clearInterval(interval);
  }, [refreshFromBackend]);

  // SITES CRUD
  const addSite = async (siteData) => {
    try {
      const payload = {
        site_name: siteData.site_name.trim(),
        address: siteData.address.trim(),
        latitude: parseFloat(siteData.latitude),
        longitude: parseFloat(siteData.longitude),
      };

      let newSite = null;
      if (isLiveBackend) {
        try {
          const res = await api.post('/sites', payload).catch(() => api.post('/api/sites', payload));
          newSite = res.data?.data || res.data;
        } catch (e) {
          console.warn('Backend call failed, applying to local store', e);
        }
      }

      if (!newSite || !newSite.site_id) {
        newSite = {
          site_id: sites.length ? Math.max(...sites.map((s) => s.site_id)) + 1 : 1,
          ...payload,
          created_at: new Date().toISOString(),
        };
      }

      setSites((prev) => [newSite, ...prev]);
      showToast(`Site "${newSite.site_name}" created successfully`);
      return { success: true, site: newSite };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create site';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateSite = async (id, siteData) => {
    try {
      const payload = {};
      if (siteData.site_name) payload.site_name = siteData.site_name.trim();
      if (siteData.address) payload.address = siteData.address.trim();
      if (siteData.latitude !== undefined) payload.latitude = parseFloat(siteData.latitude);
      if (siteData.longitude !== undefined) payload.longitude = parseFloat(siteData.longitude);

      if (isLiveBackend) {
        try {
          await api.put(`/sites/${id}`, payload).catch(() => api.put(`/api/sites/${id}`, payload));
        } catch (e) {
          console.warn('Backend update failed, applying locally', e);
        }
      }

      setSites((prev) =>
        prev.map((s) => (s.site_id === Number(id) ? { ...s, ...payload } : s))
      );
      showToast(`Site #${id} updated successfully`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update site';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const deleteSite = async (id) => {
    try {
      if (isLiveBackend) {
        try {
          await api.delete(`/sites/${id}`).catch(() => api.delete(`/api/sites/${id}`));
        } catch (e) {
          console.warn('Backend delete failed, applying locally', e);
        }
      }
      setSites((prev) => prev.filter((s) => s.site_id !== Number(id)));
      showToast(`Site #${id} removed`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete site';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // SURVEYS CRUD
  const addSurvey = async (surveyData) => {
    try {
      const payload = {
        site_id: Number(surveyData.site_id),
        survey_date: surveyData.survey_date ? new Date(surveyData.survey_date).toISOString() : new Date().toISOString(),
        survey_status: surveyData.survey_status || 'PENDING',
        remarks: surveyData.remarks || '',
      };

      let newSurvey = null;
      if (isLiveBackend) {
        try {
          const res = await api.post('/surveys', payload).catch(() => api.post('/api/surveys', payload));
          newSurvey = res.data?.data || res.data;
        } catch (e) {
          console.warn('Backend survey create failed, applying locally', e);
        }
      }

      if (!newSurvey || !newSurvey.survey_id) {
        newSurvey = {
          survey_id: surveys.length ? Math.max(...surveys.map((s) => s.survey_id)) + 1 : 1,
          ...payload,
        };
      }

      setSurveys((prev) => [newSurvey, ...prev]);
      showToast(`Drone Survey #${newSurvey.survey_id} scheduled`);
      return { success: true, survey: newSurvey };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to schedule survey';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateSurvey = async (id, surveyData) => {
    try {
      const payload = {};
      if (surveyData.survey_status) payload.survey_status = surveyData.survey_status;
      if (surveyData.remarks !== undefined) payload.remarks = surveyData.remarks;
      if (surveyData.survey_date) payload.survey_date = new Date(surveyData.survey_date).toISOString();

      if (isLiveBackend) {
        try {
          await api.put(`/surveys/${id}`, payload).catch(() => api.put(`/api/surveys/${id}`, payload));
        } catch (e) {
          console.warn('Backend update failed, applying locally', e);
        }
      }

      setSurveys((prev) =>
        prev.map((s) => (s.survey_id === Number(id) ? { ...s, ...payload } : s))
      );
      showToast(`Survey #${id} updated`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update survey';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const deleteSurvey = async (id) => {
    try {
      if (isLiveBackend) {
        try {
          await api.delete(`/surveys/${id}`).catch(() => api.delete(`/api/surveys/${id}`));
        } catch (e) {
          console.warn('Backend delete failed, applying locally', e);
        }
      }
      setSurveys((prev) => prev.filter((s) => s.survey_id !== Number(id)));
      showToast(`Survey #${id} deleted`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete survey';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // REPORTS CRUD
  const addReport = async (reportData) => {
    try {
      const payload = {
        site_id: Number(reportData.site_id),
        survey_id: reportData.survey_id ? Number(reportData.survey_id) : null,
        description: reportData.description.trim(),
        report_date: reportData.report_date ? new Date(reportData.report_date).toISOString() : new Date().toISOString(),
        status: reportData.status || 'PENDING',
      };

      let newReport = null;
      if (isLiveBackend) {
        try {
          const res = await api.post('/reports', payload).catch(() => api.post('/api/reports', payload));
          newReport = res.data?.data || res.data;
        } catch (e) {
          console.warn('Backend report create failed, applying locally', e);
        }
      }

      if (!newReport || !newReport.report_id) {
        newReport = {
          report_id: reports.length ? Math.max(...reports.map((r) => r.report_id)) + 1 : 1,
          ...payload,
        };
      }

      setReports((prev) => [newReport, ...prev]);
      showToast(`Violation Report #${newReport.report_id} logged`);
      return { success: true, report: newReport };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create report';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateReport = async (id, reportData) => {
    try {
      const payload = {};
      if (reportData.description) payload.description = reportData.description.trim();
      if (reportData.status) payload.status = reportData.status;
      if (reportData.site_id) payload.site_id = Number(reportData.site_id);
      if (reportData.survey_id !== undefined) {
        payload.survey_id = reportData.survey_id ? Number(reportData.survey_id) : null;
      }
      if (reportData.report_date) payload.report_date = new Date(reportData.report_date).toISOString();

      if (isLiveBackend) {
        try {
          await api.put(`/reports/${id}`, payload).catch(() => api.put(`/api/reports/${id}`, payload));
        } catch (e) {
          console.warn('Backend update failed, applying locally', e);
        }
      }

      setReports((prev) =>
        prev.map((r) => (r.report_id === Number(id) ? { ...r, ...payload } : r))
      );
      showToast(`Report #${id} updated`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update report';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const deleteReport = async (id) => {
    try {
      if (isLiveBackend) {
        try {
          await api.delete(`/reports/${id}`).catch(() => api.delete(`/api/reports/${id}`));
        } catch (e) {
          console.warn('Backend delete report failed, applying locally', e);
        }
      }
      setReports((prev) => prev.filter((r) => r.report_id !== Number(id)));
      // Also delete connected investigation if any
      setInvestigations((prev) => prev.filter((inv) => inv.report_id !== Number(id)));
      showToast(`Report #${id} removed`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete report';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // INVESTIGATIONS CRUD
  const addInvestigation = async (invData) => {
    try {
      const reportId = Number(invData.report_id);
      const existing = investigations.find((i) => i.report_id === reportId);
      if (existing) {
        throw new Error(`An investigation (#${existing.investigation_id}) already exists for Report #${reportId}`);
      }

      const payload = {
        report_id: reportId,
        investigation_date: invData.investigation_date ? new Date(invData.investigation_date).toISOString() : new Date().toISOString(),
        investigation_notes: invData.investigation_notes || '',
        investigation_status: invData.investigation_status || 'NOT_STARTED',
      };

      let newInv = null;
      if (isLiveBackend) {
        try {
          const res = await api.post('/investigations', payload).catch(() => api.post('/api/investigations', payload));
          newInv = res.data?.data || res.data;
        } catch (e) {
          console.warn('Backend create investigation failed, applying locally', e);
        }
      }

      if (!newInv || !newInv.investigation_id) {
        newInv = {
          investigation_id: investigations.length ? Math.max(...investigations.map((i) => i.investigation_id)) + 1 : 1,
          ...payload,
        };
      }

      setInvestigations((prev) => [newInv, ...prev]);

      // If report was PENDING, auto-progress to UNDER_INVESTIGATION
      const report = reports.find((r) => r.report_id === reportId);
      if (report && report.status === 'PENDING') {
        updateReport(reportId, { status: 'UNDER_INVESTIGATION' });
      }

      showToast(`Investigation #${newInv.investigation_id} opened for Report #${reportId}`);
      return { success: true, investigation: newInv };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to start investigation';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const updateInvestigation = async (id, invData) => {
    try {
      const payload = {};
      if (invData.investigation_status) payload.investigation_status = invData.investigation_status;
      if (invData.investigation_notes !== undefined) payload.investigation_notes = invData.investigation_notes;
      if (invData.investigation_date) {
        payload.investigation_date = new Date(invData.investigation_date).toISOString();
      }

      if (isLiveBackend) {
        try {
          await api.put(`/investigations/${id}`, payload).catch(() => api.put(`/api/investigations/${id}`, payload));
        } catch (e) {
          console.warn('Backend update investigation failed, applying locally', e);
        }
      }

      setInvestigations((prev) =>
        prev.map((i) => (i.investigation_id === Number(id) ? { ...i, ...payload } : i))
      );
      showToast(`Investigation #${id} updated`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update investigation';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const deleteInvestigation = async (id) => {
    try {
      if (isLiveBackend) {
        try {
          await api.delete(`/investigations/${id}`).catch(() => api.delete(`/api/investigations/${id}`));
        } catch (e) {
          console.warn('Backend delete investigation failed, applying locally', e);
        }
      }
      setInvestigations((prev) => prev.filter((i) => i.investigation_id !== Number(id)));
      showToast(`Investigation #${id} deleted`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete investigation';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Enriched data structures with relation lookups
  const enrichedSites = useMemo(() => {
    return sites.map((site) => {
      const siteSurveys = surveys.filter((s) => s.site_id === site.site_id);
      const siteReports = reports.filter((r) => r.site_id === site.site_id);
      return {
        ...site,
        surveysCount: siteSurveys.length,
        reportsCount: siteReports.length,
        hasViolations: siteReports.some((r) => r.status === 'VERIFIED' || r.status === 'UNDER_INVESTIGATION'),
      };
    });
  }, [sites, surveys, reports]);

  const enrichedSurveys = useMemo(() => {
    return surveys.map((surv) => {
      const site = sites.find((s) => s.site_id === surv.site_id);
      const linkedReports = reports.filter((r) => r.survey_id === surv.survey_id);
      return {
        ...surv,
        site,
        reportsCount: linkedReports.length,
      };
    });
  }, [surveys, sites, reports]);

  const enrichedReports = useMemo(() => {
    return reports.map((rep) => {
      const site = sites.find((s) => s.site_id === rep.site_id);
      const survey = rep.survey_id ? surveys.find((s) => s.survey_id === rep.survey_id) : null;
      const investigation = investigations.find((i) => i.report_id === rep.report_id);
      return {
        ...rep,
        site,
        survey,
        investigation,
      };
    });
  }, [reports, sites, surveys, investigations]);

  const enrichedInvestigations = useMemo(() => {
    return investigations.map((inv) => {
      const report = reports.find((r) => r.report_id === inv.report_id);
      const site = report ? sites.find((s) => s.site_id === report.site_id) : null;
      const survey = report?.survey_id ? surveys.find((s) => s.survey_id === report.survey_id) : null;
      return {
        ...inv,
        report: report ? { ...report, site, survey } : null,
      };
    });
  }, [investigations, reports, sites, surveys]);

  // Telemetry KPIs
  const kpis = useMemo(() => {
    const totalSites = sites.length;
    const totalSurveys = surveys.length;
    const completedSurveys = surveys.filter((s) => s.survey_status === 'COMPLETED').length;
    const totalReports = reports.length;
    const pendingReports = reports.filter((r) => r.status === 'PENDING').length;
    const verifiedReports = reports.filter((r) => r.status === 'VERIFIED').length;
    const activeInvestigations = investigations.filter((i) => i.investigation_status === 'IN_PROGRESS').length;
    const completedInvestigations = investigations.filter((i) => i.investigation_status === 'COMPLETED').length;

    const complianceScore =
      totalSites > 0
        ? Math.round(
            ((totalSites - enrichedSites.filter((s) => s.hasViolations).length) / totalSites) * 100
          )
        : 100;

    return {
      totalSites,
      totalSurveys,
      completedSurveys,
      totalReports,
      pendingReports,
      verifiedReports,
      activeInvestigations,
      completedInvestigations,
      complianceScore,
    };
  }, [sites, surveys, reports, investigations, enrichedSites]);

  const value = {
    sites: enrichedSites,
    surveys: enrichedSurveys,
    reports: enrichedReports,
    investigations: enrichedInvestigations,
    kpis,
    isLiveBackend,
    loading,
    toast,
    showToast,
    refreshFromBackend,
    // Actions
    addSite,
    updateSite,
    deleteSite,
    addSurvey,
    updateSurvey,
    deleteSurvey,
    addReport,
    updateReport,
    deleteReport,
    addInvestigation,
    updateInvestigation,
    deleteInvestigation,
  };

  return (
    <USMSContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-xs font-medium border ${
              toast.type === 'error'
                ? 'bg-crit/15 border-crit/40 text-crit'
                : toast.type === 'info'
                ? 'bg-accent/15 border-accent/40 text-accent2'
                : 'bg-surface/95 border-line text-ink'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                toast.type === 'error' ? 'bg-crit' : toast.type === 'info' ? 'bg-accent2' : 'bg-ok'
              }`}
            />
            {toast.message}
          </div>
        </div>
      )}
    </USMSContext.Provider>
  );
}

export function useUSMS() {
  const context = useContext(USMSContext);
  if (!context) {
    throw new Error('useUSMS must be used within a USMSProvider');
  }
  return context;
}
