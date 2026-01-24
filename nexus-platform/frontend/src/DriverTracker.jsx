import React, { useState, useEffect, useRef } from 'react';
import { Navigation, StopCircle, UploadCloud, AlertTriangle, AlertCircle, Wifi, PlayCircle } from 'lucide-react';
import api from './api';
import { GlassButton, GlassSelect } from './components/GlassUI';

const DriverTracker = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false); // <--- NEW STATE
  const [status, setStatus] = useState('Idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [useHighAccuracy, setUseHighAccuracy] = useState(false);
  
  const watchIdRef = useRef(null);
  const simulationIntervalRef = useRef(null);

  useEffect(() => {
    api.get('transport/vehicles/').then(res => setVehicles(res.data));
  }, []);

  // --- REAL GPS TRACKING ---
  const startTracking = () => {
    if (!selectedVehicle) return alert("Select a vehicle first!");
    
    // Stop any existing simulation
    stopTracking();

    if (!('geolocation' in navigator)) return setErrorMessage("GPS not supported.");

    setIsTracking(true);
    setIsSimulation(false);
    setErrorMessage('');
    setStatus('Acquiring Signal...');

    const options = {
      enableHighAccuracy: useHighAccuracy,
      timeout: 15000, // 15s timeout
      maximumAge: 0
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        sendLocation(latitude, longitude, `Live • ±${Math.round(accuracy)}m`);
      },
      (error) => {
        console.error("GPS ERROR:", error);
        let msg = "GPS Signal Lost.";
        if (error.code === 1) msg = "Location Permission Denied.";
        if (error.code === 3) msg = "Signal Timeout.";
        
        setErrorMessage(`${msg} Switching to Simulation?`);
        setStatus('Signal Lost');
        
        // Optional: Auto-switch to simulation on error?
        // startSimulation(); 
      },
      options
    );
  };

  // --- SIMULATION MODE (FOR TESTING) ---
  const startSimulation = () => {
    if (!selectedVehicle) return alert("Select a vehicle first!");
    
    stopTracking();
    setIsTracking(true);
    setIsSimulation(true);
    setErrorMessage('');
    setStatus('Starting Simulation...');

    // Start at a default location (e.g., Central Park, NY or New Delhi)
    // You can change these base coordinates to your city
    let lat = 28.6139; 
    let lng = 77.2090;

    simulationIntervalRef.current = setInterval(() => {
        // Randomly move the vehicle slightly
        lat += (Math.random() - 0.5) * 0.001; 
        lng += (Math.random() - 0.5) * 0.001;
        
        sendLocation(lat, lng, "Simulation Mode • Moving");
    }, 3000); // Update every 3 seconds
  };

  // --- SHARED SENDER ---
  const sendLocation = async (latitude, longitude, statusMsg) => {
      setStatus(statusMsg);
      try {
          await api.post(`transport/vehicles/${selectedVehicle}/update_location/`, {
            latitude,
            longitude
          });
          setLastUpdate(new Date());
      } catch (err) {
          console.error(err);
      }
  };

  const stopTracking = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    
    setIsTracking(false);
    setIsSimulation(false);
    setStatus('Tracking Stopped');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Pulse */}
      {isTracking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className={`w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse ${isSimulation ? 'bg-orange-500/20' : 'bg-indigo-500/20'}`}></div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md bg-[#111] border border-white/10 p-8 rounded-[3rem] shadow-2xl text-center">
        
        <div className="mb-8 flex justify-center">
            <div className={`p-6 rounded-full border-4 transition-all duration-500 ${
                isTracking 
                ? (isSimulation ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_50px_#f97316]' : 'bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-[0_0_50px_#6366f1]')
                : 'bg-white/5 border-white/10 text-gray-500'
            }`}>
                <Navigation size={64} className={isTracking ? "animate-pulse" : ""} />
            </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Driver Console</h1>
        
        {/* Error Banner */}
        {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-bold flex items-start gap-3 text-left animate-shake">
                <AlertCircle size={24} className="shrink-0" />
                <div>{errorMessage}</div>
            </div>
        )}

        {!isTracking ? (
            <div className="space-y-6">
                <div className="text-left">
                    <label className="text-xs font-bold text-gray-500 ml-3 mb-1 block">SELECT VEHICLE</label>
                    <GlassSelect value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
                        <option value="">-- Choose Bus --</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.vehicle_number} - {v.model}</option>
                        ))}
                    </GlassSelect>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Real GPS Button */}
                    <button 
                        onClick={startTracking} 
                        className="py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all"
                    >
                        Start GPS
                    </button>

                    {/* Simulation Button */}
                    <button 
                        onClick={startSimulation} 
                        className="py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-orange-400 hover:text-white transition-all flex flex-col items-center justify-center gap-1"
                    >
                        <span className="flex items-center gap-2"><PlayCircle size={16}/> Demo Mode</span>
                        <span className="text-[9px] text-gray-500 font-normal">Use Fake Location</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">
                        {isSimulation ? "SIMULATION ACTIVE" : "GPS ACTIVE"}
                    </div>
                    <div className={`text-xl font-mono flex items-center justify-center gap-2 ${isSimulation ? 'text-orange-400' : 'text-green-400'}`}>
                        {status.includes('Live') || status.includes('Moving') ? <UploadCloud size={20} className="animate-bounce"/> : null}
                        {status}
                    </div>
                    {lastUpdate && <div className="text-xs text-gray-600 mt-2">Last Update: {lastUpdate.toLocaleTimeString()}</div>}
                </div>

                <GlassButton onClick={stopTracking} className="w-full py-4 text-lg bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border-red-600/50">
                    <StopCircle size={24} className="mr-2"/> Stop Journey
                </GlassButton>
                
                <p className="text-xs text-gray-500 animate-pulse flex justify-center gap-1">
                    <AlertTriangle size={12} /> Do not close this tab.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DriverTracker;