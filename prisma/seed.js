
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // WARNING: Reset only UCMS seed-related tables before inserting fresh data.
  // Delete child records first to respect foreign key constraints.
  await prisma.investigation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.droneSurvey.deleteMany();
  await prisma.constructionSite.deleteMany();
  await prisma.user.deleteMany();

  console.log('Old seed data cleared.');

  // -------------------------
  // 1. CONSTRUCTION SITES
  // -------------------------
  const sitesData = [
    {
      site_name: 'Green Valley Residency',
      address: 'Guntur, Andhra Pradesh',
      latitude: 16.3067,
      longitude: 80.4365,
    },
    {
      site_name: 'Skyline Towers',
      address: 'Vijayawada, Andhra Pradesh',
      latitude: 16.5062,
      longitude: 80.648,
    },
    {
      site_name: 'Sunrise Commercial Complex',
      address: 'Amaravati, Andhra Pradesh',
      latitude: 16.5417,
      longitude: 80.515,
    },
    {
      site_name: 'Royal Enclave Apartments',
      address: 'Tenali, Andhra Pradesh',
      latitude: 16.2429,
      longitude: 80.64,
    },
    {
      site_name: 'Lakeview Heights',
      address: 'Nellore, Andhra Pradesh',
      latitude: 14.4426,
      longitude: 79.9865,
    },
    {
      site_name: 'Metro Business Park',
      address: 'Visakhapatnam, Andhra Pradesh',
      latitude: 17.6868,
      longitude: 83.2185,
    },
    {
      site_name: 'Silver Oak Villas',
      address: 'Tirupati, Andhra Pradesh',
      latitude: 13.6288,
      longitude: 79.4192,
    },
    {
      site_name: 'Harbor View Complex',
      address: 'Kakinada, Andhra Pradesh',
      latitude: 16.9891,
      longitude: 82.2475,
    },
  ];

  const sites = [];

  for (const site of sitesData) {
    const createdSite = await prisma.constructionSite.create({
      data: site,
    });
    sites.push(createdSite);
  }

  console.log(`${sites.length} construction sites created.`);

  // -------------------------
  // 2. DRONE SURVEYS
  // -------------------------
  const surveysData = [
    {
      siteIndex: 0,
      survey_status: 'COMPLETED',
      remarks: 'Survey completed. Possible additional floor detected.',
      daysAgo: 15,
    },
    {
      siteIndex: 0,
      survey_status: 'COMPLETED',
      remarks: 'Follow-up survey conducted. Construction activity continues.',
      daysAgo: 3,
    },
    {
      siteIndex: 1,
      survey_status: 'PENDING',
      remarks: 'Survey pending scheduling.',
      daysAgo: 0,
    },
    {
      siteIndex: 1,
      survey_status: 'COMPLETED',
      remarks: 'Roof area and building perimeter captured.',
      daysAgo: 12,
    },
    {
      siteIndex: 2,
      survey_status: 'COMPLETED',
      remarks: 'Commercial extension observed on the eastern side.',
      daysAgo: 7,
    },
    {
      siteIndex: 2,
      survey_status: 'CANCELLED',
      remarks: 'Survey cancelled due to unfavorable weather.',
      daysAgo: 5,
    },
    {
      siteIndex: 3,
      survey_status: 'COMPLETED',
      remarks: 'Residential construction progress recorded.',
      daysAgo: 20,
    },
    {
      siteIndex: 4,
      survey_status: 'PENDING',
      remarks: 'Initial aerial inspection awaiting assignment.',
      daysAgo: 0,
    },
    {
      siteIndex: 4,
      survey_status: 'COMPLETED',
      remarks: 'Boundary and setback measurements captured.',
      daysAgo: 9,
    },
    {
      siteIndex: 5,
      survey_status: 'COMPLETED',
      remarks: 'Business park structures inspected from aerial imagery.',
      daysAgo: 4,
    },
    {
      siteIndex: 6,
      survey_status: 'COMPLETED',
      remarks: 'Villa layout and roof modifications documented.',
      daysAgo: 18,
    },
    {
      siteIndex: 7,
      survey_status: 'PENDING',
      remarks: 'Drone survey awaiting field team availability.',
      daysAgo: 0,
    },
  ];

  const surveys = [];

  for (const survey of surveysData) {
    const { siteIndex, daysAgo, ...data } = survey;

    const createdSurvey = await prisma.droneSurvey.create({
      data: {
        ...data,
        site_id: sites[siteIndex].site_id,
        survey_date: new Date(Date.now() - daysAgo * 86400000),
      },
    });

    surveys.push(createdSurvey);
  }

  console.log(`${surveys.length} drone surveys created.`);

  // -------------------------
  // 3. REPORTS
  // -------------------------
  const reportsData = [
    {
      siteIndex: 0,
      surveyIndex: 0,
      description: 'Possible unauthorized additional floor detected.',
      status: 'UNDER_INVESTIGATION',
      daysAgo: 14,
    },
    {
      siteIndex: 0,
      surveyIndex: 1,
      description: 'Construction activity observed beyond the approved plan.',
      status: 'PENDING',
      daysAgo: 2,
    },
    {
      siteIndex: 1,
      surveyIndex: 3,
      description: 'Building roof structure appears different from submitted plan.',
      status: 'VERIFIED',
      daysAgo: 10,
    },
    {
      siteIndex: 1,
      surveyIndex: null,
      description: 'Public complaint regarding construction noise and activity.',
      status: 'PENDING',
      daysAgo: 1,
    },
    {
      siteIndex: 2,
      surveyIndex: 4,
      description: 'Possible unauthorized commercial extension detected.',
      status: 'UNDER_INVESTIGATION',
      daysAgo: 6,
    },
    {
      siteIndex: 2,
      surveyIndex: null,
      description: 'Complaint received about building encroachment.',
      status: 'REJECTED',
      daysAgo: 11,
    },
    {
      siteIndex: 3,
      surveyIndex: 6,
      description: 'Building construction may exceed approved boundary.',
      status: 'VERIFIED',
      daysAgo: 17,
    },
    {
      siteIndex: 3,
      surveyIndex: null,
      description: 'Neighbor reported construction during restricted hours.',
      status: 'PENDING',
      daysAgo: 4,
    },
    {
      siteIndex: 4,
      surveyIndex: 8,
      description: 'Possible setback violation near adjacent property.',
      status: 'UNDER_INVESTIGATION',
      daysAgo: 8,
    },
    {
      siteIndex: 4,
      surveyIndex: null,
      description: 'Complaint regarding unauthorized site expansion.',
      status: 'PENDING',
      daysAgo: 3,
    },
    {
      siteIndex: 5,
      surveyIndex: 9,
      description: 'Warehouse structure may exceed approved dimensions.',
      status: 'VERIFIED',
      daysAgo: 3,
    },
    {
      siteIndex: 5,
      surveyIndex: null,
      description: 'Reported obstruction of access road by construction.',
      status: 'REJECTED',
      daysAgo: 13,
    },
    {
      siteIndex: 6,
      surveyIndex: 10,
      description: 'Unapproved roof modification suspected.',
      status: 'UNDER_INVESTIGATION',
      daysAgo: 16,
    },
    {
      siteIndex: 7,
      surveyIndex: null,
      description: 'New complaint received regarding possible land encroachment.',
      status: 'PENDING',
      daysAgo: 1,
    },
  ];

  const reports = [];

  for (const report of reportsData) {
    const { siteIndex, surveyIndex, daysAgo, ...data } = report;

    const createdReport = await prisma.report.create({
      data: {
        ...data,
        site_id: sites[siteIndex].site_id,
        survey_id: surveyIndex === null ? null : surveys[surveyIndex].survey_id,
        report_date: new Date(Date.now() - daysAgo * 86400000),
      },
    });

    reports.push(createdReport);
  }

  console.log(`${reports.length} reports created.`);

  // -------------------------
  // 4. INVESTIGATIONS
  // -------------------------
  const investigationsData = [
    {
      reportIndex: 0,
      investigation_status: 'IN_PROGRESS',
      investigation_notes: 'Field inspection initiated. Measurements are being compared against approved plans.',
      daysAgo: 5,
    },
    {
      reportIndex: 2,
      investigation_status: 'COMPLETED',
      investigation_notes: 'Inspection completed. The structure was found to be within approved specifications.',
      daysAgo: 8,
    },
    {
      reportIndex: 4,
      investigation_status: 'IN_PROGRESS',
      investigation_notes: 'Site inspection scheduled. Awaiting documentation from the property owner.',
      daysAgo: 2,
    },
    {
      reportIndex: 6,
      investigation_status: 'COMPLETED',
      investigation_notes: 'Boundary measurements verified. Supporting photographs were recorded.',
      daysAgo: 12,
    },
    {
      reportIndex: 8,
      investigation_status: 'IN_PROGRESS',
      investigation_notes: 'Setback measurements are under review by the inspection team.',
      daysAgo: 3,
    },
    {
      reportIndex: 10,
      investigation_status: 'COMPLETED',
      investigation_notes: 'Dimensions verified against the approved construction layout.',
      daysAgo: 2,
    },
    {
      reportIndex: 1,
      investigation_status: 'NOT_STARTED',
      investigation_notes: 'Investigation not yet assigned.',
      daysAgo: null,
    },
    {
      reportIndex: 7,
      investigation_status: 'NOT_STARTED',
      investigation_notes: 'Pending assignment to a field officer.',
      daysAgo: null,
    },
    {
      reportIndex: 12,
      investigation_status: 'IN_PROGRESS',
      investigation_notes: 'Reviewing the drone imagery and permit records.',
      daysAgo: 7,
    },
  ];

  for (const investigation of investigationsData) {
    const { reportIndex, daysAgo, ...data } = investigation;

    await prisma.investigation.create({
      data: {
        ...data,
        report_id: reports[reportIndex].report_id,
        investigation_date:
          daysAgo === null
            ? null
            : new Date(Date.now() - daysAgo * 86400000),
      },
    });
  }

  console.log(`${investigationsData.length} investigations created.`);
  
  // -------------------------
  // 5. USERS (Bcrypt Hashed)
  // -------------------------
  const defaultPasswordHash = await bcrypt.hash('admin123', 10);
  const officerPasswordHash = await bcrypt.hash('officer123', 10);

  const usersData = [
    {
      name: 'System Admin',
      email: 'admin@usms.gov',
      password_hash: defaultPasswordHash,
      role: 'ADMIN',
    },
    {
      name: 'Enforcement Officer Patil',
      email: 'officer@usms.gov',
      password_hash: officerPasswordHash,
      role: 'OFFICER',
    },
    {
      name: 'Drone Pilot Sharma',
      email: 'pilot@usms.gov',
      password_hash: defaultPasswordHash,
      role: 'SURVEYOR',
    },
  ];

  for (const user of usersData) {
    await prisma.user.create({ data: user });
  }
  console.log(`${usersData.length} users created.`);

  console.log('-----------------------------------');
  console.log('UCMS database seeded successfully!');
  console.log('Sites: 8');
  console.log('Drone Surveys: 12');
  console.log('Reports: 14');
  console.log('Investigations: 9');
  console.log('Users: 3');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
