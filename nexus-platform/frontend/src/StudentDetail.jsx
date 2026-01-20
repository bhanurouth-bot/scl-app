import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Save, Trash2, Camera, Mail, Phone, Calendar, Hash } from 'lucide-react';
import api from './api';

const StudentDetail = ({ student, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize Data when student changes
  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.user?.first_name || '',
        last_name: student.user?.last_name || '',
        email: student.user?.email || '',
        guardian_name: student.guardian_name || '',
        guardian_phone: student.guardian_phone || '',
        roll_number: student.roll_number || '',
        student_id: student.student_id || '', // Read only
      });
      setAvatarPreview(student.user?.avatar || null);
      setIsEditing(false);
    }
  }, [student]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Use FormData for File Uploads
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      await api.patch(`students/profiles/${student.id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onUpdate(); // Refresh parent grid
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if(window.confirm("Are you sure? This will archive the student.")) {
        await api.delete(`students/profiles/${student.id}/`);
        onUpdate();
        onClose();
    }
  };

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col md:flex-row relative"
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/20 rounded-full transition-colors z-20">
            <X size={20} className="text-white" />
          </button>

          {/* Left Panel: Identity */}
          <div className="w-full md:w-1/3 bg-white/5 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/10 text-center">
            <div className="relative group mb-6">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{formData.first_name?.[0]}</span>
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
                  <Camera className="text-white" />
                  <input type="file" hidden onChange={handleFileChange} />
                </label>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2 w-full">
                <input name="first_name" value={formData.first_name} onChange={handleChange} className="glass-input w-full text-center text-lg font-bold p-2 rounded-lg" placeholder="First Name" />
                <input name="last_name" value={formData.last_name} onChange={handleChange} className="glass-input w-full text-center text-lg font-bold p-2 rounded-lg" placeholder="Last Name" />
              </div>
            ) : (
              <h2 className="text-3xl font-bold text-white mb-2">{student.user?.first_name} {student.user?.last_name}</h2>
            )}
            
            <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-sm font-mono border border-blue-500/30 mt-2">
              {student.student_id}
            </span>

            <div className="mt-8 w-full space-y-4">
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Classroom</p>
                <p className="text-xl text-white font-semibold">
                  {student.classroom_details ? `${student.classroom_details.grade_level}-${student.classroom_details.section}` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Details */}
          <div className="w-full md:w-2/3 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Student Profile
                {isEditing && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">EDITING</span>}
              </h3>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl transition-colors text-sm font-medium">
                      <Edit2 size={16} /> Edit
                    </button>
                    <button onClick={handleDelete} className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600/20 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-green-900/20">
                    <Save size={18} /> Save Changes
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="col-span-2 space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs"><Mail size={14}/> Email Address</div>
                    {isEditing ? (
                      <input name="email" value={formData.email} onChange={handleChange} className="glass-input w-full p-2 text-sm rounded-lg" />
                    ) : (
                      <div className="text-white truncate">{formData.email || "No Email"}</div>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs"><Phone size={14}/> Guardian Phone</div>
                    {isEditing ? (
                      <input name="guardian_phone" value={formData.guardian_phone} onChange={handleChange} className="glass-input w-full p-2 text-sm rounded-lg" />
                    ) : (
                      <div className="text-white">{formData.guardian_phone}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="col-span-2 space-y-4 mt-2">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Guardian Information</h4>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs"><User size={14}/> Guardian Name</div>
                    {isEditing ? (
                      <input name="guardian_name" value={formData.guardian_name} onChange={handleChange} className="glass-input w-full p-2 text-sm rounded-lg" />
                    ) : (
                      <div className="text-white">{formData.guardian_name}</div>
                    )}
                </div>
              </div>
              
              {/* Stats Row (Read Only) */}
               <div className="col-span-2 grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                     <div className="text-2xl font-bold text-blue-400">95%</div>
                     <div className="text-[10px] text-blue-300 uppercase tracking-wider">Attendance</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                     <div className="text-2xl font-bold text-purple-400">3.8</div>
                     <div className="text-[10px] text-purple-300 uppercase tracking-wider">GPA</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                     <div className="text-2xl font-bold text-green-400">Paid</div>
                     <div className="text-[10px] text-green-300 uppercase tracking-wider">Fee Status</div>
                  </div>
               </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StudentDetail;