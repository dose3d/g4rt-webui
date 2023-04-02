import React from 'react';
import { Route, Navigate, PathRouteProps } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, ...rest }: PathRouteProps) => {
  const { user } = useContext(AuthContext);
  return <Route {...rest}>{!user ? <Navigate to="/login" /> : children}</Route>;
};

export default PrivateRoute;
