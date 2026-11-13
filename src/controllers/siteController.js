const siteService = require("../services/siteService");
const createSite = async (req, res, next) => {
    try {
        const newSite = await siteService.createSite(req.body);
        res.status(201).json(newSite);
    } catch (error) {
        next(error);
    }
};
const updateSite = async (req, res, next) =>{
    try {
        const updatedSite = await siteService.updateSite(req.params.id, req.body);
        res.status(200).json(updatedSite);
    } catch (error) {
        next(error);
    }
};

const getAllSites = async (req, res, next) => {
    try {
        const sites = await siteService.getAllSites();
        res.status(200).json(sites);
    } catch (error) {
        next(error);
    }
};
const getSiteById = async (req, res, next) => {
    try {
        const siteById = await siteService.getSiteById(req.params.id);
        res.status(200).json(siteById);
    } catch (error) {
        next(error);
    }
};
const deleteSite = async (req, res, next) => {
    try {
        const deletedSite = await siteService.deleteSite(req.params.id);
        res.status(200).json(deletedSite);
    } catch (error) {
        next(error);
    }
};

module.exports = {createSite, updateSite, getAllSites, getSiteById, deleteSite}