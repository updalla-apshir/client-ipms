import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Incorrect username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-10 rounded-3xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
        <p className="text-slate-400 mb-8">Login to access your secured IP vault</p>

        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
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
          <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors mt-4">
            Sign In
          </button>
        </form>

        {/* <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one</Link>
        </p> */}
      </div>
    </div>
  );
}
