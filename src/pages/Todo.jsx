import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { Check, Trash2, Plus, X, CheckSquare, Sparkles, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function Todo({ user }) {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [task, setTask] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    // We try to order by 'order', but if that index doesn't exist yet, 
    // it might fail. If you see a console error link for 'todos', CLICK IT.
    const q = query(
      collection(db, 'todos'), 
      where('userId', '==', user.uid), 
      orderBy('order', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(loadedTasks);
    });
    return unsubscribe;
  }, [user]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    setIsModalOpen(false); 
    const t = task; 
    setTask('');
    
    // New tasks get a huge number so they go to the bottom
    await addDoc(collection(db, 'todos'), { 
      text: t, 
      completed: false, 
      userId: user.uid,
      order: Date.now() 
    });
  };

  const toggleComplete = async (todo) => {
    // Instant UI update for speed
    const newStatus = !todo.completed;
    setTasks(prev => prev.map(t => t.id === todo.id ? { ...t, completed: newStatus } : t));
    // Background DB update
    await updateDoc(doc(db, 'todos', todo.id), { completed: newStatus });
  };

  const confirmDelete = async () => { 
    if (deleteId) { 
      // Instant UI remove
      setTasks(prev => prev.filter(t => t.id !== deleteId));
      await deleteDoc(doc(db, 'todos', deleteId)); 
      setDeleteId(null); 
    } 
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items); // Instant UI update

    // Simple Reorder Strategy:
    // Just swap the 'order' values of the affected items to avoid updating the whole list.
    // However, to keep it self-healing, we update the whole list's order field.
    // We wrap this in a try-catch so if one fails, it doesn't crash the app.
    try {
      const updates = items.map((item, index) => 
        updateDoc(doc(db, 'todos', item.id), { order: index })
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Reorder failed", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-green-300 p-3 rounded-2xl text-green-800 shadow-md transform rotate-3">
            <CheckSquare size={28} strokeWidth={2.5}/>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">To-Do</h2>
            <p className="text-slate-500 font-bold">Drag to reorder.</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-green-400 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1 active:scale-95">
          <Plus size={24} strokeWidth={3} /> Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((t, index) => (
                <Draggable key={t.id} draggableId={t.id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group flex items-center justify-between p-4 rounded-3xl border-4 transition-all duration-200 ${t.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-green-100 shadow-sm'} ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-1 z-50 ring-2 ring-green-300' : 'hover:shadow-md'}`}
                      style={{ ...provided.draggableProps.style }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div {...provided.dragHandleProps} className="text-green-300 hover:text-green-500 cursor-grab active:cursor-grabbing p-2">
                          <GripVertical size={24} />
                        </div>
                        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleComplete(t)}>
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-green-400 border-green-400 scale-110' : 'bg-white border-slate-200 group-hover:border-green-300'}`}>
                            {t.completed && <Check size={20} className="text-white" strokeWidth={4} />}
                          </div>
                          <span className={`text-xl font-bold ${t.completed ? 'line-through text-slate-300' : 'text-slate-700'}`}>{t.text}</span>
                        </div>
                      </div>
                      <button onClick={() => setDeleteId(t.id)} className="text-slate-300 hover:text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={20} strokeWidth={2.5}/>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Modal & Delete Popups remain the same... */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-green-50/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white border-4 border-green-100 rounded-[2.5rem] p-8 w-full max-w-lg shadow-xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">New Mission <Sparkles className="text-green-400"/></h3>
                <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X size={24} strokeWidth={3}/></button>
             </div>
             <form onSubmit={addTask}>
                <input autoFocus type="text" value={task} onChange={(e) => setTask(e.target.value)} className="w-full bg-green-50/50 border-2 border-green-100 rounded-2xl p-5 text-slate-700 placeholder-slate-400 focus:ring-4 focus:ring-green-100 focus:border-green-300 outline-none font-bold text-xl mb-8" placeholder="e.g., Conquer the world..." />
                <div className="flex justify-end gap-3">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-black hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
                   <button type="submit" disabled={!task.trim()} className="bg-green-400 hover:bg-green-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1">Let's Go!</button>
                </div>
             </form>
          </div>
        </div>
      )}
      {deleteId && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div><div className="relative bg-white border-4 border-red-50 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center"><h3 className="text-xl font-black text-slate-800 mb-6">Remove this task?</h3><div className="flex justify-center gap-3"><button onClick={() => setDeleteId(null)} className="px-6 py-3 text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl">Cancel</button><button onClick={confirmDelete} className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white rounded-xl font-black">Delete</button></div></div></div>}
    </div>
  );
}