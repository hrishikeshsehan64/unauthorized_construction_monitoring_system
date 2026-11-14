const { prisma } = require("../config/prisma");

const validateId = (id) => {
    const investigationId = Number(id);

    if (!Number.isInteger(investigationId) || investigationId <= 0) {
        const error = new Error("Invalid investigation ID");
        error.statusCode = 400;
        throw error;
    }

    return investigationId;
};

// CREATE INVESTIGATION
const createInvestigation = async (investigationData) => {
    const reportId = Number(investigationData.report_id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
        const error = new Error("Invalid report ID");
        error.statusCode = 400;
        throw error;
    }

    const report = await prisma.report.findUnique({
        where: { report_id: reportId }
    });

    if (!report) {
        const error = new Error("Report not found");
        error.statusCode = 404;
        throw error;
    }

    return await prisma.investigation.create({
        data: {
            report_id: reportId,
            ...(investigationData.investigation_date !== undefined && {
                investigation_date: new Date(
                    investigationData.investigation_date
                )
            }),
            ...(investigationData.investigation_notes !== undefined && {
                investigation_notes: investigationData.investigation_notes
            }),
            ...(investigationData.investigation_status !== undefined && {
                investigation_status: investigationData.investigation_status
            })
        },
        include: {
            report: true
        }
    });
};

// GET ALL INVESTIGATIONS
const getAllInvestigations = async () => {
    return await prisma.investigation.findMany({
        include: {
            report: {
                include: {
                    site: true,
                    survey: true
                }
            }
        }
    });
};

// GET INVESTIGATION BY ID
const getInvestigationById = async (id) => {
    const investigationId = validateId(id);

    const investigation = await prisma.investigation.findUnique({
        where: { investigation_id: investigationId },
        include: {
            report: {
                include: {
                    site: true,
                    survey: true
                }
            }
        }
    });

    if (!investigation) {
        const error = new Error("Investigation not found");
        error.statusCode = 404;
        throw error;
    }

    return investigation;
};

// UPDATE INVESTIGATION
const updateInvestigation = async (id, investigationData) => {
    const investigationId = validateId(id);

    if (investigationData.report_id !== undefined) {
        const error = new Error("Changing the report ID is not allowed");
        error.statusCode = 400;
        throw error;
    }

    const data = {};

    if (investigationData.investigation_date !== undefined) {
        data.investigation_date =
            investigationData.investigation_date === null
                ? null
                : new Date(investigationData.investigation_date);
    }

    if (investigationData.investigation_notes !== undefined) {
        data.investigation_notes = investigationData.investigation_notes;
    }

    if (investigationData.investigation_status !== undefined) {
        data.investigation_status = investigationData.investigation_status;
    }

    if (Object.keys(data).length === 0) {
        const error = new Error("Provide at least one field to update");
        error.statusCode = 400;
        throw error;
    }

    return await prisma.investigation.update({
        where: { investigation_id: investigationId },
        data,
        include: {
            report: true
        }
    });
};

// DELETE INVESTIGATION
const deleteInvestigation = async (id) => {
    const investigationId = validateId(id);

    return await prisma.investigation.delete({
        where: { investigation_id: investigationId }
    });
};

module.exports = {
    createInvestigation,
    getAllInvestigations,
    getInvestigationById,
    updateInvestigation,
    deleteInvestigation
};