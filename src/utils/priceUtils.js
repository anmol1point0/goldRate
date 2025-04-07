import moment from 'moment';

// Generate mock historical data with realistic trends
export const generateHistoricalData = (basePrice, days) => {
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    // Add some realistic daily variation (±2%)
    const dailyChange = currentPrice * (Math.random() * 0.04 - 0.02);
    currentPrice += dailyChange;
    
    data.push({
      date: moment().subtract(i, 'days').format('YYYY-MM-DD'),
      price: Math.round(currentPrice),
      change: Math.round(dailyChange),
    });
  }
  
  return data;
};

// Calculate price changes for different time periods
export const calculatePriceChanges = (historicalData) => {
  const latest = historicalData[historicalData.length - 1].price;
  const oneDayAgo = historicalData[historicalData.length - 2]?.price || latest;
  const oneWeekAgo = historicalData[historicalData.length - 8]?.price || latest;
  const oneMonthAgo = historicalData[0]?.price || latest;

  return {
    daily: {
      change: latest - oneDayAgo,
      percentage: ((latest - oneDayAgo) / oneDayAgo * 100).toFixed(2)
    },
    weekly: {
      change: latest - oneWeekAgo,
      percentage: ((latest - oneWeekAgo) / oneWeekAgo * 100).toFixed(2)
    },
    monthly: {
      change: latest - oneMonthAgo,
      percentage: ((latest - oneMonthAgo) / oneMonthAgo * 100).toFixed(2)
    }
  };
};

// Get regional price adjustments
export const getRegionalAdjustment = (state, metalType) => {
  const baseAdjustments = {
    SOUTH: metalType === 'gold' ? 200 : 5,
    WEST: metalType === 'gold' ? 150 : 3,
    EAST: metalType === 'gold' ? -100 : -2
  };

  const regions = {
    SOUTH: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana'],
    WEST: ['Maharashtra', 'Gujarat', 'Goa'],
    EAST: ['West Bengal', 'Bihar', 'Odisha', 'Assam']
  };

  for (const [region, states] of Object.entries(regions)) {
    if (states.includes(state)) {
      return baseAdjustments[region] || 0;
    }
  }

  return 0; // Default (North) has no adjustment
}; 