import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, DollarSign, Clock, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function AnalyticsDashboard({ analytics }) {
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      
      {/* Executive Overview Banner */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Executive Analytics & Impact Report
            </span>
            <span className="text-xs text-slate-500 font-medium">Healthtech ROI Metrics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Prior Authorization Automation ROI</h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">Real-time performance measurements across processing speed, operational costs, and claim accuracy.</p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-teal-50/80 p-5 rounded-2xl border border-teal-200 shadow-xs">
          <div className="flex items-center justify-between text-teal-800 text-xs font-bold mb-2">
            <span>Turnaround Time</span>
            <Clock className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{analytics.avgProcessingTimeSec}s</span>
            <span className="text-xs text-rose-500 line-through font-bold">14 days</span>
          </div>
          <p className="text-[11px] text-teal-800 font-bold mt-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-teal-600" /> 99.9% Faster Decisioning
          </p>
        </div>

        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-2">
            <span>Admin Cost Savings</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-950">
            ${analytics.administrativeCostSavingsUSD ? analytics.administrativeCostSavingsUSD.toLocaleString() : '248,500'}
          </div>
          <p className="text-[11px] text-emerald-800 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> ~$175 saved per authorization
          </p>
        </div>

        <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-800 text-xs font-bold mb-2">
            <span>AI Auto-Approval Rate</span>
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-950">{analytics.autoApprovalRatePct}%</div>
          <p className="text-[11px] text-blue-800 font-bold mt-2">
            Instant decisioning without manual touch
          </p>
        </div>

        <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-800 text-xs font-bold mb-2">
            <span>Error & Resubmission Reduction</span>
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-950">{analytics.errorReductionRatePct}%</div>
          <p className="text-[11px] text-purple-800 font-bold mt-2">
            Eliminating paperwork claim rejections
          </p>
        </div>

      </div>

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Specialty Breakdown Bar Chart */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Prior Authorizations by Clinical Specialty</h3>
            <p className="text-xs text-slate-500 font-medium">Distribution of approved, reviewed, and rejected requests.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="approved" name="Approved" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reviewed" name="Peer Review" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="Denied" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Processing Turnaround Time Drop Area Chart */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Turnaround Time Reduction (Seconds)</h3>
            <p className="text-xs text-slate-500 font-medium">Monthly progression of authorization processing speeds.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timelineData}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} fontWeight={600} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="aiTimeSec" name="Avg Processing Time (sec)" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
