import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Plus, Search, Mail, Phone, X
} from 'lucide-react';
import api from './api';
import Dock from './Dock';
import { GlassInput, GlassButton, GlassSelect, Skeleton } from './components/GlassUI';
import { AlertModal } from './components/GlassModals'; // <--- IMPORT

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  
  // --- ALERT STATE ---
  const [alertModal, setAlertModal] = useState({ isOpen: false });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
        const res = await api.get('hr/employees/');
        setEmployees(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const filteredEmployees = employees.filter(e => roleFilter ? e.role === roleFilter : true);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 pt-6 px-6 relative font-sans">
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-pink-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10 border-b border-white/5 pb-6">
        <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-pink-600 rounded-xl shadow-lg"><Users size={24}/></div>
                Human Resources
            </h1>
            <p className="text-gray-400 mt-1">Staff Directory & Roles</p>
        </div>
        <div className="flex gap-4">
            <GlassSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-48">
                <option value="">All Roles</option>
                <option value="TEACHER">Teachers</option>
                <option value="DRIVER">Drivers</option>
                <option value="STAFF">Staff</option>
            </GlassSelect>
            <GlassButton onClick={() => setIsAddModalOpen(true)} className="bg-pink-600 hover:bg-pink-500">
                <Plus size={18}/> Add Employee
            </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {loading ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl"/>) : 
         filteredEmployees.map(emp => (
            <div key={emp.id} className="p-6 bg-[#111] border border-white/10 rounded-3xl hover:border-pink-500/30 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-xl font-bold text-gray-300">
                        {emp.first_name[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">{emp.first_name} {emp.last_name}</h3>
                        <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                            {emp.role}
                        </span>
                    </div>
                </div>
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2"><Mail size={14}/> {emp.email}</div>
                    <div className="flex items-center gap-2"><Phone size={14}/> {emp.phone}</div>
                </div>
                {emp.role === 'TEACHER' && emp.subject_names?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Subjects</p>
                        <div className="flex flex-wrap gap-1">
                            {emp.subject_names.map((sub, i) => (
                                <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-300 border border-white/5">{sub}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>

      <Dock />
      
      {/* ADD MODAL */}
      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
            fetchEmployees();
            setAlertModal({ isOpen: true, title: "Success", message: "Employee added successfully!", type: "success" });
        }}
        onError={(msg) => setAlertModal({ isOpen: true, title: "Error", message: msg, type: "error" })}
      />

      <AlertModal 
         isOpen={alertModal.isOpen} 
         onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
         title={alertModal.title}
         message={alertModal.message}
         type={alertModal.type}
      />
    </div>
  );
};

// ... (AddEmployeeModal component remains mostly same, just call props.onError instead of alert) ...
const AddEmployeeModal = ({ isOpen, onClose, onSuccess, onError }) => {
    // ... state ...
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', role: 'STAFF', salary: '', address: '', joining_date: '', subjects: [] });
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(isOpen) api.get('academics/subjects/').then(res => setAvailableSubjects(res.data));
    }, [isOpen]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('hr/employees/', formData);
            onSuccess();
            onClose();
            setFormData({ first_name: '', last_name: '', email: '', role: 'STAFF', subjects: [] });
        } catch(err) { 
            onError("Failed to add employee. Check data."); 
        } finally { setLoading(false); }
    };
    
    // ... render logic same as before ...
    const toggleSubject = (subId) => {
        const current = formData.subjects || [];
        if(current.includes(subId)) setFormData({...formData, subjects: current.filter(id => id !== subId)});
        else setFormData({...formData, subjects: [...current, subId]});
    };

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24}/></button>
                <h2 className="text-2xl font-bold text-white mb-6">New Employee</h2>
                <div className="grid grid-cols-2 gap-4">
                    <GlassInput placeholder="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                    <GlassInput placeholder="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Role</label>
                        <GlassSelect value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="STAFF">Support Staff</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="DRIVER">Driver</option>
                            <option value="ADMIN">Admin</option>
                        </GlassSelect>
                    </div>
                    <GlassInput placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <GlassInput placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <GlassInput type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} />
                    <GlassInput type="number" placeholder="Salary" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                    <div className="col-span-2"><GlassInput placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                    {formData.role === 'TEACHER' && (
                        <div className="col-span-2 bg-white/5 p-4 rounded-xl border border-white/10">
                            <label className="text-xs font-bold text-gray-400 mb-3 block uppercase tracking-wider">Assign Subjects</label>
                            <div className="flex flex-wrap gap-2">
                                {availableSubjects.map(sub => (
                                    <button key={sub.id} onClick={() => toggleSubject(sub.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.subjects?.includes(sub.id) ? 'bg-pink-600 border-pink-500 text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'}`}>{sub.name}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-8 flex gap-3"><GlassButton onClick={onClose} variant="ghost" className="flex-1">Cancel</GlassButton><GlassButton onClick={handleSubmit} className="flex-1 bg-pink-600 hover:bg-pink-500" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</GlassButton></div>
            </div>
        </div>
    );
};

export default Employees;