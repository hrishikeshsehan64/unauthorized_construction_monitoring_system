const { prisma } = require("../config/prisma");

// i will try to use helper function like validate id

const validateId = (id) =>{
    const siteId =Number(id)

    if (! Number.isInteger(siteId) || siteId <= 0) {
        const error = new Error("Invalid site ID");
        error.statusCode = 400;
        throw error;
    }
    return siteId;
};
// in all below functions, i used prisma CRUD operations
const createSite = async (siteData) => {
    const site = await prisma.constructionSite.create({ data: siteData });
    return site;
};
const getAllSites = async () => {
    const sites = await prisma.constructionSite.findMany();
    return sites;
};
const getSiteById = async (id) => {
    const siteId = validateId(id);
    const site = await prisma.constructionSite.findUnique({
        where: { site_id: siteId },
    });
     if (!site) {
        const error = new Error("Construction site not found");
        error.statusCode = 404;
        throw error;
    }

    return site;
};

const updateSite = async (id, siteData) => {
    const siteId = validateId(id);
    const site = await prisma.constructionSite.update({
        where: { site_id: siteId },
        data: siteData,
    });
    return site;
};

const deleteSite = async (id) => {
    const siteId = validateId(id);
    const site = await prisma.constructionSite.delete({
        where: { site_id: siteId },
    });
    return site;
};

module.exports = { createSite, getAllSites, getSiteById, updateSite, deleteSite };