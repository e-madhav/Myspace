import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="h-screen w-full bg-[#FFFBF0] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border-4 border-white shadow-2xl max-w-md w-full text-center relative z-10">
        <div className="bg-orange-400 w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-orange-200 transform -rotate-6">
          <Sparkles size={40} fill="currentColor" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">MySpace.</h1>
        <p className="text-slate-500 font-bold text-lg mb-10 leading-relaxed">
          Your private, cozy corner to organize your life.
        </p>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-white border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 p-4 rounded-2xl flex items-center justify-center gap-4 transition-all transform hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-md group"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          <span className="font-black text-slate-700 text-lg group-hover:text-blue-600">Continue with Google</span>
          <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 ml-auto" size={20} />
        </button>

        <p className="mt-8 text-xs font-bold text-slate-300 uppercase tracking-widest">
          Secure & Private
        </p>
      </div>
    </div>
  );
}