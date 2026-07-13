import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

type Role = 'student' | 'driver' | 'admin';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('student@campusride.col'); // Autofill standard student for ease
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (selectedRole: Role) => {
    setRole(selectedRole);
    setError('');
    // Auto-fill standard accounts to make testing a breeze
    if (selectedRole === 'student') {
      setEmail('student@campusride.col');
      setPassword('student123');
    } else if (selectedRole === 'driver') {
      setEmail('driver1@campusride.col');
      setPassword('driver123');
    } else if (selectedRole === 'admin') {
      setEmail('admin@campusride.col');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      // Double check that role matches selected tab
      if (loggedUser.role !== role) {
        setError(`This account is registered as a ${loggedUser.role}, not a ${role}.`);
        setLoading(false);
        return;
      }
      navigate(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Left side: Beautiful Bus & Road Animation (7 Cols) */}
      <div className="hidden lg:flex lg:col-span-7 bg-blue-600 dark:bg-blue-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Soft moving clouds */}
        <div className="absolute top-12 left-0 right-0 h-20 pointer-events-none overflow-hidden">
          <div className="absolute top-2 w-28 h-8 bg-white/20 rounded-full blur-[1px] animate-cloud-1" />
          <div className="absolute top-10 w-40 h-10 bg-white/10 rounded-full blur-[2px] animate-cloud-2" />
        </div>

        {/* Header Branding */}
        <div className="z-10 flex items-center space-x-2">
          <Bus className="h-9 w-9 text-blue-100" />
          <span className="text-2xl font-extrabold tracking-tight text-white">CampusRide</span>
        </div>

        {/* Middle illustration and slogan */}
        <div className="z-10 text-center max-w-lg mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">University Transit Hub</h2>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Real-time coordinates synchronization, capacity monitoring, and seat reservations made simple for the student community.
          </p>
        </div>

        {/* Bottom Road and Bus Animation */}
        <div className="relative w-full h-32 flex flex-col justify-end">
          
          {/* Animated Bus */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="relative animate-bus">
              
              {/* Bus cabin */}
              <div className="w-40 h-16 bg-amber-400 rounded-2xl relative shadow-lg border border-amber-500">
                
                {/* Windshield */}
                <div className="absolute right-0 top-2 bottom-6 w-10 bg-slate-800 rounded-l-md rounded-r-lg border-r border-slate-700 flex items-center justify-center">
                  <div className="w-1.5 h-6 bg-white/20 transform rotate-12" />
                </div>
                
                {/* Driver Head */}
                <div className="absolute right-3.5 top-4 w-4 h-4 bg-orange-200 rounded-full" />
                
                {/* Windows */}
                <div className="absolute left-3 top-2 bottom-6 right-12 flex space-x-2">
                  <div className="w-6 bg-slate-800 rounded-sm border border-slate-700" />
                  <div className="w-6 bg-slate-800 rounded-sm border border-slate-700" />
                  <div className="w-6 bg-slate-800 rounded-sm border border-slate-700" />
                </div>

                {/* CampusRide Text Label */}
                <div className="absolute bottom-1.5 left-4 right-12 text-[10px] font-bold text-amber-950 uppercase tracking-widest text-center truncate">
                  Campus Commuter
                </div>

                {/* Front Headlight */}
                <div className="absolute right-0 bottom-3 w-2.5 h-2.5 bg-yellow-200 rounded-full border border-yellow-300" />
                
                {/* Headlight beam */}
                <div className="absolute -right-20 bottom-0 top-3 w-20 bg-gradient-to-r from-yellow-200/40 to-transparent clip-path-beam pointer-events-none" />
              </div>

              {/* Wheels */}
              <div className="flex justify-between px-6 -mt-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center animate-spin" style={{ animationDuration: '0.6s' }}>
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center animate-spin" style={{ animationDuration: '0.6s' }}>
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Road */}
          <div className="w-full h-6 bg-slate-800 rounded-t-sm relative border-t border-slate-700 overflow-hidden">
            {/* Dashed line */}
            <div className="w-full h-1.5 absolute top-1.5 animate-road" />
          </div>
        </div>

      </div>

      {/* Right side: Login Panel (5 Cols) */}
      <div className="lg:col-span-5 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mini Header for mobile screens */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Log in to CampusRide
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select your role below and enter your credentials.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="relative bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex">
            {/* Sliding backdrop */}
            <div 
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 ease-out pointer-events-none"
              style={{
                width: 'calc(33.33% - 8px)',
                left: role === 'student' ? '6px' : role === 'driver' ? '33.33%' : '66.66%'
              }}
            />
            <button
              onClick={() => handleRoleChange('student')}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-xl z-10 transition-colors cursor-pointer ${
                role === 'student' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => handleRoleChange('driver')}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-xl z-10 transition-colors cursor-pointer ${
                role === 'driver' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Driver
            </button>
            <button
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-xl z-10 transition-colors cursor-pointer ${
                role === 'admin' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Password</label>
                  <a href="#forgot" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Assist Card */}
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Demo Accounts</h4>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <div>
                <span className="font-bold block text-slate-700 dark:text-slate-300">Student</span>
                student@campusride.col
                <span className="block italic text-[9px]">student123</span>
              </div>
              <div>
                <span className="font-bold block text-slate-700 dark:text-slate-300">Driver</span>
                driver1@campusride.col
                <span className="block italic text-[9px]">driver123</span>
              </div>
              <div>
                <span className="font-bold block text-slate-700 dark:text-slate-300">Admin</span>
                admin@campusride.col
                <span className="block italic text-[9px]">admin123</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
