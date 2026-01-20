import React, { useState } from 'react';
import GlassModal from '../../components/GlassModal';
import { User, Hash, GraduationCap, DollarSign, CheckCircle, AlertCircle, Loader } from 'lucide-react';

// Updated InputField to accept extra props (like step="0.01")
const InputField = ({ label, name, value, onChange, icon: Icon, type = "text", placeholder, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs text-slate-400 font-medium ml-1">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:bg-white/5 transition-all placeholder:text-slate-600 text-sm"
        {...props} // <--- This allows step, min, max, etc.
      />
    </div>
  </div>
);

const CreateStudentModal = ({ isOpen, onClose, onStudentAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_id: '',
    grade: '',
    section: '',
    roll_number: '',
    fees_due: '0.00'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:8000/api/students/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create student. Check ID or Roll No duplicates.');
      }

      onStudentAdded(); 
      onClose();
      setFormData({
        first_name: '', last_name: '', student_id: '',
        grade: '', section: '', roll_number: '', fees_due: '0.00'
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="New Admission">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="First Name" 
            name="first_name" 
            value={formData.first_name} 
            onChange={handleChange} 
            icon={User} 
            placeholder="e.g. Alice" 
          />
          <InputField 
            label="Last Name" 
            name="last_name" 
            value={formData.last_name} 
            onChange={handleChange} 
            icon={User} 
            placeholder="e.g. Smith" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Explicitly set type="text" for Student ID */}
          <InputField 
            label="Student ID" 
            name="student_id" 
            type="text" 
            value={formData.student_id} 
            onChange={handleChange} 
            icon={Hash} 
            placeholder="STD-2026-XXX" 
          />
          <InputField 
            label="Roll Number" 
            name="roll_number" 
            type="number" 
            value={formData.roll_number} 
            onChange={handleChange} 
            icon={Hash} 
            placeholder="e.g. 101" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="Grade / Class" 
            name="grade" 
            value={formData.grade} 
            onChange={handleChange} 
            icon={GraduationCap} 
            placeholder="e.g. 10" 
          />
          <InputField 
            label="Section" 
            name="section" 
            value={formData.section} 
            onChange={handleChange} 
            icon={GraduationCap} 
            placeholder="e.g. A" 
          />
        </div>

        {/* Added step="0.01" to allow decimals */}
        <InputField 
          label="Initial Fees Due" 
          name="fees_due" 
          type="number" 
          step="0.01" 
          value={formData.fees_due} 
          onChange={handleChange} 
          icon={DollarSign} 
          placeholder="0.00" 
        />

        <div className="pt-2">
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader className="animate-spin" size={20} /> : <><CheckCircle size={20} /> Confirm Admission</>}
          </button>
        </div>
      </form>
    </GlassModal>
  );
};

export default CreateStudentModal;