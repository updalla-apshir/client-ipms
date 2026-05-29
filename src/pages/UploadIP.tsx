import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, ArrowLeft } from 'lucide-react';

export default function UploadIP() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Code');
  const [validityYears, setValidityYears] = useState(10);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerDateOfBirth, setOwnerDateOfBirth] = useState('');
  const [ownerPlaceOfBirth, setOwnerPlaceOfBirth] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const { data } = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return setError('Please select a photo');
    if (!ownerName || !ownerEmail) return setError('Please provide owner information');
    if (!description.trim()) return setError('Please provide a description');

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('validity_years', validityYears.toString());
    formData.append('owner_name', ownerName);
    formData.append('owner_email', ownerEmail);
    formData.append('owner_phone', ownerPhone);
    formData.append('owner_address', ownerAddress);
    formData.append('owner_date_of_birth', ownerDateOfBirth);
    formData.append('owner_place_of_birth', ownerPlaceOfBirth);
    formData.append('photo', photo);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:5000/api/ip/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(`IP "${data.title}" created successfully. Redirecting to payment to finalize registration...`);
      setTimeout(() => navigate(`/payment/${data.id}`), 1200);
    } catch (err: any) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-2xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
              <h1 className="text-3xl font-bold mb-2">Secure New IP</h1>
              <p className="text-slate-400 mb-4">Upload a file to generate a legally-provable timestamp.</p>

              {user && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 font-medium">Registration Details</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Registered by:</span>
                      <span className="text-slate-200">{user.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Email:</span>
                      <span className="text-slate-200">{user.email}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">You are registering this intellectual property on behalf of the specified owner</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 font-medium">✓ Upload Successful!</p>
                  <p className="text-slate-200 mt-1">{success}</p>
                   <p className="text-xs text-slate-400 mt-1">Proceeding to secure payment interface...</p>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-6">
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
                     <textarea value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} rows={1}
                       className="w-full px-4 py-3 rounded-xl glass-input resize-none" placeholder="Full address" />
                   </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">The person who legally owns this intellectual property</p>
              </div>
              
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                   <label className="block text-sm font-medium text-slate-300 mb-1.5">Validity Period</label>
                   <select value={validityYears} onChange={(e) => setValidityYears(parseInt(e.target.value))}
                     className="w-full px-4 py-3 rounded-xl glass-input appearance-none">
                     <option value={1}>1 year</option>
                     <option value={5}>5 years</option>
                     <option value={10}>10 years</option>
                     <option value={40}>40 years</option>
                     <option value={50}>50 years</option>
                     <option value={60}>60 years</option>
                   </select>
                   <p className="text-xs text-slate-400 mt-1">Duration of IP legal protection</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1.5">Owner Photo</label>
                   <input required type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                     className="w-full px-4 py-2.5 rounded-xl glass-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20" />
                   <p className="text-xs text-slate-400 mt-1">Upload a clear photo of the owner (max 5MB)</p>
                 </div>
               </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                  className="w-full px-4 py-3 rounded-xl glass-input resize-none" />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button disabled={uploading} type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex justify-center items-center gap-2">
                 {uploading ? <span className="animate-pulse">Securing via Database...</span> : <><UploadCloud className="w-5 h-5"/> NEXT</>}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}
