import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Search, Plus, Filter, User, CheckCircle, 
  XCircle, BookOpen, Library as LibraryIcon, RotateCcw,
  Grid, Image as ImageIcon
} from 'lucide-react';
import api from './api';
import Dock from './Dock';
import { GlassInput, GlassButton, GlassSelect, Skeleton } from './components/GlassUI';

const Library = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  
  // Data
  const [books, setBooks] = useState([]);
  const [activeIssues, setActiveIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
  
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [searchTerm, selectedCategory, activeTab]);

  const fetchCategories = async () => {
      try {
          const res = await api.get('library/books/categories/');
          setCategories(res.data);
      } catch (err) { console.error("Failed to load categories"); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'catalog') {
        const params = new URLSearchParams();
        if(searchTerm) params.append('search', searchTerm);
        if(selectedCategory) params.append('category', selectedCategory);
        
        const res = await api.get(`library/books/?${params.toString()}`);
        setBooks(res.data);
      } else {
        const res = await api.get(`library/issues/?status=active`);
        setActiveIssues(res.data);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleReturnBook = async (issueId) => {
    if(!window.confirm("Confirm return of this book?")) return;
    try {
        await api.post(`library/issues/${issueId}/return_book/`);
        fetchData(); 
    } catch (err) { alert("Failed to return book."); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-orange-500/30">
      <div className="fixed top-[-20%] right-[-10%] w-[900px] h-[900px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <LibraryIcon className="text-orange-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-orange-200 tracking-tighter">Library</h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Digital Catalog & Circulation</p>
        </motion.div>

        <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
            <button onClick={() => setActiveTab('catalog')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'catalog' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                <Grid size={16}/> Catalog
            </button>
            <button onClick={() => setActiveTab('circulation')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'circulation' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                <RotateCcw size={16}/> Circulation Desk
            </button>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
             <div className="w-full md:w-64">
                <GlassInput icon={Search} placeholder="Search Title, ISBN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <div className="w-full md:w-48">
                <GlassSelect value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </GlassSelect>
             </div>
             <div className="flex gap-2 ml-auto w-full md:w-auto">
                <GlassButton onClick={() => setIsAddBookModalOpen(true)} variant="ghost" className="md:w-auto"><Plus size={18}/> Add Book</GlassButton>
                <GlassButton onClick={() => setIsIssueModalOpen(true)} className="md:w-auto"><BookOpen size={18}/> Issue Book</GlassButton>
             </div>
        </div>
      )}

      <div className="relative z-10 min-h-[400px]">
        <AnimatePresence mode="wait">
            {activeTab === 'catalog' && (
                <motion.div key="catalog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {loading ? ([...Array(10)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)) : books.length > 0 ? (
                        books.map((book) => (
                            <div key={book.id} className="group relative glass-panel p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all hover:-translate-y-2 duration-300">
                                <div className="aspect-[2/3] w-full rounded-xl overflow-hidden mb-4 relative shadow-lg bg-gray-800">
                                    <img 
                                        src={book.cover_image} 
                                        alt={book.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                        onError={(e) => { e.target.src = "https://placehold.co/400x600/1e1e1e/FFF?text=No+Cover"; }}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-md ${book.available_copies > 0 ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                            {book.available_copies > 0 ? `${book.available_copies} Left` : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-1">
                                    <h3 className="font-bold text-white truncate text-lg mb-1" title={book.title}>{book.title}</h3>
                                    <p className="text-xs text-gray-400 mb-2 truncate">{book.author}</p>
                                    <div className="flex flex-wrap gap-1 mt-2 mb-3">
                                        {book.categories && book.categories.map(cat => (
                                            <span key={cat.name} className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => { setSelectedBookForIssue(book); setIsIssueModalOpen(true); }}
                                        disabled={book.available_copies === 0}
                                        className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-xs shadow-lg flex justify-center gap-2"
                                    >
                                        <BookOpen size={14}/> Issue
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-500">No books found.</div>
                    )}
                </motion.div>
            )}

            {activeTab === 'circulation' && (
                <motion.div key="circulation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                    {loading ? ([...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)) : activeIssues.length > 0 ? (
                        activeIssues.map((issue) => (
                            <div key={issue.id} className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-12 h-16 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                                        <img src={issue.book_details.cover_image} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x600/1e1e1e/FFF?text=Cover"; }}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{issue.book_details.title}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <User size={12}/> Issued to <span className="text-white font-medium">{issue.student_details.user.first_name} {issue.student_details.user.last_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Due Date</div>
                                        <div className="text-white font-mono flex items-center gap-2">
                                            {issue.due_date} 
                                            {new Date(issue.due_date) < new Date() && <span className="text-red-500 text-xs font-bold">(Overdue)</span>}
                                        </div>
                                    </div>
                                    <GlassButton onClick={() => handleReturnBook(issue.id)} className="bg-green-600 hover:bg-green-500"><CheckCircle size={18}/> Return</GlassButton>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/5">
                            <CheckCircle size={48} className="mx-auto mb-4 text-green-500/50"/>
                            <p className="text-gray-400 text-lg">All books returned!</p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <Dock />
      <IssueBookModal isOpen={isIssueModalOpen} onClose={() => { setIsIssueModalOpen(false); setSelectedBookForIssue(null); }} preSelectedBook={selectedBookForIssue} onSuccess={fetchData} />
      <AddBookModal isOpen={isAddBookModalOpen} onClose={() => setIsAddBookModalOpen(false)} onSuccess={() => { fetchData(); fetchCategories(); }} />
    </div>
  );
};

const IssueBookModal = ({ isOpen, onClose, preSelectedBook, onSuccess }) => {
    const [students, setStudents] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedBook, setSelectedBook] = useState(preSelectedBook?.id || '');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(isOpen) {
            api.get('students/profiles/').then(res => setStudents(res.data));
            if(!preSelectedBook) api.get('library/books/').then(res => setBooks(res.data));
            if(preSelectedBook) setSelectedBook(preSelectedBook.id);
        }
    }, [isOpen, preSelectedBook]);

    const handleSubmit = async () => {
        if(!selectedStudent || !selectedBook || !dueDate) return;
        setLoading(true);
        try {
            await api.post('library/issues/', { student: selectedStudent, book: selectedBook, due_date: dueDate });
            alert("Book Issued Successfully!");
            onSuccess(); onClose();
        } catch(err) { alert(err.response?.data?.error || "Failed to issue."); } 
        finally { setLoading(false); }
    };

    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><XCircle size={24}/></button>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="text-orange-400"/> Issue Book</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Student</label>
                        <GlassSelect value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                            <option value="">Select Student...</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.user.first_name} {s.user.last_name}</option>)}
                        </GlassSelect>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Book</label>
                        {preSelectedBook ? (
                            <div className="p-3 bg-white/10 rounded-xl text-white font-bold border border-white/20">{preSelectedBook.title}</div>
                        ) : (
                            <GlassSelect value={selectedBook} onChange={e => setSelectedBook(e.target.value)}>
                                <option value="">Select Book...</option>
                                {books.map(b => <option key={b.id} value={b.id}>{b.title} (Qty: {b.available_copies})</option>)}
                            </GlassSelect>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Due Date</label>
                        <input type="date" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-orange-500" value={dueDate} onChange={e => setDueDate(e.target.value)}/>
                    </div>
                </div>
                <div className="mt-8 flex gap-3">
                    <GlassButton onClick={onClose} variant="ghost" className="flex-1">Cancel</GlassButton>
                    <GlassButton onClick={handleSubmit} className="flex-1 bg-orange-600 hover:bg-orange-500" disabled={loading}>{loading ? 'Issuing...' : 'Confirm'}</GlassButton>
                </div>
            </motion.div>
        </div>
    );
};

const AddBookModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', author: '', isbn: '', category_input: '', total_copies: 1, cover_image: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if(!formData.title || !formData.isbn) return alert("Title and ISBN are required.");
        setLoading(true);
        try {
            // FIX: Remove cover_image if it's empty to prevent 400 Bad Request
            const payload = { ...formData };
            if (!payload.cover_image) delete payload.cover_image;

            await api.post('library/books/', payload);
            alert("Book Added Successfully!");
            onSuccess(); onClose();
            setFormData({ title: '', author: '', isbn: '', category_input: '', total_copies: 1, cover_image: '' });
        } catch(err) {
            console.error(err);
            // Log the specific backend error for debugging
            alert(JSON.stringify(err.response?.data) || "Failed to add book.");
        } finally { setLoading(false); }
    };

    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><XCircle size={24}/></button>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Book className="text-blue-400"/> Add New Book</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Book Title</label>
                        <GlassInput value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. A Brief History of Time" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Author</label>
                        <GlassInput value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="Author Name" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">ISBN</label>
                        <GlassInput value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} placeholder="Unique ISBN" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Categories</label>
                        <GlassInput value={formData.category_input} onChange={e => setFormData({...formData, category_input: e.target.value})} placeholder="e.g. Sci-Fi, Thriller" />
                        <p className="text-[9px] text-gray-600 mt-1 ml-2">Separate multiple with comma</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Copies</label>
                        <input type="number" min="1" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" value={formData.total_copies} onChange={e => setFormData({...formData, total_copies: parseInt(e.target.value) || 1})}/>
                    </div>
                    <div className="md:col-span-2">
                         <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Cover Image URL</label>
                         <GlassInput icon={ImageIcon} value={formData.cover_image} onChange={e => setFormData({...formData, cover_image: e.target.value})} placeholder="https://..." />
                    </div>
                </div>
                <div className="mt-8 flex gap-3">
                    <GlassButton onClick={onClose} variant="ghost" className="flex-1">Cancel</GlassButton>
                    <GlassButton onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-500" disabled={loading}>{loading ? 'Adding...' : 'Add to Catalog'}</GlassButton>
                </div>
            </motion.div>
        </div>
    );
};

export default Library;