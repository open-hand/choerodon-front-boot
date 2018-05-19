import React from 'react';
import { Link } from 'react-router-dom';
import './HeaderLogo.scss';

const HeaderLogo = () => {
  return (
    <Link to="/">
      <div className="headerLogo-wrap">
        <div className="headerLogo-icon" />
        <div className="headerLogo-logo" />
      </div>
    </Link>
  );
};

export default HeaderLogo;
