import React from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import Copyright from './components/Copyright';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WLTestPage from './contrib/wl-test/WLTestPage';
import WLTestResultsPage from './contrib/wl-test/WLTestResultsPage';
import { AuthProvider, useAuthContext } from './drf-crud-client';
import useToggle from './hooks/useToggle';
import './index.css';
import HomePage from './site/HomePage';
import LoginScreen from './site/LoginScreen';
import JobCreatePage from './site/jobs/JobCreatePage';
import JobDetailPage from './site/jobs/JobDetailPage';
import JobsPage from './site/jobs/JobsPage';
import JobRootDetailPage from './site/root/JobRootDetailPage';
import RootFileCreatePage from './site/root/RootFileCreatePage';
import RootFilesPage from './site/root/RootFilesPage';
import WorkspaceCreatePage from './site/workspaces/WorkspaceCreatePage';
import WorkspaceDetailPage from './site/workspaces/WorkspaceDetailPage';
import WorkspacesPage from './site/workspaces/WorkspacesPage';

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
            <Route path="/wl-test">
              <Route element={<WLTestPage />} path="" />
              <Route element={<WLTestResultsPage />} path="results" />
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
