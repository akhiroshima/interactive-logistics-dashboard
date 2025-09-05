// Standardized constants for consistent chart styling and naming across all widgets

// Standardized color palette for all charts
export const CHART_COLORS = {
  // Delivery Status Colors (consistent across all widgets)
  'On Time': '#10b981',      // Green
  'Late': '#ef4444',         // Red  
  'Early': '#06b6d4',        // Cyan
  
  // Late Reason Colors (consistent across all widgets)
  'Weather Delays': '#3b82f6',           // Blue
  'Traffic Congestion': '#ef4444',       // Red
  'Vehicle Breakdown': '#10b981',        // Green
  'Customs Issues': '#f59e0b',           // Amber
  'Incorrect Address': '#8b5cf6',        // Purple
  'Customer Unavailable': '#ec4899',     // Pink
  'Warehouse Delays': '#06b6d4',         // Cyan
  'Driver Issues': '#84cc16',            // Lime
  
  // Order Volume (line chart)
  'Order Volume': '#ef4444'              // Red
};

// Standardized drill-down option labels
export const DRILL_DOWN_LABELS = {
  // Time-based drill-downs
  'yearly': 'Yearly',
  'quarterly': 'Quarterly', 
  'monthly': 'Monthly',
  'weekly': 'Weekly',
  'daily': 'Daily',
  
  // Geographic drill-downs
  'region': 'By Region',
  'country': 'By Country',
  'state': 'By State',
  
  // Categorical drill-downs
  'all': 'All',
  'all_reasons': 'All Reasons',
  'all_carriers': 'All Carriers',
  'by_month': 'By Month',
  'by_quarter': 'By Quarter', 
  'by_week': 'By Week',
  'by_day': 'By Day',
  'by_country': 'By Country',
  'by_carrier': 'By Carrier'
};

// Standardized chart titles
export const CHART_TITLES = {
  'map': 'Order Volume by Geography',
  'dual_axis': 'Delivery Status Distribution vs. Order Volume',
  'late_delivery': 'Late Delivery Reasons',
  'carrier_late_delivery': 'Late Delivery Reasons by Carrier'
};

// Standardized axis labels
export const AXIS_LABELS = {
  'order_count': 'Number of Orders',
  'delivery_percentage': 'Delivery Status Distribution (%)',
  'late_delivery_count': 'Number of Late Deliveries',
  'carrier': 'Carrier',
  'country': 'Country',
  'time_period': 'Time Period'
};
