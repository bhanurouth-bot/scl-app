import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Plus, Search, BookOpen, Trash2, Edit, X 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const Library = () => {
  const [activeTab, setActiveTab] = useState('catalog'); // catalog | circulation
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  
  // State for Editing
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);

  // Forms
  const [selectedBook, setSelectedBook] = useState(null); 
  const [bookForm, setBookForm] = useState({ 
      title: '', author: '', isbn: '', category: '', 
      total_copies: 1, cover_image: '' 
  });
  const [issueForm, setIssueForm] = useState({ student: '', due_date: '' });

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const [bookRes, issueRes, stuRes] = await Promise.all([
        api.get('library/books/'),
        api.get('library/issues/'),
        api.get('students/profiles/')
      ]);
      setBooks(bookRes.data);
      setIssues(issueRes.data);
      setStudents(stuRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Book Management (Create / Edit / Delete) ---
  
  const openAddModal = () => {
      setIsEditMode(false);
      setBookForm({ title: '', author: '', isbn: '', category: '', total_copies: 1, cover_image: '' });
      setIsBookModalOpen(true);
  };

  const openEditModal = (book) => {
      setIsEditMode(true);
      setEditingBookId(book.id);
      setBookForm({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          category: book.category,
          total_copies: book.total_copies,
          cover_image: book.cover_image
      });
      setIsBookModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
        if (isEditMode) {
            // Update Existing
            await api.put(`library/books/${editingBookId}/`, bookForm);
            alert("Book updated successfully!");
        } else {
            // Create New
            await api.post('library/books/', bookForm);
            alert("Book added to catalog!");
        }
        setIsBookModalOpen(false);
        fetchData(); 
    } catch(err) { 
        alert("Failed to save book. Check if ISBN is unique."); 
    }
  };

  const handleDeleteBook = async (id, title) => {
      if(!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
      try {
          await api.delete(`library/books/${id}/`);
          fetchData();
      } catch(err) {
          alert("Cannot delete book. It might have active issues records.");
      }
  };

  // --- Issue / Return Logic ---

  const openIssueModal = (book) => {
      if(book.available_copies < 1) return alert("Book is out of stock!");
      setSelectedBook(book);
      setIssueForm({ student: '', due_date: '' }); // Reset form
      setIsIssueModalOpen(true);
  };

  const handleIssueBook = async (e) => {
      e.preventDefault();
      try {
          await api.post('library/issues/', {
              book: selectedBook.id,
              student: issueForm.student,
              due_date: issueForm.due_date
          });
          setIsIssueModalOpen(false);
          fetchData(); 
          alert("Book Issued Successfully!");
      } catch(err) { alert("Failed to issue book."); }
  };

  const handleReturnBook = async (issueId) => {
      if(!window.confirm("Confirm return of this book?")) return;
      try {
          await api.post(`library/issues/${issueId}/return_book/`);
          fetchData();
      } catch(err) { alert("Error processing return"); }
  };

  // --- Filtering ---
  const filteredBooks = books.filter(b => 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-amber-500/30">
      
      <div className="fixed top-[-20%] left-[-10%] w-[900px] h-[900px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Book className="text-amber-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-200 tracking-tighter">
              Library
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Catalog & Circulation Desk</p>
        </motion.div>

        <div className="flex gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-amber-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search books..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-[2rem] py-3 pl-12 pr-6 text-white outline-none focus:border-amber-500/50 transition-all w-64"
                />
            </div>
            <button 
              onClick={openAddModal}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-[2rem] flex items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all"
            >
              <Plus size={20} /> Add Book
            </button>
        </div>
      </div>

      {/* --- Tabs --- */}
      <div className="flex gap-6 mb-8 border-b border-white/10 pb-4 relative z-10">
          <button onClick={() => setActiveTab('catalog')} className={`text-lg font-bold transition-colors ${activeTab === 'catalog' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>Book Catalog</button>
          <button onClick={() => setActiveTab('circulation')} className={`text-lg font-bold transition-colors ${activeTab === 'circulation' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>Circulation Log</button>
      </div>

      {/* --- TAB 1: CATALOG --- */}
      {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
             {loading ? <div className="text-gray-500 col-span-full text-center">Loading Shelf...</div> : filteredBooks.map((book, idx) => (
                 <motion.div 
                   key={book.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="group relative bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden hover:border-amber-500/50 transition-all hover:transform hover:scale-[1.02]"
                 >
                     {/* Cover Image */}
                     <div className="h-48 w-full overflow-hidden relative">
                         <img src={book.cover_image || 'https://via.placeholder.com/300x400'} alt={book.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                             {book.category}
                         </div>
                         
                         {/* Action Buttons (Edit/Delete) */}
                         <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); openEditModal(book); }} className="p-2 bg-black/60 hover:bg-blue-600 rounded-full text-white backdrop-blur-md border border-white/10 transition-colors">
                                <Edit size={14} />
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); handleDeleteBook(book.id, book.title); }} className="p-2 bg-black/60 hover:bg-red-600 rounded-full text-white backdrop-blur-md border border-white/10 transition-colors">
                                <Trash2 size={14} />
                             </button>
                         </div>
                     </div>

                     {/* Info */}
                     <div className="p-6">
                         <h3 className="text-xl font-bold text-white leading-tight mb-1 line-clamp-1">{book.title}</h3>
                         <p className="text-gray-400 text-sm mb-4">{book.author}</p>
                         
                         <div className="flex justify-between items-center mb-6">
                             <div className="flex flex-col">
                                 <span className="text-[10px] uppercase font-bold text-gray-500">Stock</span>
                                 <span className={`font-mono font-bold ${book.available_copies > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                     {book.available_copies} / {book.total_copies}
                                 </span>
                             </div>
                             <div className="flex flex-col text-right">
                                 <span className="text-[10px] uppercase font-bold text-gray-500">ISBN</span>
                                 <span className="font-mono text-gray-300 text-xs">{book.isbn}</span>
                             </div>
                         </div>

                         <button 
                           onClick={() => openIssueModal(book)}
                           disabled={book.available_copies < 1}
                           className="w-full py-3 rounded-xl bg-white/10 hover:bg-amber-600 text-white font-bold transition-all disabled:opacity-30 disabled:hover:bg-white/10 flex items-center justify-center gap-2"
                         >
                            <BookOpen size={18} /> {book.available_copies > 0 ? 'Issue Book' : 'Out of Stock'}
                         </button>
                     </div>
                 </motion.div>
             ))}
          </div>
      )}

      {/* --- TAB 2: CIRCULATION --- */}
      {activeTab === 'circulation' && (
          <div className="relative z-10 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="p-6 font-bold">Book Details</th>
                          <th className="p-6 font-bold">Student</th>
                          <th className="p-6 font-bold">Issue Date</th>
                          <th className="p-6 font-bold">Due Date</th>
                          <th className="p-6 font-bold text-center">Status</th>
                          <th className="p-6 font-bold text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      {issues.map((issue) => (
                          <tr key={issue.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-6">
                                  <div className="font-bold text-white">{issue.book_title}</div>
                                  <div className="text-xs text-gray-500">ID: {issue.book}</div>
                              </td>
                              <td className="p-6">
                                  <div className="font-bold text-white">{issue.student_details?.user?.first_name} {issue.student_details?.user?.last_name}</div>
                                  <div className="text-xs text-gray-500">{issue.student_details?.student_id}</div>
                              </td>
                              <td className="p-6 font-mono text-gray-300">{issue.issue_date}</td>
                              <td className="p-6 font-mono text-amber-200">{issue.due_date}</td>
                              <td className="p-6 text-center">
                                  {issue.is_returned ? (
                                      <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">Returned</span>
                                  ) : (
                                      <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20">Issued</span>
                                  )}
                              </td>
                              <td className="p-6 text-right">
                                  {!issue.is_returned && (
                                      <button onClick={() => handleReturnBook(issue.id)} className="bg-white/10 hover:bg-green-600 text-white p-2 rounded-xl transition-colors" title="Mark Returned">
                                          <Book size={18} />
                                      </button>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {issues.length === 0 && <div className="p-10 text-center text-gray-500">No circulation records found.</div>}
          </div>
      )}

      <Dock />

      {/* --- MODAL: ADD / EDIT BOOK --- */}
      <AnimatePresence>
        {isBookModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
                    <button onClick={() => setIsBookModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
                    
                    <h2 className="text-2xl font-bold text-white mb-6">{isEditMode ? 'Edit Book Details' : 'Add New Book'}</h2>
                    
                    <form onSubmit={handleSaveBook} className="space-y-4">
                        <input required placeholder="Book Title" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                        <input required placeholder="Author" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <input required placeholder="ISBN" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                            <input required placeholder="Category" value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Total Copies</label>
                                <input required type="number" min="1" value={bookForm.total_copies} onChange={e => setBookForm({...bookForm, total_copies: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Cover URL (Optional)</label>
                                <input placeholder="https://..." value={bookForm.cover_image} onChange={e => setBookForm({...bookForm, cover_image: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={() => setIsBookModalOpen(false)} className="flex-1 py-3 text-gray-500 hover:text-white">Cancel</button>
                            <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl">
                                {isEditMode ? 'Save Changes' : 'Add to Catalog'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: ISSUE BOOK --- */}
      <AnimatePresence>
        {isIssueModalOpen && selectedBook && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
                    <button onClick={() => setIsIssueModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
                    
                    <h2 className="text-2xl font-bold text-white mb-1">Issue Book</h2>
                    <p className="text-amber-500 font-mono text-sm mb-6">{selectedBook.title}</p>
                    
                    <form onSubmit={handleIssueBook} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Select Student</label>
                            <select required value={issueForm.student} onChange={e => setIssueForm({...issueForm, student: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 [&>option]:bg-gray-900">
                                <option value="">-- Choose Student --</option>
                                {students.map(stu => (
                                    <option key={stu.id} value={stu.id}>{stu.user.first_name} {stu.user.last_name} ({stu.student_id})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Due Date</label>
                            <input required type="date" value={issueForm.due_date} onChange={e => setIssueForm({...issueForm, due_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                        </div>

                        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl mt-4">Confirm Issue</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Library;