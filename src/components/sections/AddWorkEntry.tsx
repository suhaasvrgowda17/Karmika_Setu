import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Save, MapPin, Calendar, User, Clock, IndianRupee, Briefcase, Send, RefreshCw, Check, X, MessageSquare, Sparkles, FormInput, ArrowDown, Download, FileText, ShieldCheck } from 'lucide-react';
import { WorkCategory, WorkEntry } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { extractWorkFromText, ExtractedWorkData } from '../../services/geminiService';
import { jsPDF } from 'jspdf';

interface AddWorkEntryProps {
  onAdd: (entry: Omit<WorkEntry, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  t: any;
  lang?: string;
}

const LANG_MAP: Record<string, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'kn': 'kn-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'ml': 'ml-IN',
  'mr': 'mr-IN',
  'gu': 'gu-IN',
  'bn': 'bn-IN'
};

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  data?: ExtractedWorkData;
  timestamp: number;
}

export default function AddWorkEntry({ onAdd, t, lang = 'hi' }: AddWorkEntryProps) {
  const [mode, setMode] = useState<'chat' | 'manual'>('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'ai', text: t.aiGreeting, timestamp: Date.now() }
  ]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: WorkCategory.CONSTRUCTION,
    workType: '',
    location: '',
    contractorName: '',
    hoursWorked: 8,
    paymentReceived: 500,
    paymentStatus: 'Paid' as const,
    contractorId: ''
  });

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
    setShowScrollButton(!isAtBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop when done speaking
      recognitionRef.current.interimResults = false; // Only final result
      recognitionRef.current.lang = LANG_MAP[lang] || 'hi-IN'; // Dynamic language context

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputText(prev => prev ? `${prev} ${text}` : text);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
    }
  }, [lang]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), type: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // AI Processing
    const processingMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', text: t.processing, timestamp: Date.now() };
    setMessages(prev => [...prev, processingMsg]);

    try {
      const data = await extractWorkFromText(text);
      
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== processingMsg.id);
        if (data) {
          return [...filtered, { 
            id: Date.now().toString(), 
            type: 'ai', 
            text: t.foundDetails || "Found details! You can tap any field to edit before saving.", 
            data, 
            timestamp: Date.now() 
          }];
        } else {
          return [...filtered, { 
            id: Date.now().toString(), 
            type: 'ai', 
            text: t.noUnderstand || "Sorry, I couldn't understand the details. Can you say it again more clearly?", 
            timestamp: Date.now() 
          }];
        }
      });
    } catch (err) {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== processingMsg.id);
        return [...filtered, { 
          id: Date.now().toString(), 
          type: 'ai', 
          text: t.extractError || "Something went wrong. Please try again or use the manual form.", 
          timestamp: Date.now() 
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmWork = async (data: ExtractedWorkData) => {
    setIsLoading(true);
    // Simulate Location Verification
    setMessages(prev => [...prev, { 
      id: 'loc-verify', 
      type: 'ai', 
      text: "📍 " + (t.verifyingLocation?.replace('{location}', data.location) || ("Verifying your location at " + data.location + "...")), 
      timestamp: Date.now() 
    }]);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      
      await onAdd({
        ...data,
        status: data.contractorId ? 'pending' : 'verified',
        isVerified: false,
        geoTag: { lat: 12.9716, lng: 77.5946 } // Simulated coordinates
      });

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'loc-verify');
        const statusMsg = data.contractorId 
          ? (t.workSavedContractor || "Work history saved! 📍 Location matched. Entry is pending Pradhan approval for official credit.")
          : (t.workSaved || "Work history saved! 📍 Location matched.");
        return [...filtered, { 
          id: Date.now().toString(), 
          type: 'ai', 
          text: statusMsg, 
          timestamp: Date.now() 
        }];
      });
      
      // Auto-generate receipt option
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          text: t.downloadReceiptQuestion || "Would you like to download a receipt for this work?",
          data: { ...data, category: data.category as any }, // Pass data for PDF
          timestamp: Date.now()
        }]);
      }, 500);
    } catch (err) {
      alert(t.saveError);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (data: ExtractedWorkData) => {
    const doc = new jsPDF();
    
    // Add branding
    doc.setFontSize(22);
    doc.setTextColor(90, 90, 64); // Brand color
    doc.text('KARMIK SETU', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Work Receipt / कार्य रसीद', 105, 30, { align: 'center' });
    
    // Draw a line
    doc.setDrawColor(90, 90, 64);
    doc.line(20, 35, 190, 35);
    
    // Details
    doc.setFontSize(12);
    let y = 50;
    const leftMargin = 20;
    const valueMargin = 80;
    
    const fields = [
      { label: 'Date / तिथि', value: data.date },
      { label: 'Work Type / कार्य प्रकार', value: data.workType },
      { label: 'Category / श्रेणी', value: data.category },
      { label: 'Location / स्थान', value: data.location },
      { label: 'Contractor / कॉन्ट्रैक्टर', value: data.contractorName },
      { label: 'Hours Worked / घंटे', value: `${data.hoursWorked} hrs` },
      { label: 'Amount / राशि', value: `₹${data.paymentReceived}` },
      { label: 'Payment Status / भुगतान स्थिति', value: data.paymentStatus },
    ];
    
    fields.forEach(field => {
      doc.setFont('helvetica', 'bold');
      doc.text(field.label + ':', leftMargin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(field.value), valueMargin, y);
      y += 10;
    });
    
    // Footer
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a digitally generated receipt from Karmik Setu.', 105, 280, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
    
    doc.save(`Receipt_${data.date}_${data.workType.replace(/\s+/g, '_')}.pdf`);
  };

  const handleManualSave = async () => {
    if (!formData.location || !formData.workType || !formData.contractorId) {
      alert(t.mandatoryPradhanId || "Pradhan ID / Contractor ID is mandatory for verification.");
      return;
    }
    
    setIsLoading(true);
    try {
      await onAdd({
        ...formData,
        status: formData.contractorId ? 'pending' : 'verified',
        isVerified: false,
        geoTag: { lat: 12.9716, lng: 77.5946 }
      });
      const alertMsg = formData.contractorId 
        ? (t.workLoggedContractor || "✅ Work logged and sent to contractor for verification.")
        : (t.workLogged || "✅ Work logged successfully.");
      alert(alertMsg); 
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: WorkCategory.CONSTRUCTION,
        workType: '',
        location: '',
        contractorName: '',
        hoursWorked: 8,
        paymentReceived: 500,
        paymentStatus: 'Paid',
        contractorId: ''
      });
    } catch (err) {
      console.error(err);
      alert(t.saveError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] max-w-4xl mx-auto bg-brand-paper rounded-3xl overflow-hidden card-shadow border border-brand-ink/5">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b border-brand-ink/10 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg">{mode === 'chat' ? t.aiChat : t.addWork}</h2>
            <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {t.ready}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setMode(mode === 'chat' ? 'manual' : 'chat')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-brand-paper px-4 py-2 rounded-full hover:bg-brand-ink/5 transition-colors"
        >
          {mode === 'chat' ? <FormInput size={14} /> : <MessageSquare size={14} />}
          {mode === 'chat' ? t.manualOption : t.chatOption}
        </button>
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col">
        <AnimatePresence mode="wait">
          {mode === 'chat' ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col bg-[#E4E1D8]/30 min-h-0"
            >
              {/* Chat View */}
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-scroll p-4 space-y-4 scrollbar-thin scrollbar-thumb-brand-ink/20 scrollbar-track-transparent"
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[90%]",
                      msg.type === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm border",
                      msg.type === 'user' 
                        ? "bg-brand-primary text-white rounded-tr-none border-brand-primary" 
                        : "bg-white text-brand-ink rounded-tl-none border-brand-ink/5"
                    )}>
                      <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                      
                      {msg.data && (
                        <div className="mt-4 pt-4 border-t border-brand-ink/10 space-y-4 bg-brand-paper/50 p-3 rounded-xl">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-ink/40">{t.detailsFound}</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-widest">Date</label>
                              <input 
                                type="text"
                                className="bg-white/50 border-none p-2 rounded-lg text-xs"
                                value={msg.data.date || ""}
                                onChange={(e) => {
                                  const newData = { ...msg.data!, date: e.target.value };
                                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, data: newData } : m));
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-widest">Category</label>
                              <input 
                                type="text"
                                className="bg-white/50 border-none p-2 rounded-lg text-xs"
                                value={msg.data.category || ""}
                                onChange={(e) => {
                                  const newData = { ...msg.data!, category: e.target.value as any };
                                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, data: newData } : m));
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-widest">Work Type</label>
                              <input 
                                type="text"
                                className="bg-white/50 border-none p-2 rounded-lg text-xs"
                                value={msg.data.workType || ""}
                                onChange={(e) => {
                                  const newData = { ...msg.data!, workType: e.target.value };
                                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, data: newData } : m));
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-widest">Location</label>
                              <input 
                                type="text"
                                className="bg-white/50 border-none p-2 rounded-lg text-xs"
                                value={msg.data.location || ""}
                                onChange={(e) => {
                                  const newData = { ...msg.data!, location: e.target.value };
                                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, data: newData } : m));
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-widest">Hours</label>
                              <input 
                                type="number"
                                className="bg-white/50 border-none p-2 rounded-lg text-xs font-bold"
                                value={msg.data.hoursWorked || 0}
                                onChange={(e) => {
                                  const newData = { ...msg.data!, hoursWorked: Number(e.target.value) };
                                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, data: newData } : m));
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-widest">Payment</label>
                              <input 
                                type="number"
                                className="bg-white/50 border-none p-2 rounded-lg text-xs font-bold"
                                value={msg.data.paymentReceived || 0}
                                onChange={(e) => {
                                  const newData = { ...msg.data!, paymentReceived: Number(e.target.value) };
                                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, data: newData } : m));
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                              <label className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-widest">Pradhan ID / Contractor ID</label>
                              <input 
                                type="text"
                                placeholder="SS-PR-XXXX (Required)"
                                className={cn(
                                  "bg-white/80 border-none p-2 rounded-lg text-xs font-black uppercase tracking-widest",
                                  !msg.data.contractorId && "ring-2 ring-orange-500 animate-pulse"
                                )}
                                value={msg.data.contractorId || ""}
                                onChange={(e) => {
                                  const newData = { ...msg.data!, contractorId: e.target.value.toUpperCase() };
                                  setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, data: newData } : m));
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            {msg.text.includes("receipt") ? (
                              <button 
                                onClick={() => generatePDF(msg.data!)}
                                className="flex-1 bg-brand-ink text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-ink/90 transition-all shadow-md group"
                              >
                                <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> {t.downloadReceipt || "Download Work Receipt"}
                              </button>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    if (!msg.data?.contractorId) {
                                      alert("Please enter a valid Pradhan ID (SS-PR-XXXX)");
                                      return;
                                    }
                                    confirmWork(msg.data!);
                                  }}
                                  disabled={isLoading}
                                  className="flex-1 bg-green-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
                                >
                                  <Save size={16} /> {t.confirmSave}
                                </button>
                                <button 
                                  onClick={() => setMessages(prev => [...prev, { id: Date.now().toString(), type: 'ai', text: t.explainAgain || "No problem. Please explain your work again.", timestamp: Date.now() }])}
                                  className="bg-brand-paper border border-brand-ink/10 text-brand-ink py-3 px-4 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] opacity-30 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-brand-ink/40 italic ml-2">
                    <RefreshCw size={12} className="animate-spin" /> {t.processing}
                  </div>
                )}
                
                {/* Invisible bottom spacer for scrolling */}
                <div className="h-4" />
              </div>

              {/* Scroll Bottom Button */}
              <AnimatePresence>
                {showScrollButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-24 right-8 w-10 h-10 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-20 border-2 border-white"
                  >
                    <ArrowDown size={20} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-brand-ink/10 flex items-center gap-3 shrink-0">
                <button 
                  onClick={toggleRecording}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-brand-paper text-brand-ink/50 hover:bg-brand-ink/5"
                  )}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                    placeholder="Type or use mic..."
                    className="w-full bg-brand-paper px-6 py-3 rounded-full border-none focus:ring-2 focus:ring-brand-primary outline-none text-sm"
                  />
                  <button 
                    onClick={() => handleSend(inputText)}
                    disabled={!inputText.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center disabled:opacity-30 transition-all hover:scale-105"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {/* Manual Form View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <Calendar size={14} /> {t.date}
                  </label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-white p-3 rounded-xl border border-brand-ink/10 focus:ring-2 focus:ring-brand-primary outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <Briefcase size={14} /> {t.category}
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as WorkCategory})}
                    className="w-full bg-white p-3 rounded-xl border border-brand-ink/10 outline-none"
                  >
                    {Object.values(WorkCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                  <MapPin size={14} /> {t.location}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Phoenix Mall Site, Whitefield"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-white p-3 rounded-xl border border-brand-ink/10 outline-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                  <Briefcase size={14} /> {t.workType}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Concrete Mixing, Painting"
                  value={formData.workType}
                  onChange={(e) => setFormData({...formData, workType: e.target.value})}
                  className="w-full bg-white p-3 rounded-xl border border-brand-ink/10 outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <Clock size={14} /> {t.hoursWorked}
                  </label>
                  <input 
                    type="number" 
                    value={formData.hoursWorked}
                    onChange={(e) => setFormData({...formData, hoursWorked: Number(e.target.value)})}
                    className="w-full bg-white p-3 rounded-xl border border-brand-ink/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <IndianRupee size={14} /> {t.amountReceived}
                  </label>
                  <input 
                    type="number" 
                    value={formData.paymentReceived}
                    onChange={(e) => setFormData({...formData, paymentReceived: Number(e.target.value)})}
                    className="w-full bg-white p-3 rounded-xl border border-brand-ink/10 outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <User size={14} /> {t.contractorName}
                  </label>
                  <input 
                    type="text" 
                    placeholder="Who paid you?"
                    value={formData.contractorName}
                    onChange={(e) => setFormData({...formData, contractorName: e.target.value})}
                    className="w-full bg-white p-3 rounded-xl border border-brand-ink/10 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-brand-primary" /> {t.pradhanIdLabel || "Pradhan ID (Mandatory)"}
                  </label>
                  <input 
                    type="text" 
                    placeholder="SS-PR-XXXX to link work"
                    value={formData.contractorId}
                    onChange={(e) => setFormData({...formData, contractorId: e.target.value.toUpperCase()})}
                    className="w-full bg-white p-3 rounded-xl border border-brand-ink/10 outline-none" 
                  />
                </div>
              </div>

              <button 
                onClick={handleManualSave}
                disabled={isLoading}
                className="w-full bg-green-600 text-white p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-200 mt-auto"
              >
                <Save size={24} /> {isLoading ? "..." : t.saveWork}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
