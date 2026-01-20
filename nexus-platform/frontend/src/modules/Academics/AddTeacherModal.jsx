import React, { useState } from 'react';
import GlassModal from '../../components/GlassModal';
import { User, Briefcase, Hash, CheckCircle, Loader, AlertCircle } from 'lucide-react';

const AddTeacherModal = ({ isOpen, onClose, onTeacherAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    employee_id: '',
    specialization: ''
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
      const response = await fetch('http://127.0.0.1:8000/api/academics/teachers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to add teacher. Check Employee ID.');

      onTeacherAdded();
      onClose();
      setFormData({ first_name: '', last_name: '', employee_id: '', specialization: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, icon: Icon, placeholder }) => (
    <div className="space-y-1">
      <label className="text-xs text-slate-400 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 text-slate-500" size={18} />
        <input
          type="text"
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>
    </div>
  );

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Recruit Faculty">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <InputField label="First Name" name="first_name" icon={User} placeholder="e.g. Marie" />
          <InputField label="Last Name" name="last_name" icon={User} placeholder="e.g. Curie" />
        </div>

        <InputField label="Employee ID" name="employee_id" icon={Hash} placeholder="T-2026-XXX" />
        <InputField label="Specialization" name="specialization" icon={Briefcase} placeholder="e.g. Chemistry" />

        <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          {loading ? <Loader className="animate-spin" /> : <><CheckCircle size={20} /> Onboard Teacher</>}
        </button>
      </form>
    </GlassModal>
  );
};

export default AddTeacherModal;