import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import api from './api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Hook for redirection
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Send Credentials to Django Backend
      // The backend will now set HttpOnly cookies for 'access_token' and 'refresh_token'
      await api.post('token/', {
        username,
        password
      });

      console.log("Login Success");

      // 2. NO LOCALSTORAGE STORAGE HERE (Fixed XSS Vulnerability)
      // localStorage.setItem('access_token', response.data.access); <--- REMOVED
      // localStorage.setItem('refresh_token', response.data.refresh); <--- REMOVED

      // 3. Redirect to the Dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error("Login Error:", err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      
      {/* --- Vibrant Background Blobs (Mac OS Style) --- */}
      {/* Purple Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob"></div>
      
      {/* Yellow/Orange Blob */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-600 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob animation-delay-2000"></div>
      
      {/* Pink/Red Blob */}
      <div className="absolute -bottom-32 left-[20%] w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob animation-delay-4000"></div>

      {/* --- The Glass Card --- */}
      <div className="glass-panel relative z-10 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/10">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Nexus</h1>
          <p className="text-blue-200 text-sm">Institute Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Username Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-black/20 text-white border-white/10"
              placeholder="Username / Employee ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all duration-300 bg-black/20 text-white border-white/10"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex justify-center items-center gap-2 group"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="#" className="text-xs text-blue-300 hover:text-white transition-colors">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;