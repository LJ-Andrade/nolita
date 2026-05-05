import React from 'react';

const isSuperAdmin = () => {
  const userRoles = JSON.parse(localStorage.getItem('USER_ROLES') || '[]');
  return userRoles.includes('Super Admin');
};

export const hasPermission = (permission) => {
  if (isSuperAdmin()) {
    return true;
  }
  
  const userPermissions = JSON.parse(localStorage.getItem('USER_PERMISSIONS') || '[]');
  return userPermissions.includes(permission);
};

export { isSuperAdmin };

const Can = ({ permission, children }) => {
  if (hasPermission(permission)) {
    return children;
  }

  return null;
};

export default Can;
