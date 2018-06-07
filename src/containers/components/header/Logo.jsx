import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/">
      <div className="header-logo-wrap">
        <div className="header-logo-icon" />
        <div className="header-logo" />
      </div>
    </Link>
  );
};

export default Logo;
