import React from 'react';
import { Navigate } from 'react-router-dom';

const LoginProtector = ({ children }) => {
  const userType = localStorage.getItem('userType');
  if (userType === 'customer') {
    return <Navigate to='/home' replace />;
  } else if (userType === 'admin') {
    return <Navigate to='/admin' replace />;
  }
  return children;
};

export default LoginProtector;
