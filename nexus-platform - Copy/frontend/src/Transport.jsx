import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, MapPin, Users, Navigation, AlertTriangle,
  CheckCircle, Search, Phone, Wrench, Fuel,
  LayoutGrid, Map as MapIcon, User, Plus, X, Globe, 
  RefreshCw, Link as LinkIcon, Unlink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // <--- CRITICAL FIX FOR BLANK MAP
import L from 'leaflet';

import api from './api';
import Dock from './Dock';
import { GlassButton, GlassInput, GlassSelect } from './components/GlassUI';

// --- CUSTOM MAP MARKER (Sci-Fi Style) ---
const createBusIcon = (vehicleNumber) => L.divIcon({
  className: 'custom-bus-marker',
  html: `
    <div style="
      background-color: #4f46e5; 
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 0 20px rgba(79, 70, 229, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 10px;
      position: relative;
    ">
      <div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #6366f1; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      ${vehicleNumber.split('-').pop()}
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Helper to auto-center map
const MapReCenter = ({ vehicles }) => {
  const map = useMap();
  useEffect(() => {
    if (vehicles.length > 0) {
      const active = vehicles.find(v => v.latitude && v.longitude);
      if (active) {
        map.flyTo([active.latitude, active.longitude], 14, { animate: true, duration: 2 });
      }
    }
  }, [vehicles, map]);
  return null;
};

const Transport = () => {
  const [activeTab, setActiveTab] = useState('fleet');
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, rRes, dRes] = await Promise.all([
          api.get('transport/vehicles/'),
          api.get('transport/routes/'),
          api.get('transport/drivers/')
      ]);
      setVehicles(vRes.data);
      setRoutes(rRes.data);
      setDrivers(dRes.data);

      if (!selectedItem) {
          if (activeTab === 'fleet' && vRes.data.length > 0) setSelectedItem(vRes.data[0]);
          if (activeTab === 'drivers' && dRes.data.length > 0) setSelectedItem(dRes.data[0]);
          if (activeTab === 'routes' && rRes.data.length > 0) setSelectedItem(rRes.data[0]);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleAssignDriver = async (vehicleId, driverId) => {
      try {
          await api.patch(`transport/vehicles/${vehicleId}/`, { driver: driverId || null });
          fetchData(); 
          if (selectedItem && selectedItem.id === vehicleId) {
              const updatedDriver = drivers.find(d => d.id == driverId);
              setSelectedItem({ ...selectedItem, driver: driverId, driver_details: updatedDriver });
          }
          alert("Driver assignment updated!");
      } catch (err) {
          alert("Failed to assign. Driver might be busy.");
      }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32 pt-6 px-6 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 relative z-10 gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/50">
                <Bus size={24} className="text-white"/>
            </div>
            Transport Command
          </h1>
          <p className="text-gray-400 font-medium mt-1 ml-1">Fleet Operations & Logistics</p>
        </div>

        <div className="flex gap-4">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {['fleet', 'routes', 'drivers'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedItem(null); setShowLiveMap(false); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab === 'fleet' && <LayoutGrid size={16}/>}
                        {tab === 'routes' && <MapIcon size={16}/>}
                        {tab === 'drivers' && <User size={16}/>}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-240px)] relative z-10">
        
        {/* LEFT SIDEBAR (List) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full bg-[#111] border border-white/10 rounded-3xl p-4">
            
            <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-all"
                    />
                </div>
                {activeTab === 'fleet' && (
                    <button 
                        onClick={() => setShowLiveMap(!showLiveMap)}
                        className={`p-3 rounded-xl border transition-all ${showLiveMap ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
                        title="Toggle Live Map"
                    >
                        <Globe size={20}/>
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                {loading ? (
                    [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl"></div>)
                ) : (
                    (activeTab === 'fleet' ? vehicles : activeTab === 'routes' ? routes : drivers).map(item => (
                        <ListItem 
                            key={item.id} 
                            item={item} 
                            type={activeTab} 
                            active={selectedItem?.id === item.id}
                            onClick={() => setSelectedItem(item)}
                        />
                    ))
                )}
            </div>
            
            <button 
                onClick={() => setModalType(activeTab === 'fleet' ? 'vehicle' : activeTab === 'routes' ? 'route' : 'driver')} 
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white font-bold flex items-center justify-center gap-2 transition-all"
            >
                <Plus size={18}/> Add New {activeTab === 'fleet' ? 'Vehicle' : activeTab.slice(0, -1)}
            </button>
        </div>

        {/* RIGHT MAIN PANEL */}
        <div className="lg:col-span-8 h-full bg-[#111] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col shadow-2xl">
            
            {showLiveMap && activeTab === 'fleet' ? (
                <FreeLiveMap vehicles={vehicles} />
            ) : selectedItem ? (
                <DetailsView 
                    item={selectedItem} 
                    type={activeTab} 
                    onAssignClick={() => setModalType('assign_driver')}
                    onUnassignClick={() => handleAssignDriver(selectedItem.id, null)}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <Bus size={64} className="opacity-20 mb-4" />
                    <p className="text-xl font-medium">Select an item to view details</p>
                </div>
            )}
        </div>

      </div>

      <Dock />
      
      {/* MODALS */}
      <AddModal type={modalType} isOpen={!!modalType && modalType !== 'assign_driver'} onClose={() => setModalType(null)} onSuccess={fetchData} />
      <AssignDriverModal isOpen={modalType === 'assign_driver'} onClose={() => setModalType(null)} vehicle={selectedItem} drivers={drivers} onAssign={handleAssignDriver} />

    </div>
  );
};

// --- FREE REAL MAP COMPONENT (OpenStreetMap) ---
const FreeLiveMap = ({ vehicles }) => {
    const [liveVehicles, setLiveVehicles] = useState(vehicles);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await api.get('transport/vehicles/');
                setLiveVehicles(res.data);
            } catch (err) { console.error("Sync failed", err); }
        }, 3000); 
        return () => clearInterval(interval);
    }, []);

    // Active means they have coordinates
    const trackedVehicles = liveVehicles.filter(v => v.latitude && v.longitude);

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden relative border border-white/10 group bg-black">
            
            {/* The Map */}
            <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                style={{ height: '100%', width: '100%', background: '#09090b', zIndex: 0 }} 
                zoomControl={false}
            >
                {/* CARTO Dark Matter Tiles (The secret to looking like Google Maps Dark Mode for FREE) 
                   Attribution is required but subtle.
                */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <MapReCenter vehicles={trackedVehicles} />

                {trackedVehicles.map(v => (
                    <Marker 
                        key={v.id} 
                        position={[v.latitude, v.longitude]} 
                        icon={createBusIcon(v.vehicle_number)}
                    >
                        <Popup className="glass-popup">
                            <div className="text-black font-bold">{v.vehicle_number}</div>
                            <div className="text-gray-600 text-xs">{v.driver_details?.name}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay Status */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-2 shadow-xl z-[400]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
                {trackedVehicles.length} SATELLITE LOCKS
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const ListItem = ({ item, type, active, onClick }) => {
    let title = '', subtitle = '', icon = Bus, status = null;
    if (type === 'fleet') {
        title = item.vehicle_number;
        subtitle = item.driver_details?.name || 'Unassigned';
        status = item.status;
    } else if (type === 'routes') {
        title = item.name;
        subtitle = `${item.start_point} → ${item.end_point}`;
        icon = Navigation;
    } else if (type === 'drivers') {
        title = item.name;
        subtitle = item.license_number;
        status = item.status;
        icon = User;
    }

    return (
        <div onClick={onClick} className={`p-4 rounded-xl cursor-pointer border transition-all relative overflow-hidden group ${active ? 'bg-indigo-600 border-indigo-500 shadow-lg' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${active ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>{React.createElement(icon, { size: 18 })}</div>
                    <div><h3 className={`font-bold text-sm ${active ? 'text-white' : 'text-gray-200'}`}>{title}</h3><p className={`text-xs ${active ? 'text-indigo-200' : 'text-gray-500'}`}>{subtitle}</p></div>
                </div>
                {status && <div className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-yellow-400'}`}></div>}
            </div>
        </div>
    );
};

const DetailsView = ({ item, type, onAssignClick, onUnassignClick }) => {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-1">{type === 'fleet' ? item.vehicle_number : type === 'drivers' ? item.name : item.name}</h2>
                    <p className="text-gray-400 text-lg">{type === 'fleet' ? item.model : type === 'drivers' ? item.license_number : 'Route Details'}</p>
                </div>
                {item.status && <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{item.status}</span>}
            </div>
            <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2">
                {type === 'fleet' && (
                    <>
                        <InfoCard label="Fuel" value={item.fuel_type} icon={Fuel} />
                        <InfoCard label="Capacity" value={`${item.capacity} Seats`} icon={Users} />
                        <div className="col-span-2 p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><User size={16}/> Assigned Pilot</h3>
                                <div className="flex gap-2">
                                    {item.driver_details ? <button onClick={onUnassignClick} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 border border-red-500/30 transition-all"><Unlink size={14}/> Unassign</button> : null}
                                    <button onClick={onAssignClick} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-2 border border-indigo-500/30 transition-all"><LinkIcon size={14}/> {item.driver_details ? 'Change' : 'Assign Driver'}</button>
                                </div>
                            </div>
                            {item.driver_details ? (
                                <div className="flex items-center gap-6 p-4 bg-black/30 rounded-2xl border border-white/5">
                                    <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                                        {item.driver_details.photo ? <img src={item.driver_details.photo} className="w-full h-full object-cover"/> : <User size={32} className="text-gray-400"/>}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">{item.driver_details.name}</div>
                                        <div className="text-sm text-gray-400 font-mono">{item.driver_details.license_number}</div>
                                        <div className="flex gap-4 mt-2">
                                            <div className="flex items-center gap-1 text-xs text-indigo-300"><Phone size={12}/> {item.driver_details.phone}</div>
                                            <div className="flex items-center gap-1 text-xs text-green-300"><CheckCircle size={12}/> {item.driver_details.status}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500"><AlertTriangle size={32} className="mb-2 opacity-50"/><p>No Driver Assigned</p></div>
                            )}
                        </div>
                    </>
                )}
                {type === 'drivers' && <><InfoCard label="Phone" value={item.phone} icon={Phone}/><InfoCard label="License" value={item.license_number} icon={Wrench}/></>}
                {type === 'routes' && <><InfoCard label="Start" value={item.start_point} icon={MapPin}/><InfoCard label="End" value={item.end_point} icon={MapPin}/></>}
            </div>
        </motion.div>
    );
};

const InfoCard = ({ label, value, icon: Icon }) => (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
        <div className="p-3 bg-black/40 rounded-xl text-gray-400"><Icon size={20}/></div>
        <div><div className="text-xs text-gray-500 uppercase font-bold">{label}</div><div className="text-lg text-white font-medium">{value}</div></div>
    </div>
);

const AddModal = ({ type, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({});
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && type === 'driver') api.get('hr/employees/').then(res => setEmployees(res.data));
        setFormData({});
    }, [isOpen, type]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const endpoint = type === 'vehicle' ? 'transport/vehicles/' : type === 'driver' ? 'transport/drivers/' : 'transport/routes/';
            await api.post(endpoint, formData);
            onSuccess(); onClose();
        } catch (err) { alert("Failed to add."); } finally { setLoading(false); }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24}/></button>
                <h2 className="text-2xl font-bold text-white mb-6 capitalize">Add New {type}</h2>
                <div className="space-y-4">
                    {type === 'vehicle' && <><GlassInput placeholder="Number (BUS-01)" onChange={e => setFormData({...formData, vehicle_number: e.target.value})} /><GlassInput placeholder="Model" onChange={e => setFormData({...formData, model: e.target.value})} /></>}
                    {type === 'driver' && <GlassSelect onChange={e => setFormData({...formData, employee: e.target.value})}><option value="">Select HR Employee</option>{employees.map(e => <option key={e.id} value={e.id}>{e.user.first_name}</option>)}</GlassSelect>}
                    {type === 'route' && <><GlassInput placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} /><GlassInput placeholder="Start" onChange={e => setFormData({...formData, start_point: e.target.value})} /></>}
                </div>
                <div className="mt-8 flex gap-3"><GlassButton onClick={onClose} variant="ghost" className="flex-1">Cancel</GlassButton><GlassButton onClick={handleSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-500" disabled={loading}>{loading ? 'Saving...' : 'Confirm'}</GlassButton></div>
            </div>
        </div>
    );
};

const AssignDriverModal = ({ isOpen, onClose, vehicle, drivers, onAssign }) => {
    const [selectedDriver, setSelectedDriver] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24}/></button>
                <h2 className="text-xl font-bold text-white mb-6">Assign Driver to {vehicle.vehicle_number}</h2>
                <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-500 ml-2 block">SELECT DRIVER</label>
                    <GlassSelect value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}>
                        <option value="">-- Select --</option>
                        {drivers.filter(d => d.status === 'ACTIVE').map(d => <option key={d.id} value={d.id}>{d.name} ({d.license_number})</option>)}
                    </GlassSelect>
                </div>
                <div className="mt-8 flex gap-3"><GlassButton onClick={onClose} variant="ghost" className="flex-1">Cancel</GlassButton><GlassButton onClick={() => { onAssign(vehicle.id, selectedDriver); onClose(); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500">Confirm Assignment</GlassButton></div>
            </div>
        </div>
    );
};

export default Transport;