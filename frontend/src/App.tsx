import React from 'react';
import './index.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './site/homePage';
import Login from './site/LoginPage';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col overflow-hidden">
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route element={<Login />} path="/login" />
            <Route element={<Home />} path="/" />
          </Routes>
        </AuthProvider>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
