import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, updateDoc, doc, query, where, limit, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { StickyNote, CheckSquare, Calendar, ArrowRight, Check, Pencil, X, Smile, Cloud, Sparkles, PartyPopper } from 'lucide-react';

export default function Dashboard({ user }) {
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (!user) return;

    // Secure Queries
    // Note: 'orderBy' combined with 'where' might require a Firebase Index. Check console if it errors.
    const notesQuery = query(collection(db, 'notes'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
    const todoQuery = query(collection(db, 'todos'), where('userId', '==', user.uid), limit(10));
    const routineQuery = query(collection(db, 'routines'), where('userId', '==', user.uid)); 
    
    const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubTodos = onSnapshot(todoQuery, (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubRoutine = onSnapshot(routineQuery, (snapshot) => {
      // Sort routines client-side to avoid complex index requirements for now
      const sorted = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                  .sort((a, b) => a.time.localeCompare(b.time));
      setRoutines(sorted);
      setLoading(false);
    });

    return () => { unsubNotes(); unsubTodos(); unsubRoutine(); };
  }, [user]);

  const openEditModal = (note) => { setCurrentNoteId(note.id); setNoteContent(note.content); setIsModalOpen(true); };
  
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsModalOpen(false);
    const id = currentNoteId; const content = noteContent;
    setCurrentNoteId(null); setNoteContent('');
    await updateDoc(doc(db, 'notes', id), { content, updatedAt: new Date().toISOString() });
  };

  const toggleTodo = async (todo) => await updateDoc(doc(db, 'todos', todo.id), { completed: !todo.completed });

  if (loading) return <div className="p-10 text-slate-400 font-bold animate-pulse">Loading your world...</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="bg-yellow-300 w-fit p-3 rounded-full text-yellow-800 shadow-md transform -rotate-6"><Smile size={32} strokeWidth={2.5} /></div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800">Hello, {user.displayName.split(' ')[0]}!</h2>
          <p className="text-slate-500 font-bold text-base md:text-lg">Ready to make today awesome?</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Quick Notes Card */}
        <div className="bg-[#F0F9FF] rounded-[2rem] border-4 border-blue-100 flex flex-col overflow-hidden h-auto min-h-[24rem] shadow-xl shadow-blue-100/50 hover:scale-[1.02] transition-transform duration-300">
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-3"><div className="p-2 bg-blue-200 rounded-xl text-blue-700"><Cloud size={24} strokeWidth={2.5} /></div><h3 className="text-xl font-extrabold text-slate-700">Quick Notes</h3></div>
            <Link to="/notes" className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:bg-blue-400 hover:text-white transition-all shadow-sm"><ArrowRight size={16} strokeWidth={3} /></Link>
          </div>
          <div className="p-6 pt-0 overflow-y-auto flex-1 space-y-3">
            {notes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70"><div className="mb-2 text-blue-300 animate-bounce"><Cloud size={32} /></div><p className="font-bold text-slate-400 mb-3">Head in the clouds?</p><Link to="/notes" className="text-blue-500 font-black hover:underline text-lg">+ Create Note</Link></div>
            ) : (
              notes.map(note => (
                <div key={note.id} className="group relative bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-blue-50"><p className="text-slate-600 font-medium line-clamp-2 pr-6">{note.content}</p><button onClick={() => openEditModal(note)} className="absolute top-3 right-3 text-slate-300 hover:text-blue-500 bg-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Pencil size={14} strokeWidth={3} /></button></div>
              ))
            )}
          </div>
        </div>

        {/* To-Do Card */}
        <div className="bg-[#F0FFF4] rounded-[2rem] border-4 border-green-100 flex flex-col overflow-hidden h-auto min-h-[24rem] shadow-xl shadow-green-100/50 hover:scale-[1.02] transition-transform duration-300">
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-3"><div className="p-2 bg-green-200 rounded-xl text-green-700"><CheckSquare size={24} strokeWidth={2.5} /></div><h3 className="text-xl font-extrabold text-slate-700">To-Do</h3></div>
            <Link to="/todo" className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:bg-green-400 hover:text-white transition-all shadow-sm"><ArrowRight size={16} strokeWidth={3} /></Link>
          </div>
          <div className="p-6 pt-0 overflow-y-auto flex-1 space-y-2">
             {todos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70"><div className="mb-2 text-green-300 animate-bounce delay-100"><PartyPopper size={32} /></div><p className="font-bold text-slate-400 mb-3">All caught up! Hooray!</p><Link to="/todo" className="text-green-500 font-black hover:underline text-lg">+ Add Task</Link></div>
            ) : (
              todos.map(todo => (
                <div key={todo.id} className="group flex items-center gap-3 p-3 bg-white rounded-2xl border border-green-50 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => toggleTodo(todo)}><div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${todo.completed ? 'bg-green-400 scale-110' : 'bg-slate-100 group-hover:bg-green-100'}`}>{todo.completed && <Check size={14} className="text-white" strokeWidth={4} />}</div><span className={`font-bold ${todo.completed ? 'line-through text-slate-300' : 'text-slate-600'}`}>{todo.text}</span></div>
              ))
            )}
          </div>
        </div>

        {/* Routine Card */}
        <div className="bg-[#F3F0FF] rounded-[2rem] border-4 border-purple-100 flex flex-col overflow-hidden h-auto min-h-[24rem] shadow-xl shadow-purple-100/50 hover:scale-[1.02] transition-transform duration-300">
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-3"><div className="p-2 bg-purple-200 rounded-xl text-purple-700"><Calendar size={24} strokeWidth={2.5} /></div><h3 className="text-xl font-extrabold text-slate-700">Routine</h3></div>
            <Link to="/routine" className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:bg-purple-400 hover:text-white transition-all shadow-sm"><ArrowRight size={16} strokeWidth={3} /></Link>
          </div>
          <div className="p-6 pt-0 overflow-y-auto flex-1">
            {routines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70"><div className="mb-2 text-purple-300 animate-bounce delay-200"><Sparkles size={32} /></div><p className="font-bold text-slate-400 mb-3">Design your magic day!</p><Link to="/routine" className="text-purple-500 font-black hover:underline text-lg">+ Create Routine</Link></div>
            ) : (
              <div className="space-y-4">{routines.map(item => (<div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-purple-50"><div className="font-black text-purple-500 bg-purple-50 px-3 py-1 rounded-lg text-sm">{item.time}</div><p className="font-bold text-slate-600">{item.activity}</p></div>))}</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-50/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white border-4 border-blue-100 rounded-[2rem] p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-black text-slate-800">Edit Note <Cloud className="inline text-blue-400 ml-1"/></h3><button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"><X size={20} strokeWidth={3}/></button></div>
            <form onSubmit={handleUpdateNote}>
              <textarea autoFocus value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="w-full h-48 bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-5 text-slate-700 placeholder-blue-300 focus:ring-4 focus:ring-blue-100 outline-none resize-none font-bold text-lg" placeholder="Drift away..." />
              <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button><button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}