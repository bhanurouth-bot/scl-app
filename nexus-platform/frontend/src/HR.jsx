import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Users, Calendar, DollarSign, 
  CheckCircle, XCircle, Printer, Plus, UserPlus, 
  Clock, Save, ArrowRight
} from 'lucide-react';
import api from './api';
import Dock from './Dock';
import { GlassButton, GlassInput, GlassSelect, Skeleton } from './components/GlassUI';

const HR = () => {
  const [activeTab, setActiveTab] = useState('staff');
  const [loading, setLoading] = useState(false);

  // --- Data ---
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceData, setAttendanceData] = useState({}); // { empId: 'PRESENT' }

  // --- Payroll Range ---
  const [payRange, setPayRange] = useState({ 
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10), 
      end: new Date().toISOString().slice(0, 10) 
  });

  // --- Initial Load ---
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if(activeTab === 'attendance') fetchAttendanceForDate();
  }, [attendanceDate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'staff') {
        const res = await api.get('hr/employees/');
        setEmployees(res.data);
      } else if (activeTab === 'leaves') {
        const res = await api.get('hr/leaves/');
        setLeaves(res.data);
      } else if (activeTab === 'payroll') {
        const res = await api.get('hr/salary-slips/');
        setSalarySlips(res.data);
      } else if (activeTab === 'attendance') {
        // Just ensure we have employees to mark attendance for
        if(employees.length === 0) {
            const res = await api.get('hr/employees/');
            setEmployees(res.data);
        }
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchAttendanceForDate = async () => {
      // Fetch existing marks for this date to pre-fill
      // This is a simplified fetch, ideally backend supports filter by date
      // For now, we rely on the user marking. 
      // In a real app, you'd GET /hr/attendance/?date=...
      const initialMap = {};
      employees.forEach(emp => initialMap[emp.id] = 'PRESENT'); // Default All Present
      setAttendanceData(initialMap);
  };

  // --- HANDLERS ---

  const handleAttendanceChange = (empId, status) => {
      setAttendanceData(prev => ({ ...prev, [empId]: status }));
  };

  const saveAttendance = async () => {
      setLoading(true);
      const payload = Object.entries(attendanceData).map(([empId, status]) => ({
          employee: empId,
          status: status
      }));

      try {
          await api.post('hr/attendance/bulk_mark/', {
              date: attendanceDate,
              attendance: payload
          });
          alert("Attendance Saved Successfully!");
      } catch (err) { alert("Failed to save attendance."); }
      finally { setLoading(false); }
  };

  const generatePayroll = async () => {
      if(!window.confirm(`Generate payroll from ${payRange.start} to ${payRange.end}?`)) return;
      setLoading(true);
      try {
          const res = await api.post('hr/salary-slips/generate_range/', { 
              start_date: payRange.start,
              end_date: payRange.end
          });
          alert(res.data.message);
          fetchData(); // Refresh list
      } catch (err) { alert("Payroll Generation Failed"); } 
      finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-rose-500/30">
      
      <div className="fixed top-[-20%] left-[20%] w-[900px] h-[900px] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Briefcase className="text-rose-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-rose-200 tracking-tighter">
              Human Resources
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Workforce Management</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto">
            {['staff', 'attendance', 'leaves', 'payroll'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeTab === tab ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 min-h-[600px] relative z-10">
          
          {/* TAB 1: STAFF DIRECTORY */}
          {activeTab === 'staff' && (
              <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><Users size={20}/> Employee Directory</h3>
                      <GlassButton className="bg-white/10 text-white hover:bg-rose-600"><UserPlus size={18}/> Add Employee</GlassButton>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {employees.map(emp => (
                          <div key={emp.id} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold border border-rose-500/20">
                                  {emp.user.first_name[0]}
                              </div>
                              <div>
                                  <div className="font-bold text-white">{emp.user.first_name} {emp.user.last_name}</div>
                                  <div className="text-xs text-gray-500">{emp.designation_details?.title || 'Staff'}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* TAB 2: ATTENDANCE (NEW) */}
          {activeTab === 'attendance' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                      <div>
                          <h3 className="text-lg font-bold text-white mb-1">Daily Attendance Register</h3>
                          <p className="text-sm text-rose-200">Mark presence for payroll calculation.</p>
                      </div>
                      <div className="flex items-end gap-4">
                          <input 
                              type="date" 
                              value={attendanceDate}
                              onChange={(e) => setAttendanceDate(e.target.value)}
                              className="bg-black/40 border border-rose-500/30 text-white p-2 rounded-lg outline-none"
                          />
                          <GlassButton onClick={saveAttendance} className="bg-rose-600 hover:bg-rose-500">
                              {loading ? 'Saving...' : <><Save size={18}/> Save Register</>}
                          </GlassButton>
                      </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/10">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                              <tr>
                                  <th className="p-4">Employee</th>
                                  <th className="p-4 text-center">Status</th>
                                  <th className="p-4 text-right">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {employees.map(emp => (
                                  <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                      <td className="p-4">
                                          <div className="font-bold text-white">{emp.user.first_name} {emp.user.last_name}</div>
                                          <div className="text-xs text-gray-500">{emp.employee_id}</div>
                                      </td>
                                      <td className="p-4 text-center">
                                          <div className="inline-flex bg-black/40 rounded-lg p-1 border border-white/10">
                                              {['PRESENT', 'ABSENT', 'HALF_DAY'].map(status => (
                                                  <button
                                                      key={status}
                                                      onClick={() => handleAttendanceChange(emp.id, status)}
                                                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                                          attendanceData[emp.id] === status 
                                                          ? (status === 'PRESENT' ? 'bg-green-500 text-white shadow' : status === 'ABSENT' ? 'bg-red-500 text-white shadow' : 'bg-yellow-500 text-black shadow')
                                                          : 'text-gray-500 hover:text-white'
                                                      }`}
                                                  >
                                                      {status}
                                                  </button>
                                              ))}
                                          </div>
                                      </td>
                                      <td className="p-4 text-right">
                                          <div className={`text-xs font-bold ${attendanceData[emp.id] === 'PRESENT' ? 'text-green-400' : 'text-red-400'}`}>
                                              {attendanceData[emp.id]}
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* TAB 3: PAYROLL (UPDATED) */}
          {activeTab === 'payroll' && (
              <div className="space-y-6">
                  <div className="flex flex-col lg:flex-row justify-between items-center p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl gap-4">
                      <div>
                          <h3 className="text-lg font-bold text-white mb-1">Payroll Generation Engine</h3>
                          <p className="text-sm text-emerald-200">Calculate salary based on attendance range.</p>
                      </div>
                      <div className="flex items-end gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                          <div className="flex flex-col">
                              <label className="text-[10px] text-gray-400 font-bold ml-1">From</label>
                              <input type="date" value={payRange.start} onChange={e => setPayRange({...payRange, start: e.target.value})} className="bg-transparent text-white text-sm p-1 outline-none font-mono"/>
                          </div>
                          <ArrowRight size={16} className="text-gray-500 mb-2"/>
                          <div className="flex flex-col">
                              <label className="text-[10px] text-gray-400 font-bold ml-1">To</label>
                              <input type="date" value={payRange.end} onChange={e => setPayRange({...payRange, end: e.target.value})} className="bg-transparent text-white text-sm p-1 outline-none font-mono"/>
                          </div>
                          <GlassButton onClick={generatePayroll} className="bg-emerald-600 hover:bg-emerald-500 h-10 ml-2">
                              {loading ? 'Processing...' : <><DollarSign size={16}/> Calculate</>}
                          </GlassButton>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {salarySlips.map(slip => (
                          <div key={slip.id} className="p-6 rounded-2xl bg-black/20 border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all">
                              <div>
                                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">
                                      {slip.start_date} → {slip.end_date}
                                  </div>
                                  <div className="font-bold text-white text-lg">{slip.employee_name}</div>
                                  <div className="flex gap-2 mt-1">
                                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Present: {slip.present_days}</span>
                                      <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20">Leave: {slip.leave_days}</span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-2xl font-bold text-emerald-400">${slip.net_salary}</div>
                                  <div className="text-xs text-gray-500 mb-2">Calculated Pay</div>
                                  <button className="flex items-center gap-1 text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-gray-300 transition-colors">
                                      <Printer size={12}/> Slip
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* TAB 4: LEAVES (Unchanged logic, just simplified view here) */}
          {activeTab === 'leaves' && (
              <div className="text-center text-gray-500 py-20">
                  <Clock size={48} className="mx-auto mb-4 opacity-50"/>
                  <p>Leave Management Module Active</p>
                  <p className="text-xs mt-2">(Switch to Attendance tab to mark daily presence)</p>
              </div>
          )}

      </div>

      <Dock />
    </div>
  );
};

export default HR;