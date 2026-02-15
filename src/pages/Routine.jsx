import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Trash2, Plus, X, Calendar } from 'lucide-react';

export default function Routine({ user }) {
  const [routines, setRoutines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'routines'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const sorted = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                              .sort((a, b) => a.time.localeCompare(b.time));
      setRoutines(sorted);
    });
    return unsub;
  }, [user]);

  const addRoutine = async (e) => {
    e.preventDefault();
    if (!time || !activity) return;
    setIsModalOpen(false); const t = time; const a = activity; setTime(''); setActivity('');
    await addDoc(collection(db, 'routines'), { time: t, activity: a, userId: user.uid });
  };

  const confirmDelete = async () => { if (deleteId) { await deleteDoc(doc(db, 'routines', deleteId)); setDeleteId(null); } };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3"><div className="bg-purple-300 p-3 rounded-2xl text-purple-800 shadow-md transform -rotate-3"><Calendar size={28} strokeWidth={2.5}/></div><div><h2 className="text-3xl font-black text-slate-800">My Day</h2><p className="text-slate-500 font-bold">Flow through your day.</p></div></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-1 active:scale-95"><Plus size={24} strokeWidth={3} /> Add Item</button>
      </div>

      <div className="space-y-4 relative">
        <div className="absolute left-[2.4rem] top-4 bottom-4 w-1 bg-purple-100 rounded-full -z-10"></div>
        {routines.map((item) => (
          <div key={item.id} className="group flex items-center gap-6 bg-white p-5 rounded-[2rem] border-4 border-purple-50 hover:border-purple-100 hover:shadow-lg transition-all">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl font-black font-mono shadow-sm min-w-[100px] text-center">{item.time}</div>
            <div className="flex-1 text-lg font-bold text-slate-700">{item.activity}</div>
            
            {/* --- FIX: Darker color for visibility on phone --- */}
            <button onClick={() => setDeleteId(item.id)} className="text-red-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20} strokeWidth={2.5}/></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-purple-50/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div><div className="relative bg-white border-4 border-purple-100 rounded-[2.5rem] p-8 w-full max-w-md shadow-xl"><div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-black text-slate-800">New Habit ⏰</h3><button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X size={24} strokeWidth={3}/></button></div><form onSubmit={addRoutine} className="space-y-4"><div><label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">When?</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-purple-50/50 border-2 border-purple-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-4 focus:ring-purple-100 outline-none" /></div><div><label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">What?</label><input type="text" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Morning Jog" className="w-full bg-purple-50/50 border-2 border-purple-100 rounded-2xl p-4 text-slate-700 font-bold focus:ring-4 focus:ring-purple-100 outline-none" /></div><div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-black hover:bg-slate-50 rounded-2xl">Cancel</button><button type="submit" disabled={!time || !activity} className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-purple-200 hover:-translate-y-1 transition-transform">Add It</button></div></form></div></div>
      )}
      {deleteId && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div><div className="relative bg-white border-4 border-red-50 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center"><h3 className="text-xl font-black text-slate-800 mb-6">Remove item?</h3><div className="flex justify-center gap-3"><button onClick={() => setDeleteId(null)} className="px-6 py-3 text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl">Cancel</button><button onClick={confirmDelete} className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white rounded-xl font-black">Remove</button></div></div></div>}
    </div>
  );
}