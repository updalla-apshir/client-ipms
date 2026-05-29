import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, ArrowLeft, Search, Edit, Trash2, X } from 'lucide-react';

interface Category {
  id: number;
  category_name: string;
  description: string;
  status: string;
  created_date: string;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const params: any = {};
      if (searchTerm) params.search = searchTerm;

      const { data } = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (editingCategory) {
        await axios.put(`http://localhost:5000/api/categories/${editingCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ category_name: '', description: '', status: 'Active' });
      fetchCategories();
    } catch (err: any) {
      alert(editingCategory ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err: any) {
      alert('Failed to delete category');
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      description: category.description || '',
      status: category.status
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ category_name: '', description: '', status: 'Active' });
    setShowModal(true);
  };

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Category Management</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition"
          >
            <PlusCircle className="w-4 h-4" /> Add Category
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
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
                <th className="px-6 py-4 font-medium text-slate-300">Category ID</th>
                <th className="px-6 py-4 font-medium text-slate-300">Category Name</th>
                <th className="px-6 py-4 font-medium text-slate-300">Description</th>
                <th className="px-6 py-4 font-medium text-slate-300">Status</th>
                <th className="px-6 py-4 font-medium text-slate-300">Created Date</th>
                <th className="px-6 py-4 font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono">#{category.id}</td>
                    <td className="px-6 py-4 font-medium">{category.category_name}</td>
                    <td className="px-6 py-4 text-slate-400">{category.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${
                        category.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(category.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
            <div className="glass-panel rounded-2xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input"
                    placeholder="Enter category name"
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
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-input appearance-none"
                  >
                    <option className="bg-slate-800">Active</option>
                    <option className="bg-slate-800">Inactive</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-medium transition"
                >
                  {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}