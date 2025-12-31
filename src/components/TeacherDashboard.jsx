export default function TeacherDashboard() {
    return (
        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen overflow-x-hidden p-6">

            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl top-10 left-5 animate-[blob_15s_linear_infinite]" />
                <div className="absolute w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl bottom-20 right-10 animate-[blob_20s_linear_infinite]" />
                <div className="absolute w-72 h-72 bg-gradient-to-br from-violet-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_18s_linear_infinite]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">

                {/* Page Title */}
                <h1 className="text-5xl md:text-6xl font-light text-slate-900 text-center mb-8">
                    Teacher Dashboard
                </h1>

                {/* Placeholder Content */}
                <div className="bg-white/90 backdrop-blur rounded-3xl p-12 shadow-lg border border-slate-200/50 text-center">
                    <p className="text-xl text-slate-600">
                        Welcome to your Teacher Dashboard!
                    </p>
                    <p className="text-slate-500 mt-4">
                        More features coming soon...
                    </p>
                </div>

            </div>
        </div>
    );
}
