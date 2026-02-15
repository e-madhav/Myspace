import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Save, Loader, Sparkles, Hash, Maximize2, Minimize2 } from 'lucide-react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

// --- REGISTER FONTS ---
const Font = Quill.import('formats/font');
Font.whitelist = ['nunito', 'serif', 'monospace', 'handwriting'];
Quill.register(Font, true);

export default function PlanEditor({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);

  const modules = {
    toolbar: [
      [{ 'font': ['nunito', 'serif', 'monospace', 'handwriting'] }],
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'clean']
    ],
  };

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const docRef = doc(db, 'plans', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          if (docSnap.data().userId && docSnap.data().userId !== user.uid) {
             navigate('/planning'); return;
          }
          setTitle(docSnap.data().title);
          setContent(docSnap.data().content || ''); 
        } else { navigate('/planning'); }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchPlan();
  }, [id, navigate, user]);

  const saveDoc = async (newContent) => {
    if (!id) return;
    setStatus('Syncing...');
    try {
      await updateDoc(doc(db, 'plans', id), { content: newContent, updatedAt: new Date().toISOString() });
      setStatus('Saved ✨'); setTimeout(() => setStatus(''), 2000);
    } catch (err) { setStatus('Error!'); }
  };

  const getWordCount = (str) => {
    const text = str.replace(/<[^>]*>/g, ' ');
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#FFFBF0]">
      <Loader className="animate-spin text-pink-500 mb-4" size={40} />
    </div>
  );

  return (
    <div className={`max-w-5xl mx-auto h-screen flex flex-col transition-all duration-500 ${isFocusMode ? 'py-4' : 'pb-8'}`}>
      <style>{`
        /* --- 1. FONT FAMILIES --- */
        .ql-font-nunito { font-family: 'Nunito', sans-serif !important; }
        .ql-font-serif { font-family: 'Playfair Display', serif !important; }
        .ql-font-monospace { font-family: 'Fira Code', monospace !important; }
        .ql-font-handwriting { font-family: 'Caveat', cursive !important; }

        /* --- 2. TOOLBAR DROPDOWN LABELS --- */
        .ql-snow .ql-picker.ql-font .ql-picker-label::before, 
        .ql-snow .ql-picker.ql-font .ql-picker-item::before { content: 'Font'; }
        
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="nunito"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="nunito"]::before { content: 'Round'; }
        
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before { content: 'Serif'; }
        
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before { content: 'Code'; }
        
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="handwriting"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="handwriting"]::before { content: 'Sketch'; }

        /* --- 3. FIX: DROPDOWN VISIBILITY --- */
        .quill { 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
          border-radius: 2rem; 
          overflow: visible !important; /* ALLOWS DROPDOWNS TO SHOW */
        }
        
        .ql-toolbar { 
          background: rgba(255, 255, 255, 0.95) !important;
          border: 4px solid #FCE7F3 !important; 
          border-bottom: 2px solid #FCE7F3 !important;
          padding: 8px !important; 
          border-radius: 2rem 2rem 0 0 !important;
          flex-wrap: wrap !important; /* ALLOWS BUTTONS TO WRAP */
          z-index: 50;
        }

        /* Fix Picker Dropdowns appearing behind text */
        .ql-picker-options {
          z-index: 9999 !important;
          background-color: white !important;
          border: 1px solid #FCE7F3 !important;
          border-radius: 1rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          padding: 10px !important;
        }

        .ql-container { 
          flex: 1; 
          background: white !important; 
          border: 4px solid #FCE7F3 !important; 
          border-top: none !important;
          border-radius: 0 0 2rem 2rem !important;
          position: relative;
          overflow: hidden; /* KEEP TEXT INSIDE, BUT NOT TOOLBAR */
        }

        .ql-editor { 
          height: 100%;
          overflow-y: auto;
          padding: 3rem !important; 
          font-family: 'Nunito', sans-serif; 
          font-size: 1.15rem; 
          line-height: 1.8; 
          color: #475569;
        }

        /* Mobile Fixes */
        @media (max-width: 768px) {
          .ql-editor { padding: 1.5rem !important; font-size: 1.1rem !important; }
          .ql-toolbar { padding: 8px 4px !important; }
          .ql-formats { margin-right: 5px !important; margin-bottom: 5px !important; }
        }
      `}</style>

      {/* Header */}
      {!isFocusMode && (
        <div className="flex items-center justify-between mb-6 px-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/planning')} className="p-3 bg-white rounded-2xl border-2 border-pink-100 text-pink-400 hover:bg-pink-400 hover:text-white transition-all shadow-sm active:scale-90">
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight line-clamp-1">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFocusMode(true)} className="hidden md:block p-3 bg-white rounded-2xl border-2 border-pink-50 text-slate-300 hover:text-pink-400 transition-all">
              <Maximize2 size={20} />
            </button>
            <button onClick={() => saveDoc(content)} className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-pink-200 transition-all active:scale-95">
              <Save size={20} strokeWidth={3} /> <span className="hidden md:inline">Save</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex flex-col relative group h-full">
        <ReactQuill ref={quillRef} theme="snow" value={content} onChange={setContent} modules={modules} placeholder="Start writing..." />
        
        {isFocusMode && (
          <button onClick={() => setIsFocusMode(false)} className="absolute top-4 right-4 z-50 p-3 bg-white/90 backdrop-blur-md rounded-full border-2 border-pink-100 text-pink-400 shadow-xl hover:scale-110 transition-all">
            <Minimize2 size={24} />
          </button>
        )}
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border-2 border-pink-50 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-50">
           <div className="flex items-center gap-2 text-slate-500 font-black text-xs"><Hash size={14} className="text-pink-400" />{getWordCount(content)} words</div>
           <div className="w-1.5 h-1.5 rounded-full bg-pink-100"></div>
           <div className="text-pink-400 font-black text-xs tracking-wide">{status || 'Drafting...'}</div>
        </div>
      </div>
    </div>
  );
}