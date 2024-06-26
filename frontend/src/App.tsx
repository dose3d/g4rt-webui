import React from 'react';
import './index.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './site/HomePage';
import JobsPage from './site/jobs/JobsPage';
import JobCreatePage from './site/jobs/JobCreatePage';
import JobDetailPage from './site/jobs/JobDetailPage';
import Sidebar from './components/Sidebar';
import useToggle from './hooks/useToggle';
import Copyright from './components/Copyright';
import LoginScreen from './site/LoginScreen';
import { AuthProvider, useAuthContext } from './drf-crud-client';
import JobRootDetailPage from './site/root/JobRootDetailPage';
import WorkspacesPage from './site/workspaces/WorkspacesPage';
import WorkspaceCreatePage from './site/workspaces/WorkspaceCreatePage';
import WorkspaceDetailPage from './site/workspaces/WorkspaceDetailPage';
import RootFilesPage from './site/root/RootFilesPage';
import RootFileCreatePage from './site/root/RootFileCreatePage';

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
              <Route element={<JobRootDetailPage />} path=":jobId/root/:fileId" />
            </Route>
            <Route path="/rf">
              <Route element={<RootFilesPage />} path="" />
              <Route element={<RootFileCreatePage />} path="create" />
            </Route>
            <Route path="/workspaces">
              <Route element={<WorkspacesPage />} path="" />
              <Route element={<WorkspaceCreatePage />} path="create" />
              <Route element={<WorkspaceDetailPage />} path=":workspaceId" />
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
  const { authData } = useAuthContext();

  return authData ? <Authorized /> : <NoAuthorized />;
}

function Routed() {
  return (
    <AuthProvider>
      <AuthRoute />
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <Routed />
    </Router>
  );
}

export default App;
