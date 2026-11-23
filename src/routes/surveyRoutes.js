const express = require("express");
const router = express.Router();

const {validateCreateSurvey} = require('../middleware/validateMiddleware');
const { createSurvey, getAllSurveys, getSurveyById, updateSurvey, deleteSurvey } = require("../controllers/surveyController");

router.post('/', validateCreateSurvey, createSurvey);
router.get('/', getAllSurveys);
router.get('/:id', getSurveyById);
router.put('/:id', updateSurvey);
router.delete('/:id', deleteSurvey);

module.exports = router;

// all survey routes are done