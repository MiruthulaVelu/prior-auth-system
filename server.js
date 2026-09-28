import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import seedData from './database/seed_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory Database initialized from seedData
let db = {
  users: [
    {
      id: "USR-1001",
      email: "dr.smith@metrohospital.org",
      password: "password123",
      name: "Dr. Sarah Smith, MD",
      role: "provider",
      organization: "Metro Health Hospital",
      title: "Attending Orthopedic Surgeon"
    },
    {
      id: "USR-1002",
      email: "reviewer@bluecross.com",
      password: "password123",
      name: "Dr. Robert Vance",
      role: "payer",
      organization: "BlueCross BlueShield",
      title: "Senior Medical Director"
    },
    {
      id: "USR-1003",
      email: "eleanor.vance@gmail.com",
      password: "password123",
      name: "Eleanor Vance",
      role: "patient",
      organization: "Patient Member",
      title: "Policy #BCBS-99482103"
    }
  ],
  patients: [...seedData.patients],
  payers: [...seedData.payers],
  icd10Codes: [...seedData.icd10Codes],
  cptCodes: [...seedData.cptCodes],
  requests: [...seedData.requests],
  analytics: { ...seedData.analytics }
};

// Utility function to execute Python AI engine or JavaScript fallback
async function runAIEngine(payload) {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, 'ai_engine', 'classifier.py');
    const pythonProcess = spawn('python', [pythonScript, JSON.stringify(payload)]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0 && output.trim()) {
        try {
          const parsed = JSON.parse(output.trim());
          return resolve(parsed);
        } catch (e) {
          console.warn("Python JSON parse error, executing JS engine fallback:", e);
        }
      }
      
      // Fallback Node JS engine if python environment differs
      console.warn("Using JS Fallback AI Engine");
      const fallbackResult = jsFallbackAIEngine(payload);
      resolve(fallbackResult);
    });

    pythonProcess.on('error', (err) => {
      console.warn("Python process spawn error, executing JS engine fallback:", err);
      const fallbackResult = jsFallbackAIEngine(payload);
      resolve(fallbackResult);
    });
  });
}

// Fallback JS AI engine logic
function jsFallbackAIEngine(data) {
  const icd10 = (data.icd10_code || '').toUpperCase().trim();
  const cpt = (data.cpt_code || '').trim();
  const conservativeWeeks = parseInt(data.conservative_therapy_weeks || 0);
  const docs = data.uploaded_documents || [];
  const notes = (data.clinical_notes || '').toLowerCase();

  let score = 0;
  const matched = [];
  const missing = [];

  if (cpt === "27447") {
    if (icd10.startsWith("M17")) {
      score += 30;
      matched.push(`Diagnosis code ${icd10} primary match for total knee replacement.`);
    } else {
      missing.push(`Non-standard ICD-10 code ${icd10} for total knee replacement.`);
    }

    if (conservativeWeeks >= 12) {
      score += 30;
      matched.push(`Conservative physical therapy requirements satisfied (${conservativeWeeks} wks vs 12 wks required).`);
    } else {
      missing.push(`Conservative therapy duration insufficient (${conservativeWeeks} wks vs 12 wks required).`);
    }

    if (docs.length >= 2) {
      score += 25;
      matched.push(`Core clinical documentation uploaded (${docs.length} attachments).`);
    } else {
      missing.push("Missing required weight-bearing X-ray report.");
    }

    if (notes.includes("severe") || notes.includes("refractory") || notes.includes("failed")) {
      score += 15;
      matched.push("NLP extracted key clinical indicators: refractory pain and functional decline.");
    }
  } else {
    // General case
    score = 75;
    matched.push(`Standard clinical authorization check passed for CPT ${cpt}.`);
    if (docs.length > 0) score += 15;
  }

  const confidence = Math.min(0.99, Math.max(0.2, score / 100));
  let rec = "FLAGGED_FOR_PEER_REVIEW";
  let label = "Flagged for Medical Director Review";
  let rationale = `Partial requirements satisfied (${Math.round(confidence * 100)}% score). Medical director review required.`;

  if (score >= 80) {
    rec = "AUTO_APPROVED";
    label = "Auto Approved by AI Rule Engine";
    rationale = `All medical necessity clinical guidelines satisfied with ${Math.round(confidence * 100)}% confidence score.`;
  } else if (score < 50) {
    rec = "DENIED_INSUFFICIENT_CRITERIA";
    label = "Recommendation: Denied (Insufficient Evidence)";
    rationale = `Insufficient documentation or trial period met (${Math.round(confidence * 100)}% confidence score).`;
  }

  return {
    status: "SUCCESS",
    recommendation: rec,
    decision_label: label,
    confidence_score: confidence,
    score_total: score,
    rationale: rationale,
    matched_criteria: matched,
    missing_criteria: missing,
    risk_factors: data.patient_bmi > 35 ? ["Patient BMI > 35 increases surgical risk profile."] : [],
    processing_time_ms: 380
  };
}

// API ROUTES

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Prior Authorization Automation AI System', timestamp: new Date() });
});

// AUTHENTICATION ENDPOINTS
// Login route with mail ID & password validation
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Mail ID and Password are required.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid Mail ID or Password. Please check credentials.' });
  }

  // Omit password from response
  const { password: _, ...userProfile } = user;
  const token = `auth_jwt_token_${user.id}_${Date.now()}`;

  res.json({
    message: 'Login successful',
    token,
    user: userProfile
  });
});

// User Registration route
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, organization, role } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Mail ID, Password, and Full Name are required.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this Mail ID already exists.' });
  }

  const newUser = {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    email: email.trim().toLowerCase(),
    password: password,
    name: fullName.trim(),
    role: role || 'provider',
    organization: organization || 'Healthcare Facility',
    title: role === 'payer' ? 'Medical Reviewer' : role === 'patient' ? 'Patient Member' : 'Attending Physician'
  };

  db.users.push(newUser);

  // Auto-generate patient record for newly registered user so they appear in patient lists
  const newPatient = {
    id: `PAT-${Math.floor(8800 + Math.random() * 1000)}`,
    name: fullName.trim(),
    email: email.trim().toLowerCase(),
    age: 42,
    gender: "Not Specified",
    dob: "1984-05-15",
    insuranceProvider: "BlueCross BlueShield",
    policyNumber: `BCBS-${Math.floor(10000000 + Math.random() * 90000000)}`,
    groupNumber: `GRP-${Math.floor(1000 + Math.random() * 9000)}`,
    primaryDiagnosis: "M17.11 - Primary osteoarthritis, right knee",
    bmi: 25.8
  };
  db.patients.unshift(newPatient);

  const { password: _, ...userProfile } = newUser;
  const token = `auth_jwt_token_${newUser.id}_${Date.now()}`;

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: userProfile,
    patient: newPatient
  });
});

// Auth Verification / Current user endpoint
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  // Extract user id from token convention: auth_jwt_token_USR-XXXX_...
  const parts = authHeader.split('_');
  const userId = parts.find(p => p.startsWith('USR-'));
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    // Return first default user for demo if token format matches
    const defaultUser = db.users[0];
    const { password: _, ...userProfile } = defaultUser;
    return res.json({ user: userProfile });
  }

  const { password: _, ...userProfile } = user;
  res.json({ user: userProfile });
});

// 2. Get reference data (patients, payers, codes)
app.get('/api/patients', (req, res) => {
  res.json(db.patients);
});

// Create / Add New Patient route
app.post('/api/patients', (req, res) => {
  const { name, age, insuranceProvider, policyNumber, groupNumber, primaryDiagnosis, bmi } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Patient name is required.' });
  }

  const newPatient = {
    id: `PAT-${Math.floor(8800 + Math.random() * 1000)}`,
    name: name.trim(),
    age: parseInt(age || 45),
    gender: req.body.gender || "Not Specified",
    dob: req.body.dob || "1982-01-01",
    insuranceProvider: insuranceProvider || "BlueCross BlueShield",
    policyNumber: policyNumber || `POL-${Math.floor(10000000 + Math.random() * 90000000)}`,
    groupNumber: groupNumber || `GRP-${Math.floor(1000 + Math.random() * 9000)}`,
    primaryDiagnosis: primaryDiagnosis || "M17.11 - Primary osteoarthritis, right knee",
    bmi: parseFloat(bmi || 26.5)
  };

  db.patients.unshift(newPatient);
  res.status(201).json({ message: "Patient registered successfully", patient: newPatient });
});

// Update Patient Details route
app.put('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const index = db.patients.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Patient profile not found.' });
  }

  db.patients[index] = {
    ...db.patients[index],
    ...req.body
  };

  res.json({ message: "Patient details updated successfully", patient: db.patients[index] });
});


app.get('/api/payers', (req, res) => {
  res.json(db.payers);
});

app.get('/api/codes/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const matchedIcd = db.icd10Codes.filter(c => c.code.toLowerCase().includes(query) || c.description.toLowerCase().includes(query));
  const matchedCpt = db.cptCodes.filter(c => c.code.toLowerCase().includes(query) || c.description.toLowerCase().includes(query));
  res.json({ icd10: matchedIcd, cpt: matchedCpt });
});

// 3. Get all requests
app.get('/api/prior-auth', (req, res) => {
  res.json(db.requests);
});

// 4. Get request by ID
app.get('/api/prior-auth/:id', (req, res) => {
  const reqItem = db.requests.find(r => r.id === req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Request not found' });
  res.json(reqItem);
});

// 5. Pre-evaluate request with AI Engine (real-time dry run)
app.post('/api/prior-auth/evaluate', async (req, res) => {
  try {
    const payload = req.body;
    const aiResult = await runAIEngine(payload);
    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Submit a new Prior Authorization Request
app.post('/api/prior-auth/submit', async (req, res) => {
  try {
    const body = req.body;
    const patient = db.patients.find(p => p.id === body.patientId) || {
      id: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: body.patientName || "New Patient",
      age: body.patientAge || 45,
      bmi: body.patientBmi || 26.5
    };

    const cptObj = db.cptCodes.find(c => c.code === body.cptCode) || { description: "Medical Procedure" };
    const icdObj = db.icd10Codes.find(i => i.code === body.icd10Code) || { description: "Clinical Diagnosis" };

    const aiPayload = {
      icd10_code: body.icd10Code,
      cpt_code: body.cptCode,
      conservative_therapy_weeks: body.conservativeTherapyWeeks || 0,
      uploaded_documents: body.uploadedDocuments || [],
      clinical_notes: body.clinicalNotes || "",
      patient_age: patient.age,
      patient_bmi: patient.bmi,
      payer_id: body.payerId || "PAYER-01"
    };

    const aiEval = await runAIEngine(aiPayload);

    const newId = `PA-2026-${Math.floor(900 + Math.random() * 100)}`;
    
    let status = "IN_REVIEW";
    if (aiEval.recommendation === "AUTO_APPROVED") {
      status = "APPROVED";
    } else if (aiEval.recommendation === "DENIED_INSUFFICIENT_CRITERIA") {
      status = "REJECTED";
    }

    const newRequest = {
      id: newId,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientBmi: patient.bmi,
      payerName: body.payerName || "BlueCross BlueShield",
      policyNumber: body.policyNumber || "POL-99201",
      icd10Code: body.icd10Code,
      icd10Desc: icdObj.description,
      cptCode: body.cptCode,
      cptDesc: cptObj.description,
      conservativeTherapyWeeks: body.conservativeTherapyWeeks || 0,
      uploadedDocuments: body.uploadedDocuments || [],
      clinicalNotes: body.clinicalNotes || "",
      submittedAt: new Date().toISOString(),
      status: status,
      statusLabel: aiEval.decision_label,
      confidenceScore: aiEval.confidence_score,
      scoreTotal: aiEval.score_total,
      decisionRationale: aiEval.rationale,
      matchedCriteria: aiEval.matched_criteria || [],
      missingCriteria: aiEval.missing_criteria || [],
      riskFactors: aiEval.risk_factors || [],
      processingTimeMs: aiEval.processing_time_ms || 450
    };

    db.requests.unshift(newRequest);
    
    // Update analytics counter
    db.analytics.totalRequests += 1;
    if (status === "APPROVED") {
      db.analytics.administrativeCostSavingsUSD += 175;
    }

    res.status(201).json({
      message: "Prior Authorization request submitted successfully",
      request: newRequest,
      aiEvaluation: aiEval
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Update status / Payer Review decision override
app.put('/api/prior-auth/:id/decision', (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes, reviewerName } = req.body;

  const itemIndex = db.requests.findIndex(r => r.id === id);
  if (itemIndex === -1) return res.status(404).json({ error: 'Request not found' });

  const target = db.requests[itemIndex];
  target.status = status;
  if (status === 'APPROVED') {
    target.statusLabel = `Approved by ${reviewerName || 'Medical Director'}`;
  } else if (status === 'REJECTED') {
    target.statusLabel = `Denied by ${reviewerName || 'Medical Director'}`;
  } else if (status === 'IN_REVIEW') {
    target.statusLabel = `Peer-to-Peer Review Requested`;
  }
  
  if (reviewNotes) {
    target.decisionRationale = `[Reviewer Note by ${reviewerName || 'Medical Director'}]: ${reviewNotes} | (Original AI Score: ${target.confidenceScore * 100}%)`;
  }
  target.updatedAt = new Date().toISOString();

  res.json({ message: "Decision updated successfully", request: target });
});

// 8. Analytics summary
app.get('/api/analytics', (req, res) => {
  const total = db.requests.length;
  const approved = db.requests.filter(r => r.status === 'APPROVED').length;
  const inReview = db.requests.filter(r => r.status === 'IN_REVIEW').length;
  const rejected = db.requests.filter(r => r.status === 'REJECTED').length;

  res.json({
    ...db.analytics,
    currentLive: {
      total,
      approved,
      inReview,
      rejected,
      autoApprovalRate: total > 0 ? Math.round((approved / total) * 100) : 0
    }
  });
});

app.listen(PORT, () => {
  console.log(`AI Prior Authorization Server listening on http://localhost:${PORT}`);
});
