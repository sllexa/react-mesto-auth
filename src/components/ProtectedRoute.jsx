import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...props }) => {
  return props.loggedIn ? (<Component {...props} />) : (<Navigate to="sing-in" />);
}

export default ProtectedRoute;