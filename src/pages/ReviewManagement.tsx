import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, ArrowLeft, Search, Edit, Trash2, X } from 'lucide-react';

interface Review {
  id: number;
  application_id: number;
  reviewer_name: string;
  review_date: string;
  decision: string;
  comments: string;
  ip_title?: string;
  applicant_name?: string;
}

interface Application {
  id: number;
  ip_title: string;
  applicant_name: string;
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    application_id: '',
    reviewer_name: '',
    decision: '',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [searchTerm]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const params: any = {};
      if (searchTerm) params.search = searchTerm;

      const { data } = await axios.get('http://localhost:5000/api/reviews', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/applications', {
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

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        application_id: parseInt(formData.application_id)
      };

      if (editingReview) {
        await axios.put(`http://localhost:5000/api/reviews/${editingReview.id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/reviews', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingReview(null);
      setFormData({ application_id: '', reviewer_name: '', decision: '', comments: '' });
      fetchReviews();
    } catch (err: any) {
      alert(editingReview ? 'Failed to update review' : 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err: any) {
      alert('Failed to delete review');
    }
  };

  const handleApprove = async (appId: number) => {
    if (!confirm('Are you sure you want to approve this application?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/applications/${appId}/approve`, {
        reviewer_name: 'Admin',
        comments: 'Application approved via review system'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err: any) {
      alert('Failed to approve application');
    }
  };

  const handleReject = async (appId: number) => {
    if (!confirm('Are you sure you want to reject this application?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/applications/${appId}/reject`, {
        reviewer_name: 'Admin',
        comments: 'Application rejected via review system'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err: any) {
      alert('Failed to reject application');
    }
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setFormData({
      application_id: review.application_id.toString(),
      reviewer_name: review.reviewer_name,
      decision: review.decision,
      comments: review.comments || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingReview(null);
    setFormData({ application_id: '', reviewer_name: '', decision: '', comments: '' });
    setShowModal(true);
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Approved': return 'bg-green-500/10 text-green-400';
      case 'Rejected': return 'bg-red-500/10 text-red-400';
      case 'Need Revision': return 'bg-yellow-500/10 text-yellow-400';
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
          <h1 className="text-3xl font-bold">Review Management</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
          >
            <PlusCircle className="w-4 h-4" /> Save Review
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
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
                <th className="px-6 py-4 font-medium text-slate-300">Review ID</th>
                <th className="px-6 py-4 font-medium text-slate-300">Application ID</th>
                <th className="px-6 py-4 font-medium text-slate-300">Reviewer Name</th>
                <th className="px-6 py-4 font-medium text-slate-300">Review Date</th>
                <th className="px-6 py-4 font-medium text-slate-300">Decision</th>
                <th className="px-6 py-4 font-medium text-slate-300">Comments</th>
                <th className="px-6 py-4 font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono">#{review.id}</td>
                    <td className="px-6 py-4 font-mono">#{review.application_id}</td>
                    <td className="px-6 py-4 font-medium">{review.reviewer_name}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(review.review_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${getDecisionColor(review.decision)}`}>
                        {review.decision}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {review.comments || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(review)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
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
                {editingReview ? 'Update Review' : 'Save Review'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Application ID *</label>
                  <select
                    required
                    value={formData.application_id}
                    onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input appearance-none"
                    disabled={!!editingReview}
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Reviewer Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.reviewer_name}
                    onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input"
                    placeholder="Enter reviewer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Decision *</label>
                  <select
                    required
                    value={formData.decision}
                    onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input appearance-none"
                  >
                    <option className="bg-slate-800" value="">Select decision</option>
                    <option className="bg-slate-800">Approved</option>
                    <option className="bg-slate-800">Rejected</option>
                    <option className="bg-slate-800">Need Revision</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Comments</label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input resize-none"
                    rows={3}
                    placeholder="Enter comments"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-medium transition"
                >
                  {loading ? 'Saving...' : editingReview ? 'Update Review' : 'Save Review'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}