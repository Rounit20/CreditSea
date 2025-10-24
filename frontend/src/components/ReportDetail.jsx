import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById } from '../services/api';
import './ReportDetail.css';

const ReportDetail = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getReportById(id);
      setReport(response.data);
    } catch (err) {
      setError('Error fetching report details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading report...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!report) return <div className="error">Report not found</div>;

  return (
    <div className="report-detail-container">
      <div className="report-detail-header">
        <button onClick={() => navigate('/reports')} className="btn-back">
          ← Back to Reports
        </button>
        <h2>Credit Report Details</h2>
      </div>

      {/* Basic Details */}
      <section className="detail-section">
        <h3>Basic Details</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name:</label>
            <span>{report.name || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Mobile Phone:</label>
            <span>{report.mobilePhone || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>PAN:</label>
            <span>{report.pan || 'N/A'}</span>
          </div>
          <div className="detail-item credit-score-item">
            <label>Credit Score:</label>
            <span className="credit-score-badge">{report.creditScore || 'N/A'}</span>
          </div>
        </div>
      </section>

      {/* Report Summary */}
      <section className="detail-section">
        <h3>Report Summary</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Total Accounts:</label>
            <span>{report.reportSummary?.totalAccounts || 0}</span>
          </div>
          <div className="detail-item">
            <label>Active Accounts:</label>
            <span>{report.reportSummary?.activeAccounts || 0}</span>
          </div>
          <div className="detail-item">
            <label>Closed Accounts:</label>
            <span>{report.reportSummary?.closedAccounts || 0}</span>
          </div>
          <div className="detail-item">
            <label>Current Balance:</label>
            <span>₹{report.reportSummary?.currentBalanceAmount?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="detail-item">
            <label>Secured Accounts Amount:</label>
            <span>₹{report.reportSummary?.securedAccountsAmount?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="detail-item">
            <label>Unsecured Accounts Amount:</label>
            <span>₹{report.reportSummary?.unsecuredAccountsAmount?.toLocaleString('en-IN') || 0}</span>
          </div>
          <div className="detail-item">
            <label>Last 7 Days Enquiries:</label>
            <span>{report.reportSummary?.last7DaysCreditEnquiries || 0}</span>
          </div>
        </div>
      </section>

      {/* Credit Accounts */}
      <section className="detail-section">
        <h3>Credit Accounts Information</h3>
        {report.creditAccounts && report.creditAccounts.length > 0 ? (
          <div className="table-container">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Bank</th>
                  <th>Account Number</th>
                  <th>Amount Overdue</th>
                  <th>Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {report.creditAccounts.map((account, index) => (
                  <tr key={index}>
                    <td>{account.type || 'N/A'}</td>
                    <td>{account.bank || 'N/A'}</td>
                    <td>{account.accountNumber || 'N/A'}</td>
                    <td>₹{account.amountOverdue?.toLocaleString('en-IN') || 0}</td>
                    <td>₹{account.currentBalance?.toLocaleString('en-IN') || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No credit accounts information available</p>
        )}
      </section>

      {/* Addresses */}
      <section className="detail-section">
        <h3>Addresses</h3>
        {report.addresses && report.addresses.length > 0 ? (
          <div className="addresses-container">
            {report.addresses.map((address, index) => (
              <div key={index} className="address-card">
                <p>{address.addressLine || 'N/A'}</p>
                <p>{address.city && `${address.city}, `}{address.state || ''}</p>
                <p>{address.pincode || ''}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No address information available</p>
        )}
      </section>
    </div>
  );
};

export default ReportDetail;