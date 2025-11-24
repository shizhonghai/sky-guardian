import React, { useState } from 'react';
import { useApp } from '../context/store';
import { Shield, Lock, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      login();
      setIsLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute top-40 -left-20 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl"></div>

      <div className="z-10 w-full max-w-sm flex flex-col gap-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 border border-blue-400/30">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">天穹智守</h1>
          <p className="text-slate-400 mt-2 text-sm">移动端智能安防指控平台</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all placeholder-slate-500"
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all placeholder-slate-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                登录系统 <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-600">© 2024 SkyGuard Security Systems v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;