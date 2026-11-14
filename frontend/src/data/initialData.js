// Initial seed data compliant with Prisma schema (ConstructionSite, DroneSurvey, Report, Investigation)
export const initialSites = [
  {
    site_id: 1,
    site_name: 'Skyline Heights Phase 2',
    address: 'Plot 42, Baner-Pashan Link Road, Baner, Pune',
    latitude: 18.559,
    longitude: 73.7868,
    created_at: '2026-10-15T09:30:00.000Z',
  },
  {
    site_id: 2,
    site_name: 'Greenfield Commercial Complex',
    address: 'Survey 112, Kharadi Main Road, Kharadi, Pune',
    latitude: 18.5514,
    longitude: 73.9348,
    created_at: '2026-10-20T11:15:00.000Z',
  },
  {
    site_id: 3,
    site_name: 'Amanora Parkside Extension',
    address: 'Magarpatta City Bypass, Hadapsar, Pune',
    latitude: 18.5089,
    longitude: 73.9259,
    created_at: '2026-11-01T08:00:00.000Z',
  },
  {
    site_id: 4,
    site_name: 'Kothrud Hilltop Enclave',
    address: 'Paud Road, Near MIT Campus, Kothrud, Pune',
    latitude: 18.5074,
    longitude: 73.8077,
    created_at: '2026-11-04T14:20:00.000Z',
  },
  {
    site_id: 5,
    site_name: 'Viman Nagar Tech Bay',
    address: 'Symbiosis Road, Viman Nagar, Pune',
    latitude: 18.5679,
    longitude: 73.9143,
    created_at: '2026-11-08T16:45:00.000Z',
  },
  {
    site_id: 6,
    site_name: 'Wakad Horizon Residency',
    address: 'Dange Chowk Road, Wakad, Pune',
    latitude: 18.5987,
    longitude: 73.7629,
    created_at: '2026-11-10T10:00:00.000Z',
  },
];

export const initialSurveys = [
  {
    survey_id: 1,
    site_id: 1,
    survey_date: '2026-11-11T09:00:00.000Z',
    survey_status: 'COMPLETED',
    remarks: 'Aerial LiDAR scan detected unpermitted 4th floor structural slab beyond approved G+3 sanction.',
  },
  {
    survey_id: 2,
    site_id: 2,
    survey_date: '2026-11-12T11:30:00.000Z',
    survey_status: 'COMPLETED',
    remarks: 'Boundary encroachment into municipal road setback buffer by 4.2 meters.',
  },
  {
    survey_id: 3,
    site_id: 3,
    survey_date: '2026-11-15T08:30:00.000Z',
    survey_status: 'PENDING',
    remarks: 'Scheduled bi-weekly aerial perimeter monitoring flight.',
  },
  {
    survey_id: 4,
    site_id: 4,
    survey_date: '2026-11-13T14:15:00.000Z',
    survey_status: 'COMPLETED',
    remarks: 'Excavation beyond permissible basement depth limit endangering adjacent foundations.',
  },
  {
    survey_id: 5,
    site_id: 5,
    survey_date: '2026-11-09T10:00:00.000Z',
    survey_status: 'CANCELLED',
    remarks: 'Sweep cancelled due to high wind gusts and rain; rescheduled.',
  },
];

export const initialReports = [
  {
    report_id: 1,
    site_id: 1,
    survey_id: 1,
    description: 'Unauthorized additional floor (4th level) constructed without sanctioned structural revision.',
    report_date: '2026-11-11T13:45:00.000Z',
    status: 'UNDER_INVESTIGATION',
  },
  {
    report_id: 2,
    site_id: 2,
    survey_id: 2,
    description: 'Encroachment onto public right-of-way corridor and violation of mandatory 6m front setback.',
    report_date: '2026-11-12T15:20:00.000Z',
    status: 'VERIFIED',
  },
  {
    report_id: 3,
    site_id: 4,
    survey_id: 4,
    description: 'Basement excavation depth exceeded sanctioned 3.5m limit, approaching 6m without retaining shoring.',
    report_date: '2026-11-13T16:00:00.000Z',
    status: 'PENDING',
  },
  {
    report_id: 4,
    site_id: 6,
    survey_id: null,
    description: 'Illegal temporary commercial shed constructed on designated resident visitor parking bays.',
    report_date: '2026-11-14T09:15:00.000Z',
    status: 'PENDING',
  },
  {
    report_id: 5,
    site_id: 5,
    survey_id: null,
    description: 'Reported terrace canopy installation investigated and found within permissible decorative zoning.',
    report_date: '2026-11-09T12:00:00.000Z',
    status: 'REJECTED',
  },
];

export const initialInvestigations = [
  {
    investigation_id: 1,
    report_id: 1,
    investigation_date: '2026-11-12T10:00:00.000Z',
    investigation_notes: 'Physical site verification by Ward Officer R. Deshmukh. Stop-work notice issued under Section 267. Owner summons delivered.',
    investigation_status: 'IN_PROGRESS',
  },
  {
    investigation_id: 2,
    report_id: 2,
    investigation_date: '2026-11-13T14:30:00.000Z',
    investigation_notes: 'Total station land survey confirmed 4.2m encroachment. Demolition order drafted and sent for Commissioner sign-off.',
    investigation_status: 'COMPLETED',
  },
];
