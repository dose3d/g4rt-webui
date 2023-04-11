import React, { useContext } from 'react';
import './index.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import HomePage from './site/HomePage';
import JobsPage from './site/jobs/JobsPage';
import JobCreatePage from './site/jobs/JobCreatePage';
import JobDetailPage from './site/jobs/JobDetailPage';
import Sidebar from './components/Sidebar';
import useToggle from './hooks/useToggle';
import Copyright from './components/Copyright';
import LoginScreen from './site/LoginScreen';

function Authorized() {
  const [toggle, onToggle] = useToggle();

  return (
    <>
      <Navbar toggle={toggle} onToggle={onToggle} />
      <div className="flex overflow-hidden bg-white pt-16">
        <Sidebar toggle={toggle} onToggle={onToggle} />
        <div className="relative h-full w-full overflow-y-auto bg-gray-50 lg:ml-64">
          <Routes>
            <Route path="/jobs">
              <Route element={<JobsPage />} path="" />
              <Route element={<JobCreatePage />} path="create" />
              <Route element={<JobDetailPage />} path=":jobId" />
            </Route>
            <Route element={<HomePage />} path="/" />
          </Routes>
          <Footer />
          <Copyright />
        </div>
      </div>
    </>
  );
}

function NoAuthorized() {
  return <LoginScreen />;
}

function AuthRoute() {
  const { user } = useContext(AuthContext);

  return user ? <Authorized /> : <NoAuthorized />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthRoute />
      </AuthProvider>
    </Router>
  );
}

export default App;
