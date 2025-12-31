import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Users, Copy, Check, Plus, ArrowLeft } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [className, setClassName] = useState('');
    const [creating, setCreating] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        if (user) {
            fetchClasses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClass) {
            fetchClassStudents(selectedClass.id);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setClasses(data);
        }
    };

    const fetchClassStudents = async (classId) => {
        // Get enrollments
        const { data: enrollments, error } = await supabase
            .from('class_enrollments')
            .select('student_id, joined_at')
            .eq('class_id', classId);

        if (error || !enrollments) {
            setStudents([]);
            return;
        }

        // Get practices for each student in this class
        const studentData = await Promise.all(
            enrollments.map(async (enrollment) => {
                const { data: practices } = await supabase
                    .from('practices')
                    .select('score, created_at, topic')
                    .eq('user_id', enrollment.student_id)
                    .eq('class_id', classId)
                    .order('created_at', { ascending: true });

                // Get user email from auth
                const { data: { users } } = await supabase.auth.admin.listUsers();
                const userData = users?.find(u => u.id === enrollment.student_id);

                // Calculate stats
                const avgScore = practices?.length > 0
                    ? Math.round(practices.reduce((acc, p) => acc + p.score, 0) / practices.length)
                    : 0;

                return {
                    id: enrollment.student_id,
                    email: userData?.email || 'Unknown',
                    name: userData?.user_metadata?.full_name || 'Student',
                    joinedAt: enrollment.joined_at,
                    practices: practices || [],
                    avgScore,
                    totalPractices: practices?.length || 0
                };
            })
        );

        setStudents(studentData);
    };

    const generateCode = () => {
        return Math.floor(10000 + Math.random() * 90000).toString();
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!className.trim()) return;

        setCreating(true);
        const code = generateCode();

        const { data, error } = await supabase
            .from('classes')
            .insert([{
                teacher_id: user.id,
                name: className,
                code: code
            }])
            .select();

        if (!error && data) {
            setClasses([data[0], ...classes]);
            setClassName('');
        }

        setCreating(false);
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen overflow-x-hidden p-6">

            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl top-10 left-5 animate-[blob_15s_linear_infinite]" />
                <div className="absolute w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl bottom-20 right-10 animate-[blob_20s_linear_infinite]" />
                <div className="absolute w-72 h-72 bg-gradient-to-br from-violet-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_18s_linear_infinite]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {!selectedClass ? (
                    <>
                        {/* Page Title */}
                        <h1 className="text-5xl md:text-6xl font-light text-slate-900 text-center mb-8">
                            Teacher Dashboard
                        </h1>

                        {/* Create Class Section */}
                        <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200/50">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Create New Class</h2>

                            <form onSubmit={handleCreateClass} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Class Name (e.g., Algebra 1 - Period 3)"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={creating || !className.trim()}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    {creating ? 'Creating...' : 'Create Class'}
                                </button>
                            </form>
                        </div>

                        {/* Classes List */}
                        <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200/50">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Your Classes</h2>

                            {classes.length === 0 ? (
                                <p className="text-slate-500 italic text-center py-8">No classes yet. Create your first class above!</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {classes.map((cls) => (
                                        <div
                                            key={cls.id}
                                            onClick={() => setSelectedClass(cls)}
                                            className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                                        >
                                            <h3 className="font-semibold text-lg text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                                                {cls.name}
                                            </h3>

                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-500">Code:</span>
                                                    <span className="text-2xl font-bold text-blue-600 tracking-wider">{cls.code}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyCode(cls.code);
                                                    }}
                                                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                                    title="Copy code"
                                                >
                                                    {copiedCode === cls.code ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-slate-600" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Users className="w-4 h-4" />
                                                <span className="text-sm">Click to view students</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // Class Details View
                    <>
                        <button
                            onClick={() => setSelectedClass(null)}
                            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Classes</span>
                        </button>

                        <h1 className="text-4xl font-light text-slate-900 mb-2">{selectedClass.name}</h1>
                        <p className="text-slate-600 mb-8">
                            Class Code: <span className="text-2xl font-bold text-blue-600 tracking-wider">{selectedClass.code}</span>
                        </p>

                        {/* Class Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-blue-100">
                                <p className="text-slate-500 font-medium mb-1">Total Students</p>
                                <p className="text-4xl font-bold text-slate-800">{students.length}</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-purple-100">
                                <p className="text-slate-500 font-medium mb-1">Avg Class Score</p>
                                <p className="text-4xl font-bold text-slate-800">
                                    {students.length > 0
                                        ? Math.round(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length)
                                        : 0}%
                                </p>
                            </div>
                            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-green-100">
                                <p className="text-slate-500 font-medium mb-1">Total Practices</p>
                                <p className="text-4xl font-bold text-slate-800">
                                    {students.reduce((acc, s) => acc + s.totalPractices, 0)}
                                </p>
                            </div>
                        </div>

                        {/* Student List with Analytics */}
                        <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200/50">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Student Progress</h2>

                            {students.length === 0 ? (
                                <p className="text-slate-500 italic text-center py-8">No students enrolled yet. Share the class code with your students!</p>
                            ) : (
                                <div className="space-y-6">
                                    {students.map((student) => (
                                        <div key={student.id} className="border border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-slate-800">{student.name}</h3>
                                                    <p className="text-sm text-slate-500">{student.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-500">Average Score</p>
                                                    <p className="text-2xl font-bold text-blue-600">{student.avgScore}%</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-slate-500">Practices Completed</p>
                                                    <p className="text-lg font-semibold text-slate-800">{student.totalPractices}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Joined</p>
                                                    <p className="text-lg font-semibold text-slate-800">
                                                        {new Date(student.joinedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Student Performance Chart */}
                                            {student.practices.length > 0 && (
                                                <div className="h-48 mt-4">
                                                    <p className="text-sm text-slate-600 mb-2">Performance Trend</p>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={student.practices.map(p => ({
                                                            date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                                            score: p.score
                                                        }))}>
                                                            <defs>
                                                                <linearGradient id={`gradient-${student.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                                                            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                            <Tooltip />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="score"
                                                                stroke="#3b82f6"
                                                                strokeWidth={2}
                                                                fill={`url(#gradient-${student.id})`}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
