import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, StickyNote, Calendar, CheckSquare, PenTool, Sparkles, Menu, X, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const NavItem = ({ to, icon: Icon, label, color, onClick }) => {
  const location = useLocation();
  
  // Logic: Highlight "Home" only at root '/', others if URL starts with their path
  const isActive = to === '/' 
    ? location.pathname === '/' 
    : location.pathname.startsWith(to);

  const activeStyles = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 rounded-3xl transition-all font-bold mb-2 ${
        isActive 
          ? `${activeStyles[color]} shadow-sm scale-105` 
          : 'text-slate-400 hover:bg-white hover:text-slate-600'
      }`}
    >
      <Icon size={24} strokeWidth={2.5} />
      <span className="text-lg">{label}</span>
    </Link>
  );
};

export default function Layout({ user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFBF0] flex-col md:flex-row">
      
      {/* --- MOBILE HEADER (Visible only on phone) --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#FFFBF0] border-b border-orange-100 z-30 relative">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-400 rounded-xl text-white">
            <Sparkles size={20} fill="currentColor" />
          </div>
          <h1 className="text-xl font-black text-slate-800">MySpace</h1>
        </div>
        <button onClick={() => setIsMenuOpen(true)} className="p-2 text-slate-600 hover:bg-orange-50 rounded-xl transition-colors">
          <Menu size={28} />
        </button>
      </div>

      {/* --- SIDEBAR (Slides over everything on mobile) --- */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        w-72 p-6 flex flex-col bg-[#FFFBF0] md:bg-transparent z-50 border-r border-orange-50 md:border-none
        overflow-y-auto h-full shadow-2xl md:shadow-none
      `}>
        {/* Sidebar Header (Logo + Close Button for Mobile) */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-400 rounded-2xl text-white shadow-lg shadow-orange-200">
              <Sparkles size={24} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">MySpace</h1>
          </div>
          {/* Close Button (Mobile Only) */}
          <button onClick={closeMenu} className="md:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Home" color="blue" onClick={closeMenu} />
          <NavItem to="/notes" icon={StickyNote} label="Notes" color="yellow" onClick={closeMenu} />
          <NavItem to="/planning" icon={PenTool} label="Plans" color="pink" onClick={closeMenu} />
          <NavItem to="/routine" icon={Calendar} label="Routine" color="purple" onClick={closeMenu} />
          <NavItem to="/todo" icon={CheckSquare} label="To-Do" color="green" onClick={closeMenu} />
        </nav>

        {/* User Profile Section */}
        <div className="mt-8 pt-6 border-t border-orange-100 pb-10 md:pb-0">
          <div className="flex items-center gap-3 px-4 mb-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">{user?.displayName}</p>
              <p className="text-xs text-green-500 font-bold truncate flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center space-x-3 p-4 rounded-3xl w-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-bold group"
          >
            <LogOut size={24} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg">Log Out</span>
          </button>
        </div>
      </aside>

      {/* --- OVERLAY (Darkens background on mobile) --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200" onClick={closeMenu}></div>
      )}
      
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 h-full scroll-smooth">
        <div className="max-w-7xl mx-auto pb-24 md:pb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}