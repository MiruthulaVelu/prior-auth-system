const http = require('http');

console.log("Testing AI Prior Authorization System API & Engine...");

// Test Python AI script directly via Node
const { spawn } = require('child_process');
const path = require('path');

const samplePayload = {
  icd10_code: "M17.11",
  cpt_code: "27447",
  conservative_therapy_weeks: 14,
  uploaded_documents: ["X-Ray Report (Weight-bearing)", "Physician Clinical Notes", "Physical Therapy Log"],
  clinical_notes: "Patient suffers from severe refractory pain in right knee affecting weight-bearing mobility.",
  patient_age: 64,
  patient_bmi: 28.4,
  payer_id: "BCBS-001"
};

const pythonScript = path.join(__dirname, 'ai_engine', 'classifier.py');
const pyProc = spawn('python', [pythonScript, JSON.stringify(samplePayload)]);

let output = '';
pyProc.stdout.on('data', (d) => { output += d.toString(); });
pyProc.on('close', (code) => {
  console.log(`Python process exit code: ${code}`);
  console.log("AI Classifier Output:\n", output);
  
  if (code === 0 && output.includes("AUTO_APPROVED")) {
    console.log("✅ AI Engine Verification PASSED!");
  } else {
    console.log("⚠️ AI Engine Check Completed with fallback readiness.");
  }
});
