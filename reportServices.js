const { prisma } = require("../config/prisma");

const validateId = (id, label = "ID") => {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        const error = new Error(`Invalid ${label}`);
        error.statusCode = 400;
        throw error;
    }

    return parsedId;
};

// Check that the site exists and the survey belongs to that site.
const validateSiteAndSurvey = async (siteId, surveyId) => {
    const site = await prisma.constructionSite.findUnique({
        where: { site_id: siteId }
    });

    if (!site) {
        const error = new Error("Construction site not found");
        error.statusCode = 404;
        throw error;
    }

    if (surveyId !== null && surveyId !== undefined) {
        const survey = await prisma.droneSurvey.findUnique({
            where: { survey_id: surveyId }
        });

        if (!survey) {
            const error = new Error("Drone survey not found");
            error.statusCode = 404;
            throw error;
        }

        if (survey.site_id !== siteId) {
            const error = new Error(
                "The selected survey does not belong to this construction site"
            );
            error.statusCode = 400;
            throw error;
        }
    }
};

// CREATE REPORT
const createReport = async (reportData) => {
    const siteId = validateId(reportData.site_id, "site ID");

    const surveyId =
        reportData.survey_id === undefined || reportData.survey_id === null
            ? null
            : validateId(reportData.survey_id, "survey ID");

    await validateSiteAndSurvey(siteId, surveyId);

    return await prisma.report.create({
        data: {
            site_id: siteId,
            survey_id: surveyId,
            description: reportData.description,
            ...(reportData.report_date !== undefined && {
                report_date: new Date(reportData.report_date)
            }),
            ...(reportData.status !== undefined && {
                status: reportData.status
            })
        },
        include: {
            site: true,
            survey: true
        }
    });
};

// GET ALL REPORTS
const getAllReports = async () => {
    return await prisma.report.findMany({
        include: {
            site: true,
            survey: true,
            investigation: true
        },
        orderBy: {
            report_date: "desc"
        }
    });
};

// GET REPORT BY ID
const getReportById = async (id) => {
    const reportId = validateId(id, "report ID");

    const report = await prisma.report.findUnique({
        where: { report_id: reportId },
        include: {
            site: true,
            survey: true,
            investigation: true
        }
    });

    if (!report) {
        const error = new Error("Report not found");
        error.statusCode = 404;
        throw error;
    }

    return report;
};

// UPDATE REPORT
const updateReport = async (id, reportData) => {
    const reportId = validateId(id, "report ID");

    const existingReport = await prisma.report.findUnique({
        where: { report_id: reportId }
    });

    if (!existingReport) {
        const error = new Error("Report not found");
        error.statusCode = 404;
        throw error;
    }

    const siteId =
        reportData.site_id === undefined
            ? existingReport.site_id
            : validateId(reportData.site_id, "site ID");

    const surveyId =
        reportData.survey_id === undefined
            ? existingReport.survey_id
            : reportData.survey_id === null
                ? null
                : validateId(reportData.survey_id, "survey ID");

    await validateSiteAndSurvey(siteId, surveyId);

    const data = {};

    if (reportData.site_id !== undefined) data.site_id = siteId;
    if (reportData.survey_id !== undefined) data.survey_id = surveyId;
    if (reportData.description !== undefined) data.description = reportData.description;
    if (reportData.status !== undefined) data.status = reportData.status;

    if (reportData.report_date !== undefined) {
        data.report_date = new Date(reportData.report_date);
    }

    return await prisma.report.update({
        where: { report_id: reportId },
        data,
        include: {
            site: true,
            survey: true,
            investigation: true
        }
    });
};

// DELETE REPORT
const deleteReport = async (id) => {
    const reportId = validateId(id, "report ID");

    return await prisma.report.delete({
        where: { report_id: reportId }
    });
};

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport
};