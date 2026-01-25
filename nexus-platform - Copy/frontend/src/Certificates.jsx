import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Printer, Award, CheckCircle, Crown, Download 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const CERT_TYPES = [
  { id: 'BONAFIDE', label: 'Bonafide Certificate', color: 'bg-blue-600' },
  { id: 'CHARACTER', label: 'Character Certificate', color: 'bg-green-600' },
  { id: 'TRANSFER', label: 'School Leaving / Transfer', color: 'bg-red-600' },
  { id: 'LOR', label: 'Letter of Recommendation', color: 'bg-purple-600' },
];

const Certificates = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedType, setSelectedType] = useState('BONAFIDE');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const componentRef = useRef();

  // --- PRINT HANDLER (Browser) ---
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: selectedStudent ? `${selectedStudent.student_id}_${selectedType}` : 'Certificate',
  });

  // --- DOWNLOAD PDF HANDLER (Direct) ---
  const handleDownloadPdf = async () => {
    if (!componentRef.current) return;
    setGeneratingPdf(true);
    
    try {
        const canvas = await html2canvas(componentRef.current, {
            scale: 2, // High resolution
            useCORS: true, // Allow loading images (profile pics)
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${selectedStudent.student_id}_${selectedType}.pdf`);
    } catch (err) {
        console.error("PDF Generation Failed", err);
        alert("Failed to generate PDF. Please try again.");
    } finally {
        setGeneratingPdf(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('students/profiles/');
      setStudents(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filteredStudents = students.filter(s => 
    s.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- DATA HELPERS ---
  const getPlaceholders = (student) => {
    if (!student) return {};
    const gender = student.gender === 'Female' ? 'Female' : 'Male';
    return {
      name: `${student.user.first_name} ${student.user.last_name}`.toUpperCase(),
      id: student.student_id,
      guardian: student.guardian_name,
      relation: student.guardian_relation || 'Parent',
      dob: new Date(student.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      grade: student.classroom_details ? `Grade ${student.classroom_details.grade_level}` : 'N/A',
      section: student.classroom_details ? student.classroom_details.section : 'A',
      address: student.address,
      pronoun_sub: gender === 'Male' ? 'he' : 'she',
      pronoun_obj: gender === 'Male' ? 'him' : 'her',
      pronoun_poss: gender === 'Male' ? 'his' : 'her',
      honorific: gender === 'Male' ? 'Master' : 'Miss',
      parent_prefix: gender === 'Male' ? 'Son' : 'Daughter',
      today: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      year: new Date().getFullYear(),
      next_year: new Date().getFullYear() + 1,
    };
  };

  const TEMPLATES = {
    BONAFIDE: {
      title: "TO WHOMSOEVER IT MAY CONCERN",
      subject: "SUBJECT: ISSUANCE OF BONAFIDE CERTIFICATE",
      body: `This is to officially certify that {honorific} <b>{name}</b>, {parent_prefix} of Mr./Mrs. <b>{guardian}</b>, is a bona fide student of the <b>Nexus Institute of Technology & Science</b>.
      <br/><br/>
      According to our official registry, {pronoun_sub} is currently enrolled in <b>{grade} - Section {section}</b> for the academic session <b>{year}-{next_year}</b>. 
      <br/><br/>
      {pronoun_poss} Date of Birth, as recorded in the General Admission Register of this Institution, is <b>{dob}</b>.
      <br/><br/>
      To the best of our knowledge and belief, {pronoun_sub} bears a good moral character and has demonstrated satisfactory conduct.
      <br/><br/>
      This certificate is issued for the purpose of <b>General Verification</b>.`
    },
    CHARACTER: {
      title: "CHARACTER & CONDUCT CERTIFICATE",
      subject: null,
      body: `Certified that {honorific} <b>{name}</b> (Reg. No: {id}), {parent_prefix} of <b>{guardian}</b>, has been a student of this Institution studying in <b>{grade}</b>.
      <br/><br/>
      During the period of {pronoun_poss} stay in this institution, we have found {pronoun_obj} to be sincere, obedient, and dedicated to {pronoun_poss} academic pursuits. {pronoun_sub} has shown exemplary behavior towards teachers, staff, and fellow students.
      <br/><br/>
      {pronoun_sub} has actively participated in various co-curricular activities and has never been involved in any act of indiscipline.
      <br/><br/>
      We wish {pronoun_obj} every success in {pronoun_poss} future endeavors.`
    },
    TRANSFER: {
      title: "SCHOOL LEAVING / TRANSFER CERTIFICATE",
      subject: null,
      body: `
      <table class="w-full text-left mt-2 border-collapse text-sm">
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">1. Name of the Student</td><td class="font-bold uppercase border-b border-gray-200">{name}</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">2. Student ID</td><td class="border-b border-gray-200">{id}</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">3. Guardian Name</td><td class="border-b border-gray-200">{guardian}</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">4. Date of Birth</td><td class="border-b border-gray-200">{dob}</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">5. Class Last Studied</td><td class="border-b border-gray-200">{grade}</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">6. Final Result</td><td class="border-b border-gray-200">Passed / Promoted</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">7. Dues Paid</td><td class="border-b border-gray-200">All dues cleared</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">8. Conduct</td><td class="border-b border-gray-200">Good</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">9. Issue Date</td><td class="border-b border-gray-200">{today}</td></tr>
        <tr><td class="py-1.5 w-1/3 font-bold text-gray-600 border-b border-gray-200">10. Reason for Leaving</td><td class="border-b border-gray-200">Request</td></tr>
      </table>`
    },
    LOR: {
      title: "LETTER OF RECOMMENDATION",
      subject: "SUBJECT: ACADEMIC RECOMMENDATION",
      body: `It gives me immense pleasure to recommend {honorific} <b>{name}</b>, a student of <b>{grade}</b> at Nexus Institute.
      <br/><br/>
      I have known {pronoun_obj} for the past academic year. {pronoun_sub} has distinguished {pronoun_obj}self as an inquisitive and hardworking student with strong analytical skills.
      <br/><br/>
      Beyond academics, {pronoun_sub} is a well-rounded individual with strong leadership qualities.
      <br/><br/>
      I strongly recommend {pronoun_obj} without reservation. {pronoun_sub} will undoubtedly be an asset to any institution.`
    }
  };

  const processTemplate = (templateName, student) => {
    if (!student) return null;
    const data = getPlaceholders(student);
    let tmpl = TEMPLATES[templateName];
    let processedBody = tmpl.body;
    Object.keys(data).forEach(key => {
       const regex = new RegExp(`{${key}}`, 'g');
       processedBody = processedBody.replace(regex, data[key]);
    });
    return { ...tmpl, body: processedBody, ...data };
  };

  const content = selectedStudent ? processTemplate(selectedType, selectedStudent) : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-purple-500/30">
      
      <div className="fixed top-[-20%] left-[-10%] w-[900px] h-[900px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Award className="text-purple-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-200 tracking-tighter font-serif">
              Official Docs
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Generate & Verify Academic Records</p>
        </motion.div>

        <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Student..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-3 pl-12 pr-6 text-white outline-none focus:border-purple-500/50 transition-all"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          
          {/* --- LEFT: Selector --- */}
          <div className="xl:col-span-4 space-y-6">
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Document Type</h3>
                  <div className="space-y-3">
                      {CERT_TYPES.map(type => (
                          <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                                selectedType === type.id 
                                ? `${type.color} text-white shadow-lg` 
                                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                              <span className="font-bold">{type.label}</span>
                              {selectedType === type.id && <CheckCircle size={18} />}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 h-[400px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Select Scholar</h3>
                  <div className="space-y-2">
                      {filteredStudents.map(student => (
                          <div 
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                                selectedStudent?.id === student.id 
                                ? 'bg-purple-500/20 border border-purple-500/50' 
                                : 'bg-transparent border border-transparent hover:bg-white/5'
                            }`}
                          >
                               <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden border border-white/10">
                                  <img src={student.profile_picture || `https://ui-avatars.com/api/?name=${student.user.first_name}`} className="w-full h-full object-cover" alt="" />
                               </div>
                               <div className="min-w-0">
                                   <div className="font-bold text-sm text-white truncate">{student.user.first_name} {student.user.last_name}</div>
                                   <div className="text-xs text-purple-400 font-mono">{student.student_id}</div>
                               </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* --- RIGHT: A4 Preview --- */}
          <div className="xl:col-span-8 flex flex-col gap-6">
              
              <div className="flex justify-end gap-4">
                   <button 
                    onClick={handleDownloadPdf}
                    disabled={!selectedStudent || generatingPdf}
                    className="bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  >
                      {generatingPdf ? 'Generating...' : <><Download size={18} /> Download PDF</>}
                  </button>
                  <button 
                    onClick={handlePrint}
                    disabled={!selectedStudent}
                    className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                      <Printer size={18} /> Print
                  </button>
              </div>

              {/* A4 CONTAINER: 
                  Width: 210mm
                  Height: 297mm
                  Background: White
              */}
              <div className="bg-[#1a1a1a] p-4 md:p-8 rounded-[2rem] flex justify-center overflow-auto min-h-[850px] border border-white/5">
                  {content ? (
                      <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
                          <div 
                              ref={componentRef} 
                              className="bg-white text-[#111] relative shadow-2xl print:shadow-none font-serif flex flex-col"
                              style={{ width: '210mm', height: '297mm', padding: '20mm' }} // STRICT A4 SIZING
                          >
                                
                                {/* WATERMARK */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                                    <Crown size={400} />
                                </div>

                                {/* HEADER */}
                                <div className="flex items-center justify-center border-b-2 border-[#111] pb-6 mb-8 relative">
                                    <div className="absolute left-0 top-2">
                                        <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center text-white">
                                            <Crown size={40} />
                                        </div>
                                    </div>
                                    <div className="text-center px-16">
                                        <h1 className="text-3xl font-black uppercase tracking-[0.1em] mb-1 leading-none">Nexus Institute</h1>
                                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600">of Technology & Science</h2>
                                        <p className="text-[10px] text-gray-500 mt-2 font-sans">
                                            Established 1998 • ISO 9001:2015 Certified<br/>
                                            123 Education Lane, Academic City - 400001
                                        </p>
                                    </div>
                                </div>

                                {/* META */}
                                <div className="flex justify-between font-bold text-xs mb-10 font-sans text-gray-700">
                                    <span>Ref No: NX/{content.year}/{selectedType.substring(0,3)}/{content.id}</span>
                                    <span>Date: {content.today}</span>
                                </div>

                                {/* TITLE */}
                                <div className="text-center mb-10">
                                    <h3 className="text-lg font-bold uppercase underline underline-offset-4 tracking-widest inline-block border-2 border-[#111] px-4 py-1.5">
                                        {content.title}
                                    </h3>
                                    {content.subject && (
                                        <div className="text-left mt-6 font-bold underline decoration-dotted underline-offset-4 uppercase text-xs">
                                            {content.subject}
                                        </div>
                                    )}
                                </div>

                                {/* BODY */}
                                <div 
                                    className="text-base leading-[2] text-justify text-gray-900"
                                    dangerouslySetInnerHTML={{ __html: content.body }} 
                                />

                                {/* FOOTER */}
                                <div className="mt-auto pt-8 flex justify-between items-end">
                                    <div className="text-center">
                                         <p className="text-[10px] font-sans uppercase font-bold text-gray-500 mb-10">Checked By</p>
                                         <div className="w-32 border-b border-gray-400 mb-1"></div>
                                         <p className="font-bold text-xs uppercase">Registrar</p>
                                    </div>
                                    
                                    <div className="text-center">
                                         <div className="h-16 mb-[-5px] flex items-end justify-center">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/John_Hancock_Signature.svg/1200px-John_Hancock_Signature.svg.png" className="h-full opacity-90" alt="Principal" />
                                         </div>
                                         <p className="font-bold text-base uppercase">Principal</p>
                                         <p className="text-[10px] font-bold text-gray-500">Nexus Institute</p>
                                         <div className="w-40 border-b-2 border-[#111] mt-1"></div>
                                    </div>
                                </div>

                                {/* BOTTOM STRIP */}
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-[#111] text-white flex items-center justify-between px-8 text-[8px] font-sans uppercase tracking-widest">
                                    <span>www.nexus-institute.edu</span>
                                    <span>Phone: +91 98765 43210</span>
                                </div>
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center text-white/50 h-full w-full">
                          <FileText size={48} className="mb-4 opacity-50"/>
                          <p className="font-mono uppercase tracking-widest">Select a student</p>
                      </div>
                  )}
              </div>

          </div>
      </div>

      <Dock />
    </div>
  );
};

export default Certificates;