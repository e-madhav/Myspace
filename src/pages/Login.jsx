import React from 'react';
import { auth, googleProvider } from '../firebase';
// 1. IMPORTANT: Import signInWithRedirect instead of signInWithPopup
import { signInWithRedirect } from 'firebase/auth'; 
import { Sparkles } from 'lucide-react';

export default function Login() {
  
  const handleLogin = async () => {
    try {
      // 2. IMPORTANT: Use signInWithRedirect
      await signInWithRedirect(auth, googleProvider);
      
      // Note: We do NOT need navigate('/') here anymore. 
      // The page will redirect to Google. When Google sends them back, 
      // your App.jsx will automatically see they are logged in and load the Dashboard!
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0] p-4">
      <div className="bg-white p-10 rounded-[3rem] border-4 border-orange-50 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300"></div>
        
        <div className="bg-orange-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 shadow-sm">
          <Sparkles className="text-orange-500" size={40} />
        </div>
        
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4">MySpace</h1>
        <p className="text-slate-500 font-bold mb-10 text-lg">Your mind, organized.</p>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 bg-white p-0.5 rounded-full" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
