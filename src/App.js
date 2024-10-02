//import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './pages/Login';
import Purchases from './pages/TransactionBinder';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import Fof from './pages/404'; 
import DocumentReview from './pages/DocumentReview';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/login">Login/Logout</Link></li>
            <li><Link to="/documents">Documents</Link></li>
            <li><Link to="/purchases">Invoices</Link></li>
            <li><Link to="/document">Payments</Link></li>
            <li>
              <Link to="/settings">Settings</Link>
              <ul className="submenu">
                <li><Link to="/document-review">Manual Classification</Link></li>
                <li><Link to="/settings/submenu2">System Settings</Link></li>
                <li><Link to="/settings/submenu3">Suppliers</Link></li>
              </ul>
            </li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/documents" element={<Fof />} /> {/* Modified to use Fof component */}
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/submenu1" element={<div>Submenu 1 Content</div>} />
          <Route path="/settings/submenu2" element={<div>Submenu 2 Content</div>} />
          <Route path="/settings/submenu3" element={<div>Submenu 3 Content</div>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/document-review" element={<DocumentReview />} />
          <Route path="*" element={<Fof />} /> {/* Catch-all route for undefined paths */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;