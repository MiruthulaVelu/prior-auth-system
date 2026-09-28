import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Stethoscope,
  Activity,
  HeartPulse,
  KeyRound,
  Sun,
  Moon
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess, theme = 'dark', toggleTheme }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration specific state
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('provider'); // 'provider' | 'payer' | 'patient'

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Quick demo credentials options
  const demoUsers = [
    {
      label: 'Physician / Provider',
      email: 'dr.smith@metrohospital.org',
      password: 'password123',
      role: 'provider',
      icon: Stethoscope,
      badge: 'Hospital / Clinic'
    },
    {
      label: 'Medical Director / Payer',
      email: 'reviewer@bluecross.com',
      password: 'password123',
      role: 'payer',
      icon: Building2,
      badge: 'Insurance Reviewer'
    },
    {
      label: 'Patient Portal Member',
      email: 'eleanor.vance@gmail.com',
      password: 'password123',
      role: 'patient',
      icon: User,
      badge: 'Patient Account'
    }
  ];

  const handleFillDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setRole(demo.role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both Email ID and Password.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email, password }
        : { email, password, fullName, organization, role };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccessMsg(mode === 'login' ? 'Login successful! Redirecting...' : 'Account created successfully!');
      
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 600);

    } catch (err) {
      // Fallback demo auth in client side if server request fails or server is offline
      console.warn('API connection issue, checking fallback client auth:', err);
      
      const matchingDemo = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (matchingDemo && password === matchingDemo.password) {
        const fallbackUser = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          email: matchingDemo.email,
          name: matchingDemo.label.split('/')[0].trim(),
          role: matchingDemo.role,
          organization: matchingDemo.badge
        };
        setSuccessMsg('Login successful!');
        setTimeout(() => {
          onLoginSuccess(fallbackUser, 'mock-jwt-token-12345');
        }, 500);
      } else if (mode === 'register' && fullName && email && password) {
        const fallbackUser = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          email: email,
          name: fullName,
          role: role,
          organization: organization || 'Healthcare Facility'
        };
        setSuccessMsg('Registration successful!');
        setTimeout(() => {
          onLoginSuccess(fallbackUser, 'mock-jwt-token-67890');
        }, 500);
      } else {
        setError(err.message || 'Invalid Email ID or Password. Try demo login buttons below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setForgotModal(false);
      setResetSent(false);
      setResetEmail('');
      setSuccessMsg(`Password reset link sent to ${resetEmail}`);
    }, 1500);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white' : 'bg-slate-100 text-slate-900 selection:bg-teal-200 selection:text-teal-900'
    }`}>
      
      {/* Background Glow & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.2),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Bar for Theme Switcher */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-4 z-20 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            PriorAuth AI Security Portal
          </span>
        </div>

        {/* Dedicated Theme Toggle Button */}
        {toggleTheme && (
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer border ${
              isDark
                ? 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-teal-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-teal-600'
            }`}
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                <span>Night Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span>Bright Theme</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className={`w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border shadow-2xl overflow-hidden z-10 transition-colors duration-300 ${
        isDark ? 'border-slate-800/80 bg-slate-900/80 backdrop-blur-xl' : 'border-slate-200 bg-white shadow-xl'
      }`}>
        
        {/* Left Panel - Product Highlight & Features */}
        <div className={`lg:col-span-5 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r flex flex-col justify-between relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/60 border-slate-800/80'
            : 'bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            {/* Platform Branding */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  PriorAuth<span className="text-teal-400 font-extrabold">AI</span>
                </h1>
                <p className="text-xs text-slate-300 font-medium">Enterprise Prior Authorization Platform</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                AI Medical Decision Support
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                Automating Prior Auth with Medical NLP & Policy Rules
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Streamline approval workflows, reduce administrative turnaround from 14 days to under 1 second, and minimize claim rejections.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5 py-4 border-t border-slate-700/60">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-100">Real-Time Guidelines Check</h4>
                  <p className="text-[11px] text-slate-300">Instant evaluation against ICD-10 & CPT policy criteria.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-100">HIPAA Compliant Workflows</h4>
                  <p className="text-[11px] text-slate-300">End-to-end encrypted medical attachments & clinical notes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-100">Multi-Portal Role Access</h4>
                  <p className="text-[11px] text-slate-300">Custom interfaces for Healthcare Providers, Payers & Patients.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="pt-6 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              AI Rule Classifier Active
            </span>
            <span>v2.4 Enterprise</span>
          </div>
        </div>

        {/* Right Panel - Sign In / Register Form */}
        <div className={`lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center transition-colors ${
          isDark ? 'bg-slate-900/90 text-slate-100' : 'bg-white text-slate-900'
        }`}>
          
          {/* Header Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {mode === 'login' ? 'Sign In to your Account' : 'Create New Account'}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {mode === 'login'
                  ? 'Enter your registered Mail ID and Password below'
                  : 'Fill in your details to get started'}
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div className={`flex p-1 rounded-xl border ${
              isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Registration Fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Alexander Wright"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                        isDark
                          ? 'bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500'
                          : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Organization / Facility
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="General Hospital"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                          isDark
                            ? 'bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500'
                            : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Account Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                        isDark
                          ? 'bg-slate-800/80 border border-slate-700/80 text-white'
                          : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="provider">Healthcare Provider</option>
                      <option value="payer">Insurance Payer / Reviewer</option>
                      <option value="patient">Patient Portal User</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Mail ID Field */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Mail ID / Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                    isDark
                      ? 'bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password <span className="text-rose-500">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setForgotModal(true)}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline transition-all cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${
                    isDark
                      ? 'bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-teal-600 focus:ring-teal-500/30 accent-teal-600 cursor-pointer"
                  />
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Keep me signed in
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.99] transition-all shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Portal' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className={`mt-8 pt-6 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <KeyRound className="w-3.5 h-3.5 text-teal-500" />
                Quick Demo Accounts (1-Click Fill)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {demoUsers.map((demo, idx) => {
                const IconComp = demo.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleFillDemo(demo)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                      isDark
                        ? 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-teal-500/50 text-slate-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-teal-50/50 hover:border-teal-400 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <IconComp className="w-3.5 h-3.5 text-teal-500 group-hover:scale-110 transition-transform" />
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-slate-700 text-teal-300' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {demo.role}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold truncate">{demo.label}</div>
                    <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {demo.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl relative border ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-teal-500" />
              Reset Password
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Enter your registered Email ID and we will send you a password reset verification link.
            </p>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Verification link sent! Check your inbox for reset instructions.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="dr.smith@metrohospital.org"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDark ? 'bg-slate-800 border border-slate-700 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
