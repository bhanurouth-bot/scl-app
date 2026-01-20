import React, { useState } from 'react';
import GlassModal from '../../components/GlassModal';
import { User, Lock, Briefcase, DollarSign, Calendar, CheckCircle, Loader, AlertCircle } from 'lucide-react';

const CreateEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', username: '', password: '',
    designation: '', department: '', basic_salary: '', join_date: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://127.0.0.1:8000/api/hr/employees/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to create employee. Username might be taken.");

      onEmployeeAdded();
      onClose();
      setFormData({
        first_name: '', last_name: '', username: '', password: '',
        designation: '', department: '', basic_salary: '', join_date: ''
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Onboard New Staff">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded flex gap-2"><AlertCircle size={16}/> {error}</div>}

        {/* SECTION 1: LOGIN DETAILS */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-3">
            <h4 className="text-xs text-blue-300 font-bold uppercase tracking-widest">Login Credentials</h4>
            <div className="grid grid-cols-2 gap-3">
                <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"/>
                <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"/>
                <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"/>
            </div>
        </div>

        {/* SECTION 2: JOB DETAILS */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-3">
            <h4 className="text-xs text-purple-300 font-bold uppercase tracking-widest">Contract Details</h4>
            <div className="grid grid-cols-2 gap-3">
                <input name="designation" placeholder="Designation (e.g. Math Teacher)" value={formData.designation} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"/>
                <input name="department" placeholder="Department (e.g. Science)" value={formData.department} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-slate-500 ml-1">Joining Date</label>
                    <input name="join_date" type="date" value={formData.join_date} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"/>
                </div>
                <div>
                    <label className="text-xs text-slate-500 ml-1">Basic Salary ($)</label>
                    <input name="basic_salary" type="number" step="0.01" value={formData.basic_salary} onChange={handleChange} required className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"/>
                </div>
            </div>
        </div>

        <button disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex justify-center items-center gap-2">
            {loading ? <Loader className="animate-spin" size={18}/> : <><CheckCircle size={18}/> Confirm & Create Account</>}
        </button>
      </form>
    </GlassModal>
  );
};

export default CreateEmployeeModal;