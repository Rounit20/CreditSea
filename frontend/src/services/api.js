import axios from 'axios';


const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api/credit'
    : 'https://creditsea-baackend-1.onrender.com/api/credit');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload XML file
export const uploadXMLFile = async (file) => {
  const formData = new FormData();
  formData.append('xmlFile', file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Get all reports
export const getAllReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

// Get a report by ID
export const getReportById = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

// Delete a report
export const deleteReport = async (id) => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};

export default api;
