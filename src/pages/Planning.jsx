import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Trash2, Plus, X, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Planning({ user }) {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'plans'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    setIsModalOpen(false); 
    const t = newPlanTitle; 
    setNewPlanTitle("");
    const docRef = await addDoc(collection(db, 'plans'), { 
      title: t, content: "", userId: user.uid, updatedAt: new Date().toISOString() 
    });
    navigate(`/planning/${docRef.id}`);
  };

  const confirmDelete = async () => { if (deleteId) { await deleteDoc(doc(db, 'plans', deleteId)); setDeleteId(null); } };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3"><div className="bg-pink-300 p-3 rounded-2xl text-pink-800 shadow-md transform rotate-2"><FileText size={28} strokeWidth={2.5}/></div><div><h2 className="text-3xl font-black text-slate-800">Master Plans</h2><p className="text-slate-500 font-bold">Your big ideas, organized.</p></div></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-pink-200 transition-all transform hover:-translate-y-1 active:scale-95"><Plus size={24} strokeWidth={3} /> New Plan</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map(plan => (
          <div key={plan.id} onClick={() => navigate(`/planning/${plan.id}`)} className="group bg-white p-8 rounded-[2.5rem] border-4 border-pink-50 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-pink-100 transition-all cursor-pointer relative overflow-hidden flex flex-col h-72">
            <div className="flex items-start justify-between mb-4"><div className="p-3 bg-pink-50 rounded-2xl text-pink-400 group-hover:bg-pink-400 group-hover:text-white transition-colors"><FileText size={24} strokeWidth={2.5}/></div><div className="bg-pink-100 text-pink-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Draft</div></div>
            <h3 className="font-black text-xl text-slate-800 mb-3 truncate group-hover:text-pink-500 transition-colors">{plan.title}</h3>
            <div className="flex-1 overflow-hidden"><div className="text-slate-500 font-bold text-sm leading-relaxed line-clamp-4 opacity-80" dangerouslySetInnerHTML={{ __html: plan.content || "<i>Click to start writing your masterpiece...</i>" }} /></div>
            
            {/* --- FIX: Always visible on mobile, hover-only on desktop --- */}
            <button onClick={(e) => { e.stopPropagation(); setDeleteId(plan.id); }} className="absolute bottom-6 right-6 text-red-300 hover:text-red-400 p-2 hover:bg-red-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"><Trash2 size={20} strokeWidth={2.5} /></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-pink-50/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div><div className="relative bg-white border-4 border-pink-100 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"><div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">New Plan <Sparkles className="text-pink-400" /></h3><button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X size={24} strokeWidth={3}/></button></div><form onSubmit={handleCreatePlan}><input autoFocus type="text" value={newPlanTitle} onChange={(e) => setNewPlanTitle(e.target.value)} placeholder="Name your mission..." className="w-full bg-pink-50/50 border-2 border-pink-100 rounded-2xl p-5 text-slate-700 font-bold text-xl mb-8 focus:ring-4 focus:ring-pink-100 outline-none" /><div className="flex justify-end gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-black">Cancel</button><button type="submit" disabled={!newPlanTitle.trim()} className="bg-pink-400 hover:bg-pink-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-pink-200 transform hover:-translate-y-1 transition-all">Create</button></div></form></div></div>
      )}
      {deleteId && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div><div className="relative bg-white border-4 border-red-50 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center"><div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400"><AlertTriangle size={32} /></div><h3 className="text-xl font-black text-slate-800 mb-2">Delete Plan?</h3><p className="text-slate-400 font-bold mb-8">This cannot be undone!</p><div className="flex justify-center gap-3"><button onClick={() => setDeleteId(null)} className="px-6 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl">Keep it</button><button onClick={confirmDelete} className="px-6 py-3 bg-red-400 text-white rounded-xl font-black">Delete</button></div></div></div>}
    </div>
  );
}