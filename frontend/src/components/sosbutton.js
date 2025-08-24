import React, { useState } from 'react';
import { triggerSOS } from '../utils/api';

const SOSButton = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSOS = async () => {
    if (window.confirm('Are you sure you want to trigger emergency SOS? This will notify your trusted contacts.')) {
      setIsLoading(true);
      try {
        // Get current location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            await triggerSOS(location, 'Emergency SOS activated');
            alert('SOS activated! Help is on the way.');
            setIsLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('Could not get your location. Please enable location services.');
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('SOS activation failed:', error);
        alert('SOS activation failed. Please try again.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="sos-button" onClick={handleSOS} disabled={isLoading}>
      <i className="fas fa-exclamation"></i>
      {isLoading ? 'Activating...' : 'SOS'}
    </div>
  );
};

export default SOSButton;