import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ChecklistDetail() {
  const [checklistName, setChecklistName] = useState('');
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedName, setEditedName] = useState('');

  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchChecklistDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const checklistRes = await axios.get(`${API_BASE_URL}/checklist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const checklist = checklistRes.data.data.find((c) => c.id.toString() === id);
      if (!checklist) throw new Error("Checklist not found");
      setChecklistName(checklist.name);

      const itemRes = await axios.get(`${API_BASE_URL}/checklist/${id}/item`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(itemRes.data.data);
    } catch (err) {
      console.error("Failed to fetch checklist details:", err);
      if (err.message === "Checklist not found") {
        setError('Checklist not found. Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      } else if (err.response?.status === 401) {
        setError('Unauthorized. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to load checklist. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    fetchChecklistDetails();
  }, [fetchChecklistDetails]);

  const addChecklistItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return alert('Item name is required');

    try {
      await axios.post(`${API_BASE_URL}/checklist/${id}/item`, {
        itemName: newItemName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewItemName('');
      fetchChecklistDetails();
    } catch (err) {
      console.error("Add item error:", err);
      setError('Could not add item.');
    }
  };

  const deleteChecklistItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/checklist/${id}/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems((prev) => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Delete item error:", err);
      setError('Could not delete item.');
    }
  };

  const toggleItemStatus = async (itemId) => {
    try {
      await axios.put(`${API_BASE_URL}/checklist/${id}/item/${itemId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchChecklistDetails(); 
    } catch (err) {
      console.error("Toggle status error:", err);
      setError('Could not toggle status.');
    }
  };

  const startEditing = (itemId, currentName) => {
    setEditingItemId(itemId);
    setEditedName(currentName);
  };

  const saveEditedItem = async () => {
    if (!editedName.trim()) {
      setError('Item name cannot be empty!');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/checklist/${id}/item/rename/${editingItemId}`, {
        itemName: editedName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditingItemId(null);
      setEditedName('');
      fetchChecklistDetails();
    } catch (err) {
      console.error("Edit item error:", err);
      setError('Could not edit item.');
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium text-gray-700">Loading checklist details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
        <svg className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Checklist: <span className="text-blue-600 drop-shadow-sm">{checklistName}</span>
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 ease-in-out font-medium"
          >
            &larr; Back to Checklists
          </button>
        </div>

     
        <form onSubmit={addChecklistItem} className="flex gap-4 mb-10 p-4 bg-white rounded-xl shadow-md">
          <input
            type="text"
            placeholder="Add a new item to this checklist..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-base"
            aria-label="New checklist item name"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-7 py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out text-lg font-semibold"
          >
            Add Item
          </button>
        </form>

        {items.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-12 bg-white rounded-xl shadow-md">
            <p className="mb-2">No items in this checklist yet.</p>
            <p>Start by adding your first item above!</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <li
                key={item.id}
                className="relative flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition duration-200 transform hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={item.itemCompletionStatus}
                    onChange={() => toggleItemStatus(item.id)}
                    className="form-checkbox h-6 w-6 text-blue-600 rounded focus:ring-blue-500 cursor-pointer transition duration-150 ease-in-out"
                    aria-label={`Toggle status for ${item.itemName || item.name}`}
                  />
                  {editingItemId === item.id ? (
                    <div className="flex items-center flex-1 gap-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveEditedItem();
                          } else if (e.key === 'Escape') {
                            setEditingItemId(null);
                            setEditedName('');
                          }
                        }}
                        className="flex-1 text-lg font-medium border-b-2 border-blue-500 outline-none p-1 -ml-1"
                        autoFocus
                        aria-label={`Edit item: ${item.itemName || item.name}`}
                      />
                      <button
                        onClick={saveEditedItem}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                        title="Save Changes"
                        aria-label="Save changes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setEditingItemId(null); setEditedName(''); }}
                        className="p-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200"
                        title="Cancel Editing"
                        aria-label="Cancel editing"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`flex-1 text-lg text-gray-800 font-medium cursor-pointer ${
                        item.itemCompletionStatus ? 'line-through text-gray-500' : ''
                      }`}
                      onClick={() => startEditing(item.id, item.itemName || item.name)}
                      title="Click to edit"
                      aria-label={`Checklist item: ${item.itemName || item.name}. Click to edit.`}
                    >
                      {item.itemName || item.name}
                    </span>
                  )}
                </div>

                {!editingItemId && ( 
                  <button
                    onClick={() => deleteChecklistItem(item.id)}
                    className="absolute top-3 right-3 text-red-600 hover:text-red-800 font-medium bg-red-50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition duration-200 ease-in-out border border-red-200 hover:bg-red-100"
                    aria-label={`Delete item ${item.itemName || item.name}`}
                    title="Delete Item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}