const express = require('express');
const cors = require('cors');
const { format, subDays } = require('date-fns');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data generation (simplified version for backend)
const generateMockData = (filters = {}) => {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'South America', 'Africa', 'Middle East'];
  const statuses = ['On Time', 'Late', 'Early'];
  const lateReasons = [
    'Weather Delays', 'Traffic Congestion', 'Vehicle Breakdown', 'Customs Issues',
    'Incorrect Address', 'Customer Unavailable', 'Warehouse Delays', 'Driver Issues'
  ];

  const data = [];
  const count = 1000; // Smaller dataset for API response

  for (let i = 0; i < count; i++) {
    const date = format(subDays(new Date(), Math.floor(Math.random() * 365)), 'yyyy-MM-dd');
    const region = regions[Math.floor(Math.random() * regions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const order = {
      id: `order-${i}`,
      date,
      region,
      deliveryStatus: status,
      lateReason: status === 'Late' ? lateReasons[Math.floor(Math.random() * lateReasons.length)] : null,
      deliveryTime: Math.round((status === 'Late' ? 48 + Math.random() * 48 : 24 + Math.random() * 24) * 10) / 10,
      orderValue: Math.floor(Math.random() * 10000) + 100,
    };

    // Apply filters
    let include = true;
    
    if (filters.region && order.region !== filters.region) include = false;
    if (filters.deliveryStatus && order.deliveryStatus !== filters.deliveryStatus) include = false;
    if (filters.lateReason && order.lateReason !== filters.lateReason) include = false;
    if (filters.dateFrom && order.date < filters.dateFrom) include = false;
    if (filters.dateTo && order.date > filters.dateTo) include = false;
    
    if (include) {
      data.push(order);
    }
  }

  return data;
};

// API Routes

// Get filtered logistics data
app.get('/api/logistics-data', (req, res) => {
  try {
    const filters = req.query;
    const data = generateMockData(filters);
    
    res.json({
      success: true,
      data: data,
      count: data.length,
      filters: filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get geographic distribution
app.get('/api/geographic-distribution', (req, res) => {
  try {
    const filters = req.query;
    const data = generateMockData(filters);
    
    const regionStats = {};
    data.forEach(order => {
      if (!regionStats[order.region]) {
        regionStats[order.region] = {
          region: order.region,
          orderCount: 0,
          totalValue: 0,
          onTimeCount: 0,
          lateCount: 0
        };
      }
      
      regionStats[order.region].orderCount++;
      regionStats[order.region].totalValue += order.orderValue;
      if (order.deliveryStatus === 'On Time') regionStats[order.region].onTimeCount++;
      if (order.deliveryStatus === 'Late') regionStats[order.region].lateCount++;
    });

    res.json({
      success: true,
      data: Object.values(regionStats),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get delivery performance metrics
app.get('/api/delivery-performance', (req, res) => {
  try {
    const filters = req.query;
    const granularity = req.query.granularity || 'monthly';
    const data = generateMockData(filters);
    
    // Group data by time period (simplified - in real app would use proper date handling)
    const groupedData = {};
    data.forEach(order => {
      const key = order.date.substring(0, 7); // YYYY-MM for monthly
      
      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          orderCount: 0,
          totalDeliveryTime: 0,
          totalValue: 0
        };
      }
      
      groupedData[key].orderCount++;
      groupedData[key].totalDeliveryTime += order.deliveryTime;
      groupedData[key].totalValue += order.orderValue;
    });

    const result = Object.values(groupedData).map(item => ({
      ...item,
      avgDeliveryTime: Math.round((item.totalDeliveryTime / item.orderCount) * 10) / 10
    }));

    res.json({
      success: true,
      data: result,
      granularity: granularity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get late delivery analysis
app.get('/api/late-delivery-analysis', (req, res) => {
  try {
    const filters = req.query;
    const data = generateMockData(filters);
    const lateOrders = data.filter(order => order.deliveryStatus === 'Late');
    
    const reasonStats = {};
    lateOrders.forEach(order => {
      if (!reasonStats[order.lateReason]) {
        reasonStats[order.lateReason] = {
          reason: order.lateReason,
          count: 0,
          totalDelay: 0
        };
      }
      
      reasonStats[order.lateReason].count++;
      reasonStats[order.lateReason].totalDelay += Math.max(0, order.deliveryTime - 24);
    });

    const result = Object.values(reasonStats).map(item => ({
      ...item,
      avgDelay: Math.round((item.totalDelay / item.count) * 10) / 10
    }));

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock logistics backend server is running on port ${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET /api/logistics-data`);
  console.log(`   GET /api/geographic-distribution`);
  console.log(`   GET /api/delivery-performance`);
  console.log(`   GET /api/late-delivery-analysis`);
  console.log(`   GET /health`);
});
