import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RedirectIfAuthenticated from './auth/RedirectIfAuthenticated';
import Login from './pages/login';
import Register from './pages/register';
import ChecklistDetail from "./pages/checklistdetail";

import { AuthProvider, useAuth } from './auth/AuthContext';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
<Route
  path="/login"
  element={
    <RedirectIfAuthenticated>
      <Login />
    </RedirectIfAuthenticated>
  }
/>
<Route
  path="/register"
  element={
    <RedirectIfAuthenticated>
      <Register />
    </RedirectIfAuthenticated>
  }
/>

          <Route path="/checklist/:id" element={<ChecklistDetail />} />


          <Route path="/checklist/:id" element={<ChecklistDetail />} />



          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
