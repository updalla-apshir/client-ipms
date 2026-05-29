import { Link } from 'react-router-dom';
import { Lock, Clock, Eye, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-24 px-6 md:px-12 lg:px-24 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center p-8 bg-blue-500/10 rounded-full mb-8 ring-2 ring-blue-500/30">
          <img src="/Main_Logo.png" alt="IPMS Logo" className="w-32 h-32 object-contain" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
          Intellectual Property Management System
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          The ultimate platform for creators to securely store, and indisputably prove ownership of their ideas, code, and content.
        </p>
        <div className="flex items-center justify-center gap-4 pt-8">
          <Link to="/ideas" className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-full font-medium transition-all border border-slate-500">
            <Eye className="w-4 h-4 inline mr-2" />
            Browse Ideas
          </Link>
          <Link to="/login" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
            Login
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32 pb-24">
        {[
          { icon: Lock, title: 'Secure Vault', desc: 'Enterprise-grade encryption for all your uploaded files and ideas.' },
          { icon: Clock, title: 'Immutable Timestamps', desc: 'Indisputable proof of the exact moment you secured your property.' },
          { icon: ShieldCheck, title: 'Absolute Control', desc: 'You own the keys. Manage, view, and organize your IPs anytime.' }
        ].map((feat, i) => (
          <div key={i} className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400 mb-6">
              <feat.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{feat.title}</h3>
            <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
