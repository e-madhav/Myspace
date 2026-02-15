import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Loader } from 'lucide-react';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Todo from './pages/Todo';
import Routine from './pages/Routine';
import Planning from './pages/Planning';
import PlanEditor from './pages/PlanEditor';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#FFFBF0] flex items-center justify-center text-orange-400">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      
      {/* Protected Layout: Passes 'user' prop to all children */}
      <Route path="/" element={user ? <Layout user={user} /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard user={user} />} />
        <Route path="notes" element={<Notes user={user} />} />
        <Route path="todo" element={<Todo user={user} />} />
        <Route path="routine" element={<Routine user={user} />} />
        <Route path="planning" element={<Planning user={user} />} />
        <Route path="planning/:id" element={<PlanEditor user={user} />} />
      </Route>
    </Routes>
  );
}