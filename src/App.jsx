import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader } from 'lucide-react'; // For the loading spinner

// Import your pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Todo from './pages/Todo';
import Routine from './pages/Routine';
import Planning from './pages/Planning';
import PlanEditor from './pages/PlanEditor';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 1. ADD LOADING STATE

  useEffect(() => {
    // 2. FIREBASE LISTENER
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Tell React we are done checking!
    });
    return unsubscribe;
  }, []);

  // 3. THE MAGIC FIX: Show a spinner while Firebase is thinking
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF0]">
        <Loader className="animate-spin text-orange-400 mb-4" size={48} />
        <p className="text-slate-400 font-bold animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  // 4. Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/" />;
    return children;
  };

  return (
    <Routes>
      {/* If logged in, go to dashboard. If not, show login */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><Notes user={user} /></ProtectedRoute>} />
      <Route path="/todo" element={<ProtectedRoute><Todo user={user} /></ProtectedRoute>} />
      <Route path="/routine" element={<ProtectedRoute><Routine user={user} /></ProtectedRoute>} />
      <Route path="/planning" element={<ProtectedRoute><Planning user={user} /></ProtectedRoute>} />
      <Route path="/planning/:id" element={<ProtectedRoute><PlanEditor user={user} /></ProtectedRoute>} />
      
      {/* Catch-all: Redirect unknown URLs to dashboard or login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
