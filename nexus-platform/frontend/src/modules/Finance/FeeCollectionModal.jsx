import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';
import { Search, CreditCard, Banknote, CheckCircle, Loader } from 'lucide-react';

const FeeCollectionModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // New States for Real Data
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 1. The Real-Time Search Function
  useEffect(() => {
    const searchStudents = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://127.0.0.1:8000/api/students/search/?q=${searchQuery}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search failed", err);
      }
    };

    // Debounce (Wait 300ms after typing stops to save API calls)
    const timeoutId = setTimeout(() => searchStudents(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStep(2);
  };

  const handlePayment = async () => {
    if (!selectedStudent) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // The Payload matching our Backend Serializer
      const payload = {
        student: selectedStudent.id,
        amount: selectedStudent.fees_due, // Paying full amount
        payment_method: 'CASH' // Hardcoded for now, you can make this dynamic
      };

      const response = await fetch('http://127.0.0.1:8000/api/finance/collect/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Payment Failed');

      // Success
      setStep(3);
      
    } catch (err) {
      console.error(err);
      alert("Transaction Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStudent(null);
    onClose();
  };

  return (
    <GlassModal isOpen={isOpen} onClose={reset} title="Collect Fees">
      
      {/* STEP 1: Identify Student */}
      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm text-slate-400">Search Student</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Type name or ID (e.g. Sarah)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
              autoFocus
            />
          </div>
          
          {/* Dynamic Results List */}
          <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
            {searchResults.length === 0 && searchQuery.length > 2 && (
               <div className="text-center text-slate-500 text-sm py-4">No students found.</div>
            )}

            {searchResults.map((student) => (
              <div 
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-blue-600/20 hover:border-blue-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                  {student.first_name[0]}
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-blue-300 transition-colors">
                    {student.first_name} {student.last_name}
                  </div>
                  <div className="text-xs text-slate-400">
                    ID: {student.student_id} • Grade {student.grade}
                  </div>
                </div>
                <div className="ml-auto text-right">
                   <div className="text-xs text-slate-500">Due</div>
                   <div className={`text-sm font-mono font-bold ${student.fees_due > 0 ? 'text-red-400' : 'text-green-400'}`}>
                     ${student.fees_due}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Process Payment */}
      {step === 2 && selectedStudent && (
        <div className="space-y-6">
          <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-sm text-slate-400">Total Due for {selectedStudent.first_name}</div>
            <div className="text-4xl font-bold text-white mt-1">
              ${selectedStudent.fees_due}
            </div>
            {selectedStudent.fees_due === "0.00" && (
               <div className="mt-2 text-xs bg-green-500/20 text-green-400 py-1 px-3 rounded-full inline-block">
                 Fully Paid
               </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl border border-blue-500/50 bg-blue-500/10 text-blue-400 flex flex-col items-center gap-2 hover:bg-blue-500 hover:text-white transition-all">
              <CreditCard size={24} />
              <span className="text-sm font-medium">Card / Online</span>
            </button>
            <button className="p-4 rounded-xl border border-white/10 bg-white/5 text-slate-400 flex flex-col items-center gap-2 hover:bg-white/10 hover:text-white transition-all">
              <Banknote size={24} />
              <span className="text-sm font-medium">Cash</span>
            </button>
          </div>

          <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" /> : 'Confirm Payment'}
          </button>
          
          <button onClick={() => setStep(1)} className="w-full text-xs text-slate-500 hover:text-white">
             Back to Search
          </button>
        </div>
      )}

      {/* STEP 3: Success */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Successful</h2>
          <p className="text-slate-400 mt-2">Receipt sent to {selectedStudent?.first_name}.</p>
          
          <button 
            onClick={reset}
            className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            Close Window
          </button>
        </div>
      )}
    </GlassModal>
  );
};

export default FeeCollectionModal;