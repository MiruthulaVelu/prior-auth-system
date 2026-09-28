import React from 'react';
import { ShieldCheck, Activity, User, Building2, BarChart3, PlusCircle, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewWizard, currentUser, onLogout, theme, toggleTheme }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand & Live Badge */}
        <div className="flex items-center space-x-3.5 cursor-pointer shrink-0" onClick={() => setActiveTab('provider')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-600/20">
            <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                PriorAuth<span className="text-teal-600 font-extrabold">AI</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span>
                AI Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Prior Authorization Automation Platform</p>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('provider')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'provider'
                ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Provider Portal
          </button>

          <button
            onClick={() => setActiveTab('payer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'payer'
                ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Payer Work Queue
          </button>

          <button
            onClick={() => setActiveTab('patient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'patient'
                ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Patient Tracker
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            ROI Analytics
          </button>
        </nav>

        {/* Theme Switcher, New Request & User Profile Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Theme Toggle Button */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Bright Theme' : 'Switch to Night Theme'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-xs cursor-pointer bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 active:scale-95"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5]" />
                  <span className="hidden sm:inline font-bold">Night Theme</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                  <span className="hidden sm:inline font-bold">Bright Theme</span>
                </>
              )}
            </button>
          )}

          {/* Action Button */}
          <button
            onClick={onOpenNewWizard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            New Auth Request
          </button>

          {/* User Profile Pill */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 font-bold text-xs flex items-center justify-center border border-slate-700">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">
                    {currentUser.name || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium max-w-[120px] truncate">
                    {currentUser.email || currentUser.role}
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
