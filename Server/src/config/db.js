import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store database in a persistent data directory or server root
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'brainbytz.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency & performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      college TEXT NOT NULL,
      department TEXT NOT NULL,
      year TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_number INTEGER NOT NULL UNIQUE,
      category TEXT NOT NULL,
      question_text TEXT NOT NULL,
      code_snippet TEXT,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      participant_id INTEGER NOT NULL,
      started_at DATETIME NOT NULL,
      submitted_at DATETIME,
      score INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 0,
      time_taken_seconds INTEGER DEFAULT 0,
      status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'invalidated', 'abandoned'
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY(participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      selected_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY(question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Initialize default settings if not exist
  const defaultSettings = [
    { key: 'registration_open', value: 'true' },
    { key: 'quiz_live', value: 'true' },
    { key: 'duration_minutes', value: '20' },
    { key: 'college_name', value: 'DMI ENGINEERING COLLEGE' },
    { key: 'college_location', value: 'Kumarapuram Road, Aralvaimozhi, Kanyakumari Dist-629301, Tamil Nadu' },
    { key: 'symposium_title', value: 'XENORAZZ 2K26' },
    { key: 'symposium_subtitle', value: 'A National Level Technical Symposium • Department of CSE' },
    { key: 'competition_title', value: 'BRAIN BYTZ' },
    { key: 'sub_title', value: 'Python • C • C++ • Java' }
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO quiz_settings (key, value) VALUES (?, ?)
  `);

  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value);
  }

  // Seed default admin (admin / admin123 or brainbytz@2026)
  // We'll store a bcrypt hash or standard hash
  const checkAdmin = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  if (checkAdmin.count === 0) {
    // bcrypt hash for "admin123" or "brainbytz@2026"
    // We'll insert default admin with username 'admin'
    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (username, password_hash) 
      VALUES (?, ?)
    `);
    // default bcrypt hash for 'admin@brainbytz' or 'admin123'
    // '$2a$10$w8T9JzNqm1h4u0YdM8K8XeP.fJ.oW6V4n5fL.O7eK3wA/o5l7B8hG'
    // Let's seed via seedQuestions module where bcrypt is available
  }
}

export default db;
