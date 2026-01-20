import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Talk to Django
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Success! Save the "Access Key" (Token)
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        
        // 3. Redirect to Dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid Credentials. Access Denied.');
      }
    } catch (err) {
      console.error(err);
      setError('System Offline. Check Connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-nexus-dark/80 backdrop-blur-sm"></div>

      <GlassCard className="relative z-10 w-full max-w-md p-8 m-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Identify Yourself
          </h2>
          <p className="text-slate-400 text-sm mt-2">NEXUS SECURE GATEWAY</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Input */}
          <div className="relative group">
            <User className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
              required
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : (
              <>
                Initialize Session <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default Login;