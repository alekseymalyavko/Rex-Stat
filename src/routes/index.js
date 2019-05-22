import express from 'express';
import stats from './stats.js';
import auth from './auth.js';

const router = express.Router();

router.use('/api/auth', auth);
router.use('/api/stats', stats);

export default router;
