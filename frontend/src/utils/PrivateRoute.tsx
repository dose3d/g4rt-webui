import React from 'react';
import { Route, Navigate, PathRouteProps } from 'react-router-dom';
import { useContext } from 'react';
import { JwtAuthContext } from "../drf-crud-client";

const PrivateRoute = ({ children, ...rest }: PathRouteProps) => {
  const { user } = useContext(JwtAuthContext);
  return <Route {...rest}>{!user ? <Navigate to="/login" /> : children}</Route>;
};

export default PrivateRoute;
