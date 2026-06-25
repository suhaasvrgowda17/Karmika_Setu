import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, BookOpen, ShieldCheck, CreditCard, Users, Briefcase } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

export default function HowItWorks({ role }: { role: 'worker' | 'organization' | 'contractor' }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const workerFAQs: FAQSection[] = [
    {
      title: "For Workers: Building Your Digital Identity",
      icon: <Users className="text-brand-primary" />,
      items: [
        {
          question: "What is Karmik Setu?",
          answer: "Karmik Setu is a digital platform designed to bridge the gap between unorganized labor and formal institutions. It helps you build a verified work history that can be used to access banking services, insurance, and better job opportunities."
        },
        {
          question: "How do I add a new work entry?",
          answer: "Go to the 'Work Entry' section in your dashboard. Enter the details of your job including location, category, and daily wage. You can even upload photo proof (optional) to strengthen your verification."
        },
        {
          question: "How does this help me get a loan?",
          answer: "Banks and financial institutions look for evidence of steady income. By regularly logging your work on Karmik Setu, you create a 'Digital Credit Score' based on your actual work consistency, which organizations can verify via your unique Setu ID."
        },
        {
          question: "How is the Trust Score calculated?",
          answer: "The Trust Score is a mathematical rating of your professional reliability. It starts at 750 and increases with every 'Verified' job entry (+15 points). However, if an entry is 'Rejected' by a contractor due to misinformation or absence, the score decreases significantly (-150 points). Authenticating your identity with Aadhaar gives you an immediate +100 point boost."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: <ShieldCheck className="text-brand-primary" />,
      items: [
        {
          question: "Is my Aadhaar data safe?",
          answer: "Yes. Your Aadhaar is only used for one-time verification. Karmik Setu follows strict Indian data privacy norms and never shares your personal details without your explicit consent."
        },
        {
          question: "Who can see my profile?",
          answer: "Only authorized organizations can see your profile if you share your Setu ID with them. You have full control over who accesses your data."
        }
      ]
    }
  ];

  const contractorFAQs: FAQSection[] = [
    {
      title: "For Contractors: Managing Your Crew",
      icon: <Briefcase className="text-orange-500" />,
      items: [
        {
          question: "How do I verify worker sessions?",
          answer: "Workers will request verification for their daily sessions. You can see these in your 'Verification Queue'. Approving them instantly updates their digital credit history, helping them build financial trust."
        },
        {
          question: "How do I post new work?",
          answer: "Click the 'Post Work' button on your dashboard. Enter the job type, daily wage, and location. Verified workers can then find and apply for these opportunities through their portal."
        }
      ]
    }
  ];

  const orgFAQs: FAQSection[] = [
    {
      title: "For Organizations: Verified Labor Insights",
      icon: <Briefcase className="text-brand-ink" />,
      items: [
        {
          question: "How do I verify a worker?",
          answer: "Enter the worker's unique Setu ID (e.g., SS-XXXX) in the 'Worker Search' or 'Quick Verification' box. You will instantly see their verified work history, skill distribution, and credit readiness score."
        },
        {
          question: "What data points are available for analysis?",
          answer: "You can view total days worked, average daily wage, sector-specific experience, and a consistency index. This helps in underwriting micro-loans or assessing reliability for projects."
        }
      ]
    },
    {
      title: "Financial Inclusion",
      icon: <CreditCard className="text-brand-ink" />,
      items: [
        {
          question: "How is the Credit Readiness score calculated?",
          answer: "It is an algorithmic score based on work frequency, income stability, and category diversity. It is designed to reflect the fiscal reliability of unorganized sector workers."
        }
      ]
    }
  ];

  const sections = role === 'worker' ? workerFAQs : (role === 'contractor' ? contractorFAQs : orgFAQs);

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="font-display text-4xl font-black mb-2 text-brand-ink uppercase tracking-tight flex items-center gap-3">
          <BookOpen className="text-brand-primary" size={32} />
          Guide & Support
        </h1>
        <p className="text-brand-muted">Everything you need to know about navigating the Karmik Setu ecosystem.</p>
      </header>

      <div className="grid gap-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-brand-ink/5">
              {section.icon}
              <h2 className="font-bold text-lg text-brand-ink">{section.title}</h2>
            </div>
            
            <div className="space-y-3">
              {section.items.map((item, iIdx) => {
                const id = `${sIdx}-${iIdx}`;
                const isOpen = openIndex === id;

                return (
                  <div 
                    key={id}
                    className="bg-white rounded-2xl border border-brand-ink/5 overflow-hidden transition-all hover:border-brand-primary/20"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : id)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <span className="font-bold text-brand-ink pr-8">{item.question}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className="text-brand-muted shrink-0"
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-5 pb-5"
                        >
                          <div className="pt-2 text-sm text-brand-muted leading-relaxed border-t border-brand-ink/5">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-brand-ink text-white p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-black uppercase mb-2">Need more help?</h3>
          <p className="text-white/60 mb-6 text-sm max-w-md">Our support team is available 24/7 to assist you with any technical or account-related queries.</p>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:support@karmiksetu.in" className="bg-white text-brand-ink px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-paper transition-all">
              Email Support
            </a>
            <button className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
              Live Chat
            </button>
          </div>
        </div>
        <HelpCircle className="absolute -bottom-10 -right-10 text-white/5" size={200} />
      </div>
    </div>
  );
}
