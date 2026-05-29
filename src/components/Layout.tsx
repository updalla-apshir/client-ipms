import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, FolderLock, User as UserIcon, LogOut, Users, List, FileText, FilePlus } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { data } = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(data);
        }
      } catch (err) {
        // Ignore
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Ip', path: '/my-ip', icon: FolderLock },
    { name: 'Create New ip', path: '/upload', icon: UploadCloud },
    { name: 'Category', path: '/categories', icon: List },
    { name: 'Application', path: '/applications', icon: FileText },
    { name: 'Documents', path: '/documents', icon: FilePlus },
    { name: 'Review', path: '/reviews', icon: Users },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    ...(user?.role === 'admin' ? [{ name: 'Users', path: '/users', icon: Users }] : []),
  ];

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <div className="w-64 glass-panel border-r border-white/10 hidden md:flex flex-col p-6 sticky top-0 h-screen overflow-y-auto">
<a href="/">
              <img src="/Main_Logo.png" alt="IPMS Logo" className="w-56 mb-10 object-contain" />
            </a>
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (location.pathname.startsWith('/ip/') && link.path === '/my-ip');
            return (
              <Link
                key={link.name}
                to={link.path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" /> {link.name}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
