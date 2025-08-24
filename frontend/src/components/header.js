import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, onConnectWallet, onLogout }) => {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">
            <i className="fas fa-heart"></i> InstaMatch
          </Link>
          
          <ul className="nav-links">
            <li><Link to="/"><i className="fas fa-home"></i> Home</Link></li>
            <li><Link to="/discover"><i className="fas fa-search"></i> Discover</Link></li>
            <li><Link to="/messages"><i className="fas fa-comment"></i> Messages</Link></li>
            <li><Link to="/profile"><i className="fas fa-user"></i> Profile</Link></li>
          </ul>
          
          <div className="auth-buttons">
            {user ? (
              <>
                <div className="user-profile">
                  <img src={user.profile?.photos?.[0]?.url || 'https://i.pravatar.cc/150?img=8'} 
                       alt={user.username} className="user-avatar" />
                  <span className="user-name">{user.username}</span>
                </div>
                <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={onConnectWallet}>Connect Wallet</button>
                <button className="btn btn-primary" onClick={onConnectWallet}>Create Profile</button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;