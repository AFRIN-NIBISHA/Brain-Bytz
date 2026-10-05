import express from 'express';
import {
  adminLogin,
  getStats,
  getRankings,
  getParticipants,
  getParticipantDetails,
  deleteParticipant,
  getAnalytics,
  updateSettings,
  resetActiveAttempts,
  clearData,
  exportCSV
} from '../controllers/adminController.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Admin Authentication
router.post('/login', adminLogin);

// Protected Admin Routes
router.get('/stats', verifyAdminToken, getStats);
router.get('/rankings', verifyAdminToken, getRankings);
router.get('/participants', verifyAdminToken, getParticipants);
router.get('/participants/:id', verifyAdminToken, getParticipantDetails);
router.delete('/participants/:id', verifyAdminToken, deleteParticipant);
router.get('/analytics', verifyAdminToken, getAnalytics);
router.put('/settings', verifyAdminToken, updateSettings);
router.post('/reset-active', verifyAdminToken, resetActiveAttempts);
router.post('/clear-data', verifyAdminToken, clearData);
router.get('/export-csv', verifyAdminToken, exportCSV);

export default router;
