import crypto from 'crypto';
import db from '../config/db.js';
import { generateAttemptToken } from '../middleware/auth.js';

// Get Public Quiz Status and Settings
export function getQuizConfig(req, res) {
  try {
    const settingsRows = db.prepare('SELECT key, value FROM quiz_settings').all();
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.key] = row.value;
    });

    const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;

    return res.json({
      registrationOpen: settings.registration_open === 'true',
      quizLive: settings.quiz_live === 'true',
      durationMinutes: parseInt(settings.duration_minutes || '20', 10),
      totalQuestions: totalQuestions || 25,
      title: settings.competition_title || 'BRAIN BYTZ',
      subtitle: settings.sub_title || 'Python • C • C++ • Java'
    });
  } catch (error) {
    console.error('Error fetching quiz config:', error);
    return res.status(500).json({ error: 'Failed to retrieve quiz configuration.' });
  }
}

// Get All Questions for Participant (STRICTLY WITHOUT ANSWERS)
export function getQuestions(req, res) {
  try {
    const questions = db.prepare(`
      SELECT 
        id, 
        question_number, 
        category, 
        question_text, 
        code_snippet, 
        option_a, 
        option_b, 
        option_c, 
        option_d
      FROM questions 
      ORDER BY question_number ASC
    `).all();

    return res.json({
      success: true,
      total: questions.length,
      questions: questions.map(q => ({
        id: q.id,
        questionNumber: q.question_number,
        category: q.category,
        question: q.question_text,
        codeSnippet: q.code_snippet,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to load questions.' });
  }
}

// Start Quiz Attempt (Registration & Attempt Initialization with Deduplication)
export function startQuiz(req, res) {
  try {
    const { name, college, department, year } = req.body;

    if (!name || !college || !department || !year) {
      return res.status(400).json({ error: 'All fields (Name, College, Department, Year) are required.' });
    }

    const trimmedName = name.trim();
    const trimmedCollege = college.trim();
    const trimmedDept = department.trim();
    const trimmedYear = year.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name.' });
    }

    // Check quiz settings
    const regSetting = db.prepare("SELECT value FROM quiz_settings WHERE key = 'registration_open'").get();
    const liveSetting = db.prepare("SELECT value FROM quiz_settings WHERE key = 'quiz_live'").get();
    const durationSetting = db.prepare("SELECT value FROM quiz_settings WHERE key = 'duration_minutes'").get();

    if (regSetting && regSetting.value !== 'true') {
      return res.status(403).json({ error: 'Registration is currently closed by the organizers.' });
    }

    if (liveSetting && liveSetting.value !== 'true') {
      return res.status(403).json({ error: 'The quiz is not currently active. Please wait for the event organizer.' });
    }

    const durationMinutes = parseInt(durationSetting ? durationSetting.value : '20', 10);

    // Check if participant already exists (match name, college, department)
    const existingParticipant = db.prepare(`
      SELECT id, name, college, department, year 
      FROM participants 
      WHERE LOWER(TRIM(name)) = LOWER(?) 
        AND LOWER(TRIM(college)) = LOWER(?) 
        AND LOWER(TRIM(department)) = LOWER(?)
      LIMIT 1
    `).get(trimmedName, trimmedCollege, trimmedDept);

    let participantId;

    if (existingParticipant) {
      participantId = existingParticipant.id;

      // Check if participant has already submitted and completed
      const completedAttempt = db.prepare(`
        SELECT id, score FROM quiz_attempts 
        WHERE participant_id = ? AND status = 'completed'
        LIMIT 1
      `).get(participantId);

      if (completedAttempt) {
        return res.status(403).json({
          error: 'You have already completed and submitted your quiz attempt. Resubmissions are not permitted.'
        });
      }

      // Mark any prior abandoned/in_progress attempt as abandoned
      db.prepare(`
        UPDATE quiz_attempts 
        SET status = 'abandoned' 
        WHERE participant_id = ? AND status = 'in_progress'
      `).run(participantId);

      // Update participant's year/college if changed
      db.prepare(`
        UPDATE participants 
        SET year = ?, college = ?, name = ?
        WHERE id = ?
      `).run(trimmedYear, trimmedCollege, trimmedName, participantId);

    } else {
      // Insert new unique participant
      const insertParticipant = db.prepare(`
        INSERT INTO participants (name, college, department, year)
        VALUES (?, ?, ?, ?)
      `);
      const participantResult = insertParticipant.run(trimmedName, trimmedCollege, trimmedDept, trimmedYear);
      participantId = participantResult.lastInsertRowid;
    }

    // Generate unique Attempt ID
    const attemptId = `bb_att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startedAt = new Date().toISOString();
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Insert Quiz Attempt
    const insertAttempt = db.prepare(`
      INSERT INTO quiz_attempts (id, participant_id, started_at, status, ip_address, user_agent)
      VALUES (?, ?, ?, 'in_progress', ?, ?)
    `);
    insertAttempt.run(attemptId, participantId, startedAt, ipAddress, userAgent);

    // Sign attempt token
    const attemptToken = generateAttemptToken({
      attemptId,
      participantId,
      startedAt
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz started successfully.',
      attemptId,
      attemptToken,
      startedAt,
      durationMinutes,
      participant: {
        id: participantId,
        name: trimmedName,
        college: trimmedCollege,
        department: trimmedDept,
        year: trimmedYear
      }
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return res.status(500).json({ error: 'Failed to start quiz attempt.' });
  }
}

// Invalidate Attempt (Participant Left / Tab Closed / Session Cancelled)
export function invalidateAttempt(req, res) {
  try {
    const attemptId = req.attempt?.attemptId || req.body.attemptId;

    if (!attemptId) {
      return res.status(400).json({ error: 'Attempt ID required.' });
    }

    const attempt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ?').get(attemptId);
    if (attempt && attempt.status === 'in_progress') {
      db.prepare("UPDATE quiz_attempts SET status = 'invalidated' WHERE id = ?").run(attemptId);
    }

    return res.json({
      success: true,
      message: 'Attempt session invalidated.'
    });
  } catch (error) {
    console.error('Error invalidating attempt:', error);
    return res.status(500).json({ error: 'Failed to invalidate attempt.' });
  }
}

// Submit Quiz (Backend Evaluation & Scoring)
export function submitQuiz(req, res) {
  try {
    const attemptId = req.attempt?.attemptId || req.body.attemptId;
    const { answers } = req.body; // Array of { questionId: number, selectedAnswer: 'A' | 'B' | 'C' | 'D' }

    if (!attemptId) {
      return res.status(400).json({ error: 'Valid attempt session required.' });
    }

    const attempt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ?').get(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found.' });
    }

    if (attempt.status === 'completed') {
      return res.json({
        success: true,
        message: 'Quiz completed. Your responses have already been recorded successfully.'
      });
    }

    if (attempt.status === 'invalidated') {
      return res.status(403).json({ error: 'This quiz attempt was invalidated due to session expiration or anti-cheat rules.' });
    }

    // Fetch all questions with correct answers from DB
    const allQuestions = db.prepare('SELECT id, question_number, correct_answer FROM questions ORDER BY question_number ASC').all();

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;

    const submittedAnswers = Array.isArray(answers) ? answers : [];
    const submittedMap = new Map();
    submittedAnswers.forEach(ans => {
      if (ans && (ans.questionId !== undefined || ans.questionNumber !== undefined)) {
        const key = Number(ans.questionId !== undefined ? ans.questionId : ans.questionNumber);
        submittedMap.set(key, String(ans.selectedAnswer || '').toUpperCase().trim());
      }
    });

    // Delete any previously recorded partial answers for this attempt
    db.prepare('DELETE FROM answers WHERE attempt_id = ?').run(attemptId);

    const insertAnswer = db.prepare(`
      INSERT INTO answers (attempt_id, question_id, selected_answer, is_correct)
      VALUES (?, ?, ?, ?)
    `);

    const evaluateTransaction = db.transaction(() => {
      for (const q of allQuestions) {
        // Look up by database id or question_number
        const selected = submittedMap.get(q.id) || submittedMap.get(q.question_number) || '';
        const correct = q.correct_answer.toUpperCase().trim();
        const isCorrect = selected && selected === correct ? 1 : 0;

        if (isCorrect) {
          score += 1;
          correctCount += 1;
        } else {
          wrongCount += 1;
        }

        insertAnswer.run(attemptId, q.id, selected || 'UNANSWERED', isCorrect);
      }

      // Calculate time taken
      const startedAtTime = new Date(attempt.started_at).getTime();
      const submittedAtTime = Date.now();
      const timeTakenSeconds = Math.max(1, Math.round((submittedAtTime - startedAtTime) / 1000));
      const submittedAtStr = new Date(submittedAtTime).toISOString();

      // Update quiz_attempts record
      db.prepare(`
        UPDATE quiz_attempts 
        SET 
          submitted_at = ?,
          score = ?,
          correct_count = ?,
          wrong_count = ?,
          time_taken_seconds = ?,
          status = 'completed'
        WHERE id = ?
      `).run(submittedAtStr, score, correctCount, wrongCount, timeTakenSeconds, attemptId);
    });

    evaluateTransaction();

    // STRICT ANTI-CHEATING RULE: NEVER send score, rank, or correct answers back to participant!
    return res.json({
      success: true,
      message: 'QUIZ COMPLETED. Thank you for participating in BRAIN BYTZ. Your responses have been recorded successfully.'
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return res.status(500).json({ error: 'Failed to record quiz submission.' });
  }
}
