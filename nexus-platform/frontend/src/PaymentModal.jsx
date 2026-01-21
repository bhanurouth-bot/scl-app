import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, CreditCard, CheckCircle, Banknote } from 'lucide-react';
import api from './api';

const PaymentModal = ({ invoice, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'CASH',
    remarks: ''
  });

  // Pre-fill amount with the balance due when modal opens
  React.useEffect(() => {
    if (invoice) {
        setFormData(prev => ({ ...prev, amount: invoice.balance_due }));
    }
  }, [invoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return alert("Enter a valid amount");
    if (parseFloat(formData.amount) > parseFloat(invoice.balance_due)) return alert("Amount exceeds balance due!");

    setLoading(true);
    try {
      await api.post('finance/transactions/', {
        invoice: invoice.id,
        amount: formData.amount,
        payment_method: formData.payment_method,
        remarks: formData.remarks
      });
      alert("Payment Recorded!");
      onSuccess();
      onClose();
    } catch (err) {
      alert("Payment Failed: " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-8 border-b border-white/5">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Record Payment</h2>
                        <p className="text-green-300 text-sm font-mono">{invoice.invoice_number}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="mt-6">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Due</p>
                    <p className="text-4xl font-bold text-white mt-1">${invoice.balance_due}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* Amount Input */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Receiving Amount</label>
                    <div className="relative mt-2">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">$</div>
                        <input 
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white text-lg font-bold outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Method Selection */}
                <div className="grid grid-cols-2 gap-3">
                    {['CASH', 'ONLINE', 'CHEQUE', 'BANK_TRANSFER'].map((method) => (
                        <button
                            type="button"
                            key={method}
                            onClick={() => setFormData({...formData, payment_method: method})}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 ${
                                formData.payment_method === method 
                                ? 'bg-green-600 border-green-500 text-white' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {method === 'CASH' && <Banknote size={20}/>}
                            {method === 'ONLINE' && <CreditCard size={20}/>}
                            {method === 'CHEQUE' && <div className="font-serif italic text-lg leading-none">Chk</div>}
                            {method === 'BANK_TRANSFER' && <div className="font-mono text-lg leading-none">Tx</div>}
                            {method.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Submit */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-900/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? "Processing..." : <> <CheckCircle size={20} /> Confirm Payment </>}
                </button>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;