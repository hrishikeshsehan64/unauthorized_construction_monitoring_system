const express = require("express");

const {
    createInvestigation,
    getAllInvestigations,
    getInvestigationById,
    updateInvestigation,
    deleteInvestigation
} = require("../controllers/investigationController");

const router = express.Router();

router.post("/", createInvestigation);
router.get("/", getAllInvestigations);
router.get("/:id", getInvestigationById);
router.put("/:id", updateInvestigation);
router.delete("/:id", deleteInvestigation);

module.exports = router;