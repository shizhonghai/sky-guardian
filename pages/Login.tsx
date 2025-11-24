
import React, { useState } from 'react';
import { useApp } from '../context/store';
import { Shield, Lock, User } from 'lucide-react';
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
    <div className="h-screen w-full bg-gradient-to-b from-blue-950 via-slate-900 to-teal-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]"></div>
      <div className="absolute top-1/2 -left-20 w-60 h-60 bg-teal-500/10 rounded-full blur-[80px]"></div>

      <div className="z-10 w-full max-w-sm flex flex-col gap-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6 border border-white/10 backdrop-blur-sm">
            <Shield size={48} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">资源管理系统移动端APP</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300/70 group-focus-within:text-blue-400 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                required
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300/70 group-focus-within:text-blue-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "登录"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
