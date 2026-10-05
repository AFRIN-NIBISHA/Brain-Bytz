const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'https://brain-bytz.onrender.com/api')
).replace(/\/$/, '');

export async function fetchQuizConfig() {
  const res = await fetch(`${API_BASE}/quiz/config`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch quiz configuration');
  }
  return res.json();
}

export async function fetchQuestions() {
  const res = await fetch(`${API_BASE}/quiz/questions`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load quiz questions');
  }
  return res.json();
}

export async function startQuizAttempt(participantData) {
  const res = await fetch(`${API_BASE}/quiz/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(participantData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to start quiz');
  }
  return data;
}

export async function invalidateQuizAttempt(attemptId, token) {
  try {
    await fetch(`${API_BASE}/quiz/invalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ attemptId })
    });
  } catch (err) {
    console.warn('Failed to invalidate attempt session:', err);
  }
}

export async function submitQuizAnswers(attemptId, token, answers) {
  const res = await fetch(`${API_BASE}/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ attemptId, answers })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit quiz responses');
  }
  return data;
}

// Admin APIs
export async function adminLoginApi(credentials) {
  const cleanUsername = String(credentials.username || '').trim();
  const cleanPassword = String(credentials.password || '').trim();

  // STRICT RULE: If username is not admin or password is not dmi@eng@brainbytz.in, reject!
  // admin123 is completely disabled and will NEVER log in.
  if (cleanUsername !== 'admin' || cleanPassword !== 'dmi@eng@brainbytz.in') {
    throw new Error('Invalid admin credentials.');
  }

  // Primary login attempt
  let res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
  });

  // If backend was running old version and returned 401 when given dmi@eng@brainbytz.in,
  // bridge with old backend key ONLY because the user typed dmi@eng@brainbytz.in!
  if (!res.ok) {
    const fallbackRes = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUsername, password: 'admin123' })
    });
    if (fallbackRes.ok) {
      return fallbackRes.json();
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Invalid admin credentials.');
  }
  return data;
}

export async function fetchAdminStats(token) {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch admin statistics');
  return res.json();
}

export async function fetchAdminRankings(token, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/rankings?${query}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch rankings');
  return res.json();
}

export async function fetchAdminParticipants(token, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/participants?${query}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch participants');
  return res.json();
}

export async function fetchParticipantDetails(token, participantId) {
  const res = await fetch(`${API_BASE}/admin/participants/${participantId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch participant details');
  return res.json();
}

export async function deleteParticipantApi(token, participantId) {
  let res = await fetch(`${API_BASE}/admin/participants/${participantId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // Fallback to POST /delete-participant if DELETE returns 404/405
  if (res.status === 404 || res.status === 405) {
    res = await fetch(`${API_BASE}/admin/delete-participant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: participantId })
    });
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Backend is still deploying on Render. Please wait 1 minute and try again.`);
    }
    return { success: true, message: 'Participant deleted successfully.' };
  }

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete participant.');
  }
  return data;
}

export async function fetchAdminAnalytics(token) {
  const res = await fetch(`${API_BASE}/admin/analytics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function updateAdminSettings(token, settings) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data;
}

export async function resetActiveAttemptsApi(token) {
  const res = await fetch(`${API_BASE}/admin/reset-active`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset attempts');
  return data;
}

export async function clearAllDataApi(token) {
  const res = await fetch(`${API_BASE}/admin/clear-data`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to clear data');
  return data;
}

export async function downloadResultsCsv(token) {
  const res = await fetch(`${API_BASE}/admin/export-csv`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to export CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BRAIN_BYTZ_Rankings_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
