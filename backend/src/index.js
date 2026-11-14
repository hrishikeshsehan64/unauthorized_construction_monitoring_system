import 'dotenv/config'; // must be first so env vars exist before other modules read them
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import violationsRouter from './routes/violations.js';
import incidentsRouter from './routes/incidents.js';
import investigationsRouter from './routes/investigations.js';
import zonesRouter from './routes/zones.js';
import { initDb } from './config/db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/violations', violationsRouter);
app.use('/api/investigations', investigationsRouter);
app.use('/api/zones', zonesRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => console.log('Socket connected', socket.id));

const PORT = process.env.PORT || 5001;
const dbOk = await initDb();
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}${dbOk ? '' : '  (no database: API returns 503, frontend shows demo data)'}`));
