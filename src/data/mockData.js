import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';

// Regions with their geographic coordinates
export const REGIONS = {
  'North America': { lat: 39.8283, lng: -98.5795, color: '#3b82f6' },
  'Europe': { lat: 54.5260, lng: 15.2551, color: '#ef4444' },
  'Asia Pacific': { lat: 34.0479, lng: 100.6197, color: '#10b981' },
  'South America': { lat: -8.7832, lng: -55.4915, color: '#f59e0b' },
  'Africa': { lat: -8.7832, lng: 34.5085, color: '#8b5cf6' },
  'Middle East': { lat: 29.2985, lng: 42.5510, color: '#ec4899' }
};

export const DELIVERY_STATUSES = ['On Time', 'Late', 'Early'];

export const LATE_REASONS = [
  'Weather Delays',
  'Traffic Congestion',
  'Vehicle Breakdown',
  'Customs Issues',
  'Incorrect Address',
  'Customer Unavailable',
  'Warehouse Delays',
  'Driver Issues'
];

// Generate dates for the past year
const generateDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 365; i >= 0; i--) {
    dates.push(subDays(today, i));
  }
  
  return dates;
};

// Generate mock logistics data
export const generateLogisticsData = (count = 5000) => {
  const dates = generateDates();
  const regions = Object.keys(REGIONS);
  const data = [];

  for (let i = 0; i < count; i++) {
    const date = dates[Math.floor(Math.random() * dates.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    // Determine delivery status with some realistic probability
    let deliveryStatus;
    const statusRand = Math.random();
    if (statusRand < 0.75) deliveryStatus = 'On Time';
    else if (statusRand < 0.90) deliveryStatus = 'Late';
    else deliveryStatus = 'Early';

    // Generate late reason only for late deliveries
    const lateReason = deliveryStatus === 'Late' 
      ? LATE_REASONS[Math.floor(Math.random() * LATE_REASONS.length)]
      : null;

    // Generate realistic delivery times (in hours)
    const baseDeliveryTime = deliveryStatus === 'On Time' ? 24 + Math.random() * 24 :
                           deliveryStatus === 'Late' ? 48 + Math.random() * 48 :
                           12 + Math.random() * 12;

    const orderValue = Math.floor(Math.random() * 10000) + 100;
    
    data.push({
      id: `order-${i}`,
      date: format(date, 'yyyy-MM-dd'),
      region,
      deliveryStatus,
      lateReason,
      deliveryTime: Math.round(baseDeliveryTime * 10) / 10, // Round to 1 decimal
      orderValue,
      quarter: `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`,
      month: format(date, 'MMM yyyy'),
      week: `Week of ${format(startOfWeek(date), 'MMM d, yyyy')}`,
      day: format(date, 'MMM d, yyyy'),
      coordinates: {
        lat: REGIONS[region].lat + (Math.random() - 0.5) * 20,
        lng: REGIONS[region].lng + (Math.random() - 0.5) * 20
      }
    });
  }

  return data;
};

// Process data for geographic distribution
export const processGeographicData = (data) => {
  const regionStats = {};
  
  data.forEach(order => {
    if (!regionStats[order.region]) {
      regionStats[order.region] = {
        region: order.region,
        orderCount: 0,
        totalValue: 0,
        onTimeCount: 0,
        lateCount: 0,
        coordinates: REGIONS[order.region],
        color: REGIONS[order.region].color
      };
    }
    
    regionStats[order.region].orderCount++;
    regionStats[order.region].totalValue += order.orderValue;
    
    if (order.deliveryStatus === 'On Time') regionStats[order.region].onTimeCount++;
    if (order.deliveryStatus === 'Late') regionStats[order.region].lateCount++;
  });

  return Object.values(regionStats);
};

// Helper function to limit time periods for better chart readability
const limitTimePeriods = (data, limit = 10) => {
  return data.sort((a, b) => a.period.localeCompare(b.period)).slice(-limit);
};

// Process data for dual-axis chart (order volume vs delivery times split by status)
export const processDualAxisData = (data, granularity = 'monthly') => {
  const groupedData = {};
  
  data.forEach(order => {
    let key;
    switch (granularity) {
      case 'quarterly':
        key = order.quarter;
        break;
      case 'weekly':
        key = order.week;
        break;
      case 'daily':
        key = order.day;
        break;
      case 'monthly':
      default:
        key = order.month;
        break;
    }
    
    if (!groupedData[key]) {
      groupedData[key] = {
        period: key,
        orderCount: 0,
        onTimeDeliveryTime: 0,
        onTimeCount: 0,
        lateDeliveryTime: 0,
        lateCount: 0,
        earlyDeliveryTime: 0,
        earlyCount: 0,
        totalValue: 0
      };
    }
    
    groupedData[key].orderCount++;
    groupedData[key].totalValue += order.orderValue;
    
    // Split delivery times by status
    switch (order.deliveryStatus) {
      case 'On Time':
        groupedData[key].onTimeDeliveryTime += order.deliveryTime;
        groupedData[key].onTimeCount++;
        break;
      case 'Late':
        groupedData[key].lateDeliveryTime += order.deliveryTime;
        groupedData[key].lateCount++;
        break;
      case 'Early':
        groupedData[key].earlyDeliveryTime += order.deliveryTime;
        groupedData[key].earlyCount++;
        break;
    }
  });

  const processedData = Object.values(groupedData).map(item => ({
    ...item,
    onTimePercentage: item.orderCount > 0 ? Math.round((item.onTimeCount / item.orderCount) * 100 * 10) / 10 : 0,
    latePercentage: item.orderCount > 0 ? Math.round((item.lateCount / item.orderCount) * 100 * 10) / 10 : 0,
    earlyPercentage: item.orderCount > 0 ? Math.round((item.earlyCount / item.orderCount) * 100 * 10) / 10 : 0
  }));
  
  return limitTimePeriods(processedData);
};

// Process data for late delivery reasons
export const processLateDeliveryData = (data, granularity = 'all') => {
  const lateOrders = data.filter(order => order.deliveryStatus === 'Late');
  
  if (granularity === 'all') {
    const reasonStats = {};
    
    lateOrders.forEach(order => {
      if (!reasonStats[order.lateReason]) {
        reasonStats[order.lateReason] = {
          reason: order.lateReason,
          count: 0,
          totalDelay: 0,
          regions: new Set()
        };
      }
      
      reasonStats[order.lateReason].count++;
      reasonStats[order.lateReason].totalDelay += Math.max(0, order.deliveryTime - 24); // Assuming 24h is standard
      reasonStats[order.lateReason].regions.add(order.region);
    });

    return Object.values(reasonStats).map(item => ({
      ...item,
      avgDelay: Math.round((item.totalDelay / item.count) * 10) / 10,
      regionCount: item.regions.size
    })).sort((a, b) => b.count - a.count);
  }
  
  // For time-based granularity, group by time period
  const timeGrouped = {};
  
  lateOrders.forEach(order => {
    let key;
    switch (granularity) {
      case 'quarterly':
        key = order.quarter;
        break;
      case 'weekly':
        key = order.week;
        break;
      case 'daily':
        key = order.day;
        break;
      case 'monthly':
      default:
        key = order.month;
        break;
    }
    
    if (!timeGrouped[key]) {
      timeGrouped[key] = {};
    }
    
    if (!timeGrouped[key][order.lateReason]) {
      timeGrouped[key][order.lateReason] = 0;
    }
    
    timeGrouped[key][order.lateReason]++;
  });

  const timeBasedData = Object.entries(timeGrouped).map(([period, reasons]) => ({
    period,
    ...reasons
  }));
  
  return limitTimePeriods(timeBasedData);
};

// Get unique values for dropdowns
export const getUniqueValues = (data, field) => {
  return [...new Set(data.map(item => item[field]))].sort();
};

// Generate drill-down options for different chart types
export const getDrillDownOptions = (chartType) => {
  const baseOptions = {
    geographic: [
      { value: 'region', label: 'By Region' },
      { value: 'country', label: 'By Country', disabled: true }, // Future enhancement
    ],
    temporal: [
      { value: 'yearly', label: 'Yearly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'daily', label: 'Daily' }
    ],
    categorical: [
      { value: 'all', label: 'All Reasons' },
      { value: 'monthly', label: 'By Month' },
      { value: 'quarterly', label: 'By Quarter' },
      { value: 'weekly', label: 'By Week' },
      { value: 'daily', label: 'By Day' }
    ]
  };

  return baseOptions[chartType] || baseOptions.temporal;
};

// Export the main dataset
export const LOGISTICS_DATA = generateLogisticsData();
