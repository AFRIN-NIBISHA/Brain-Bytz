import express from 'express';
import { getQuizConfig, getQuestions, startQuiz, invalidateAttempt, submitQuiz } from '../controllers/quizController.js';
import { verifyAttemptToken } from '../middleware/auth.js';

const router = express.Router();

// Public config & questions
router.get('/config', getQuizConfig);
router.get('/questions', getQuestions);

// Quiz flow
router.post('/start', startQuiz);
router.post('/invalidate', invalidateAttempt);
router.post('/submit', verifyAttemptToken, submitQuiz);

export default router;
