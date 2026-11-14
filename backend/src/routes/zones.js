import express from 'express';
import { getZones } from '../controllers/incidentsController.js';
const router = express.Router();
router.get('/', getZones);
export default router;
