// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // ✅ add this

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const cleanEmail = email.trim();

    try {
      const { error } = await signIn({ email: cleanEmail, password });
      if (error) {
        // Supabase specific error handling
        if (error.message.includes("Email not confirmed")) {
          setError("Please confirm your email address before logging in.");
        } else if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(error.message);
        }
      } else {
        // Pass success state to next route
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">

      {/* Fluid gradient blobs */}
      <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl -top-20 -left-20 animate-[blob_20s_/_infinite]"></div>
      <div className="absolute w-80 h-80 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl bottom-10 right-10 animate-[blob_25s_/_infinite]"></div>
      <div className="absolute w-72 h-72 bg-gradient-to-br from-purple-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_30s_/_infinite]"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/30 flex flex-col items-center">
        <h1 className="text-4xl font-light text-slate-900 mb-6 text-center">
          Welcome Back
        </h1>
        <p className="text-slate-600 text-center mb-8 font-light">
          Enter your credentials to continue your math learning journey
        </p>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400 shadow-sm transition-all duration-300"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400 shadow-sm transition-all duration-300"
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105"
          >
            Log In
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500 text-center">
          Don't have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
      </div>

      {/* Add smooth blob animation */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}
