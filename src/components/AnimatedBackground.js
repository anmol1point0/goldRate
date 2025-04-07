import React, { useEffect, useState, useRef } from 'react';

const AnimatedBackground = ({ theme }) => {
  const [collectedCoins, setCollectedCoins] = useState([]);
  const [burstingCoins, setBurstingCoins] = useState([]);
  const containerRef = useRef(null);

  const themeConfig = {
    gold: {
      gradient: 'from-amber-500/20 via-yellow-500/10 to-amber-600/20',
      coinClass: 'gold-coin',
      containerClass: 'gold-container',
    },
    silver: {
      gradient: 'from-gray-400/20 via-gray-300/10 to-gray-500/20',
      coinClass: 'silver-coin',
      containerClass: 'silver-container',
    }
  };

  const currentTheme = themeConfig[theme];

  const createBurstEffect = () => {
    // Create bursting coins from the collected ones
    const newBurstingCoins = collectedCoins.map(coin => ({
      ...coin,
      xOffset: `${(Math.random() - 0.5) * 300}px`,
      yOffset: `${(Math.random() - 0.5) * 300}px`,
    }));
    setBurstingCoins(newBurstingCoins);
    
    // Clear bursting coins after animation
    setTimeout(() => {
      setBurstingCoins([]);
      setCollectedCoins([]); // Empty the container
    }, 1500);
  };

  useEffect(() => {
    // Add a new coin every 3 seconds
    const interval = setInterval(() => {
      setCollectedCoins(prev => {
        if (prev.length < 16) { // Limit to 16 coins (4x4 grid)
          return [...prev, { id: Date.now() }];
        } else if (prev.length === 16) {
          // Container is full, trigger the burst effect
          setTimeout(createBurstEffect, 500);
          return prev;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [collectedCoins, createBurstEffect]);

  return (
    <>
      {/* Gradient background */}
      <div className={`fixed inset-0 bg-gradient-to-br ${currentTheme.gradient}`} />

      {/* Bursting coins */}
      {burstingCoins.map(coin => (
        <div
          key={coin.id}
          className={`collected-coin ${currentTheme.coinClass} animate-coin-burst`}
          style={{
            '--x-offset': coin.xOffset,
            '--y-offset': coin.yOffset,
            position: 'fixed',
            left: 'calc(100% - 140px)',
            bottom: '20px',
          }}
        />
      ))}

      {/* Single dropping coin */}
      {burstingCoins.length === 0 && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="coin-wrapper">
            <div className={`coin ${currentTheme.coinClass} animate-coin-drop`} />
          </div>
        </div>
      )}

      {/* Coin container */}
      <div 
        ref={containerRef}
        className={`coin-container ${currentTheme.containerClass}`}
      >
        <div className="collected-coins">
          {collectedCoins.map(coin => (
            <div 
              key={coin.id} 
              className={`collected-coin ${currentTheme.coinClass} animate-coin-collect`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AnimatedBackground; 