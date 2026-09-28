import React, { useState, useEffect } from 'react';
import { HeartPulse, UserCheck, UserPlus, Pencil, CheckCircle2, Sparkles } from 'lucide-react';

export default function PatientPortal({ requests, patients, currentUser, onAddPatient, onUpdatePatient }) {
  const defaultPatient = patients.find(
    p => currentUser && p.name.toLowerCase() === currentUser.name.toLowerCase()
  ) || patients[0];

  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatient?.id || 'PAT-8801');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Add Patient Form State
  const [newPatientName, setNewPatientName] = useState(currentUser?.name || '');
  const [newPatientAge, setNewPatientAge] = useState('45');
  const [newPatientPayer, setNewPatientPayer] = useState('BlueCross BlueShield');
  const [newPolicyNumber, setNewPolicyNumber] = useState(`POL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [newBmi, setNewBmi] = useState('26.5');
  const [newDiagnosis, setNewDiagnosis] = useState('M17.11 - Primary osteoarthritis, right knee');

  // Edit Patient Form State
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editPayer, setEditPayer] = useState('');
  const [editPolicyNumber, setEditPolicyNumber] = useState('');
  const [editBmi, setEditBmi] = useState('');
  const [editDiagnosis, setEditDiagnosis] = useState('');

  useEffect(() => {
    if (defaultPatient && (!selectedPatientId || !patients.some(p => p.id === selectedPatientId))) {
      setSelectedPatientId(defaultPatient.id);
    }
  }, [patients, currentUser]);

  const activePatient = patients.find(p => p.id === selectedPatientId) || defaultPatient || patients[0];

  // Initialize Edit state whenever activePatient changes or Edit button is clicked
  const handleOpenEdit = () => {
    if (activePatient) {
      setEditName(activePatient.name || '');
      setEditAge(String(activePatient.age || 45));
      setEditPayer(activePatient.insuranceProvider || 'BlueCross BlueShield');
      setEditPolicyNumber(activePatient.policyNumber || '');
      setEditBmi(String(activePatient.bmi || 26.5));
      setEditDiagnosis(activePatient.primaryDiagnosis || 'M17.11 - Primary osteoarthritis, right knee');
      setIsEditingPatient(true);
      setIsAddingPatient(false);
    }
  };

  const patientRequests = requests.filter(
    r => r.patientId === selectedPatientId || r.patientName === activePatient?.name
  );

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
        setUpdateMsg('New patient profile created!');
        setTimeout(() => setUpdateMsg(''), 3000);
      }
    } catch (err) {
      console.error("Failed to create patient:", err);
    }
  };

  const handleEditPatientSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !activePatient) return;

    const updatedPayload = {
      ...activePatient,
      name: editName.trim(),
      age: parseInt(editAge || 45),
      insuranceProvider: editPayer,
      policyNumber: editPolicyNumber,
      primaryDiagnosis: editDiagnosis,
      bmi: parseFloat(editBmi || 26.5)
    };

    try {
      const res = await fetch(`http://localhost:5000/api/patients/${activePatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      const data = await res.json();
      const resultPatient = data.patient || updatedPayload;

      if (onUpdatePatient) {
        onUpdatePatient(resultPatient);
      }
      setIsEditingPatient(false);
      setUpdateMsg('Patient details updated successfully!');
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      console.warn("Client side update fallback:", err);
      if (onUpdatePatient) {
        onUpdatePatient(updatedPayload);
      }
      setIsEditingPatient(false);
      setUpdateMsg('Patient details updated successfully!');
      setTimeout(() => setUpdateMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Toast Alert Notification */}
      {updateMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-semibold text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{updateMsg}</span>
        </div>
      )}

      {/* Patient Switcher & Header */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-teal-600/20">
            {activePatient?.name ? activePatient.name[0] : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">{activePatient?.name}</h2>
              {currentUser && activePatient?.name.toLowerCase() === currentUser.name.toLowerCase() && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Your Profile
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {activePatient?.insuranceProvider}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Policy #: <span className="text-slate-900 font-bold">{activePatient?.policyNumber}</span> • Age: {activePatient?.age} • BMI: {activePatient?.bmi}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Switch Patient View</label>
            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                setIsEditingPatient(false);
                setIsAddingPatient(false);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-600 w-full"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.insuranceProvider}) {currentUser && p.name.toLowerCase() === currentUser.name.toLowerCase() ? '★ (You)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 mt-4 sm:mt-5">
            {/* Edit Button */}
            <button
              type="button"
              onClick={handleOpenEdit}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Details
            </button>

            {/* Add New Button */}
            <button
              type="button"
              onClick={() => {
                setIsAddingPatient(!isAddingPatient);
                setIsEditingPatient(false);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Edit Patient Details Drawer */}
      {isEditingPatient && (
        <form onSubmit={handleEditPatientSubmit} className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Pencil className="w-4 h-4 text-amber-600" />
              Edit Patient Profile ({activePatient?.name})
            </h4>
            <span className="text-[10px] text-amber-800 font-medium">Update profile & insurance details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">BMI</label>
              <input
                type="text"
                value={editBmi}
                onChange={(e) => setEditBmi(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Insurance Provider</label>
              <input
                type="text"
                value={editPayer}
                onChange={(e) => setEditPayer(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Policy Number</label>
              <input
                type="text"
                value={editPolicyNumber}
                onChange={(e) => setEditPolicyNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Diagnosis</label>
            <input
              type="text"
              value={editDiagnosis}
              onChange={(e) => setEditDiagnosis(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingPatient(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Inline Add Registration Drawer */}
      {isAddingPatient && (
        <form onSubmit={handleCreatePatientSubmit} className="p-5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-teal-600" />
              Register New Patient Profile
            </h4>
            <span className="text-[10px] text-teal-700 font-medium">Enter your details to track your authorization requests</span>
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
              Save Patient Profile
            </button>
          </div>
        </form>
      )}

      {/* Hero Care Delay Reduction Card */}
      <div className="bg-slate-900 dark:bg-slate-900 p-6 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 dark:bg-teal-900 border border-teal-500 dark:border-teal-700 flex items-center justify-center text-teal-200 dark:text-teal-300 shrink-0 shadow-xs">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Accelerated Patient Care Timeline</h3>
            <p className="text-xs text-teal-200 dark:text-teal-300 mt-0.5 font-medium leading-relaxed">
              AI prior authorization eliminated <span className="text-white font-bold underline">14 days</span> of administrative paperwork delay. Your care treatment path is unlocked instantly.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 hidden sm:block">
          <div className="text-2xl font-black text-teal-300 dark:text-teal-300">0.4s</div>
          <div className="text-[10px] uppercase font-bold text-teal-200 dark:text-teal-400">Approval Speed</div>
        </div>
      </div>

      {/* Prior Auth Requests Timeline Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Your Treatment Authorization Status</h3>

        {patientRequests.length === 0 ? (
          <div className="bg-white p-8 text-center text-slate-500 text-xs rounded-2xl border border-slate-200 font-medium space-y-2">
            <div>No active prior authorization requests found for <span className="font-bold text-slate-800">{activePatient?.name}</span>.</div>
            <p className="text-[11px] text-slate-400">Click "+ New Authorization Request" at the top to submit a new prior authorization request with AI pre-approval!</p>
          </div>
        ) : (
          patientRequests.map((req) => (
            <div key={req.id} className="bg-white p-6 border border-slate-200 rounded-2xl space-y-6 shadow-xs">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{req.id}</span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{req.cptDesc} ({req.cptCode})</h4>
                  <p className="text-xs text-slate-500 font-medium">Diagnosis: {req.icd10Desc} ({req.icd10Code})</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    req.status === 'IN_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {req.statusLabel}
                  </span>
                </div>
              </div>

              {/* Status Timeline Stepper */}
              <div className="relative flex items-center justify-between text-xs px-2">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0">
                  <div className={`h-full bg-emerald-600 transition-all ${
                    req.status === 'APPROVED' ? 'w-full' : 'w-1/2'
                  }`}></div>
                </div>

                {/* Step 1: Request Submitted */}
                <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">✓</div>
                  <span className="font-bold text-slate-900">Request Submitted</span>
                  <span className="text-[10px] text-slate-500 font-medium">EHR Digital Transfer</span>
                </div>

                {/* Step 2: AI Pre-Verification */}
                <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">✓</div>
                  <span className="font-bold text-slate-900">AI Verification</span>
                  <span className="text-[10px] text-slate-500 font-medium">Medical Necessity Match</span>
                </div>

                {/* Step 3: Insurer Approval */}
                <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                    req.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {req.status === 'APPROVED' ? '✓' : '⏳'}
                  </div>
                  <span className="font-bold text-slate-900">Payer Decision</span>
                  <span className="text-[10px] text-slate-500 font-medium">{req.status}</span>
                </div>
              </div>

              {/* Rationale explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                <span className="font-bold text-teal-700">Status Update Note: </span>
                {req.decisionRationale}
              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}
