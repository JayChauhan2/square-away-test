import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { MoreHorizontal, LogOut, User, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function FloatingNavbar() {
  const linkBase = "px-4 py-2 rounded-full text-sm font-light transition-all duration-300";
  const active = "bg-white/60 text-slate-900 shadow-sm";
  const inactive = "text-slate-600 hover:text-slate-900 hover:bg-white/40";
  const { user, signOut } = useAuth();

  const isTeacher = user?.user_metadata?.role === 'teacher';

  // Student class state
  const [currentClass, setCurrentClass] = useState(null);
  const [classCode, setClassCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (user && !isTeacher) {
      fetchCurrentClass();
    }
  }, [user, isTeacher]);

  const fetchCurrentClass = async () => {
    const { data: enrollment } = await supabase
      .from('class_enrollments')
      .select('class_id, classes(name, code)')
      .eq('student_id', user.id)
      .single();

    if (enrollment?.classes) {
      setCurrentClass(enrollment.classes);
      // Store in localStorage for Questions component
      localStorage.setItem('currentClassId', enrollment.class_id);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim() || classCode.length !== 5) {
      setJoinError('Please enter a valid 5-digit code');
      return;
    }

    setJoining(true);
    setJoinError('');

    // Find class by code
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name, code')
      .eq('code', classCode.trim())
      .single();

    if (classError || !classData) {
      setJoinError('Invalid class code');
      setJoining(false);
      return;
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('class_enrollments')
      .select('id')
      .eq('student_id', user.id)
      .single();

    if (existing) {
      setJoinError('You are already in a class. Leave your current class first.');
      setJoining(false);
      return;
    }

    // Join class
    const { error: joinError } = await supabase
      .from('class_enrollments')
      .insert([{
        class_id: classData.id,
        student_id: user.id
      }]);

    if (!joinError) {
      setCurrentClass(classData);
      localStorage.setItem('currentClassId', classData.id);
      setClassCode('');
    } else {
      setJoinError('Failed to join class');
    }

    setJoining(false);
  };

  const handleLeaveClass = async () => {
    if (!confirm('Are you sure you want to leave this class?')) return;

    await supabase
      .from('class_enrollments')
      .delete()
      .eq('student_id', user.id);

    setCurrentClass(null);
    localStorage.removeItem('currentClassId');
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-2 px-3 py-2
        bg-white/50 backdrop-blur-xl
        border border-white/40
        rounded-full shadow-lg shadow-blue-500/10"
      >
        {isTeacher ? (
          // Teacher Navigation
          <NavLink
            to="/teacher-dashboard"
            className={({ isActive }) => `${linkBase} ${isActive ? 'bg-yellow-400 text-black shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-yellow-100'}`}
          >
            Dashboard
          </NavLink>
        ) : (
          // Student Navigation
          <>
            <NavLink
              to="/"
              className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
            >
              Upload
            </NavLink>

            <NavLink
              to="/library"
              className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
            >
              Library
            </NavLink>

            <NavLink
              to="/practice"
              className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
            >
              Practice
            </NavLink>

            {/* Join Class Dropdown */}
            <div className="relative group">
              <button className={`${linkBase} ${currentClass ? 'bg-green-100 text-green-700 font-medium' : inactive} flex items-center gap-1`}>
                <UserPlus className="w-4 h-4" />
                {currentClass ? currentClass.name.substring(0, 15) + (currentClass.name.length > 15 ? '...' : '') : 'Join Class'}
              </button>

              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left">
                {currentClass ? (
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase mb-1">Current Class</p>
                    <p className="text-sm font-semibold text-slate-800 mb-1">{currentClass.name}</p>
                    <p className="text-xs text-slate-500 mb-3">Code: {currentClass.code}</p>
                    <button
                      onClick={handleLeaveClass}
                      className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Leave Class
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleJoinClass}>
                    <p className="text-sm font-medium text-slate-800 mb-2">Enter Class Code</p>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      maxLength={5}
                      placeholder="12345"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center text-lg font-mono mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {joinError && <p className="text-xs text-red-600 mb-2">{joinError}</p>}
                    <button
                      type="submit"
                      disabled={joining}
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {joining ? 'Joining...' : 'Join Class'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </>
        )}

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* More Menu */}
        <div className="relative group">
          <button className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
            {user ? (
              <>
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs text-slate-500 font-medium uppercase">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                  <p className="text-xs text-slate-400 capitalize">{isTeacher ? 'Teacher' : 'Student'}</p>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                Not signed in
              </div>
            )}
          </div>
        </div>

      </nav>
    </div>
  );
}
