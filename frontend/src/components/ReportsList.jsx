import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllReports, deleteReport } from '../services/api';
import './ReportsList.css';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getAllReports();
      setReports(response.data);
    } catch (err) {
      setError('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(id);
        setReports(reports.filter(report => report._id !== id));
      } catch (err) {
        alert('Error deleting report');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Credit Reports</h2>
        <button onClick={() => navigate('/')} className="btn-upload">
          Upload New Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="no-reports">
          <p>No reports found. Upload an XML file to get started.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-card-header">
                <h3>{report.name || 'Unknown'}</h3>
                <span className="credit-score">{report.creditScore || 'N/A'}</span>
              </div>
              
              <div className="report-card-body">
                <p><strong>PAN:</strong> {report.pan || 'N/A'}</p>
                <p><strong>Mobile:</strong> {report.mobilePhone || 'N/A'}</p>
                <p><strong>Total Accounts:</strong> {report.reportSummary?.totalAccounts || 0}</p>
                <p><strong>Uploaded:</strong> {formatDate(report.uploadDate)}</p>
              </div>

              <div className="report-card-actions">
                <button 
                  onClick={() => navigate(`/reports/${report._id}`)}
                  className="btn-view"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleDelete(report._id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsList;