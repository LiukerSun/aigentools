import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { message } from 'antd'; // Using message directly, not from Layout
import TitleBar from './components/TitleBar';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Admin from './pages/Admin';

interface User {
  username: string;
  role: string;
  id: number;
}

const AppShell: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setUser({ username: decodedToken.username, role: decodedToken.role, id: decodedToken.user_id });
        // If logged in and on login/register page, redirect to home
        if (location.pathname === '/login' || location.pathname === '/register') {
          navigate('/');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        message.error('Invalid token. Please login again.');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      }
    } else {
      setUser(null);
      // If not logged in and not on login/register, redirect to login
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* 修复：无论是否登录，都渲染 TitleBar */}
      <TitleBar username={user?.username} role={user?.role} />

      <div className="flex flex-1 overflow-hidden">
         {/* ... (路由部分保持不变) */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* MainLayout (and its nested routes) are protected by this AppShell's internal logic */}
          <Route path="/" element={user ? <MainLayout user={user} onLogout={handleLogout} /> : <Login />}> {/* Pass user to MainLayout */}
            <Route index element={<Home />} /> {/* Home page as index route */}
            <Route path="admin" element={user?.role === 'admin' ? <Admin /> : <Home />} /> {/* Protect admin route */}
          </Route>
        </Routes>
      </div>
    </div>  );
};

export default AppShell;