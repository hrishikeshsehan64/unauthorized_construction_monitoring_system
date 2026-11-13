const express = require("express");
const { validateCreateSite, validateUpdateSite} = require("../middleware/validateMIddleware");
const {createSite, updateSite, getAllSites, getSiteById, deleteSite} = require("../controllers/siteController");
const router = express.Router();
router.post('/', validateCreateSite, createSite);
router.get('/', getAllSites);
router.get('/:id', getSiteById);
router.put('/:id', validateUpdateSite, updateSite);
router.delete('/:id', deleteSite);
// all site routes are done