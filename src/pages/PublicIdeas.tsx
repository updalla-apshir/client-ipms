import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Eye, Calendar, User, FileText } from 'lucide-react';

export default function PublicIdeas() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, [searchTerm, categoryFilter]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);

      const { data } = await axios.get(`http://localhost:5000/api/public/ideas?${params.toString()}`);
      setIdeas(data);
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIdeas = ideas.filter((idea: any) => {
    const matchesSearch = !searchTerm ||
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || idea.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/Main_Logo.png" alt="IPMS Logo" className="w-16 h-16 object-contain" />
              <a href="/">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 cursor-pointer hover:opacity-80 transition-opacity">
                  IPMS
                </h1>
              </a>
            </div>
            <div className="flex gap-4">
              <Link
                to="/"
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ideas by title, description, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none min-w-[180px]"
            >
              <option value="">All Categories</option>
              <option value="Code">Code</option>
              <option value="Document">Document</option>
              <option value="Design">Design</option>
              <option value="Audio/Video">Audio/Video</option>
            </select>
          </div>
        </div>

        {/* Ideas Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-slate-400">Loading ideas...</div>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No ideas found matching your criteria.</p>
            <p className="text-slate-500 mt-2">Try adjusting your search or filter settings.</p>
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 max-w-md mx-auto">
              <p className="text-sm text-slate-300 mb-2">💡 <strong>Pro tip:</strong></p>
              <p className="text-xs text-slate-400">
                Ideas marked as "Draft" show limited information. Log in to see full details and upload your own ideas!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea: any) => (
              <div key={idea.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                    {idea.category}
                  </span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    Documented
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 line-clamp-2">
                  {idea.title}
                </h3>

                <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                  {idea.description || 'No description provided.'}
                </p>

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-slate-300">{idea.owner_name}</span>
                  </div>

                  {idea.owner_place_of_birth && (
                    <div className="text-slate-500 text-xs mb-2">
                      📍 {idea.owner_place_of_birth}
                    </div>
                  )}

                  {idea.document_status === 'draft' && (
                    <div className="text-yellow-400 text-xs mb-2 italic">
                      Limited info shown for draft ideas
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{idea.document_status === 'documented' ? 'Full Access' : 'Limited'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-400">
            <p>© 2026 IPMS. Discover and explore intellectual property ideas.</p>
            <p className="mt-2 text-sm">Login to register your own ideas and access full features.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}