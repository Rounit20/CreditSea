import axios from 'axios';

const API_URL = 'http://localhost:5000/api/credit';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const getAllReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};

export default api;