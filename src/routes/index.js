import express from 'express';
import stats from './stats.js';

const router = express.Router();

router.use('/api/stats', stats);

export default router;
