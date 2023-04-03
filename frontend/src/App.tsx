import React from 'react';
import './index.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './site/HomePage';
import Login from './site/LoginPage';
import JobsPage from './site/jobs/JobsPage';
import JobCreatePage from './site/jobs/JobCreatePage';
import JobDetailPage from './site/jobs/JobDetailPage';
import Sidebar from './components/Sidebar';
import useToggle from './hooks/useToggle';
import Copyright from "./components/Copyright";

function App() {
  const [toggle, onToggle] = useToggle();

  return (
    <Router>
      <AuthProvider>
        <Navbar toggle={toggle} onToggle={onToggle} />
        <div className="flex overflow-hidden bg-white pt-16">
          <Sidebar toggle={toggle} onToggle={onToggle} />
          <div className="h-full w-full bg-gray-50 relative overflow-y-auto lg:ml-64">
          <Routes>
            <Route path="/jobs">
              <Route element={<JobsPage />} path="" />
              <Route element={<JobCreatePage />} path="create" />
              <Route element={<JobDetailPage />} path=":jobId" />
            </Route>
            <Route element={<Login />} path="/login" />
            <Route element={<HomePage />} path="/" />
          </Routes>
            <Footer />
            <Copyright/>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
