/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Customer, AppState } from './types';
import { storage } from './lib/storage';
import { Keypad } from './components/Keypad';
import { Coffee, ChevronLeft, Gift, PlusCircle, MinusCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CASHIER_PIN = '1234';
const INACTIVITY_TIMEOUT = 10000; // 10 seconds

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  
  // New Customer State
  const [newName, setNewName] = useState('');
  
  // Cashier State
  const [cashierPin, setCashierPin] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inactivity Timer
  const timerRef = useRef<number | null>(null);

  const resetToIdle = useCallback(() => {
    setAppState('IDLE');
    setPhone('');
    setCustomer(null);
    setNewName('');
    setCashierPin('');
    setPurchaseAmount('');
    setRedeemAmount('');
    setErrorMsg('');
    setSuccessMsg('');
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    // Only set inactivity timer if we are not in IDLE state
    if (appState !== 'IDLE') {
      timerRef.current = window.setTimeout(() => {
        resetToIdle();
      }, INACTIVITY_TIMEOUT);
    }
  }, [appState, resetToIdle]);

  useEffect(() => {
    resetTimer();
    const handleInteraction = () => resetTimer();
    
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  const showSuccessAndReturn = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      resetToIdle();
    }, 3000);
  };

  const handlePhoneSubmit = () => {
    if (phone.length !== 11) {
      setErrorMsg('Please enter a valid 11-digit number');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const existing = storage.getCustomer(phone);
    if (existing) {
      setCustomer(existing);
      setAppState('DASHBOARD');
    } else {
      setAppState('CASHIER_ADD'); // Or NEW_CUSTOMER. Let's go to NEW_CUSTOMER
      setAppState('NEW_CUSTOMER');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCust: Customer = {
      phone,
      name: newName.trim(),
      points: 10,
      transactions: [{
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: 'welcome',
        points: 10,
        description: 'Welcome Bonus'
      }]
    };
    
    storage.saveCustomer(newCust);
    setCustomer(newCust);
    setAppState('DASHBOARD');
  };

  const handleAddPoints = () => {
    if (cashierPin !== CASHIER_PIN) {
      setErrorMsg('Invalid PIN');
      setTimeout(() => setErrorMsg(''), 3000);
      setCashierPin('');
      return;
    }
    
    const amt = parseFloat(purchaseAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Invalid Amount');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const pointsEarned = Math.floor(amt / 10);
    
    if (customer) {
      const updatedCust: Customer = {
        ...customer,
        points: customer.points + pointsEarned,
        transactions: [
          {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: 'add',
            points: pointsEarned,
            description: `Purchase: â±${amt.toFixed(2)}`
          },
          ...customer.transactions
        ]
      };
      storage.saveCustomer(updatedCust);
      showSuccessAndReturn(`Added ${pointsEarned} points!`);
    }
  };

  const handleRedeemPoints = () => {
    if (cashierPin !== CASHIER_PIN) {
      setErrorMsg('Invalid PIN');
      setTimeout(() => setErrorMsg(''), 3000);
      setCashierPin('');
      return;
    }
    
    const pts = parseInt(redeemAmount, 10);
    if (isNaN(pts) || pts <= 0 || pts > (customer?.points || 0)) {
      setErrorMsg('Invalid Points Amount');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    if (customer) {
      const updatedCust: Customer = {
        ...customer,
        points: customer.points - pts,
        transactions: [
          {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: 'redeem',
            points: pts,
            description: `Redeemed â±${pts} discount`
          },
          ...customer.transactions
        ]
      };
      storage.saveCustomer(updatedCust);
      showSuccessAndReturn(`Redeemed â±${pts} discount!`);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FDFBF7] text-[#4B3F35] font-sans flex overflow-hidden">
      
      <aside className="w-[380px] bg-[#A3B18A]/20 border-r border-[#E5E1DA] p-10 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-[#4B3F35] rounded-full flex items-center justify-center">
              <div className="w-6 h-8 border-2 border-white rounded-t-sm rounded-b-xl relative">
                <div className="absolute top-2 left-1 w-1 h-4 bg-white/30 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">MOSS & MILK</h1>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-light leading-tight">Welcome to our <span className="font-bold text-[#606C38]">Loyalty Club</span></h2>
            <p className="text-lg opacity-80">Every ₱10 spent = 1 Point.<br/>1 Point = ₱1 Discount.</p>
            <div className="bg-white p-6 rounded-3xl border border-[#E5E1DA] shadow-sm">
              <p className="text-xs uppercase tracking-widest font-bold text-[#A3B18A] mb-2">Current Offer</p>
              <p className="font-semibold">Free Matcha Latte at 100 points!</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 opacity-50 text-sm">
            <div className="w-2 h-2 bg-[#606C38] rounded-full"></div>
            <span>System Active • Terminal 01</span>
          </div>
          <button className="w-full py-3 px-4 border border-[#E5E1DA] rounded-xl text-sm font-medium hover:bg-white transition-colors">Cashier Login</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto w-full">
        
        <AnimatePresence mode="wait">
          
          {/* SUCCESS OVERLAY */}
          {successMsg && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#FDFBF7] z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <CheckCircle2 size={80} className="text-[#606C38] mb-6" />
              <h2 className="text-3xl font-bold mb-2">Success!</h2>
              <p className="text-xl opacity-80">{successMsg}</p>
              <p className="text-sm opacity-40 mt-8 font-medium">Resetting automatically...</p>
            </motion.div>
          )}

          {/* IDLE: PHONE ENTRY */}
          {appState === 'IDLE' && !successMsg && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-md flex flex-col items-center text-center mx-auto"
            >
              <div className="mb-12 w-full">
                <label className="block text-xs uppercase tracking-[0.2em] font-bold mb-8 opacity-60">Enter your mobile number</label>
                <div className="flex justify-center gap-1 sm:gap-3 text-4xl sm:text-5xl font-mono tracking-tighter w-full">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-8 sm:w-12 border-b-4 pb-2 ${
                        phone[i] 
                          ? 'border-[#4B3F35] text-[#4B3F35]' 
                          : i === phone.length 
                            ? 'border-[#4B3F35] text-[#D4A373]' 
                            : 'border-[#E5E1DA] text-transparent opacity-30'
                      }`}
                    >
                      {phone[i] || (i === phone.length ? '•' : '•')}
                    </span>
                  ))}
                </div>
                {errorMsg && <p className="text-[#F16565] mt-6 font-medium">{errorMsg}</p>}
              </div>

              <Keypad 
                onPress={(val) => setPhone(p => (p.length < 11 ? p + val : p))}
                onBackspace={() => setPhone(p => p.slice(0, -1))}
                onClear={() => setPhone('')}
                onSubmit={handlePhoneSubmit}
                submitLabel="Submit"
                disabledSubmit={phone.length === 0}
              />
            </motion.div>
          )}

          {/* NEW CUSTOMER SETUP */}
          {appState === 'NEW_CUSTOMER' && !successMsg && (
            <motion.div 
              key="new_customer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#A3B18A]/20 text-[#606C38] rounded-full flex items-center justify-center mb-6">
                <Gift size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-2">New Customer!</h2>
              <p className="opacity-60 mb-8 text-lg">
                Enter your first name to join.<br/>
                <span className="font-bold text-[#606C38]">You'll get 10 Welcome Points!</span>
              </p>
              
              <form onSubmit={handleCreateAccount} className="w-full max-w-sm flex flex-col gap-4">
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your First Name"
                  className="w-full text-center text-2xl p-4 rounded-2xl border-2 border-[#E5E1DA] bg-white focus:outline-none focus:border-[#A3B18A] placeholder:text-[#4B3F35]/30"
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={!newName.trim()}
                  className="w-full h-20 bg-[#606C38] hover:bg-[#4F592E] disabled:bg-[#A3B18A] disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl shadow-lg shadow-[#606C38]/20 transition-colors active:scale-95 mt-4"
                >
                  JOIN & GET BONUS
                </button>
                <button 
                  type="button"
                  onClick={resetToIdle}
                  className="text-[#4B3F35]/50 hover:text-[#4B3F35] font-medium py-3"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          )}

          {/* DASHBOARD */}
          {appState === 'DASHBOARD' && customer && !successMsg && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-3xl font-bold mb-2">Welcome back, {customer.name}!</h2>
              
              <div className="bg-white border border-[#E5E1DA] w-full max-w-md rounded-3xl p-8 flex flex-col items-center my-8 shadow-sm">
                <p className="text-[#A3B18A] font-bold uppercase tracking-widest text-xs mb-2">Points Balance</p>
                <div className="text-6xl font-black text-[#606C38] mb-2">{customer.points}</div>
                <p className="opacity-60 font-medium text-sm">Available Discount: ₱{customer.points}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <button 
                  onClick={() => setAppState('CASHIER_REDEEM')}
                  className="bg-white border-2 border-[#E5E1DA] hover:border-[#A3B18A] hover:bg-[#FDFBF7] font-bold py-6 px-4 rounded-2xl shadow-sm transition-all active:scale-95 flex flex-col items-center gap-3"
                >
                  <MinusCircle size={32} className="text-[#F16565]" />
                  <span className="text-lg">Redeem Points</span>
                </button>
                <button 
                  onClick={() => setAppState('CASHIER_ADD')}
                  className="bg-[#606C38] hover:bg-[#4F592E] text-white font-bold py-6 px-4 rounded-2xl shadow-sm transition-all active:scale-95 flex flex-col items-center gap-3"
                >
                  <PlusCircle size={32} />
                  <span className="text-lg">Add Points</span>
                </button>
              </div>

              <button 
                onClick={resetToIdle}
                className="mt-12 text-[#4B3F35]/50 hover:text-[#4B3F35] font-medium flex items-center gap-2 transition-colors"
              >
                <ChevronLeft size={20} /> Exit / Next Customer
              </button>
            </motion.div>
          )}

          {/* CASHIER: ADD POINTS */}
          {appState === 'CASHIER_ADD' && !successMsg && (
            <motion.div 
              key="cashier_add"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full flex items-center mb-8 relative max-w-sm">
                <button onClick={() => setAppState('DASHBOARD')} className="absolute left-0 p-2 text-[#4B3F35]/50 hover:text-[#4B3F35]">
                  <ChevronLeft size={28} />
                </button>
                <h2 className="text-2xl font-bold w-full text-center">Add Points</h2>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mb-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold opacity-60 mb-2">Purchase Amount (₱)</label>
                  <input 
                    type="number" 
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-2xl p-4 rounded-xl border-2 border-[#E5E1DA] bg-white focus:outline-none focus:border-[#A3B18A] placeholder:text-[#4B3F35]/30"
                    autoFocus
                  />
                  <p className="text-sm opacity-50 mt-2 font-medium">Earns: {Math.floor(parseFloat(purchaseAmount || '0') / 10)} pts (₱10 = 1 pt)</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold opacity-60 mb-2 mt-4">Cashier PIN</label>
                  <input 
                    type="password" 
                    value={cashierPin}
                    onChange={(e) => setCashierPin(e.target.value)}
                    placeholder="****"
                    maxLength={4}
                    className="w-full text-2xl p-4 rounded-xl border-2 border-[#E5E1DA] bg-white focus:outline-none focus:border-[#A3B18A] text-center tracking-widest placeholder:text-[#4B3F35]/30"
                  />
                </div>
                {errorMsg && <p className="text-[#F16565] font-medium text-center mt-2">{errorMsg}</p>}
              </div>

              <button 
                onClick={handleAddPoints}
                disabled={!purchaseAmount || !cashierPin}
                className="w-full max-w-sm h-20 bg-[#4B3F35] hover:bg-[#322A23] disabled:bg-[#E5E1DA] disabled:text-[#4B3F35]/40 disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl shadow-lg transition-colors active:scale-95"
              >
                CONFIRM ADDITION
              </button>
            </motion.div>
          )}

          {/* CASHIER: REDEEM POINTS */}
          {appState === 'CASHIER_REDEEM' && customer && !successMsg && (
            <motion.div 
              key="cashier_redeem"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full flex items-center mb-8 relative max-w-sm">
                <button onClick={() => setAppState('DASHBOARD')} className="absolute left-0 p-2 text-[#4B3F35]/50 hover:text-[#4B3F35]">
                  <ChevronLeft size={28} />
                </button>
                <h2 className="text-2xl font-bold w-full text-center">Redeem Points</h2>
              </div>

              <div className="bg-[#A3B18A]/20 px-6 py-4 rounded-2xl mb-8 w-full max-w-sm flex justify-between items-center font-medium border border-[#A3B18A]/30">
                <span className="opacity-80">Available pts:</span>
                <span className="text-2xl font-bold text-[#606C38]">{customer.points}</span>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mb-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold opacity-60 mb-2">Points to Redeem</label>
                  <input 
                    type="number" 
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="0"
                    max={customer.points}
                    className="w-full text-2xl p-4 rounded-xl border-2 border-[#E5E1DA] bg-white focus:outline-none focus:border-[#A3B18A] placeholder:text-[#4B3F35]/30"
                    autoFocus
                  />
                  <p className="text-sm opacity-50 mt-2 font-medium">Discount value: ₱{redeemAmount || '0'}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold opacity-60 mb-2 mt-4">Cashier PIN</label>
                  <input 
                    type="password" 
                    value={cashierPin}
                    onChange={(e) => setCashierPin(e.target.value)}
                    placeholder="****"
                    maxLength={4}
                    className="w-full text-2xl p-4 rounded-xl border-2 border-[#E5E1DA] bg-white focus:outline-none focus:border-[#A3B18A] text-center tracking-widest placeholder:text-[#4B3F35]/30"
                  />
                </div>
                {errorMsg && <p className="text-[#F16565] font-medium text-center mt-2">{errorMsg}</p>}
              </div>

              <button 
                onClick={handleRedeemPoints}
                disabled={!redeemAmount || !cashierPin}
                className="w-full max-w-sm h-20 bg-[#4B3F35] hover:bg-[#322A23] disabled:bg-[#E5E1DA] disabled:text-[#4B3F35]/40 disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl shadow-lg transition-colors active:scale-95"
              >
                CONFIRM REDEMPTION
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}
