import React, { useState, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

// Theme Colors from PDF
const NAVY_1 = '#2d3a58';
const NAVY_2 = '#384770';
const PANEL_BG = '#e9edf1';

function Diamonds({ count = 10 }: { count?: number }) {
  const diamonds = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: 60 + Math.random() * 120,
      top: Math.random() * 100,
      left: Math.random() * 100,
    }));
  }, [count]);

  return (
    <>
      {diamonds.map((d) => (
        <div
          key={d.id}
          className="absolute border-2 border-white/5 rotate-[45deg] bg-white/[0.01]"
          style={{
            width: d.size,
            height: d.size,
            top: `${d.top}%`,
            left: `${d.left}%`,
          }}
        />
      ))}
    </>
  );
}

interface BubbleProps {
  text: string;
  textColor?: string;
  style?: React.CSSProperties;
  tailStyle?: React.CSSProperties;
}

function Bubble({ text, textColor, style, tailStyle }: BubbleProps) {
  return (
    <div
      className="absolute bg-white dark:bg-slate-800 rounded-[20px] py-5 px-9 text-2xl font-black shadow-xl whitespace-nowrap animate-bob transition-all duration-300"
      style={{
        color: textColor || '#43536e',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        ...style,
      }}
    >
      {text}
      <div
        className="absolute w-6 h-6 bg-white dark:bg-slate-800"
        style={tailStyle}
      />
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberOption, setRememberOption] = useState('none');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-bob {
          animation: bob 4s ease-in-out infinite;
        }
      `}</style>

      {/* LEFT: Full Screen Animated Illustration Side */}
      <div 
        className="relative md:w-[65%] w-full h-[360px] md:h-screen overflow-hidden p-10 md:p-16 flex flex-col justify-between flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${NAVY_1}, ${NAVY_2})`,
        }}
      >
        {/* Background floating diamonds */}
        <Diamonds count={16} />

        {/* Header branding on left panel */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20">
            <ShieldCheck className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <span className="text-white font-bold tracking-tight text-2xl">CSAT Hub</span>
            <span className="text-blue-300 text-sm block -mt-0.5">Big Outsource Portal</span>
          </div>
        </div>

        {/* Conversation/Support Bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bubble 1 (Customer feedback query) */}
          <Bubble
            text="Hi! I have a problem!"
            textColor="#c96a7a"
            style={{
              top: '32%',
              left: '15%',
              animationDelay: '0s',
            }}
            tailStyle={{
              bottom: -8,
              left: 32,
              clipPath: 'polygon(0 0, 100% 0, 0 100%)',
            }}
          />

          {/* Bubble 2 (Agent solution) */}
          <Bubble
            text="Don't worry, we will solve it!"
            textColor="#43536e"
            style={{
              top: '54%',
              left: '32%',
              animationDelay: '1.3s',
            }}
            tailStyle={{
              top: -8,
              left: 32,
              clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
            }}
          />
        </div>

        {/* Lower info tagline */}
        <div className="relative z-10 text-white/50 text-xs font-medium mt-auto hidden md:block">
          © {new Date().getFullYear()} Big Outsource Customer Satisfaction Index.
        </div>
      </div>

      {/* RIGHT: Full Screen Modern Form Side */}
      <div 
        className="md:w-[35%] w-full h-auto md:h-screen overflow-y-auto p-10 md:p-12 lg:p-14 flex flex-col justify-between flex-shrink-0 transition-colors duration-300"
        style={{ background: PANEL_BG }}
        id="login-form-container"
      >
        <div className="my-auto max-w-[460px] w-full mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              Welcome! Please log in.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Access your satisfaction analytics and survey controls.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl font-semibold border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username / Email field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-650 dark:text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. superadmin@bigoutsource.com"
                className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#3f5aa6]/20 focus:border-[#3f5aa6] outline-none transition-all font-medium placeholder-slate-400"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-650 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#f8fafc] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#3f5aa6]/20 focus:border-[#3f5aa6] outline-none transition-all font-medium placeholder-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me / Session Options */}
            <div className="pt-1.5 space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="radio"
                  name="remember"
                  checked={rememberOption === 'auto'}
                  onChange={() => setRememberOption('auto')}
                  className="w-5 h-5 text-[#3f5aa6] focus:ring-[#3f5aa6] border-slate-300 dark:border-slate-800"
                />
                Log me on automatically each visit
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="radio"
                  name="remember"
                  checked={rememberOption === 'username'}
                  onChange={() => setRememberOption('username')}
                  className="w-5 h-5 text-[#3f5aa6] focus:ring-[#3f5aa6] border-slate-300 dark:border-slate-800"
                />
                Remember just my username
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="radio"
                  name="remember"
                  checked={rememberOption === 'none'}
                  onChange={() => setRememberOption('none')}
                  className="w-5 h-5 text-[#3f5aa6] focus:ring-[#3f5aa6] border-slate-300 dark:border-slate-800"
                />
                No, thanks
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-[#3f5aa6] hover:bg-[#2f477f] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Click here to login'}
            </button>
          </form>

          {/* Forgot password */}
          <div className="text-left">
            <a
              href="#"
              className="text-sm font-semibold text-[#3f5aa6] dark:text-blue-400 hover:underline transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Footer matching standard design credits */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed mt-8 max-w-[460px] w-full mx-auto">
          <span className="font-semibold">Demo:</span> use <code className="bg-slate-300/40 px-1.5 py-0.5 rounded">superadmin@bigoutsource.com</code>
          <div className="mt-1">
            Powered by{' '}
            <a href="#" className="hover:underline text-[#3f5aa6] dark:text-blue-400">
              Help Desk Software HESK
            </a>
            {' '}/{' '}
            More IT firepower? Try{' '}
            <a href="#" className="hover:underline text-[#3f5aa6] dark:text-blue-400">
              SysAid
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
