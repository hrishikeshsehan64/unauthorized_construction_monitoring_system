const investigationService = require("../services/investigationService");

const createInvestigation = async (req, res, next) => {
    try {
        const investigation =
            await investigationService.createInvestigation(req.body);

        res.status(201).json({
            success: true,
            message: "Investigation created successfully",
            data: investigation
        });
    } catch (error) {
        next(error);
    }
};

const getAllInvestigations = async (req, res, next) => {
    try {
        const investigations =
            await investigationService.getAllInvestigations();

        res.status(200).json({
            success: true,
            data: investigations
        });
    } catch (error) {
        next(error);
    }
};

const getInvestigationById = async (req, res, next) => {
    try {
        const investigation =
            await investigationService.getInvestigationById(req.params.id);

        res.status(200).json({
            success: true,
            data: investigation
        });
    } catch (error) {
        next(error);
    }
};

const updateInvestigation = async (req, res, next) => {
    try {
        const investigation =
            await investigationService.updateInvestigation(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Investigation updated successfully",
            data: investigation
        });
    } catch (error) {
        next(error);
    }
};

const deleteInvestigation = async (req, res, next) => {
    try {
        const investigation =
            await investigationService.deleteInvestigation(req.params.id);

        res.status(200).json({
            success: true,
            message: "Investigation deleted successfully",
            data: investigation
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createInvestigation,
    getAllInvestigations,
    getInvestigationById,
    updateInvestigation,
    deleteInvestigation
};