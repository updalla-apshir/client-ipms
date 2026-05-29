import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { Plus, Shield, Search, Filter } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const makeAdmin = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/auth/users/${id}/make-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map((u: any) => u.id === id ? { ...u, role: 'admin' } : u));
    } catch (err: any) {
      setError('Failed to make user admin');
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const [usersRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/api/auth/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUsers(usersRes.data);
        if (userRes.data.role !== 'admin') navigate('/dashboard');
      } catch (err: any) {
        if (err.response?.status === 403) navigate('/dashboard');
        else navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/auth/create-user`, createForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setCreateForm({ name: '', email: '', password: '', role: 'user' });
      // Refetch users
      const { data } = await axios.get(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (err: any) {
      setError('Failed to create user');
    }
  };

  return (
    <div className="p-8 md:p-12">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Create User
        </button>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl glass-input appearance-none min-w-[150px]"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="glass-panel p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl glass-input"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                required
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl glass-input"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                required
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl glass-input"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl glass-input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-300">Name</th>
              <th className="px-6 py-4 font-medium text-slate-300">Email</th>
              <th className="px-6 py-4 font-medium text-slate-300">Role</th>
              <th className="px-6 py-4 font-medium text-slate-300">Created</th>
              <th className="px-6 py-4 font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user: any) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-slate-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{new Date(user.created_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => makeAdmin(user.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium transition"
                    >
                      <Shield className="w-3 h-3" /> Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400">No users match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}