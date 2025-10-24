import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './components/Upload';
import ReportsList from './components/ReportsList';
import ReportDetail from './components/ReportDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>CreditSea - Credit Report Manager</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/reports" element={<ReportsList />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;