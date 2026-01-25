import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { 
  IdCard, Search, Printer, Palette,
  MapPin, Phone, User, Crown 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

// --- THEME PRESETS (Ivy League Inspired) ---
const THEMES = {
  oxford: {
    id: 'oxford',
    name: 'Oxford Blue',
    primary: 'bg-[#002147]', 
    secondary: 'bg-[#002147]/10',
    border: 'border-[#002147]',
    text: 'text-[#002147]',
    accent: 'bg-[#A79D96]' 
  },
  harvard: {
    id: 'harvard',
    name: 'Harvard Crimson',
    primary: 'bg-[#A51C30]', 
    secondary: 'bg-[#A51C30]/10',
    border: 'border-[#A51C30]',
    text: 'text-[#A51C30]',
    accent: 'bg-[#000000]'
  },
  princeton: {
    id: 'princeton',
    name: 'Prestige Black',
    primary: 'bg-[#121212]',
    secondary: 'bg-[#121212]/10',
    border: 'border-[#121212]',
    text: 'text-[#121212]',
    accent: 'bg-[#E77500]' 
  }
};

const IDCardGenerator = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Customization State
  const [currentTheme, setCurrentTheme] = useState(THEMES.oxford);
  const [validUntil, setValidUntil] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );
  
  // Refresh Key for Cache Busting Images
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Print Ref
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: selectedStudent ? `${selectedStudent.student_id}_ID` : 'ID_Card',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('students/profiles/');
      setStudents(res.data);
      setRefreshKey(Date.now());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filteredStudents = students.filter(s => 
    s.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-amber-500/30">
      
      <div className="fixed top-[-20%] right-[-10%] w-[900px] h-[900px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <IdCard className="text-amber-100" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-200 tracking-tighter font-serif">
              Identity
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Professional Card Generator</p>
        </motion.div>

        <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-amber-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Scholars..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-3 pl-12 pr-6 text-white outline-none focus:border-amber-500/50 transition-all"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          
          {/* --- LEFT: List --- */}
          <div className="xl:col-span-7 h-[750px] overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredStudents.map((student, idx) => (
                      <motion.div 
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedStudent(student)}
                        className={`p-4 rounded-[1rem] border cursor-pointer transition-all flex flex-col gap-3 group relative overflow-hidden ${
                            selectedStudent?.id === student.id 
                            ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/40' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0 border border-white/10 overflow-hidden">
                                  <img 
                                    src={student.profile_picture || `https://ui-avatars.com/api/?name=${student.user.first_name}+${student.user.last_name}&background=random`} 
                                    className="w-full h-full object-cover" 
                                    alt="thumb" 
                                  />
                              </div>
                              <div className="min-w-0">
                                  <div className="font-bold text-white text-sm truncate">{student.user.first_name} {student.user.last_name}</div>
                                  <div className="text-xs text-amber-500 font-mono">{student.student_id}</div>
                              </div>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>

          {/* --- RIGHT: Config & Preview --- */}
          <div className="xl:col-span-5 flex flex-col gap-6">
              
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5">
                  <div className="mb-6">
                      <label className="text-xs text-gray-500 font-bold ml-2 mb-3 block flex items-center gap-2">
                          <Palette size={14}/> CARD THEME
                      </label>
                      <div className="flex gap-3">
                          {Object.values(THEMES).map(theme => (
                              <button
                                key={theme.id}
                                onClick={() => setCurrentTheme(theme)}
                                className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all ${theme.primary} ${
                                    currentTheme.id === theme.id ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-60 hover:opacity-100'
                                }`}
                              >
                                  {currentTheme.id === theme.id && <Crown size={16} className="text-white"/>}
                              </button>
                          ))}
                      </div>
                      <div className="text-center mt-2 text-xs font-mono text-gray-400 uppercase tracking-widest">{currentTheme.name}</div>
                  </div>

                  <div className="flex gap-4 items-end pt-4 border-t border-white/5">
                      <div className="flex-1">
                          <label className="text-xs text-gray-500 font-bold ml-2 mb-1 block">Valid Until</label>
                          <input 
                              type="date" 
                              value={validUntil}
                              onChange={(e) => setValidUntil(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors font-mono text-sm"
                          />
                      </div>
                      <button 
                        onClick={handlePrint}
                        disabled={!selectedStudent}
                        className="flex-1 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                          <Printer size={18} /> Print Card
                      </button>
                  </div>
              </div>

              <div className="flex justify-center items-center flex-1 min-h-[550px] bg-[#0c0c0c] rounded-[2rem] border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-50 pointer-events-none"></div>

                  {selectedStudent ? (
                      <div className="scale-[0.85] sm:scale-100 transition-transform duration-500">
                          
                          {/* =================================================================================
                              THE PRINTABLE CARD
                          ================================================================================= */}
                          <div 
                            ref={componentRef} 
                            className={`w-[350px] h-[550px] bg-white text-black overflow-hidden relative shadow-2xl print:shadow-none print:m-0 flex flex-col ${currentTheme.border} border-y-8`}
                          >
                                <div className={`${currentTheme.primary} h-24 flex flex-col items-center justify-center text-white relative`}>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 rounded-full border border-white/20 flex items-center justify-center">
                                        <Crown size={24} className="opacity-80"/>
                                    </div>
                                    <h2 className="font-serif text-2xl font-bold tracking-widest uppercase">Nexus</h2>
                                    <h3 className="text-[10px] tracking-[0.2em] uppercase opacity-80 font-medium mt-1">Institute of Technology</h3>
                                </div>

                                <div className="flex-1 px-6 pt-6 relative flex flex-col">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                        <Crown size={200}/>
                                    </div>

                                    <div className="flex gap-5 mb-6">
                                        <div className="w-[100px] h-[120px] bg-gray-100 border border-gray-300 shadow-sm p-1 flex-shrink-0">
                                            <img 
                                              src={selectedStudent.profile_picture || "https://via.placeholder.com/150"} 
                                              alt="Student" 
                                              className="w-full h-full object-cover grayscale-[0.2]"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className={`${currentTheme.text} font-bold text-[10px] uppercase tracking-wider mb-1`}>Student Scholar</div>
                                            <h1 className="font-serif text-2xl font-bold text-gray-900 leading-none mb-2">
                                                {selectedStudent.user.first_name} <br/> {selectedStudent.user.last_name}
                                            </h1>
                                            <div className="inline-block border border-gray-300 px-2 py-0.5 text-[10px] font-mono text-gray-600 bg-gray-50 rounded">
                                                {selectedStudent.student_id}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs border-t border-gray-100 pt-4">
                                        <div>
                                            <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider">Class / Grade</span>
                                            <span className="font-serif font-bold text-gray-800 text-sm">
                                                {selectedStudent.classroom_details ? `Grade ${selectedStudent.classroom_details.grade_level}` : 'N/A'} 
                                                <span className="ml-1 text-gray-400 font-sans font-normal">({selectedStudent.classroom_details?.section || 'A'})</span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider">Date of Birth</span>
                                            <span className="font-serif font-bold text-gray-800 text-sm">{selectedStudent.date_of_birth}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider">Parent / Guardian</span>
                                            <span className="font-bold text-gray-800">{selectedStudent.guardian_name}</span>
                                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">{selectedStudent.guardian_phone}</div>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider">Blood Group</span>
                                            <span className={`${currentTheme.text} font-bold`}>{selectedStudent.blood_group || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className={`mt-5 p-3 ${currentTheme.secondary} border-l-2 ${currentTheme.border} rounded-r-md`}>
                                        <div className={`text-[9px] ${currentTheme.text} uppercase font-bold tracking-wider mb-1 flex items-center gap-1`}>
                                            <MapPin size={10}/> Residential Address
                                        </div>
                                        <div className="text-[11px] font-medium text-gray-700 leading-tight">
                                            {selectedStudent.address || "Address not on file."}
                                        </div>
                                    </div>

                                    {/* --- SIGNATURES --- */}
                                    <div className="mt-auto pt-6 flex justify-between items-end pb-2">
                                        <div className="text-center">
                                            {/* Principal Placeholder */}
                                            <div className="h-8 mb-1 flex items-end justify-center">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/John_Hancock_Signature.svg/1200px-John_Hancock_Signature.svg.png" className="h-full opacity-60" alt="Principal" />
                                            </div>
                                            <div className="w-24 border-b border-gray-400 mb-1"></div>
                                            <div className="text-[8px] text-gray-400 uppercase">Principal Signature</div>
                                        </div>

                                        {selectedStudent.student_signature && (
                                            <div className="text-center">
                                                <div className="h-8 mb-1 flex items-end justify-center">
                                                    {/* Added cache buster ?t=... */}
                                                    <img src={`${selectedStudent.student_signature}?t=${refreshKey}`} className="h-full opacity-60" alt="Student" />
                                                </div>
                                                <div className="w-24 border-b border-gray-400 mb-1"></div>
                                                <div className="text-[8px] text-gray-400 uppercase">Student Signature</div>
                                            </div>
                                        )}

                                        <div className="text-right">
                                            <span className="block text-[8px] text-gray-400 uppercase font-bold">Valid Until</span>
                                            <span className={`font-mono font-bold ${currentTheme.text} text-sm`}>{validUntil}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${currentTheme.primary} h-10 flex justify-between items-center px-4 text-white`}>
                                    <div className="text-[7px] opacity-70 leading-tight">
                                        PROPERTY OF NEXUS INSTITUTE.<br/>
                                        IF FOUND, PLEASE RETURN TO CAMPUS.
                                    </div>
                                    <div className="w-8 h-8 bg-white p-0.5 rounded-sm -mt-6 shadow-lg border-2 border-white">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedStudent.student_id}`} alt="QR" className="w-full h-full" />
                                    </div>
                                </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center text-gray-500 flex flex-col items-center">
                          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                              <User size={32} className="opacity-50" />
                          </div>
                          <p className="text-lg font-medium text-gray-400">No Student Selected</p>
                          <p className="text-sm opacity-50">Choose a scholar from the list</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      <Dock />
    </div>
  );
};

export default IDCardGenerator;