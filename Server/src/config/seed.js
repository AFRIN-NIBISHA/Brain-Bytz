import bcrypt from 'bcryptjs';
import db, { initDatabase } from './db.js';

export const questionsData = [
  {
    question_number: 1,
    category: 'Python',
    question_text: 'What will be the output of the following Python code?',
    code_snippet: 'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)',
    option_a: '[1, 2, 3]',
    option_b: '[1, 2, 3, 4]',
    option_c: '[4, 1, 2, 3]',
    option_d: 'Error',
    correct_answer: 'B'
  },
  {
    question_number: 2,
    category: 'C',
    question_text: 'What will be the output of the following C program snippet?',
    code_snippet: 'int a = 10;\nint *p = &a;\nprintf("%d", *p + 5);',
    option_a: '10',
    option_b: '5',
    option_c: '15',
    option_d: 'Address of a',
    correct_answer: 'C'
  },
  {
    question_number: 3,
    category: 'C++',
    question_text: 'Which C++ feature allows multiple functions to have the same name but different parameter lists?',
    code_snippet: null,
    option_a: 'Function overriding',
    option_b: 'Function overloading',
    option_c: 'Encapsulation',
    option_d: 'Inheritance',
    correct_answer: 'B'
  },
  {
    question_number: 4,
    category: 'Java',
    question_text: 'Which keyword prevents a Java class from being inherited?',
    code_snippet: null,
    option_a: 'static',
    option_b: 'private',
    option_c: 'final',
    option_d: 'protected',
    correct_answer: 'C'
  },
  {
    question_number: 5,
    category: 'Python',
    question_text: 'What is the output of the following Python statement?',
    code_snippet: 'print(bool([]), bool([0]))',
    option_a: 'True True',
    option_b: 'False True',
    option_c: 'False False',
    option_d: 'True False',
    correct_answer: 'B'
  },
  {
    question_number: 6,
    category: 'C',
    question_text: 'What happens to a local static variable in C?',
    code_snippet: null,
    option_a: 'It is recreated every function call',
    option_b: 'It retains its value between function calls',
    option_c: 'It can only be declared globally',
    option_d: 'It is always stored in a CPU register',
    correct_answer: 'B'
  },
  {
    question_number: 7,
    category: 'OOP Concepts',
    question_text: 'Which OOP concept hides implementation details and exposes only essential functionality?',
    code_snippet: null,
    option_a: 'Abstraction',
    option_b: 'Inheritance',
    option_c: 'Compilation',
    option_d: 'Recursion',
    correct_answer: 'A'
  },
  {
    question_number: 8,
    category: 'Java / C++',
    question_text: 'Which of the following is automatically invoked when an object is created using the new keyword?',
    code_snippet: null,
    option_a: 'main()',
    option_b: 'Constructor',
    option_c: 'start()',
    option_d: 'finalize()',
    correct_answer: 'B'
  },
  {
    question_number: 9,
    category: 'Python',
    question_text: 'What is the output of the following Python expression?',
    code_snippet: 'print(10 // 3, 10 % 3)',
    option_a: '3 1',
    option_b: '3 0',
    option_c: '3.33 1',
    option_d: '4 1',
    correct_answer: 'A'
  },
  {
    question_number: 10,
    category: 'C',
    question_text: 'Which operator is used to access a structure member through a pointer in C?',
    code_snippet: null,
    option_a: '.',
    option_b: '->',
    option_c: '::',
    option_d: '&',
    correct_answer: 'B'
  },
  {
    question_number: 11,
    category: 'C++',
    question_text: 'Which feature is primarily used to achieve runtime polymorphism in C++?',
    code_snippet: null,
    option_a: 'Function templates',
    option_b: 'Virtual functions',
    option_c: 'Namespaces',
    option_d: 'Friend functions',
    correct_answer: 'B'
  },
  {
    question_number: 12,
    category: 'Java',
    question_text: 'Which Java collection interface/class does not allow duplicate elements?',
    code_snippet: null,
    option_a: 'List',
    option_b: 'Set',
    option_c: 'ArrayList',
    option_d: 'LinkedList',
    correct_answer: 'B'
  },
  {
    question_number: 13,
    category: 'C',
    question_text: 'What is the output of the following C code snippet?',
    code_snippet: 'int x = 10;\nprintf("%d", x++);',
    option_a: '9',
    option_b: '10',
    option_c: '11',
    option_d: 'Error',
    correct_answer: 'B'
  },
  {
    question_number: 14,
    category: 'Python',
    question_text: 'Which of the following data types in Python is immutable?',
    code_snippet: null,
    option_a: 'List',
    option_b: 'Dictionary',
    option_c: 'Tuple',
    option_d: 'Set',
    correct_answer: 'C'
  },
  {
    question_number: 15,
    category: 'C++',
    question_text: 'What is the primary purpose of a destructor?',
    code_snippet: null,
    option_a: 'Initialize an object',
    option_b: 'Release resources when an object is destroyed',
    option_c: 'Create multiple objects',
    option_d: 'Overload operators',
    correct_answer: 'B'
  },
  {
    question_number: 16,
    category: 'Java / OOP',
    question_text: 'Which statement correctly describes method overloading?',
    code_snippet: null,
    option_a: 'Same method name with different parameter lists',
    option_b: 'Same method and parameters in a subclass',
    option_c: 'Changing only the return type',
    option_d: 'Changing only the access modifier',
    correct_answer: 'A'
  },
  {
    question_number: 17,
    category: 'Python',
    question_text: 'What is the output of the following code?',
    code_snippet: 'print(len({1, 1, 2, 3}))',
    option_a: '4',
    option_b: '3',
    option_c: '2',
    option_d: '1',
    correct_answer: 'B'
  },
  {
    question_number: 18,
    category: 'C',
    question_text: 'Which keyword gives a file-scope variable internal linkage in C?',
    code_snippet: null,
    option_a: 'auto',
    option_b: 'register',
    option_c: 'static',
    option_d: 'extern',
    correct_answer: 'C'
  },
  {
    question_number: 19,
    category: 'C++',
    question_text: 'Which C++ cast is used for runtime-checked conversion in a polymorphic class hierarchy?',
    code_snippet: null,
    option_a: 'static_cast',
    option_b: 'dynamic_cast',
    option_c: 'const_cast',
    option_d: 'reinterpret_cast',
    correct_answer: 'B'
  },
  {
    question_number: 20,
    category: 'Java',
    question_text: 'Which keyword is used to invoke the superclass constructor in Java?',
    code_snippet: null,
    option_a: 'this',
    option_b: 'super',
    option_c: 'extends',
    option_d: 'parent',
    correct_answer: 'B'
  },
  {
    question_number: 21,
    category: 'Python',
    question_text: 'What is the main difference between "is" and "==" in Python?',
    code_snippet: null,
    option_a: 'Both compare memory addresses',
    option_b: 'is compares identity, while == compares equality',
    option_c: 'is compares values, while == compares data types',
    option_d: 'Both always compare values',
    correct_answer: 'B'
  },
  {
    question_number: 22,
    category: 'C',
    question_text: 'What does the expression *(arr + 2) represent if arr is an integer array?',
    code_snippet: null,
    option_a: 'Address of the first element',
    option_b: 'Value of the third element',
    option_c: 'Value of the second element',
    option_d: 'Address of the third element',
    correct_answer: 'B'
  },
  {
    question_number: 23,
    category: 'C++',
    question_text: 'Why is a virtual destructor useful in a C++ base class?',
    code_snippet: null,
    option_a: 'It prevents object creation',
    option_b: 'It allows proper destruction of derived objects through a base pointer',
    option_c: 'It makes all methods virtual',
    option_d: 'It prevents inheritance',
    correct_answer: 'B'
  },
  {
    question_number: 24,
    category: 'Java',
    question_text: 'Which combination is required for runtime polymorphism in Java?',
    code_snippet: null,
    option_a: 'Method overloading + static method',
    option_b: 'Method overriding + inheritance',
    option_c: 'Constructor overloading + encapsulation',
    option_d: 'Interface + constructor',
    correct_answer: 'B'
  },
  {
    question_number: 25,
    category: 'Python / General',
    question_text: 'Which statement is TRUE?',
    code_snippet: null,
    option_a: 'Python does not support multiple inheritance',
    option_b: 'C++ does not support function overloading',
    option_c: 'Java supports multiple inheritance through classes',
    option_d: 'Python supports multiple inheritance',
    correct_answer: 'D'
  }
];

export function seedDatabase() {
  initDatabase();

  const count = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;

  if (count !== 25) {
    db.prepare('DELETE FROM questions').run();

    const insertQuestion = db.prepare(`
      INSERT INTO questions (
        id, question_number, category, question_text, code_snippet,
        option_a, option_b, option_c, option_d, correct_answer
      ) VALUES (
        @question_number, @question_number, @category, @question_text, @code_snippet,
        @option_a, @option_b, @option_c, @option_d, @correct_answer
      )
    `);

    const insertMany = db.transaction((questions) => {
      for (const q of questions) {
        insertQuestion.run(q);
      }
    });

    insertMany(questionsData);
    console.log(`[Seed] Seeded ${questionsData.length} questions cleanly.`);
  }

  // 2. Seed / update admin password to "dmi@eng@brainbytz.in"
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('dmi@eng@brainbytz.in', salt);

  const adminUser = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');
  if (!adminUser) {
    db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run(
      'admin',
      passwordHash,
      'superadmin'
    );
    console.log('[Seed] Admin created: username="admin", password="dmi@eng@brainbytz.in"');
  } else {
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(
      passwordHash,
      'admin'
    );
    console.log('[Seed] Admin password updated to: "dmi@eng@brainbytz.in"');
  }

  // 3. Set default duration to 15 mins
  db.prepare("INSERT OR REPLACE INTO quiz_settings (key, value) VALUES ('duration_minutes', '15')").run();
}
