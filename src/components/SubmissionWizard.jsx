import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, FileText, Upload, Sparkles, ArrowRight, Loader2, Info, UserPlus, Plus } from 'lucide-react';

export default function SubmissionWizard({ isOpen, onClose, patients, payers, icd10Codes, cptCodes, currentUser, onAddPatient, onSubmitSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedPayerId, setSelectedPayerId] = useState(payers[0]?.id || '');
  const [icd10Code, setIcd10Code] = useState('M17.11');
  const [cptCode, setCptCode] = useState('27447');
  const [conservativeWeeks, setConservativeWeeks] = useState(14);
  const [clinicalNotes, setClinicalNotes] = useState(
    "Patient suffers from severe refractory pain in right knee affecting weight-bearing mobility. Failed 14 weeks of physical therapy and intra-articular steroid injections. X-Ray confirms severe Grade 4 Kellgren-Lawrence joint space narrowing."
  );

  // New Patient Modal / Form State
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState(currentUser?.name || '');
  const [newPatientAge, setNewPatientAge] = useState('45');
  const [newPatientPayer, setNewPatientPayer] = useState('BlueCross BlueShield');
  const [newPolicyNumber, setNewPolicyNumber] = useState(`POL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [newBmi, setNewBmi] = useState('26.5');
  const [newDiagnosis, setNewDiagnosis] = useState('M17.11 - Primary osteoarthritis, right knee');
  
  // Attachments
  const [documents, setDocuments] = useState([
    "X-Ray Report (Weight-bearing)",
    "Physician Clinical Notes",
    "Physical Therapy Log"
  ]);
  const [newDocName, setNewDocName] = useState('');

  // AI Evaluation state
  const [evaluating, setEvaluating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients]);

  const handleCreatePatientSubmit = async (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPatientName.trim(),
          age: parseInt(newPatientAge || 45),
          insuranceProvider: newPatientPayer,
          policyNumber: newPolicyNumber,
          primaryDiagnosis: newDiagnosis,
          bmi: parseFloat(newBmi || 26.5)
        })
      });
      const data = await res.json();
      if (data.patient) {
        if (onAddPatient) onAddPatient(data.patient);
        setSelectedPatientId(data.patient.id);
        setIsAddingPatient(false);
      }
    } catch (err) {
      console.error("Failed to add patient:", err);
    }
  };

  if (!isOpen) return null;

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const currentPayer = payers.find(p => p.id === selectedPayerId) || payers[0];

  const handleAddDoc = () => {
    if (newDocName.trim() && !documents.includes(newDocName.trim())) {
      setDocuments([...documents, newDocName.trim()]);
      setNewDocName('');
    }
  };

  const handleRemoveDoc = (docToRemove) => {
    setDocuments(documents.filter(d => d !== docToRemove));
  };

  const runAIEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch('http://localhost:5000/api/prior-auth/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icd10_code: icd10Code,
          cpt_code: cptCode,
          conservative_therapy_weeks: conservativeWeeks,
          uploaded_documents: documents,
          clinical_notes: clinicalNotes,
          patient_age: currentPatient?.age || 62,
          patient_bmi: currentPatient?.bmi || 28.4,
          payer_id: selectedPayerId
        })
      });
      const data = await res.json();
      setAiResult(data);
      setStep(3); // Advance to AI Evaluation Review step
    } catch (err) {
      console.error("AI Evaluation error:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/prior-auth/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          patientName: currentPatient?.name,
          patientAge: currentPatient?.age,
          patientBmi: currentPatient?.bmi,
          payerId: selectedPayerId,
          payerName: currentPayer?.name,
          policyNumber: currentPatient?.policyNumber || 'POL-99120',
          icd10Code,
          cptCode,
          conservativeTherapyWeeks: conservativeWeeks,
          uploadedDocuments: documents,
          clinicalNotes
        })
      });
      const data = await res.json();
      onSubmitSuccess(data.request);
      onClose();
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Prior Authorization Submission Wizard</h2>
              <p className="text-xs text-slate-500 font-medium">Step {step} of 3 • Automated AI Eligibility & Clinical Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50/80 border-b border-slate-200 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-teal-700' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-teal-600 text-white font-bold' : 'bg-slate-200'}`}>1</span>
            Patient & Coverage
          </div>
          <div className="h-0.5 flex-1 mx-4 bg-slate-200">
            <div className={`h-full bg-teal-600 transition-all ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-teal-700' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-teal-600 text-white font-bold' : 'bg-slate-200'}`}>2</span>
            Clinical Notes & Attachments
          </div>
          <div className="h-0.5 flex-1 mx-4 bg-slate-200">
            <div className={`h-full bg-teal-600 transition-all ${step <= 2 ? 'w-0' : 'w-full'}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-teal-700' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-teal-600 text-white font-bold' : 'bg-slate-200'}`}>3</span>
            AI Evaluation Preview
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* STEP 1: Patient & Coverage */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Select Patient</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingPatient(!isAddingPatient)}
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {isAddingPatient ? 'Cancel Add' : '+ Register / Add New Patient'}
                    </button>
                  </div>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.age} yrs, {p.insuranceProvider})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Insurance Payer</label>
                  <select
                    value={selectedPayerId}
                    onChange={(e) => setSelectedPayerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  >
                    {payers.map(py => (
                      <option key={py.id} value={py.id}>{py.logo} {py.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add New Patient Form Drawer */}
              {isAddingPatient && (
                <form onSubmit={handleCreatePatientSubmit} className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-teal-600" />
                      Register New Patient Profile
                    </h4>
                    <span className="text-[10px] text-teal-700 font-medium">Link your details instantly</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={newPatientAge}
                        onChange={(e) => setNewPatientAge(e.target.value)}
                        placeholder="45"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">BMI</label>
                      <input
                        type="text"
                        value={newBmi}
                        onChange={(e) => setNewBmi(e.target.value)}
                        placeholder="26.5"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Insurance Provider</label>
                      <input
                        type="text"
                        value={newPatientPayer}
                        onChange={(e) => setNewPatientPayer(e.target.value)}
                        placeholder="BlueCross BlueShield"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Policy Number</label>
                      <input
                        type="text"
                        value={newPolicyNumber}
                        onChange={(e) => setNewPolicyNumber(e.target.value)}
                        placeholder="POL-994821"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingPatient(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                    >
                      Save & Select Patient
                    </button>
                  </div>
                </form>
              )}

              {/* Patient Info Card */}
              {currentPatient && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Policy #:</span> <span className="font-bold text-slate-900">{currentPatient.policyNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Primary Diagnosis:</span> <span className="font-bold text-slate-900">{currentPatient.primaryDiagnosis}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">BMI:</span> <span className="font-bold text-teal-700">{currentPatient.bmi}</span>
                  </div>
                </div>
              )}

              {/* ICD-10 & CPT Code Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Diagnosis Code (ICD-10)</label>
                  <select
                    value={icd10Code}
                    onChange={(e) => setIcd10Code(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  >
                    {icd10Codes.map(code => (
                      <option key={code.code} value={code.code}>{code.code} - {code.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Procedure Code (CPT)</label>
                  <select
                    value={cptCode}
                    onChange={(e) => setCptCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                  >
                    {cptCodes.map(code => (
                      <option key={code.code} value={code.code}>{code.code} - {code.description}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Conservative Therapy Duration (Weeks)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="52"
                    value={conservativeWeeks}
                    onChange={(e) => setConservativeWeeks(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-bold"
                  />
                  <span className="text-xs text-slate-500 font-medium">Payer guideline requires 12 weeks of documented conservative care for CPT 27447.</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Clinical Notes & Attachments */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Physician Clinical Notes & Medical Necessity Justification</label>
                <textarea
                  rows="4"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white leading-relaxed font-medium"
                  placeholder="Enter detailed clinical summary, symptoms, failed treatments..."
                ></textarea>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <Info className="w-3.5 h-3.5 text-teal-600" />
                  AI engine automatically parses text for key medical necessity terms (e.g. refractory, severe pain, functional impairment).
                </p>
              </div>

              {/* Upload Document Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Clinical Attachments & Diagnostics Verification</label>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. MRI Spine Report, Pathology Lab Result..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white"
                  />
                  <button
                    onClick={handleAddDoc}
                    type="button"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Attach File
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                      <div className="flex items-center gap-2 text-slate-800 truncate">
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="truncate">{doc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">OCR Verified</span>
                        <button onClick={() => handleRemoveDoc(doc)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: AI Evaluation Result Preview */}
          {step === 3 && aiResult && (
            <div className="space-y-5">
              
              {/* Decision Badge */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                aiResult.recommendation === 'AUTO_APPROVED'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : aiResult.recommendation === 'FLAGGED_FOR_PEER_REVIEW'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-3">
                  {aiResult.recommendation === 'AUTO_APPROVED' ? (
                    <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold">{aiResult.decision_label}</h3>
                    <p className="text-xs font-medium opacity-90">{aiResult.rationale}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black">{Math.round(aiResult.confidence_score * 100)}%</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">AI Score</div>
                </div>
              </div>

              {/* Matched Criteria */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Verified Guideline Matches ({aiResult.matched_criteria.length})
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                  {aiResult.matched_criteria.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Criteria */}
              {aiResult.missing_criteria && aiResult.missing_criteria.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Missing Evidence / Guidelines Checklist
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-900 bg-amber-50/50 p-3 rounded-xl border border-amber-200 font-medium">
                    {aiResult.missing_criteria.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            {step < 2 && (
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/20"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={runAIEvaluation}
                disabled={evaluating}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Analyzing Clinical Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run Instant AI Evaluation
                  </>
                )}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm & Submit Authorization
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
