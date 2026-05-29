import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-10 rounded-3xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-slate-400 mb-8">Start protecting your intellectual property</p>

        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input 
              type="text" required
              value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input transition-all"
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input transition-all"
              placeholder="creator@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input 
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold transition-colors mt-4">
            Register
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
