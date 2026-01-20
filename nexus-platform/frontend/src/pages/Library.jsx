import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { Book, Search, Plus, User, Calendar, CheckCircle, RotateCcw } from 'lucide-react';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Issue Modal State
  const [selectedBook, setSelectedBook] = useState(null);
  const [studentId, setStudentId] = useState('');
  
  // Add Book Modal State
  const [isAddOpen, setAddOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: 'General', total_copies: 5 });

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/library/books/', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setBooks(await res.json());
    setLoading(false);
  };

  const issueBook = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/library/issue/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ book_id: selectedBook.id, student_id: studentId })
    });
    if (res.ok) { alert("Book Issued!"); setSelectedBook(null); fetchBooks(); }
    else alert("Failed. Check Student ID or Stock.");
  };

  const addBook = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    await fetch('http://127.0.0.1:8000/api/library/books/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({...newBook, available_copies: newBook.total_copies})
    });
    setAddOpen(false); fetchBooks();
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-blue-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-32">
         
         <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Library</h1>
              <p className="text-slate-400 mt-2">Digital Asset Management</p>
            </div>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all font-medium">
              <Plus size={20} /> Add Book
            </button>
         </div>

         {/* BOOK GRID */}
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map(book => (
               <div key={book.id} className="group relative">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
                     <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
                     
                     <div className="absolute bottom-0 left-0 w-full p-4">
                        <div className="text-xs text-blue-400 font-bold mb-1">{book.category}</div>
                        <h3 className="font-bold text-white leading-tight mb-1">{book.title}</h3>
                        <p className="text-xs text-slate-400">{book.author}</p>
                     </div>

                     {/* HOVER OVERLAY */}
                     <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                        <div className="font-bold text-2xl text-white mb-2">{book.available_copies}</div>
                        <div className="text-xs text-blue-200 uppercase tracking-widest mb-4">Available</div>
                        <button 
                            onClick={() => setSelectedBook(book)}
                            disabled={book.available_copies < 1}
                            className="px-4 py-2 bg-white text-blue-900 font-bold rounded-lg text-sm hover:bg-blue-50 disabled:opacity-50"
                        >
                            Issue Book
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* ISSUE MODAL */}
         <GlassModal isOpen={!!selectedBook} onClose={() => setSelectedBook(null)} title="Issue Book">
            <form onSubmit={issueBook} className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl flex gap-4">
                    <img src={selectedBook?.cover_image} className="w-16 h-24 object-cover rounded-lg" />
                    <div>
                        <h3 className="font-bold text-lg">{selectedBook?.title}</h3>
                        <p className="text-slate-400 text-sm">{selectedBook?.isbn}</p>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-slate-400">Student ID (e.g. 5)</label>
                    <input type="number" required value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white mt-1"/>
                </div>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">Confirm Issue</button>
            </form>
         </GlassModal>

         {/* ADD BOOK MODAL */}
         <GlassModal isOpen={isAddOpen} onClose={() => setAddOpen(false)} title="New Inventory">
            <form onSubmit={addBook} className="space-y-4">
                <input type="text" placeholder="Title" required value={newBook.title} onChange={e=>setNewBook({...newBook, title: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                <input type="text" placeholder="Author" required value={newBook.author} onChange={e=>setNewBook({...newBook, author: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="ISBN" required value={newBook.isbn} onChange={e=>setNewBook({...newBook, isbn: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                    <input type="number" placeholder="Copies" required value={newBook.total_copies} onChange={e=>setNewBook({...newBook, total_copies: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                </div>
                <button className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">Add to Library</button>
            </form>
         </GlassModal>

       </main>
       <Dock />
    </div>
  );
};
export default Library;