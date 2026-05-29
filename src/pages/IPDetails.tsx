import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Download, ShieldCheck, User, X, Edit } from 'lucide-react';

export default function IPDetails() {
  const { id } = useParams();
  const [ip, setIp] = useState<any>(null);
  const [installing, setInstalling] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const navigate = useNavigate();

  // Cleanup photo URL when component unmounts
  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:5000/api/ip/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIp(data);
      } catch (err) {
        navigate('/my-ip');
      }
    };
    fetchAuth();
  }, [id, navigate]);

  const handleInstallAsDocument = async () => {
    if (!confirm('Are you sure you want to install this IP as a document? This action cannot be undone.')) return;
    setInstalling(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/ip/${id}/install-document`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the IP data
      const { data } = await axios.get(`http://localhost:5000/api/ip/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIp(data);
    } catch (err: any) {
      alert('Failed to install as document');
    } finally {
      setInstalling(false);
    }
  };

  const handleDownloadDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/ip/${id}/download-document`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IP_Document_${ip.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to download document');
    }
  };

  const loadPhoto = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/ip/${id}/download?view=true`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      setPhotoUrl(url);
    } catch (err) {
      console.error('Failed to load photo:', err);
    }
  };

  if (!ip) return <div className="p-12 text-slate-400">Loading asset...</div>;

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/my-ip" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to IP
        </Link>

        <div className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32 text-emerald-400" />
          </div>

          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium mb-4 inline-block">
              {ip.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{ip.title}</h1>

            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm mb-10 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="block text-emerald-300 font-sans text-xs uppercase tracking-wider mb-1">Official Proof of Ownership Timestamp</strong>
                {new Date(ip.created_at).toISOString()} UTC
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div>
                <h3 className="text-sm text-slate-400 font-medium mb-2 uppercase tracking-wide">Description</h3>
                <p className="text-slate-200 leading-relaxed text-lg whitespace-pre-wrap">
                  {ip.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm text-slate-400 font-medium mb-2 uppercase tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4" /> Owner Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-slate-200 font-medium">{ip.owner_name}</p>
                    <p className="text-slate-400 text-sm">{ip.owner_email}</p>
                    {ip.owner_phone && <p className="text-slate-400 text-sm">📞 {ip.owner_phone}</p>}
                    {ip.owner_date_of_birth && <p className="text-slate-400 text-sm">🎂 {new Date(ip.owner_date_of_birth).toLocaleDateString()}</p>}
                    {ip.owner_place_of_birth && <p className="text-slate-400 text-sm">📍 Born in {ip.owner_place_of_birth}</p>}
                    {ip.owner_address && <p className="text-slate-400 text-sm whitespace-pre-wrap">🏠 {ip.owner_address}</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-slate-400 font-medium mb-2 uppercase tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4" /> Registrant
                  </h3>
                  <div className="space-y-1">
                    <p className="text-slate-200 font-medium">{ip.registrant_name}</p>
                    <p className="text-slate-400 text-sm">{ip.registrant_email}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm text-slate-400 font-medium mb-2 uppercase tracking-wide">Document Status</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ip.document_status === 'documented'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                      {ip.document_status === 'documented' ? 'Documented' : 'Draft'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm text-slate-400 font-medium mb-2 uppercase tracking-wide">Identifier</h3>
                    <code className="text-slate-300 bg-black/30 px-3 py-1.5 rounded-lg text-sm break-all">{ip.id}</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-sm text-slate-400 font-medium mb-4 uppercase tracking-wide">Owner Photo</h3>
              <div className="flex gap-4 mb-4">
                <Link
                  to={`/ip/${ip.id}/edit`}
                  className="inline-flex items-center gap-3 px-6 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-medium transition-colors"
                >
                  <Edit className="w-5 h-5" /> Edit IP
                </Link>
                <button
                  onClick={() => {
                    setShowPhotoModal(true);
                    if (!photoUrl) {
                      loadPhoto();
                    }
                  }}
                  className="inline-flex items-center gap-3 px-6 py-4 bg-slate-600 hover:bg-slate-500 rounded-xl font-medium transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" /> View Photo
                </button>
                {ip.document_status === 'documented' ? (
                  <button
                    onClick={handleDownloadDocument}
                    className="inline-flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-5 h-5" /> Download PDF Document
                  </button>
                ) : (
                  <button
                    onClick={handleInstallAsDocument}
                    disabled={installing}
                    className="inline-flex items-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    {installing ? 'Installing...' : 'Install as Document'}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Photo: {ip.photo_path.split('/').pop()} • Uploaded: {new Date(ip.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Photo Modal */}
            {showPhotoModal && (
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => {
                  setShowPhotoModal(false);
                  if (photoUrl) {
                    URL.revokeObjectURL(photoUrl);
                    setPhotoUrl('');
                  }
                }}
              >
                <div
                  className="glass-panel p-6 rounded-2xl max-w-4xl max-h-[90vh] relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setShowPhotoModal(false);
                      if (photoUrl) {
                        URL.revokeObjectURL(photoUrl);
                        setPhotoUrl('');
                      }
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-medium mb-4">Owner Photo</h3>
                    <div className="max-w-full max-h-[70vh] overflow-hidden rounded-lg">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Owner Photo"
                          className="max-w-full max-h-full object-contain"
                          style={{ maxWidth: '100%', maxHeight: '70vh' }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                          Loading photo...
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <a
                        href={`http://localhost:5000/api/ip/${ip.id}/download`}
                        download
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => {
                          setShowPhotoModal(false);
                          if (photoUrl) {
                            URL.revokeObjectURL(photoUrl);
                            setPhotoUrl('');
                          }
                        }}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
