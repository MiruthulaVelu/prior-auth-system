import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

export default function PayerPortal({ requests, onUpdateDecision }) {
  const [selectedPayerFilter, setSelectedPayerFilter] = useState('ALL');
  const [activeRequest, setActiveRequest] = useState(requests[1] || requests[0]);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewerName, setReviewerName] = useState('Dr. Sarah Jenkins, MD (Medical Director)');
  const [submittingAction, setSubmittingAction] = useState(false);

  const filteredRequests = requests.filter(r => 
    selectedPayerFilter === 'ALL' || r.payerName.toLowerCase().includes(selectedPayerFilter.toLowerCase())
  );

  const handleDecision = async (newStatus) => {
    if (!activeRequest) return;
    setSubmittingAction(true);

    try {
      const res = await fetch(`http://localhost:5000/api/prior-auth/${activeRequest.id}/decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: reviewNote,
          reviewerName
        })
      });

      const data = await res.json();
      onUpdateDecision(data.request);
      setActiveRequest(data.request);
      setReviewNote('');
    } catch (err) {
      console.error("Payer decision error:", err);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Insurance Payer Console
            </span>
            <span className="text-xs text-slate-500 font-medium">Payer Integration Gateway</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Medical Director Authorization Queue</h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">Review AI recommendations, guideline criteria compliance, and override decisions.</p>
        </div>

        {/* Payer Selector */}
        <select
          value={selectedPayerFilter}
          onChange={(e) => setSelectedPayerFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-teal-600"
        >
          <option value="ALL">All Payers Work Queue</option>
          <option value="BlueCross">BlueCross BlueShield</option>
          <option value="Aetna">Aetna Health</option>
          <option value="UnitedHealthcare">UnitedHealthcare</option>
          <option value="Humana">Humana Choice</option>
        </select>
      </div>

      {/* Main Split Grid: Left List / Right AI Reviewer Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Work Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Pending & Recent Auths ({filteredRequests.length})</h3>
          
          <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setActiveRequest(req)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeRequest?.id === req.id
                    ? 'bg-teal-50/70 border-teal-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{req.patientName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    req.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-rose-100 text-rose-800 border-rose-200'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mt-1 flex items-center justify-between font-medium">
                  <span className="truncate max-w-[200px]">{req.cptCode} • {req.cptDesc}</span>
                  <span className="font-extrabold text-teal-700">{Math.round(req.confidenceScore * 100)}% AI Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed AI Decision Console (7 cols) */}
        {activeRequest && (
          <div className="lg:col-span-7 bg-white p-6 border border-slate-200 rounded-2xl space-y-6 shadow-xs">
            
            {/* Header / Case ID */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{activeRequest.id}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{activeRequest.patientName} ({activeRequest.patientAge} yrs)</h3>
                <p className="text-xs text-slate-500 font-medium">Payer: <span className="text-slate-800 font-semibold">{activeRequest.payerName}</span> • Policy: {activeRequest.policyNumber}</p>
              </div>

              {/* AI Confidence Dial */}
              <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-2xl font-black text-teal-700">{Math.round(activeRequest.confidenceScore * 100)}%</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">AI Necessity Index</div>
              </div>
            </div>

            {/* AI Decision Rationale Box */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                <Sparkles className="w-4 h-4 text-teal-600" />
                AI Clinical Guideline Evaluation Rationale
              </div>
              <p className="text-xs text-teal-950 font-medium leading-relaxed">{activeRequest.decisionRationale}</p>
            </div>

            {/* Guideline Matches Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Clinical Guideline Criteria
              </h4>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-800 font-medium">
                {activeRequest.matchedCriteria && activeRequest.matchedCriteria.length > 0 ? (
                  activeRequest.matchedCriteria.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-800">
                      <span className="text-emerald-600 font-bold">✓</span> {c}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic">No guideline matches recorded.</div>
                )}
              </div>
            </div>

            {/* Missing Criteria Warning */}
            {activeRequest.missingCriteria && activeRequest.missingCriteria.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Missing Required Criteria / Attachments
                </h4>
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1.5 text-xs text-amber-900 font-medium">
                  {activeRequest.missingCriteria.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">⚠️</span> {m}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Reviewer Override Form */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">Medical Director Reviewer Rationale Note</label>
              <textarea
                rows="2"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add peer review notes or override explanation..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white font-medium"
              ></textarea>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 font-medium">
                  Reviewer: <span className="font-bold text-slate-800">{reviewerName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecision('REJECTED')}
                    disabled={submittingAction}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Deny Request
                  </button>

                  <button
                    onClick={() => handleDecision('IN_REVIEW')}
                    disabled={submittingAction}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Peer Review
                  </button>

                  <button
                    onClick={() => handleDecision('APPROVED')}
                    disabled={submittingAction}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Authorization
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
