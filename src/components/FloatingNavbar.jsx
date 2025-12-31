import { NavLink } from "react-router-dom";
import { useState } from "react";
import { MoreHorizontal, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function FloatingNavbar() {
  const linkBase = "px-4 py-2 rounded-full text-sm font-light transition-all duration-300";
  const active = "bg-white/60 text-slate-900 shadow-sm";
  const inactive = "text-slate-600 hover:text-slate-900 hover:bg-white/40";
  const { user, signOut } = useAuth();

  const isTeacher = user?.user_metadata?.role === 'teacher';

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
