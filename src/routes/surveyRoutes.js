const express = require("express");
const router = express.Router();

const {validateCreateSurvey} = require('../middleware/validateMiddleware');
const { createSurvey, getAllSurveys, getSurveyById, updateSurvey } = require("../controllers/surveyController");

router.post('/', validateCreateSurvey, createSurvey);
router.get('/', getAllSurveys);
router.get('/:id', getSurveyById);
router.put('/:id', updateSurvey);

module.exports = router;

// all survey routes are done