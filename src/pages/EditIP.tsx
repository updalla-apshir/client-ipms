import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditIP() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Code');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerDateOfBirth, setOwnerDateOfBirth] = useState('');
  const [ownerPlaceOfBirth, setOwnerPlaceOfBirth] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const { data: userData } = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userData);
      } catch (err) {
        navigate('/login');
      }
    };

    const fetchIP = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE}/api/ip/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTitle(data.title || '');
        setDescription(data.description || '');
        setCategory(data.category || 'Code');
        setOwnerName(data.owner_name || '');
        setOwnerEmail(data.owner_email || '');
        setOwnerPhone(data.owner_phone || '');
        setOwnerAddress(data.owner_address || '');
        setOwnerDateOfBirth(data.owner_date_of_birth ? data.owner_date_of_birth.split('T')[0] : '');
        setOwnerPlaceOfBirth(data.owner_place_of_birth || '');

        if (data.photo_path) {
          setCurrentPhotoUrl(`${API_BASE}/api/ip/${id}/download?view=true`);
        }
      } catch (err: any) {
        if (err.response?.status === 401) navigate('/login');
        else navigate('/my-ip');
      }
    };

    fetchUser();
    fetchIP();
  }, [id, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ownerName || !ownerEmail) {
      return setError('Title, owner name, and owner email are required');
    }

    setSaving(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('owner_name', ownerName);
    formData.append('owner_email', ownerEmail);
    formData.append('owner_phone', ownerPhone);
    formData.append('owner_address', ownerAddress);
    formData.append('owner_date_of_birth', ownerDateOfBirth);
    formData.append('owner_place_of_birth', ownerPlaceOfBirth);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`${API_BASE}/api/ip/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(`IP "${data.title}" successfully updated`);
      setTimeout(() => navigate('/my-ip'), 2000);
    } catch (err: any) {
      setError('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/my-ip" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to IP
        </Link>

        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
          <h1 className="text-3xl font-bold mb-2">Edit IPMS</h1>
          <p className="text-slate-400 mb-4">Update your IP registration details.</p>

          {user && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400 font-medium">Edit Details</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Edited by:</span>
                  <span className="text-slate-200">{user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Email:</span>
                  <span className="text-slate-200">{user.email}</span>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400 font-medium">✓ Update Successful!</p>
              <p className="text-slate-200 mt-1">{success}</p>
              <p className="text-xs text-slate-400 mt-1">Redirecting to your IP vault...</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Asset Title</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input" placeholder="e.g. Core System Logic v1" />
            </div>

            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-400 font-medium mb-3">Owner Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input required type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input" placeholder="Enter owner's full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input required type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input" placeholder="owner@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                  <input type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input" placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth</label>
                  <input type="date" value={ownerDateOfBirth} onChange={(e) => setOwnerDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Place of Birth</label>
                  <input type="text" value={ownerPlaceOfBirth} onChange={(e) => setOwnerPlaceOfBirth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input" placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
                  <textarea value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-xl glass-input resize-none" placeholder="Full address" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">The person who legally owns this intellectual property</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input appearance-none">
                  <option className="bg-slate-800">Code</option>
                  <option className="bg-slate-800">Document</option>
                  <option className="bg-slate-800">Design</option>
                  <option className="bg-slate-800">Audio/Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Update Owner Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20" />
                {currentPhotoUrl && (
                  <p className="text-xs text-slate-400 mt-1">Leave empty to keep current photo</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (Optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                className="w-full px-4 py-3 rounded-xl glass-input resize-none" placeholder="Provide context about this file..." />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button disabled={saving} type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex justify-center items-center gap-2">
              {saving ? <span className="animate-pulse">Updating...</span> : <><Save className="w-5 h-5"/> Update IP Record</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}