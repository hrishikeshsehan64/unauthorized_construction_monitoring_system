const reportService = require("../services/reportService");

const createReport = async (req, res, next) => {
    try {
        const report = await reportService.createReport(req.body);

        res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: report
        });
    } catch (error) {
        next(error);
    }
};

const getAllReports = async (req, res, next) => {
    try {
        const reports = await reportService.getAllReports();

        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

const getReportById = async (req, res, next) => {
    try {
        const report = await reportService.getReportById(req.params.id);

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

const updateReport = async (req, res, next) => {
    try {
        const report = await reportService.updateReport(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Report updated successfully",
            data: report
        });
    } catch (error) {
        next(error);
    }
};

const deleteReport = async (req, res, next) => {
    try {
        const report = await reportService.deleteReport(req.params.id);

        res.status(200).json({
            success: true,
            message: "Report deleted successfully",
            data: report
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport
};