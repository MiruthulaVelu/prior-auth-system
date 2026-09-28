import React, { useState } from 'react';
import { PlusCircle, Search, CheckCircle2, Clock, XCircle, FileText, ChevronRight } from 'lucide-react';

export default function ProviderPortal({ requests, onOpenNewWizard }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filterStatus === 'ALL' || req.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      req.patientName.toLowerCase().includes(q) ||
      req.icd10Code.toLowerCase().includes(q) ||
      req.cptCode.toLowerCase().includes(q) ||
      req.id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalCount = requests.length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const inReviewCount = requests.filter(r => r.status === 'IN_REVIEW').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      
      {/* Provider Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-50/80 via-slate-50 to-emerald-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950 p-6 md:p-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/60 dark:text-teal-300 dark:border-teal-700">
                Healthcare Provider Portal
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">St. Jude Medical Center</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Automated Prior Authorization Engine
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed font-medium">
              Submit digital authorization requests with instant AI clinical pre-validation. Eliminate manual paperwork and reduce approval turnarounds from weeks to seconds.
            </p>
          </div>

          <button
            onClick={onOpenNewWizard}
            className="px-5 py-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-md shadow-teal-600/20 shrink-0 transition-transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            New Authorization Request
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Total Submitted</span>
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time EHR Sync</div>
        </div>

        <div className="bg-emerald-200 dark:bg-emerald-900 p-5 rounded-2xl border border-emerald-300 dark:border-emerald-700 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-100 text-xs font-bold mb-2">
            <span>Auto Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-100" />
          </div>
          <div className="text-2xl font-black text-emerald-950 dark:text-white">{approvedCount}</div>
          <div className="text-[11px] text-emerald-800 dark:text-emerald-100 mt-1 font-semibold">Instant approval by AI</div>
        </div>

        <div className="bg-amber-200 dark:bg-amber-900 p-5 rounded-2xl border border-amber-300 dark:border-amber-700 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-100 text-xs font-bold mb-2">
            <span>Pending Peer Review</span>
            <Clock className="w-4 h-4 text-amber-700 dark:text-amber-100" />
          </div>
          <div className="text-2xl font-black text-amber-950 dark:text-white">{inReviewCount}</div>
          <div className="text-[11px] text-amber-800 dark:text-amber-100 mt-1 font-semibold">Under Medical Director review</div>
        </div>

        <div className="bg-rose-200 dark:bg-rose-900 p-5 rounded-2xl border border-rose-300 dark:border-rose-700 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-100 text-xs font-bold mb-2">
            <span>Denied / Appeal Needed</span>
            <XCircle className="w-4 h-4 text-rose-700 dark:text-rose-100" />
          </div>
          <div className="text-2xl font-black text-rose-950 dark:text-white">{rejectedCount}</div>
          <div className="text-[11px] text-rose-800 dark:text-rose-100 mt-1 font-semibold">Insufficient clinical evidence</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          {['ALL', 'APPROVED', 'IN_REVIEW', 'REJECTED'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === statusKey
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {statusKey === 'ALL' ? 'All Requests' : statusKey === 'APPROVED' ? 'Approved' : statusKey === 'IN_REVIEW' ? 'In Review' : 'Denied'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, ICD-10, CPT..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
          />
        </div>

      </div>

      {/* Request List Cards */}
      <div className="space-y-3">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            onClick={() => setSelectedRequest(req)}
            className="glass-card-interactive p-5 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer bg-white"
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base font-bold ${
                req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                req.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-rose-100 text-rose-700 border border-rose-200'
              }`}>
                {req.status === 'APPROVED' ? '✓' : req.status === 'IN_REVIEW' ? '⏳' : '✕'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{req.patientName}</h3>
                  <span className="text-xs text-slate-500">({req.patientAge} yrs • {req.payerName})</span>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{req.id}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 font-mono text-teal-800 font-bold">{req.cptCode}</span>
                  <span className="truncate max-w-xs font-medium">{req.cptDesc}</span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-700 font-medium">{req.icd10Code}</span>
                </div>
              </div>
            </div>

            {/* Right Status Badge & AI Score */}
            <div className="flex items-center gap-4 self-end md:self-center">
              <div className="text-right">
                <div className="text-xs font-extrabold text-teal-700">
                  {Math.round(req.confidenceScore * 100)}% AI Score
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Processed in {req.processingTimeMs || 420}ms
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                req.status === 'IN_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {req.statusLabel}
              </span>

              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedRequest.patientName}</h3>
                <p className="text-xs text-slate-500">Request ID: {selectedRequest.id} • {selectedRequest.payerName}</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200">
                <span className="font-bold text-teal-900">Decision Rationale:</span>
                <p className="text-teal-950 mt-1 leading-relaxed font-medium">{selectedRequest.decisionRationale}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800">Clinical Notes:</span>
                <p className="text-slate-700 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">{selectedRequest.clinicalNotes}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800">Attached OCR Documents:</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {selectedRequest.uploadedDocuments.map((doc, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
                      📄 {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedRequest(null)} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-xl text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
