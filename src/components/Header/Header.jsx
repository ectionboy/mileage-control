import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Головна</Link>
          </li>

          <li>
            <Link to="/mileage">Кілометраж</Link>
          </li>
          
          <li>
            <Link to="/about">Про додаток</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
