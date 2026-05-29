import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { FolderLock, Trash2, Search, Filter, Edit } from 'lucide-react';

export default function MyIP() {
  const [ips, setIps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIPs();
  }, []);

  const fetchIPs = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE}/api/ip/my-assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIps(data);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const filteredIPs = ips.filter((ip: any) => {
    const matchesSearch = !searchTerm ||
      ip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ip.description && ip.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || ip.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this IP record?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/ip/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIps(ips.filter((ip: any) => ip.id !== id));
    } catch (err: any) {
      alert('Could not delete');
    }
  }

  return (
    <div className="p-8 md:p-12">
      <h1 className="text-3xl font-bold mb-8">Intellectual Property Management</h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl glass-input appearance-none min-w-[180px]"
          >
            <option value="">All Categories</option>
            <option value="Code">Code</option>
            <option value="Document">Document</option>
            <option value="Design">Design</option>
            <option value="Audio/Video">Audio/Video</option>
          </select>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 md:px-6 py-4 font-medium text-slate-300">Title & Description</th>
                <th className="px-4 md:px-6 py-4 font-medium text-slate-300">Owner</th>
                <th className="px-4 md:px-6 py-4 font-medium text-slate-300 hidden md:table-cell">Registrant</th>
                <th className="px-4 md:px-6 py-4 font-medium text-slate-300">Category</th>
                <th className="px-4 md:px-6 py-4 font-medium text-slate-300">Status</th>
                <th className="px-4 md:px-6 py-4 font-medium text-slate-300">Date</th>
                <th className="px-4 md:px-6 py-4 font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredIPs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 md:px-6 py-12 text-center">
                    <FolderLock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {ips.length === 0 ? 'Your vault is empty.' : 'No results match your search.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredIPs.map((ip: any) => (
                  <tr key={ip.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-200">{ip.title}</div>
                        <div className="text-sm text-slate-400 line-clamp-1 max-w-xs">
                          {ip.description || 'No description provided.'}
                        </div>
                        <div className="md:hidden text-xs text-slate-500 mt-1">
                          Reg: {ip.registrant_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-300">
                      <div>
                        <div className="font-medium">{ip.owner_name}</div>
                        <div className="text-sm text-slate-400">{ip.owner_email}</div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-300 hidden md:table-cell">
                      {ip.registrant_name && (
                        <div>
                          <div className="font-medium">{ip.registrant_name}</div>
                          <div className="text-sm text-slate-400">{ip.registrant_email}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs font-medium">
                        {ip.category}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ip.document_status === 'documented'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {ip.document_status === 'documented' ? 'Documented' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-400">
                      <div className="text-emerald-400 font-mono text-xs">
                        {new Date(ip.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {new Date(ip.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          to={`/ip/${ip.id}`}
                          className="px-3 py-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded text-sm font-medium transition text-center"
                        >
                          View
                        </Link>
                        <Link
                          to={`/ip/${ip.id}/edit`}
                          className="px-3 py-1 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded text-sm font-medium transition text-center flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(ip.id)}
                          className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded text-sm font-medium transition flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      );
}
