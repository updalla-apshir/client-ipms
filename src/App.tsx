import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import UploadIP from './pages/UploadIP.tsx';
import MyIP from './pages/MyIP.tsx';
import Profile from './pages/Profile.tsx';
import IPDetails from './pages/IPDetails.tsx';
import EditIP from './pages/EditIP.tsx';
import Users from './pages/Users.tsx';
import PublicIdeas from './pages/PublicIdeas.tsx';
import Payment from './pages/Payment.tsx';
import Layout from './components/Layout.tsx';
import CategoryManagement from './pages/CategoryManagement.tsx';
import ApplicationManagement from './pages/ApplicationManagement.tsx';
import DocumentManagement from './pages/DocumentManagement.tsx';
import ReviewManagement from './pages/ReviewManagement.tsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500/30">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ideas" element={<PublicIdeas />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadIP />} />
            <Route path="/my-ip" element={<MyIP />} />
            <Route path="/users" element={<Users />} />
            <Route path="/ip/:id" element={<IPDetails />} />
            <Route path="/ip/:id/edit" element={<EditIP />} />
            <Route path="/payment/:ipId" element={<Payment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/applications" element={<ApplicationManagement />} />
            <Route path="/documents" element={<DocumentManagement />} />
            <Route path="/reviews" element={<ReviewManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
