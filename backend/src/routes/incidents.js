import express from 'express';
import { getIncidents } from '../controllers/incidentsController.js';
const router = express.Router();
router.get('/', getIncidents);
export default router;
