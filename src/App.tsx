import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import EquipmentManagement from './pages/EquipmentManagement';
import InvestmentPage from './pages/InvestmentPage';
import DepreciationPage from './pages/DepreciationPage';
import ManageDimensionPage from './pages/ManageDimensionPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Navigation />
        <Routes>
          <Route path="/" element={<EquipmentManagement />} />
          <Route path="/investment" element={<InvestmentPage />} />
          <Route path="/depreciation" element={<DepreciationPage />} />
          <Route path="/dimension" element={<ManageDimensionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
