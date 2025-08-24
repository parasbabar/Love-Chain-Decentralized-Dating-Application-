import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import ProfilePage from './pages/ProfilePage';
import WalletConnect from './components/WalletConnect';
import SOSButton from './components/SOSButton';
import { checkWalletConnection, connectWallet } from './utils/aptos';
import { getUserProfile } from './utils/api';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isWalletConnected = await checkWalletConnection();
      setIsConnected(isWalletConnected);
      
      if (isWalletConnected) {
        const userData = await getUserProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleWalletConnect = async () => {
    try {
      const walletData = await connectWallet();
      setIsConnected(true);
      setUser(walletData.user);
      setShowWalletModal(false);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const handleLogout = () => {
    setIsConnected(false);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <Router>
      <div className="App">
        <Header 
          user={user} 
          onConnectWallet={() => setShowWalletModal(true)} 
          onLogout={handleLogout}
        />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/discover" element={<Discover user={user} />} />
            <Route path="/messages" element={<Messages user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
          </Routes>
        </main>

        {user && <SOSButton user={user} />}

        {showWalletModal && (
          <WalletConnect 
            onConnect={handleWalletConnect}
            onClose={() => setShowWalletModal(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;