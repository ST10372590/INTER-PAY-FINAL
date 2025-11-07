import React from 'react';
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.userType || userType;

  if (!role) {
    return null; // hide navbar if no role detected
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const profileLink = role === 'employee' ? '/employee/profile' : '/profile';
  const dashboardLink = role === 'customer' ? '/customer/dashboard' : '/employee/dashboard';

  return (
    <nav className="navbar">
      <div className="nav-left">
        {role === 'customer' && <Link to="/customer/dashboard">Dashboard</Link>}
        {role === 'employee' && <Link to="/employee/dashboard">Dashboard</Link>}
        {!role && <Link to="/dashboard">Dashboard</Link>}
      </div>

      <div className="nav-center">
        <Link to={dashboardLink}>International Payments</Link>
      </div>

      <div className="nav-right">
        <Link to={profileLink} className="nav-link">Profile</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;

/*
----------------------------------
Reference List
----------------------------------

React Documentation. (2024). React – A JavaScript library for building user interfaces. Retrieved from https://react.dev

React Router Documentation. (2024). useNavigate, useLocation Hooks. Retrieved from https://reactrouter.com/en/main/hooks

Lucide React Icons. (2024). Lucide React Icon Components. Retrieved from https://lucide.dev/docs/lucide-react

MDN Web Docs. (2024). HTML input element. Retrieved from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input

MDN Web Docs. (2024). JavaScript async/await. Retrieved from https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises#async_and_await

W3C CSS Working Group. (2024). CSS: Cascading Style Sheets — Visual formatting model and layout techniques. Retrieved from https://www.w3.org/TR/CSS/

OWASP Foundation. (2024). Input Validation Cheat Sheet. Retrieved from https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

ECMAScript International. (2024). ECMAScript Language Specification (ES2024). Retrieved from https://tc39.es/ecma262/

Node.js Foundation. (2024). Working with Asynchronous Code and Promises. Retrieved from https://nodejs.org/en/docs/guides/using-promises/

Google Material Design. (2024). UI/UX Principles for Form Design. Retrieved from https://m3.material.io/
*/