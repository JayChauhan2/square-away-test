import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { MoreHorizontal, LogOut, User, UserPlus, Check, ChevronDown, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function FloatingNavbar() {
  const linkBase = "px-4 py-2 rounded-full text-sm font-light transition-all duration-300";
  const active = "bg-white/60 text-slate-900 shadow-sm";
  const inactive = "text-slate-600 hover:text-slate-900 hover:bg-white/40";
  const { user, signOut } = useAuth();

  const isTeacher = user?.user_metadata?.role === 'teacher';

  // Student class state
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [classCode, setClassCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  useEffect(() => {
    if (user && !isTeacher) {
      fetchEnrollments();
    }
  }, [user, isTeacher]);

  const fetchEnrollments = async () => {
    try {
      const { data: enrollments, error } = await supabase
        .from('class_enrollments')
        .select('class_id, classes(id, name, code)')
        .eq('student_id', user.id);

      if (error) throw error;

      if (enrollments && enrollments.length > 0) {
        // Map to cleaner objects
        const classes = enrollments.map(e => e.classes).filter(Boolean);
        setEnrolledClasses(classes);

        // Determine active class
        const savedId = localStorage.getItem('currentClassId');
        const savedClass = classes.find(c => c.id.toString() === savedId);

        if (savedClass) {
          setActiveClass(savedClass);
        } else {
          // Default to first class if nothing saved or saved class not found
          setActiveClass(classes[0]);
          localStorage.setItem('currentClassId', classes[0].id);
        }
      } else {
        setEnrolledClasses([]);
        setActiveClass(null);
        localStorage.removeItem('currentClassId');
      }
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  };

  const switchClass = (cls) => {
    setActiveClass(cls);
    localStorage.setItem('currentClassId', cls.id);
    setShowJoinInput(false);
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim() || classCode.length !== 5) {
      setJoinError('Please enter a valid 5-digit code');
      return;
    }

    setJoining(true);
    setJoinError('');

    try {
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
      const isEnrolled = enrolledClasses.some(c => c.id === classData.id);
      if (isEnrolled) {
        setJoinError('You are already enrolled in this class.');
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

      if (joinError) throw joinError;

      // Update state
      const updatedClasses = [...enrolledClasses, classData];
      setEnrolledClasses(updatedClasses);
      setActiveClass(classData);
      localStorage.setItem('currentClassId', classData.id);

      // Reset form
      setClassCode('');
      setShowJoinInput(false);

    } catch (err) {
      console.error('Error joining class:', err);
      setJoinError('Failed to join class. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveClass = async (classId) => {
    if (!confirm('Are you sure you want to leave this class?')) return;

    try {
      const { error } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('student_id', user.id)
        .eq('class_id', classId);

      if (error) throw error;

      // Update local state
      const updatedClasses = enrolledClasses.filter(c => c.id !== classId);
      setEnrolledClasses(updatedClasses);

      if (activeClass && activeClass.id === classId) {
        if (updatedClasses.length > 0) {
          setActiveClass(updatedClasses[0]);
          localStorage.setItem('currentClassId', updatedClasses[0].id);
        } else {
          setActiveClass(null);
          localStorage.removeItem('currentClassId');
        }
      }
    } catch (err) {
      console.error("Error leaving class:", err);
      alert("Failed to leave class");
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-2 px-3 py-2
        bg-white/50 backdrop-blur-xl
        border border-white/40
        rounded-full shadow-lg shadow-blue-500/10"
      >
        {isTeacher ? (
          // Teacher Navigation (Unchanged)
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

            {/* Multi-Class Dropdown */}
            <div className="relative group">
              <button
                className={`${linkBase} ${activeClass ? 'bg-green-100 text-green-700 font-medium' : inactive} flex items-center gap-1 min-w-[120px] justify-between`}
              >
                <div className="flex items-center gap-1 overflow-hidden">
                  <UserPlus className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate max-w-[100px]">
                    {activeClass ? activeClass.name : 'Join Class'}
                  </span>
                </div>
                {activeClass && <ChevronDown className="w-3 h-3 opacity-50" />}
              </button>

              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left divide-y divide-slate-100">

                {/* Enrolled Classes List */}
                {enrolledClasses.length > 0 && !showJoinInput && (
                  <div className="mb-2">
                    <p className="px-3 py-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">Your Classes</p>
                    <div className="space-y-1">
                      {enrolledClasses.map(cls => (
                        <div key={cls.id} className="flex items-center justify-between group/item px-2 py-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                          <button
                            onClick={() => switchClass(cls)}
                            className={`flex-1 flex items-center gap-2 text-left text-sm
                              ${activeClass?.id === cls.id ? 'text-blue-600 font-medium' : 'text-slate-700'}
                            `}
                          >
                            {activeClass?.id === cls.id && <Check className="w-3 h-3" />}
                            <span className={activeClass?.id === cls.id ? '' : 'pl-5'}>
                              {cls.name}
                            </span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeaveClass(cls.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover/item:opacity-100 transition-all"
                            title="Leave Class"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Join New Class Section */}
                <div className="pt-2">
                  {!showJoinInput ? (
                    <button
                      onClick={() => setShowJoinInput(true)}
                      className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Join Another Class
                    </button>
                  ) : (
                    <div className="px-2 pb-2">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-slate-800">Enter Class Code</p>
                        <button
                          onClick={() => {
                            setShowJoinInput(false);
                            setJoinError('');
                            setClassCode('');
                          }}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                      <form onSubmit={handleJoinClass}>
                        <input
                          type="text"
                          value={classCode}
                          onChange={(e) => setClassCode(e.target.value)}
                          maxLength={5}
                          placeholder="12345"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center text-lg font-mono mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          autoFocus
                        />
                        {joinError && <p className="text-xs text-red-600 mb-2">{joinError}</p>}
                        <button
                          type="submit"
                          disabled={joining}
                          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {joining ? 'Joining...' : 'Join Class'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* More Menu (Unchanged) */}
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
