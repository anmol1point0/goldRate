import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { FaSearch } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceHistory = ({ metal, rates }) => {
  const [timeRange, setTimeRange] = useState('1W');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customComparison, setCustomComparison] = useState(null);
  const [timeRangeData, setTimeRangeData] = useState(null);
  const [usdToINR, setUsdToINR] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const currentTheme = themeColors[metal];

  useEffect(() => {
    const fetchUsdToInr = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setUsdToINR(data.rates.INR);
      } catch (error) {
        console.error('Error fetching USD to INR rate:', error);
        // Fallback to a reasonable default if API fails
        setUsdToINR(83);
      }
    };

    fetchUsdToInr();
  }, []);

  const generateTimeRangeData = (range) => {
    const basePrice = metal === 'gold' ? 65000 : 75000;
    const now = moment();
    let startDate;

    switch (range) {
      case '1D':
        startDate = now.clone().subtract(1, 'day');
        break;
      case '1W':
        startDate = now.clone().subtract(1, 'week');
        break;
      case '1M':
        startDate = now.clone().subtract(1, 'month');
        break;
      case '3M':
        startDate = now.clone().subtract(3, 'months');
        break;
      case '6M':
        startDate = now.clone().subtract(6, 'months');
        break;
      case '1Y':
        startDate = now.clone().subtract(1, 'year');
        break;
      default:
        startDate = now.clone().subtract(1, 'week');
    }

    const startPrice = basePrice + (Math.random() * 2000 - 1000);
    const endPrice = basePrice + (Math.random() * 2000 - 1000);
    const priceChange = endPrice - startPrice;
    const percentageChange = ((priceChange / startPrice) * 100).toFixed(2);
    const days = now.diff(startDate, 'days');

    return {
      startDate: startDate.format('MMMM D, YYYY'),
      endDate: now.format('MMMM D, YYYY'),
      startPrice,
      endPrice,
      priceChange,
      percentageChange,
      days
    };
  };

  useEffect(() => {
    setTimeRangeData(generateTimeRangeData(timeRange));
  }, [timeRange, metal]);

  const calculatePriceChange = (startPrice, endPrice) => {
    const change = endPrice - startPrice;
    const percentageChange = (change / startPrice) * 100;
    return { change, percentageChange };
  };

  const handleCompare = () => {
    if (!customStartDate || !customEndDate || !usdToINR) return;

    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);

    if (startDate >= endDate) {
      alert('Start date must be before end date');
      return;
    }

    const basePrice = metal === 'gold' ? 2000 : 25; // Base price in USD
    const startPrice = basePrice * usdToINR;
    const endPrice = basePrice * usdToINR * (1 + (Math.random() - 0.5) * 0.1);

    const { change, percentageChange } = calculatePriceChange(startPrice, endPrice);

    setCustomComparison({
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      startPrice,
      endPrice,
      change,
      percentageChange,
    });
  };

  const generateHistoricalData = () => {
    if (!usdToINR) return { labels: [], datasets: [] };

    const now = new Date();
    const data = [];
    const labels = [];
    let startDate, endDate, interval;

    switch (timeRange) {
      case '1D':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        endDate = now;
        interval = 60 * 60 * 1000; // 1 hour
        break;
      case '1W':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1M':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1Y':
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
        endDate = now;
        interval = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return { labels: [], datasets: [] };
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        interval = (endDate - startDate) / 20; // Divide into 20 points
        break;
      default:
        return { labels: [], datasets: [] };
    }

    for (let date = startDate; date <= endDate; date = new Date(date.getTime() + interval)) {
      const basePrice = metal === 'gold' ? 2000 : 25; // Base price in USD
      const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * randomFactor * usdToINR;
      
      data.push(price);
      labels.push(date.toLocaleDateString());
    }

    return {
      labels,
      datasets: [
        {
          label: `${metal === 'gold' ? 'Gold' : 'Silver'} Price (₹)`,
          data,
          borderColor: metal === 'gold' ? '#FFD700' : '#C0C0C0',
          backgroundColor: metal === 'gold' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(192, 192, 192, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const chartData = generateHistoricalData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (!usdToINR) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${currentTheme.background} shadow-lg`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">Price History</h2>
        <div className="flex flex-wrap gap-2">
          {['1D', '1W', '1M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? `${currentTheme.button} text-white`
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-4 rounded-lg ${currentTheme.card}`}>
          <h3 className="text-lg font-medium text-white mb-4">Custom Date Range</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleCompare}
              className={`w-full py-2 rounded-lg ${currentTheme.button} text-white font-medium transition-colors hover:bg-opacity-90`}
            >
              Compare Dates
            </button>
          </div>
        </div>

        {customComparison && (
          <div className={`p-4 rounded-lg ${currentTheme.card}`}>
            <h3 className="text-lg font-medium text-white mb-4">Comparison Results</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Start Date:</span>
                <span className="text-white">{customComparison.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">End Date:</span>
                <span className="text-white">{customComparison.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Start Price:</span>
                <span className="text-white">₹{customComparison.startPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">End Price:</span>
                <span className="text-white">₹{customComparison.endPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Change:</span>
                <span className={customComparison.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {customComparison.change >= 0 ? '+' : ''}₹{Math.abs(customComparison.change).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Percentage Change:</span>
                <span className={customComparison.percentageChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {customComparison.percentageChange >= 0 ? '+' : ''}{customComparison.percentageChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceHistory; 