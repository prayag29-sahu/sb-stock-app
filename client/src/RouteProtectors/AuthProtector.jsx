import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthProtector = ({ children }) => {
  if (!localStorage.getItem('userType')) {
    return <Navigate to='/' replace />;
  }
  return children;
};

export default AuthProtector;
