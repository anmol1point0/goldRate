import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMapMarkerAlt, FaSync } from 'react-icons/fa';
import moment from 'moment';
import PriceHistory from './PriceHistory';
import AnimatedBackground from './AnimatedBackground';

const GoldRates = () => {
  const [rates, setRates] = useState({
    gold: { rate: 0, change: 0 },
    silver: { rate: 0, change: 0 }
  });
  const [location, setLocation] = useState({ city: 'Loading...', state: '' });
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshTimerRef = useRef(null);

  const themeColors = {
    gold: {
      primary: 'bg-amber-500',
      secondary: 'bg-amber-600',
      accent: 'text-amber-500',
      border: 'border-amber-500/20',
      hover: 'hover:bg-amber-600',
      text: 'text-amber-100',
      muted: 'text-amber-300/70',
      card: 'bg-[#1A1A1A]',
      cardBorder: 'border-amber-500/20',
      gradient: 'from-amber-500/20 to-amber-600/20'
    },
    silver: {
      primary: 'bg-gray-400',
      secondary: 'bg-gray-500',
      accent: 'text-gray-400',
      border: 'border-gray-400/20',
      hover: 'hover:bg-gray-500',
      text: 'text-gray-100',
      muted: 'text-gray-300/70',
      card: 'bg-[#1A1A1A]',
      cardBorder: 'border-gray-400/20',
      gradient: 'from-gray-400/20 to-gray-500/20'
    }
  };

  const currentTheme = themeColors[selectedMetal];

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching rates from backend...');
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      // First test if the server is accessible
      const testResponse = await fetch(`${API_URL}/api/test`);
      if (!testResponse.ok) {
        throw new Error('Backend server is not responding');
      }
      
      // Fetch rates from our backend API
      const response = await fetch(`${API_URL}/api/metal-rates`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(`Failed to fetch rates: ${errorData.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);

      if (!data.gold || !data.gold.average) {
        console.error('Invalid data structure:', data);
        throw new Error('Invalid data received from server');
      }

      const updatedRates = {
        gold: {
          rate: Math.round(data.gold.average),
          change: 0,
          timestamp: data.timestamp,
        },
        silver: {
          rate: Math.round(data.silver.average),
          change: 0,
          timestamp: data.timestamp,
        },
      };
      
      console.log('Setting rates:', updatedRates);
      setRates(updatedRates);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Detailed error:', error);
      // Fallback to approximate rates if API fails
      const fallbackRates = {
        gold: { rate: 90662, change: 0 },
        silver: { rate: 92910, change: 0 }
      };
      setRates(fallbackRates);
      setError(`Unable to fetch live rates: ${error.message}`);
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await fetchRates();
  }, [fetchRates]);

  const getLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocation({ city: 'Delhi', state: 'Delhi' });
      setLocationLoading(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('Location permission denied. Please enable location access in your browser settings.'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Location information is unavailable.'));
                break;
              case error.TIMEOUT:
                reject(new Error('Location request timed out.'));
                break;
              default:
                reject(new Error('An unknown error occurred while getting location.'));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      console.log('Current position:', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

      // First try to get location from Google's Geocoding API
      try {
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=YOUR_GOOGLE_API_KEY`
        );
        
        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          if (googleData.results && googleData.results.length > 0) {
            const addressComponents = googleData.results[0].address_components;
            const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name;
            const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name;
            
            if (city && state) {
              console.log('Location from Google:', { city, state });
              setLocation({ city, state });
              setLocationLoading(false);
              return;
            }
          }
        }
      } catch (googleError) {
        console.log('Google Geocoding failed, falling back to OpenStreetMap:', googleError);
      }

      // Fallback to OpenStreetMap
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GoldRateApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      console.log('OpenStreetMap response:', data);
      
      // Try to get the most accurate location data
      const city = data.address.city || 
                  data.address.town || 
                  data.address.village || 
                  data.address.suburb ||
                  data.address.neighbourhood ||
                  'Unknown City';
                  
      const state = data.address.state || 
                   data.address.region || 
                   data.address.province ||
                   'Unknown State';

      console.log('Final location data:', { city, state });
      setLocation({ city, state });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError(error.message);
      setLocation({ city: 'Delhi', state: 'Delhi' });
    } finally {
      setLocationLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(handleRefresh, 10000); // 10 seconds
    }
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, handleRefresh]);

  // Initial fetch and location
  useEffect(() => {
    getLocation();
    fetchRates();
  }, []);

  return (
    <>
      <AnimatedBackground theme={selectedMetal} />
      <div className="w-full max-w-4xl mx-auto relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedMetal('gold')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetal === 'gold'
                  ? `${currentTheme.primary} ${currentTheme.text}`
                  : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#2A2A2A]'
              }`}
            >
              Gold
            </button>
            <button
              onClick={() => setSelectedMetal('silver')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetal === 'silver'
                  ? `${currentTheme.primary} ${currentTheme.text}`
                  : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#2A2A2A]'
              }`}
            >
              Silver
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-400"
              />
              Auto-refresh
            </label>
            <button
              onClick={handleRefresh}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentTheme.primary} ${currentTheme.text} ${currentTheme.hover}`}
            >
              Refresh Now
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-4 ${currentTheme.border} border-t-${currentTheme.primary}`}></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl ${currentTheme.card} border ${currentTheme.cardBorder} backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">24K {selectedMetal === 'gold' ? 'Gold' : 'Silver'}</h3>
                <span className={`text-sm ${currentTheme.muted}`}>per 10g</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                ₹{rates[selectedMetal].rate.toLocaleString()}
              </div>
              <div className={`flex items-center ${rates[selectedMetal].change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span className="text-sm">
                  {rates[selectedMetal].change >= 0 ? '+' : ''}₹{Math.abs(rates[selectedMetal].change).toLocaleString()}
                </span>
                <span className="mx-2">•</span>
                <span className="text-sm">
                  {rates[selectedMetal].change >= 0 ? '+' : ''}{((rates[selectedMetal].change / (rates[selectedMetal].rate - rates[selectedMetal].change)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${currentTheme.card} border ${currentTheme.cardBorder} backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Location</h3>
                <span className={`text-sm ${currentTheme.muted}`}>Current</span>
              </div>
              {locationLoading ? (
                <div className="flex items-center justify-center h-16">
                  <div className={`animate-spin rounded-full h-6 w-6 border-2 ${currentTheme.border} border-t-${currentTheme.primary}`}></div>
                </div>
              ) : locationError ? (
                <div className="text-red-400 text-sm">
                  {locationError}
                  <button 
                    onClick={getLocation}
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-white mb-2">
                    {location.city}, {location.state}
                  </div>
                  <div className={`text-sm ${currentTheme.muted}`}>
                    Last updated: {moment().format('hh:mm:ss A')}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <PriceHistory metal={selectedMetal} />
      </div>
    </>
  );
};

export default GoldRates; 