import express from 'express';
import { getInvestigations } from '../controllers/incidentsController.js';
const router = express.Router();
router.get('/', getInvestigations);
export default router;
