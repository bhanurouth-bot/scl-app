import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';
import { Clock, Calendar, BookOpen, User, MapPin, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ScheduleClassModal = ({ isOpen, onClose, onScheduleAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data for Dropdowns
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    room: '',
    grade: '',
    section: '',
    day_of_week: 'MON',
    start_time: '',
    end_time: ''
  });

  // Fetch Dropdown Data on Mount
  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [tRes, rRes, sRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/academics/teachers/', { headers }),
        fetch('http://127.0.0.1:8000/api/academics/rooms/', { headers }),
        fetch('http://127.0.0.1:8000/api/academics/subjects/', { headers })
      ]);

      setTeachers(await tRes.json());
      setRooms(await rRes.json());
      setSubjects(await sRes.json());
    } catch (err) {
      console.error("Failed to load resources");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:8000/api/academics/schedule/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to schedule class.');

      onScheduleAdded();
      onClose();
      // Reset critical fields only
      setFormData({ ...formData, start_time: '', end_time: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Schedule Class">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* 1. Subject & Teacher */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Subject</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 text-slate-500" size={18} />
              <select name="subject" onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white appearance-none focus:outline-none focus:border-blue-500">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Teacher</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500" size={18} />
              <select name="teacher" onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white appearance-none focus:outline-none focus:border-blue-500">
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Room & Day */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Room / Lab</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
              <select name="room" onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white appearance-none focus:outline-none focus:border-blue-500">
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Day</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-slate-500" size={18} />
              <select name="day_of_week" onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white appearance-none focus:outline-none focus:border-blue-500">
                <option value="MON">Monday</option>
                <option value="TUE">Tuesday</option>
                <option value="WED">Wednesday</option>
                <option value="THU">Thursday</option>
                <option value="FRI">Friday</option>
                <option value="SAT">Saturday</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Class & Time */}
        <div className="grid grid-cols-2 gap-4">
            <input type="text" name="grade" onChange={handleChange} placeholder="Grade (e.g. 10)" className="bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white" />
            <input type="text" name="section" onChange={handleChange} placeholder="Section (e.g. A)" className="bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <input type="time" name="start_time" onChange={handleChange} className="bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white" />
            <input type="time" name="end_time" onChange={handleChange} className="bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white" />
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          {loading ? <Loader className="animate-spin" /> : 'Confirm Class'}
        </button>
      </form>
    </GlassModal>
  );
};

export default ScheduleClassModal;