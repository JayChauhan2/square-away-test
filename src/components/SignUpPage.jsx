import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim();

    try {
      const { error } = await signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        // Check if email confirmation is required? usually yes.
        // Supabase defaults to requiring email confirmation.
        // We can redirect to login or show a message.
        alert('Registration successful! Please check your email to confirm your account.');
        navigate('/login');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">

      {/* Blobs */}
      <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl -top-20 -left-20 animate-[blob_20s_/_infinite]"></div>
      <div className="absolute w-80 h-80 bg-gradient-to-br from-teal-300/20 to-cyan-300/20 rounded-full blur-3xl bottom-10 right-10 animate-[blob_25s_/_infinite]"></div>
      <div className="absolute w-72 h-72 bg-gradient-to-br from-purple-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_30s_/_infinite]"></div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md p-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/30 flex flex-col items-center">
        <h1 className="text-4xl font-light text-slate-900 mb-6 text-center">
          Create Your Account
        </h1>
        <p className="text-slate-600 text-center mb-8 font-light">
          Join Square Away and start your wonderful math learning journey.
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSignUp} className="w-full">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400 shadow-sm transition-all duration-300"
          />

          {/* Role Selector */}
          <div className="w-full mb-4">
            <p className="text-sm text-slate-600 mb-2 font-medium">I am a:</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${role === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${role === 'teacher'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
              >
                Teacher
              </button>
            </div>
          </div>

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
            className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400 shadow-sm transition-all duration-300"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400 shadow-sm transition-all duration-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Sign Up'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500 text-center">
          Already have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/login')}>Log In</span>
        </p>
      </div>

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
