import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { PlusCircle, ArrowLeft, Search, Edit, Trash2, X } from 'lucide-react';

interface Application {
  id: number;
  applicant_name: string;
  ip_title: string;
  property_type: string;
  submission_date: string;
  status: string;
  remarks: string;
  category_id: number;
  category_name?: string;
}

interface Category {
  id: number;
  category_name: string;
  status: string;
}

export default function ApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [formData, setFormData] = useState({
    applicant_name: '',
    ip_title: '',
    property_type: '',
    remarks: '',
    category_id: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [searchTerm]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const params: any = {};
      if (searchTerm) params.search = searchTerm;

      const { data } = await axios.get(`${API_BASE}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(data.filter((c: Category) => c.status === 'Active'));
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        category_id: formData.category_id || null
      };

      if (editingApplication) {
        await axios.put(`${API_BASE}/api/applications/${editingApplication.id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE}/api/applications`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingApplication(null);
      setFormData({ applicant_name: '', ip_title: '', property_type: '', remarks: '', category_id: '' });
      fetchApplications();
    } catch (err: any) {
      alert(editingApplication ? 'Failed to update application' : 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchApplications();
    } catch (err: any) {
      alert('Failed to delete application');
    }
  };

  const openEditModal = (application: Application) => {
    setEditingApplication(application);
    setFormData({
      applicant_name: application.applicant_name,
      ip_title: application.ip_title,
      property_type: application.property_type,
      remarks: application.remarks || '',
      category_id: application.category_id?.toString() || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingApplication(null);
    setFormData({ applicant_name: '', ip_title: '', property_type: '', remarks: '', category_id: '' });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-500/10 text-green-400';
      case 'Rejected': return 'bg-red-500/10 text-red-400';
      case 'Under Review': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Application Management</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
          >
            <PlusCircle className="w-4 h-4" /> Submit Application
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input"
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-300">Application ID</th>
                <th className="px-6 py-4 font-medium text-slate-300">Applicant Name</th>
                <th className="px-6 py-4 font-medium text-slate-300">Property Title</th>
                <th className="px-6 py-4 font-medium text-slate-300">Property Type</th>
                <th className="px-6 py-4 font-medium text-slate-300">Submission Date</th>
                <th className="px-6 py-4 font-medium text-slate-300">Status</th>
                <th className="px-6 py-4 font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono">#{app.id}</td>
                    <td className="px-6 py-4 font-medium">{app.applicant_name}</td>
                    <td className="px-6 py-4 text-slate-400">{app.ip_title}</td>
                    <td className="px-6 py-4 text-slate-400">{app.property_type}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(app.submission_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">
                {editingApplication ? 'Update Application' : 'Submit New Application'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Applicant Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.applicant_name}
                    onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input"
                    placeholder="Enter applicant name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Intellectual Property Title *</label>
                  <input
                    required
                    type="text"
                    value={formData.ip_title}
                    onChange={(e) => setFormData({ ...formData, ip_title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input"
                    placeholder="Enter IP title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Property Type *</label>
                  <select
                    required
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input appearance-none"
                  >
                    <option className="bg-slate-800" value="">Select type</option>
                    <option className="bg-slate-800">Patent</option>
                    <option className="bg-slate-800">Trademark</option>
                    <option className="bg-slate-800">Copyright</option>
                    <option className="bg-slate-800">Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input appearance-none"
                  >
                    <option className="bg-slate-800" value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} className="bg-slate-800" value={cat.id.toString()}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input resize-none"
                    rows={3}
                    placeholder="Enter remarks"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-medium transition"
                >
                  {loading ? 'Saving...' : editingApplication ? 'Update Application' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}