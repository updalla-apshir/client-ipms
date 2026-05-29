import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, UploadCloud, FolderOpen, Users } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, recent: [], users: 0, revenue: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const { data } = await axios.get('http://localhost:5000/api/ip/stats', { headers: { Authorization: `Bearer ${token}` } });
        setStats(data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const metrics = [
    { title: 'Total Assets', value: stats.total.toLocaleString(), icon: FolderOpen, color: 'text-blue-400' },
    { title: 'Users', value: (stats.users || 0).toLocaleString(), icon: Users, color: 'text-violet-400' },
  ];

  return (
    <div className="p-8 md:p-12">
      <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Dashboard</h1>
            <Link to="/upload" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition">
             <PlusCircle className="w-4 h-4" /> CREATE NEW IP
           </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 tracking-wide">{metric.title}</p>
                    <p className="text-4xl font-semibold mt-3 text-white tracking-tighter">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/5 ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="text-xl font-semibold mb-6">Recent Uploads</h2>
        {stats.recent.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center border-dashed">
            <UploadCloud className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No intellectual property uploaded yet.</p>
            <Link to="/upload" className="mt-4 inline-block text-blue-400 hover:underline">Upload your first asset</Link>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-300">Title</th>
                  <th className="px-6 py-4 font-medium text-slate-300">Owner</th>
                  <th className="px-6 py-4 font-medium text-slate-300">Registrant</th>
                  <th className="px-6 py-4 font-medium text-slate-300">Category</th>
                   <th className="px-6 py-4 font-medium text-slate-300">TimeStamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recent.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.title}</td>
                    <td className="px-6 py-4 text-slate-400">{item.owner_name}</td>
                    <td className="px-6 py-4 text-slate-400">{item.registrant_name}</td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
}
