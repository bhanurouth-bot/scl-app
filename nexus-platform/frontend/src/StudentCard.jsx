import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone } from 'lucide-react';

const StudentCard = ({ student, index }) => {
  // Safe defaults in case data is missing
  const name = student.user?.first_name 
    ? `${student.user.first_name} ${student.user.last_name}` 
    : "Unknown Student";
    
  const studentId = student.student_id || "N/A";
  const grade = student.classroom_details 
    ? `${student.classroom_details.grade_level}-${student.classroom_details.section}` 
    : "No Class";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="glass-panel p-6 rounded-3xl border border-white/10 group hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Decorative ID Strip */}
      <div className="absolute top-0 left-6 w-12 h-24 bg-blue-600/20 blur-xl rounded-full"></div>

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">{name}</h3>
          <span className="text-blue-300 text-xs font-mono bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
            {studentId}
          </span>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="p-2 rounded-lg bg-white/5"><User size={14} /></div>
          <span>Class: <span className="text-white">{grade}</span></span>
        </div>
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="p-2 rounded-lg bg-white/5"><Phone size={14} /></div>
          <span>{student.guardian_phone || "No Contact"}</span>
        </div>
      </div>

      {/* Hover Action */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </motion.div>
  );
};

export default StudentCard;