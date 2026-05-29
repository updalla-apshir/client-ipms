import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setName(data.name);
        setEmail(data.email);
        setRole(data.role);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/auth/profile`, 
        { name, email, password: password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 md:p-12">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="max-w-xl glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />

        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-slate-400">Account Type</p>
          <p className="text-lg font-medium capitalize">{role}</p>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" /> Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>
            <input 
              required type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input 
              required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4" /> New Password (Optional)
            </label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full px-4 py-3 rounded-xl glass-input" 
            />
          </div>

          <button 
            disabled={saving} type="submit" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold transition-colors mt-4"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
