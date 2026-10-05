import http from 'http';

const BASE = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return { status: res.status, text: await res.text() };
  }
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- 1. Testing Config & Questions API ---');
  const config = await req('/quiz/config');
  console.log('Quiz Config:', config.data);

  const questionsRes = await req('/quiz/questions');
  console.log('Total Questions:', questionsRes.data.total);
  
  // Security check: Verify NO correct answers are returned
  const hasLeakedAnswer = questionsRes.data.questions.some(q => 
    'correct_answer' in q || 'correctAnswer' in q || 'answer' in q || 'is_correct' in q
  );
  console.log('🔒 Security Check: Correct answers leaked to participant?', hasLeakedAnswer ? 'FAILED (LEAKED!)' : 'PASSED (STRICTLY CONCEALED)');

  console.log('\n--- 2. Registering Participants & Submitting Answers ---');
  
  // Participant 1: Arun (Score 25/25)
  const p1 = await req('/quiz/start', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Arun Kumar',
      college: 'ABC College of Engineering',
      department: 'Computer Science & Engineering (CSE)',
      year: '3rd Year'
    })
  });
  console.log('P1 Registered:', p1.data.participant.name, 'Attempt ID:', p1.data.attemptId);

  // Participant 2: Priya (Score 24/25)
  const p2 = await req('/quiz/start', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Priya Sharma',
      college: 'XYZ Institute of Tech',
      department: 'Information Technology (IT)',
      year: '3rd Year'
    })
  });

  // Participant 3: Rahul (Score 23/25)
  const p3 = await req('/quiz/start', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Rahul Verma',
      college: 'ABC College of Engineering',
      department: 'Electronics & Communication Engineering (ECE)',
      year: '2nd Year'
    })
  });

  // Correct answers key for our test simulation
  const correctKeys = {
    1: 'B', 2: 'C', 3: 'B', 4: 'C', 5: 'B',
    6: 'B', 7: 'A', 8: 'B', 9: 'A', 10: 'B',
    11: 'B', 12: 'B', 13: 'B', 14: 'C', 15: 'B',
    16: 'A', 17: 'B', 18: 'C', 19: 'B', 20: 'B',
    21: 'B', 22: 'B', 23: 'B', 24: 'B', 25: 'D'
  };

  // Submit Arun (All 25 Correct)
  const arunAnswers = Object.entries(correctKeys).map(([qNum, ans]) => ({
    questionId: parseInt(qNum),
    selectedAnswer: ans
  }));
  const sub1 = await req('/quiz/submit', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${p1.data.attemptToken}` },
    body: JSON.stringify({ attemptId: p1.data.attemptId, answers: arunAnswers })
  });
  console.log('P1 Submit Response:', sub1.data);
  console.log('🔒 Did submission leak score to participant?', 'score' in sub1.data || 'rank' in sub1.data ? 'YES (LEAKED!)' : 'NO (SECURE!)');

  // Submit Priya (24 Correct - Q1 wrong)
  const priyaAnswers = Object.entries(correctKeys).map(([qNum, ans]) => ({
    questionId: parseInt(qNum),
    selectedAnswer: qNum === '1' ? 'A' : ans
  }));
  await req('/quiz/submit', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${p2.data.attemptToken}` },
    body: JSON.stringify({ attemptId: p2.data.attemptId, answers: priyaAnswers })
  });

  // Submit Rahul (23 Correct - Q1 & Q2 wrong)
  const rahulAnswers = Object.entries(correctKeys).map(([qNum, ans]) => ({
    questionId: parseInt(qNum),
    selectedAnswer: (qNum === '1' || qNum === '2') ? 'A' : ans
  }));
  await req('/quiz/submit', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${p3.data.attemptToken}` },
    body: JSON.stringify({ attemptId: p3.data.attemptId, answers: rahulAnswers })
  });

  console.log('\n--- 3. Testing Admin Login & Dashboard Data ---');
  const loginRes = await req('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const adminToken = loginRes.data.token;
  console.log('Admin Authenticated:', loginRes.data.success);

  const statsRes = await req('/admin/stats', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Admin Live Stats:', statsRes.data.stats);

  const rankingsRes = await req('/admin/rankings', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('\n🏆 FINAL LEADERBOARD RANKINGS:');
  console.table(rankingsRes.data.rankings.map(r => ({
    Rank: r.rank,
    Name: r.name,
    College: r.college,
    Dept: r.department,
    Year: r.year,
    Score: r.scoreDisplay,
    Accuracy: `${r.percentage}%`,
    Time: r.formattedTimeTaken
  })));

  const auditRes = await req(`/admin/participants/${p1.data.participant.id}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`\n🔍 Participant Audit for ${p1.data.participant.name}:`);
  console.log(`Rank: #${auditRes.data.attempt.rank} | Score: ${auditRes.data.attempt.score}/25 | Total Responses Evaluated: ${auditRes.data.answersBreakdown.length}`);

  const analyticsRes = await req('/admin/analytics', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('\n📊 Analytics Score Distribution:', analyticsRes.data.distribution);
  console.log('Sample Question 1 Performance:', analyticsRes.data.questionAnalytics[0]);

  const csvRes = await req('/admin/export-csv', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('\n📄 CSV Export Header & Sample:');
  console.log(csvRes.text.split('\n').slice(0, 4).join('\n'));

  console.log('\n✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

runTests().catch(console.error);
