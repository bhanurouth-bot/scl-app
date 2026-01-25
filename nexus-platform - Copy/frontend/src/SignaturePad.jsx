import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { motion } from 'framer-motion';
import { Eraser, Check, Upload, X, PenTool, Image as ImageIcon } from 'lucide-react';

const SignaturePad = ({ onSave, onClose, title = "Digital Signature" }) => {
  const sigCanvas = useRef({});
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'upload'
  const [file, setFile] = useState(null);
  const [penColor, setPenColor] = useState('black');
  const [saving, setSaving] = useState(false);

  const clear = () => sigCanvas.current.clear();

  const handleSaveDraw = () => {
    if (sigCanvas.current.isEmpty()) return alert("Please provide a signature first.");
    
    setSaving(true);

    // FIX: Use getCanvas() instead of getTrimmedCanvas() to avoid Vite bundling error
    const canvas = sigCanvas.current.getCanvas();
    
    canvas.toBlob((blob) => {
      if (blob) {
        const generatedFile = new File([blob], "signature.png", { type: "image/png" });
        onSave(generatedFile);
        // Note: We don't setSaving(false) here immediately because the parent component 
        // usually handles the async save and closes the modal.
        // But for safety in case of error in parent:
        setTimeout(() => setSaving(false), 2000); 
      }
    }, 'image/png');
  };

  const handleSaveUpload = () => {
    if (!file) return alert("Please select a file.");
    setSaving(true);
    onSave(file);
    // Timeout to reset state if parent doesn't close immediately
    setTimeout(() => setSaving(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PenTool size={20} className="text-blue-500"/> {title}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        <div className="p-8">
            {/* Tabs */}
            <div className="flex p-1 bg-black rounded-xl mb-6 border border-white/10">
                <button 
                  onClick={() => setActiveTab('draw')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'draw' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <PenTool size={16}/> Draw
                </button>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <Upload size={16}/> Upload
                </button>
            </div>

            {/* DRAW MODE */}
            {activeTab === 'draw' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="relative border-2 border-white/20 rounded-2xl overflow-hidden bg-white shadow-inner mb-4">
                        <SignatureCanvas 
                            ref={sigCanvas}
                            penColor={penColor}
                            canvasProps={{ className: 'w-full h-56' }}
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                             {/* Color Pickers */}
                             {['black', 'blue', 'red'].map(c => (
                                 <button 
                                   key={c}
                                   onClick={() => setPenColor(c)}
                                   className={`w-6 h-6 rounded-full border-2 ${penColor === c ? 'border-gray-900 scale-110' : 'border-transparent opacity-50'}`}
                                   style={{ backgroundColor: c }}
                                 />
                             ))}
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={clear} className="px-5 py-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                            <Eraser size={18}/> Reset
                        </button>
                        <button onClick={handleSaveDraw} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold py-3 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                            {saving ? 'Saving...' : <><Check size={18}/> Save Signature</>}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* UPLOAD MODE */}
            {activeTab === 'upload' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="border-2 border-dashed border-white/20 rounded-2xl h-56 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all relative mb-4">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <ImageIcon size={48} className="mb-3 opacity-50"/>
                        <p className="font-bold text-white">{file ? file.name : "Click to Upload Scan"}</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG supported</p>
                    </div>
                    <button onClick={handleSaveUpload} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold py-3 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        {saving ? 'Uploading...' : <><Check size={18}/> Save Upload</>}
                    </button>
                </motion.div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default SignaturePad;