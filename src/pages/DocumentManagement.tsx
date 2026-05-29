import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { PlusCircle, ArrowLeft, Search, Trash2, X, Download } from 'lucide-react';

interface Document {
  id: number;
  application_id: number;
  document_name: string;
  document_type: string;
  file_path: string;
  upload_date: string;
  description: string;
  ip_title?: string;
}

interface Application {
  id: number;
  ip_title: string;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    application_id: '',
    document_name: '',
    document_type: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const params: any = {};
      if (searchTerm) params.search = searchTerm;

      const { data } = await axios.get(`${API_BASE}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedFile) {
      alert('Please select a file to upload');
      setLoading(false);
      return;
    }

    const docFormData = new FormData();
    docFormData.append('application_id', formData.application_id);
    docFormData.append('document_name', formData.document_name);
    docFormData.append('document_type', formData.document_type);
    docFormData.append('description', formData.description);
    docFormData.append('document', selectedFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/documents`, docFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ application_id: '', document_name: '', document_type: '', description: '' });
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      alert('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments();
    } catch (err: any) {
      alert('Failed to delete document');
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/documents/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documents.find(d => d.id === id)?.document_name || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Failed to download document');
    }
  };

  const openAddModal = () => {
    setFormData({ application_id: '', document_name: '', document_type: '', description: '' });
    setSelectedFile(null);
    setShowModal(true);
  };

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Document Management</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
          >
            <PlusCircle className="w-4 h-4" /> Upload Document
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
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
                <th className="px-6 py-4 font-medium text-slate-300">Document ID</th>
                <th className="px-6 py-4 font-medium text-slate-300">Application ID</th>
                <th className="px-6 py-4 font-medium text-slate-300">Document Name</th>
                <th className="px-6 py-4 font-medium text-slate-300">Document Type</th>
                <th className="px-6 py-4 font-medium text-slate-300">Upload Date</th>
                <th className="px-6 py-4 font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No documents found
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono">#{doc.id}</td>
                    <td className="px-6 py-4 font-mono">#{doc.application_id}</td>
                    <td className="px-6 py-4 font-medium">{doc.document_name}</td>
                    <td className="px-6 py-4 text-slate-400">{doc.document_type || '-'}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(doc.id)}
                          className="p-1.5 text-green-400 hover:bg-green-500/10 rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
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
              <h2 className="text-xl font-bold mb-4">Upload Document</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Application ID *</label>
                  <select
                    required
                    value={formData.application_id}
                    onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input appearance-none"
                  >
                    <option className="bg-slate-800" value="">Select application</option>
                    {applications.map(app => (
                      <option key={app.id} className="bg-slate-800" value={app.id.toString()}>
                        #{app.id} - {app.ip_title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Document Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.document_name}
                    onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input"
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Document Type</label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input appearance-none"
                  >
                    <option className="bg-slate-800" value="">Select type</option>
                    <option className="bg-slate-800">PDF</option>
                    <option className="bg-slate-800">DOCX</option>
                    <option className="bg-slate-800">TXT</option>
                    <option className="bg-slate-800">Image</option>
                    <option className="bg-slate-800">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">File *</label>
                  <input
                    required
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input resize-none"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-medium transition"
                >
                  {loading ? 'Uploading...' : 'Upload Document'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}