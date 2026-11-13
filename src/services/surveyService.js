
const { prisma } = require("../config/prisma");

// same helper function from the siteServices that i am  reusing
const validateId = (id, fieldName = "survey ID") => {
    const value = Number(id);

    if (!Number.isInteger(value) || value <= 0) {
        const error = new Error(`Invalid ${fieldName}`);
        error.statusCode = 400;
        throw error;
    }

    return value;
};

// all the below are almost same as site services
const createSurvey = async (surveyData) => {
    const siteId = validateId(surveyData.site_id, "site ID");


    const site = await prisma.constructionSite.findUnique({
        where: { site_id: siteId }
    });

    if (!site) {
        const error = new Error("Construction site not found");
        error.statusCode = 404;
        throw error;
    }

    const survey = await prisma.droneSurvey.create({
        data: {
            ...surveyData,
            site_id: siteId
        }
    });

    return survey;
};


const getAllSurveys = async () => {
    const surveys = await prisma.droneSurvey.findMany();
    return surveys;
};


const getSurveyById = async (id) => {
    const surveyId = validateId(id);

    const survey = await prisma.droneSurvey.findUnique({
        where: { survey_id: surveyId }
    });

    if (!survey) {
        const error = new Error("Survey not found");
        error.statusCode = 404;
        throw error;
    }

    return survey;
};


const updateSurvey = async (id, surveyData) => {
    const surveyId = validateId(id);


    if (surveyData.site_id !== undefined) {
        const error = new Error("Changing the site ID is not allowed");
        error.statusCode = 400;
        throw error;
    }

    const survey = await prisma.droneSurvey.update({
        where: { survey_id: surveyId },
        data: surveyData
    });

    return survey;
};


const deleteSurvey = async (id) => {
    const surveyId = validateId(id);

    const survey = await prisma.droneSurvey.delete({
        where: { survey_id: surveyId }
    });

    return survey;
};

module.exports = { createSurvey, getAllSurveys, getSurveyById, updateSurvey, deleteSurvey };
