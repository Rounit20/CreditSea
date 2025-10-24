import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadXMLFile } from '../services/api';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.xml')) {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid XML file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadXMLFile(file);
      setSuccess('File uploaded and processed successfully!');
      setFile(null);
      
      // Reset file input
      e.target.reset();
      
      // Navigate to report detail after 1.5 seconds
      setTimeout(() => {
        navigate(`/reports/${response.data._id}`);
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Credit Report XML</h2>
        <p className="upload-description">
          Upload an Experian XML file to process and view credit report data
        </p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              id="file-input"
              className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              {file ? file.name : 'Choose XML File'}
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            className="upload-button"
            disabled={!file || loading}
          >
            {loading ? 'Processing...' : 'Upload & Process'}
          </button>
        </form>

        <div className="navigation-links">
          <button 
            onClick={() => navigate('/reports')}
            className="link-button"
          >
            View All Reports →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;