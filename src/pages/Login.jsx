import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth'; 
import { Sparkles, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // This catches the user EXACTLY when they return from the Google Redirect
    getRedirectResult(auth)
      .then((result) => {
        // If successful, App.jsx handles the redirect automatically!
      })
      .catch((error) => {
        // THIS is what we were missing. It will now show us the exact error.
        console.error("Google Redirect Error:", error);
        setErrorMsg(error.message);
      });
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Login trigger failed", error);
      setErrorMsg(error.message);
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
        <p className="text-slate-500 font-bold mb-6 text-lg">Your mind, organized.</p>
        
        {/* If an error happens, this red box will appear to tell us WHY */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex flex-col items-center gap-2 text-red-600 text-sm font-bold">
            <AlertTriangle size={24} />
            <p>{errorMsg}</p>
          </div>
        )}
        
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
