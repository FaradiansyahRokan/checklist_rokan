import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [checklists, setChecklists] = useState([]);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); 

  const { token, logout } = useAuth();
  const navigate = useNavigate();



  const fetchChecklists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/checklist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChecklists(res.data.data);
    } catch (err) {
      console.error("Failed to fetch checklists:", err);
      setError('Failed to load checklists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const addChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklistName.trim()) {
      alert('Checklist name cannot be empty.'); 
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/checklist`,
        { name: newChecklistName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewChecklistName(''); 
      fetchChecklists();
    } catch (err) {
      console.error("Failed to add checklist:", err);
      setError('Failed to add checklist. Please try again.');
    }
  };

  const deleteChecklist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this checklist? This cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/checklist/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChecklists(checklists.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete checklist:", err);
      setError('Failed to delete checklist. Please try again.');
    }
  };



  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);



  const handleLogout = () => {
    logout();
    navigate('/login');
  };

 
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200"> 
          <h1 className="text-4xl font-extrabold text-gray-900">Todo Simple Dimple</h1> 
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-100 text-red-700 rounded-full shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 transition duration-200 ease-in-out font-medium"
          >
            Logout
          </button>
        </div>

  
        <form onSubmit={addChecklist} className="mb-10 flex gap-4 p-4 bg-white rounded-xl shadow-md">
          <input
            type="text"
            placeholder="Enter new checklist name..."
            value={newChecklistName}
            onChange={(e) => setNewChecklistName(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-base"
            aria-label="New checklist name" 
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-7 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out text-lg font-semibold"
          >
            Add Checklist
          </button>
        </form>

     
        {isLoading && (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xl font-medium text-gray-700">Loading your checklists...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {!isLoading && checklists.length === 0 && !error && (
          <div className="text-center text-gray-500 text-xl py-12 bg-white rounded-xl shadow-md">
            <p className="mb-2">It looks like you don't have any checklists yet.</p>
            <p>Add your first one using the form above!</p>
          </div>
        )}

  
        {!isLoading && checklists.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {checklists.map((item) => (
              <div key={item.id} className="relative group"> 
                <Link
                  to={`/checklist/${item.id}`} 
                  className="block bg-white p-5 pr-14 rounded-xl shadow-md border border-gray-200 transition transform hover:scale-[1.02] duration-200 ease-in-out" 
                >
                  <span className="text-lg font-medium text-gray-800 break-words pr-2">{item.name}</span>
                </Link>
                <button
                  onClick={() => deleteChecklist(item.id)}
                  className="absolute top-3 right-3 text-sm text-red-600 hover:text-red-800 font-medium bg-red-50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition duration-200 ease-in-out border border-red-200 hover:bg-red-100" // Styled delete button
                  aria-label={`Delete checklist ${item.name}`}
                  title="Delete Checklist" 
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}