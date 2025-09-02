// Enhanced geographic data for drill-down map functionality
import { format, subDays, startOfWeek } from 'date-fns';

// Hierarchical geographic structure for drill-down
export const GEOGRAPHIC_HIERARCHY = {
  world: {
    'United States': {
      id: 'US',
      name: 'United States',
      subdivisions: {
        'California': { id: 'US-CA', name: 'California', region: 'North America' },
        'New York': { id: 'US-NY', name: 'New York', region: 'North America' },
        'Texas': { id: 'US-TX', name: 'Texas', region: 'North America' },
        'Florida': { id: 'US-FL', name: 'Florida', region: 'North America' },
        'Illinois': { id: 'US-IL', name: 'Illinois', region: 'North America' }
      },
      region: 'North America'
    },
    'United Kingdom': {
      id: 'GB',
      name: 'United Kingdom',
      subdivisions: {
        'England': { id: 'GB-ENG', name: 'England', region: 'Europe' },
        'Scotland': { id: 'GB-SCT', name: 'Scotland', region: 'Europe' },
        'Wales': { id: 'GB-WLS', name: 'Wales', region: 'Europe' },
        'Northern Ireland': { id: 'GB-NIR', name: 'Northern Ireland', region: 'Europe' }
      },
      region: 'Europe'
    },
    'Germany': {
      id: 'DE',
      name: 'Germany', 
      subdivisions: {
        'Bavaria': { id: 'DE-BY', name: 'Bavaria', region: 'Europe' },
        'North Rhine-Westphalia': { id: 'DE-NW', name: 'North Rhine-Westphalia', region: 'Europe' },
        'Baden-Württemberg': { id: 'DE-BW', name: 'Baden-Württemberg', region: 'Europe' },
        'Lower Saxony': { id: 'DE-NI', name: 'Lower Saxony', region: 'Europe' }
      },
      region: 'Europe'
    },
    'China': {
      id: 'CN',
      name: 'China',
      subdivisions: {
        'Beijing': { id: 'CN-BJ', name: 'Beijing', region: 'Asia Pacific' },
        'Shanghai': { id: 'CN-SH', name: 'Shanghai', region: 'Asia Pacific' },
        'Guangdong': { id: 'CN-GD', name: 'Guangdong', region: 'Asia Pacific' },
        'Zhejiang': { id: 'CN-ZJ', name: 'Zhejiang', region: 'Asia Pacific' },
        'Jiangsu': { id: 'CN-JS', name: 'Jiangsu', region: 'Asia Pacific' }
      },
      region: 'Asia Pacific'
    },
    'Japan': {
      id: 'JP',
      name: 'Japan',
      subdivisions: {
        'Tokyo': { id: 'JP-13', name: 'Tokyo', region: 'Asia Pacific' },
        'Osaka': { id: 'JP-27', name: 'Osaka', region: 'Asia Pacific' },
        'Kanagawa': { id: 'JP-14', name: 'Kanagawa', region: 'Asia Pacific' },
        'Aichi': { id: 'JP-23', name: 'Aichi', region: 'Asia Pacific' }
      },
      region: 'Asia Pacific'
    },
    'Brazil': {
      id: 'BR',
      name: 'Brazil',
      subdivisions: {
        'São Paulo': { id: 'BR-SP', name: 'São Paulo', region: 'South America' },
        'Rio de Janeiro': { id: 'BR-RJ', name: 'Rio de Janeiro', region: 'South America' },
        'Minas Gerais': { id: 'BR-MG', name: 'Minas Gerais', region: 'South America' },
        'Bahia': { id: 'BR-BA', name: 'Bahia', region: 'South America' }
      },
      region: 'South America'
    },
    'Canada': {
      id: 'CA',
      name: 'Canada',
      subdivisions: {
        'Ontario': { id: 'CA-ON', name: 'Ontario', region: 'North America' },
        'Quebec': { id: 'CA-QC', name: 'Quebec', region: 'North America' },
        'British Columbia': { id: 'CA-BC', name: 'British Columbia', region: 'North America' },
        'Alberta': { id: 'CA-AB', name: 'Alberta', region: 'North America' }
      },
      region: 'North America'
    },
    'France': {
      id: 'FR',
      name: 'France',
      subdivisions: {
        'Île-de-France': { id: 'FR-IDF', name: 'Île-de-France', region: 'Europe' },
        'Provence-Alpes-Côte d\'Azur': { id: 'FR-PAC', name: 'Provence-Alpes-Côte d\'Azur', region: 'Europe' },
        'Auvergne-Rhône-Alpes': { id: 'FR-ARA', name: 'Auvergne-Rhône-Alpes', region: 'Europe' },
        'Occitanie': { id: 'FR-OCC', name: 'Occitanie', region: 'Europe' }
      },
      region: 'Europe'
    },
    'Australia': {
      id: 'AU',
      name: 'Australia',
      subdivisions: {
        'New South Wales': { id: 'AU-NSW', name: 'New South Wales', region: 'Asia Pacific' },
        'Victoria': { id: 'AU-VIC', name: 'Victoria', region: 'Asia Pacific' },
        'Queensland': { id: 'AU-QLD', name: 'Queensland', region: 'Asia Pacific' },
        'Western Australia': { id: 'AU-WA', name: 'Western Australia', region: 'Asia Pacific' }
      },
      region: 'Asia Pacific'
    },
    'South Africa': {
      id: 'ZA',
      name: 'South Africa',
      subdivisions: {
        'Gauteng': { id: 'ZA-GP', name: 'Gauteng', region: 'Africa' },
        'KwaZulu-Natal': { id: 'ZA-KZN', name: 'KwaZulu-Natal', region: 'Africa' },
        'Western Cape': { id: 'ZA-WC', name: 'Western Cape', region: 'Africa' },
        'Eastern Cape': { id: 'ZA-EC', name: 'Eastern Cape', region: 'Africa' }
      },
      region: 'Africa'
    }
  }
};

// Enhanced logistics data generation for hierarchical geography
export const generateHierarchicalLogisticsData = (count = 10000) => {
  const data = [];
  const countries = Object.keys(GEOGRAPHIC_HIERARCHY.world);
  const deliveryStatuses = ['On Time', 'Late', 'Early'];
  const lateReasons = [
    'Weather Delays', 'Traffic Congestion', 'Vehicle Breakdown', 'Customs Issues',
    'Incorrect Address', 'Customer Unavailable', 'Warehouse Delays', 'Driver Issues'
  ];

  // Country weights for more realistic distribution (US gets 40% of orders)
  const countryWeights = {
    'United States': 0.4,
    'United Kingdom': 0.15,
    'Germany': 0.15,
    'Canada': 0.1,
    'China': 0.1,
    'Australia': 0.05,
    'Brazil': 0.05
  };

  // US state weights for more realistic distribution
  const usStateWeights = {
    'California': 0.25,
    'Texas': 0.2,
    'New York': 0.2,
    'Florida': 0.2,
    'Illinois': 0.15
  };

  // Function to select country based on weights
  const selectWeightedCountry = () => {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [country, weight] of Object.entries(countryWeights)) {
      cumulative += weight;
      if (rand < cumulative) {
        return country;
      }
    }
    // Fallback to random if weights don't add up to 1
    return countries[Math.floor(Math.random() * countries.length)];
  };

  // Function to select US state based on weights
  const selectWeightedUSState = () => {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [state, weight] of Object.entries(usStateWeights)) {
      cumulative += weight;
      if (rand < cumulative) {
        return state;
      }
    }
    // Fallback to random state
    const usStates = Object.keys(GEOGRAPHIC_HIERARCHY.world['United States'].subdivisions);
    return usStates[Math.floor(Math.random() * usStates.length)];
  };

  for (let i = 0; i < count; i++) {
    const date = subDays(new Date(), Math.floor(Math.random() * 365));
    const country = selectWeightedCountry();
    const countryData = GEOGRAPHIC_HIERARCHY.world[country];
    
    // Select subdivision - ensure US always has a state
    let subdivision = null;
    const subdivisions = Object.keys(countryData.subdivisions || {});
    
    if (subdivisions.length > 0) {
      if (country === 'United States') {
        // Always assign a state to US orders with weighted distribution
        subdivision = selectWeightedUSState();
      } else {
        // Random subdivision for other countries
        subdivision = subdivisions[Math.floor(Math.random() * subdivisions.length)];
      }
    }
    
    // Determine delivery status
    let deliveryStatus;
    const statusRand = Math.random();
    if (statusRand < 0.75) deliveryStatus = 'On Time';
    else if (statusRand < 0.90) deliveryStatus = 'Late';
    else deliveryStatus = 'Early';

    const lateReason = deliveryStatus === 'Late' 
      ? lateReasons[Math.floor(Math.random() * lateReasons.length)]
      : null;

    const baseDeliveryTime = deliveryStatus === 'On Time' ? 24 + Math.random() * 24 :
                           deliveryStatus === 'Late' ? 48 + Math.random() * 48 :
                           12 + Math.random() * 12;

    const orderValue = Math.floor(Math.random() * 10000) + 100;
    
    data.push({
      id: `order-${i}`,
      date: format(date, 'yyyy-MM-dd'),
      country,
      countryId: countryData.id,
      subdivision: subdivision,
      subdivisionId: subdivision ? countryData.subdivisions[subdivision]?.id : null,
      region: countryData.region,
      deliveryStatus,
      lateReason,
      deliveryTime: Math.round(baseDeliveryTime * 10) / 10,
      orderValue,
      quarter: `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`,
      month: format(date, 'MMM yyyy'),
      week: `Week of ${format(startOfWeek(date), 'MMM d, yyyy')}`,
      day: format(date, 'MMM d, yyyy')
    });
  }

  return data;
};

// Process data for choropleth coloring
export const processDataForChoropleth = (data, level = 'country', parentId = null) => {
  const aggregated = {};

  data.forEach(order => {
    let key, id, name, region;
    
    if (level === 'country') {
      key = order.country;
      id = order.countryId;
      name = order.country;
      region = order.region;
    } else if (level === 'subdivision' && order.subdivision) {
      // Only include subdivisions of the selected parent country
      if (parentId && order.countryId !== parentId) return;
      
      key = order.subdivision;
      id = order.subdivisionId;
      name = order.subdivision;
      region = order.region;
    } else {
      return;
    }

    if (!aggregated[key]) {
      aggregated[key] = {
        id,
        name,
        region,
        orderCount: 0,
        totalValue: 0,
        onTimeCount: 0,
        lateCount: 0,
        earlyCount: 0,
        totalDeliveryTime: 0
      };
    }

    aggregated[key].orderCount++;
    aggregated[key].totalValue += order.orderValue;
    aggregated[key].totalDeliveryTime += order.deliveryTime;
    
    switch (order.deliveryStatus) {
      case 'On Time':
        aggregated[key].onTimeCount++;
        break;
      case 'Late':
        aggregated[key].lateCount++;
        break;
      case 'Early':
        aggregated[key].earlyCount++;
        break;
    }
  });

  // Calculate derived metrics
  return Object.values(aggregated).map(item => ({
    ...item,
    onTimeRate: item.orderCount > 0 ? item.onTimeCount / item.orderCount : 0,
    lateRate: item.orderCount > 0 ? item.lateCount / item.orderCount : 0,
    avgDeliveryTime: item.orderCount > 0 ? item.totalDeliveryTime / item.orderCount : 0,
    avgOrderValue: item.orderCount > 0 ? item.totalValue / item.orderCount : 0
  }));
};

// Get color scale for choropleth
export const getColorScale = (data, metric = 'orderCount') => {
  const values = data.map(d => d[metric]).filter(v => !isNaN(v) && v > 0);
  if (values.length === 0) return () => '#e2e8f0';
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  return (value) => {
    if (!value || isNaN(value)) return '#e2e8f0';
    
    const normalized = range > 0 ? (value - min) / range : 0;
    
    // Color scheme based on metric
    if (metric === 'onTimeRate') {
      // Green scale for on-time performance (better = darker green)
      const intensity = Math.max(0.2, normalized);
      return `hsl(120, 70%, ${90 - intensity * 40}%)`;
    } else if (metric === 'lateRate') {
      // Red scale for late rate (higher = darker red)
      const intensity = Math.max(0.2, normalized);
      return `hsl(0, 70%, ${90 - intensity * 40}%)`;
    } else {
      // Blue scale for volume metrics (higher = darker blue)
      const intensity = Math.max(0.2, normalized);
      return `hsl(210, 70%, ${90 - intensity * 40}%)`;
    }
  };
};

// Generate the hierarchical dataset
export const HIERARCHICAL_LOGISTICS_DATA = generateHierarchicalLogisticsData();
