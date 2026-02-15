import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { Trash2, Plus, X, StickyNote, Pencil, AlertTriangle, Cloud } from 'lucide-react';

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const openCreateModal = () => { setEditingId(null); setNoteContent(''); setIsModalOpen(true); };
  const openEditModal = (note) => { setEditingId(note.id); setNoteContent(note.content); setIsModalOpen(true); };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsModalOpen(false);
    const content = noteContent; const id = editingId;
    setNoteContent(''); setEditingId(null);
    if (id) {
      await updateDoc(doc(db, 'notes', id), { content, updatedAt: new Date().toISOString() });
    } else {
      await addDoc(collection(db, 'notes'), { content, userId: user.uid, createdAt: new Date().toISOString() });
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteDoc(doc(db, 'notes', deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-200 p-3 rounded-2xl text-blue-700 shadow-md transform -rotate-3"><StickyNote size={28} strokeWidth={2.5}/></div>
          <div><h2 className="text-3xl font-black text-slate-800">Cloud Notes</h2><p className="text-slate-500 font-bold">Thoughts floating by...</p></div>
        </div>
        <button onClick={openCreateModal} className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95"><Plus size={24} strokeWidth={3} /> New Note</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div key={note.id} className="group bg-[#F0F9FF] p-6 rounded-[2rem] border-4 border-blue-100 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-blue-200 transition-all duration-300 flex flex-col justify-between min-h-[200px]">
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-bold text-lg">{note.content}</p>
            
            {/* --- FIX: Changed 'lg' to 'xl'. iPad Pro is 'lg' (1024px), so buttons will now stay visible! --- */}
            <div className="flex justify-end gap-3 mt-4 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={() => openEditModal(note)} 
                className="p-3 bg-white border border-blue-100 text-blue-500 hover:bg-blue-50 rounded-xl shadow-sm transition-colors"
              >
                <Pencil size={20} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => setDeleteId(note.id)} 
                className="p-3 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-xl shadow-sm transition-colors"
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-50/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white border-4 border-blue-100 rounded-[2.5rem] p-8 w-full max-w-lg shadow-xl"><div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">{editingId ? 'Edit Note' : 'New Thought'} <Cloud className="text-blue-400" /></h3><button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} strokeWidth={3}/></button></div><form onSubmit={handleSaveNote}><textarea autoFocus value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="w-full h-64 bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-5 text-slate-700 placeholder-blue-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none resize-none font-bold text-lg" placeholder="What's on your mind today?" /><div className="flex justify-end gap-3 mt-8"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-black hover:bg-slate-50 rounded-2xl transition-colors">Drift away</button><button type="submit" disabled={!noteContent.trim()} className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1">Save Note</button></div></form></div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
          <div className="relative bg-white border-4 border-red-50 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center"><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} strokeWidth={3} /></div><h3 className="text-xl font-black text-slate-800 mb-2">Delete this note?</h3><p className="text-slate-400 font-bold mb-6">It will vanish into thin air!</p><div className="flex justify-center gap-3"><button onClick={() => setDeleteId(null)} className="px-6 py-3 text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl">Keep it</button><button onClick={confirmDelete} className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white rounded-xl font-black shadow-lg shadow-red-200">Poof!</button></div></div>
        </div>
      )}
    </div>
  );
}