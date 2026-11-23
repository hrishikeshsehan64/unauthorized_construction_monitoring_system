const surveyService = require("../services/surveyService");

const createSurvey = async (req, res, next) => {
    try {
        const newSurvey = await surveyService.createSurvey(req.body);
        res.status(201).json(newSurvey);
    } catch (error) {
        next(error);
    }
};
const getAllSurveys = async (req, res, next) => {
    try {
        const surveys = await surveyService.getAllSurveys();
        res.status(200).json(surveys);
    } catch (error) {
        next(error);
    }
};
const getSurveyById = async (req, res, next) => {
    try {
        const survey = await surveyService.getSurveyById(req.params.id);
        res.status(200).json(survey);
    } catch (error) {
        next(error);
    }
};
const updateSurvey = async (req, res, next) => {
    try {
        const updatedSurvey = await surveyService.updateSurvey(req.params.id, req.body);
        res.status(200).json(updatedSurvey);
    } catch (error) {
        next(error);
    }
};

const deleteSurvey = async (req, res, next) => {
    try {
        const deletedSurvey = await surveyService.deleteSurvey(req.params.id);
        res.status(200).json(deletedSurvey);
    } catch (error) {
        next(error);
    }
};

module.exports = { createSurvey, getAllSurveys, getSurveyById, updateSurvey, deleteSurvey };