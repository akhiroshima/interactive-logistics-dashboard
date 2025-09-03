import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Filter types
export const FILTER_TYPES = {
  REGION: 'region',
  COUNTRY: 'country',
  SUBDIVISION: 'subdivision',
  YEAR: 'year',
  QUARTER: 'quarter',
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  DELIVERY_STATUS: 'deliveryStatus',
  LATE_REASON: 'lateReason',
  CARRIER: 'carrier',
  DATE_RANGE: 'dateRange',
  LEGEND_FILTER: 'legendFilter'
};

// Filter actions
const FILTER_ACTIONS = {
  ADD_FILTER: 'ADD_FILTER',
  REMOVE_FILTER: 'REMOVE_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  TOGGLE_LEGEND_ITEM: 'TOGGLE_LEGEND_ITEM'
};

// Initial state
const initialState = {
  activeFilters: [],
  hiddenLegendItems: {
    // Chart-specific hidden legend items
    // Format: { chartId: { itemKey: boolean } }
  }
};

// Filter reducer
function filterReducer(state, action) {
  switch (action.type) {
          case FILTER_ACTIONS.ADD_FILTER:
      // For DATE_RANGE, replace existing date range filter instead of preventing duplicates
      if (action.payload.type === FILTER_TYPES.DATE_RANGE) {
        const nonDateFilters = state.activeFilters.filter(filter => filter.type !== FILTER_TYPES.DATE_RANGE);
        return {
          ...state,
          activeFilters: [...nonDateFilters, action.payload]
        };
      }
      
      // Prevent duplicate filters of same type and value for other filter types
      const existingFilter = state.activeFilters.find(
        filter => filter.type === action.payload.type && filter.value === action.payload.value
      );
      
      if (existingFilter) {
        return state;
      }
      
      return {
        ...state,
        activeFilters: [...state.activeFilters, action.payload]
      };
      
    case FILTER_ACTIONS.REMOVE_FILTER:
      return {
        ...state,
        activeFilters: state.activeFilters.filter(filter => filter.id !== action.payload.id)
      };
      
    case FILTER_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        activeFilters: []
      };
      
    case FILTER_ACTIONS.TOGGLE_LEGEND_ITEM:
      const { chartId, itemKey } = action.payload;
      return {
        ...state,
        hiddenLegendItems: {
          ...state.hiddenLegendItems,
          [chartId]: {
            ...state.hiddenLegendItems[chartId],
            [itemKey]: !state.hiddenLegendItems[chartId]?.[itemKey]
          }
        }
      };
      
    default:
      return state;
  }
}

// Create context
const FilterContext = createContext();

// Custom hook to use filter context
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Filter provider component
export const FilterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  // Add filter
  const addFilter = useCallback((type, value, label) => {
    const filter = {
      id: `${type}-${value}-${Date.now()}`,
      type,
      value,
      label
    };
    
    dispatch({
      type: FILTER_ACTIONS.ADD_FILTER,
      payload: filter
    });
  }, []);

  // Add multiple filters at once (for enhanced filtering)
  const addMultipleFilters = useCallback((filters) => {
    filters.forEach(({ type, value, label }) => {
      const filter = {
        id: `${type}-${value}-${Date.now()}`,
        type,
        value,
        label
      };
      
      dispatch({
        type: FILTER_ACTIONS.ADD_FILTER,
        payload: filter
      });
    });
  }, []);

  // Remove filter
  const removeFilter = useCallback((filterId) => {
    dispatch({
      type: FILTER_ACTIONS.REMOVE_FILTER,
      payload: { id: filterId }
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    dispatch({
      type: FILTER_ACTIONS.CLEAR_FILTERS
    });
  }, []);

  // Handle legend click with filtering behavior - maps to real data filters
  const handleLegendClick = useCallback((chartId, itemKey, itemLabel) => {
    // Map legend items to actual filter types that affect dashboard data
    const getFilterTypeForLegendItem = (chartId, itemKey) => {
      // Map chart-specific legend items to filter types
      if (chartId === 'dual-axis-chart') {
        // Dual axis chart legends map to delivery status
        const deliveryStatusMapping = {
          'onTimeDelivery': { type: FILTER_TYPES.DELIVERY_STATUS, value: 'On Time', label: 'Delivery Status: On Time' },
          'lateDelivery': { type: FILTER_TYPES.DELIVERY_STATUS, value: 'Late', label: 'Delivery Status: Late' },
          'earlyDelivery': { type: FILTER_TYPES.DELIVERY_STATUS, value: 'Early', label: 'Delivery Status: Early' }
        };
        return deliveryStatusMapping[itemKey] || null;
      } else if (chartId === 'late-delivery-chart' || chartId === 'carrier-late-delivery-chart') {
        // Late delivery charts - legend items are late reasons
        return {
          type: FILTER_TYPES.LATE_REASON,
          value: itemKey,
          label: `Late Reason: ${itemKey}`
        };
      }
      return null;
    };

    const filterMapping = getFilterTypeForLegendItem(chartId, itemKey);
    
    if (!filterMapping) {
      // Fallback to old legend filter behavior for unmapped items
      console.warn(`No filter mapping found for chart ${chartId}, item ${itemKey}`);
      return;
    }

    // Check if this filter already exists
    const existingFilter = state.activeFilters.find(filter => 
      filter.type === filterMapping.type && filter.value === filterMapping.value
    );
    
    if (existingFilter) {
      // Remove existing filter (toggle off)
      dispatch({
        type: FILTER_ACTIONS.REMOVE_FILTER,
        payload: { id: existingFilter.id }
      });
    } else {
      // Add new filter (toggle on)
      const filter = {
        id: `${filterMapping.type}-${filterMapping.value}-${Date.now()}`,
        type: filterMapping.type,
        value: filterMapping.value,
        label: filterMapping.label
      };
      
      dispatch({
        type: FILTER_ACTIONS.ADD_FILTER,
        payload: filter
      });
    }
  }, [state.activeFilters]);

  // Keep the old toggle for backward compatibility but mark as deprecated
  const toggleLegendItem = useCallback((chartId, itemKey) => {
    dispatch({
      type: FILTER_ACTIONS.TOGGLE_LEGEND_ITEM,
      payload: { chartId, itemKey }
    });
  }, []);

  // Get filtered data based on active filters with OR logic within same type, AND between types
  const getFilteredData = useCallback((data, chartSpecificFilters = []) => {
    if (!data || (!state.activeFilters.length && !chartSpecificFilters.length)) {
      return data;
    }

    const allFilters = [...state.activeFilters, ...chartSpecificFilters];
    
    // Group filters by type for OR logic within each type
    const filterGroups = allFilters.reduce((groups, filter) => {
      if (!groups[filter.type]) {
        groups[filter.type] = [];
      }
      groups[filter.type].push(filter);
      return groups;
    }, {});
    
    return data.filter(item => {
      // Each filter type group must have at least one match (AND between groups)
      return Object.keys(filterGroups).every(filterType => {
        const filtersOfType = filterGroups[filterType];
        
        // Within each type, at least one filter must match (OR within group)
        return filtersOfType.some(filter => {
          switch (filter.type) {
            case FILTER_TYPES.REGION:
              // Handle both traditional region and new hierarchical geography
              return item.region === filter.value || 
                     item.country === filter.value || 
                     item.subdivision === filter.value;
            case FILTER_TYPES.QUARTER:
              return item.quarter === filter.value;
            case FILTER_TYPES.MONTH:
              return item.month === filter.value;
            case FILTER_TYPES.WEEK:
              return item.week === filter.value;
            case FILTER_TYPES.DELIVERY_STATUS:
              return item.deliveryStatus === filter.value;
            case FILTER_TYPES.LATE_REASON:
              return item.lateReason === filter.value;
            case FILTER_TYPES.CARRIER:
              return item.carrier === filter.value;
            case FILTER_TYPES.COUNTRY:
              return item.country === filter.value;
            case FILTER_TYPES.SUBDIVISION:
              return item.subdivision === filter.value;
            case FILTER_TYPES.DAY:
              return item.day === filter.value;
            case FILTER_TYPES.YEAR:
              return item.date.includes(filter.value); // Simple year check
            case FILTER_TYPES.DATE_RANGE:
              // Parse date range from stored value (format: "2024-01-01_2024-12-31")
              const [startDateStr, endDateStr] = filter.value.split('_');
              const startDate = new Date(startDateStr);
              const endDate = new Date(endDateStr);
              const itemDate = new Date(item.date);
              return itemDate >= startDate && itemDate <= endDate;
            default:
              return true;
          }
        });
      });
    });
  }, [state.activeFilters]);

  // Get filtered data excluding geographic filters (for map component)
  // This allows the map to show all countries/states while respecting other filters
  const getFilteredDataForMap = useCallback((data, chartSpecificFilters = []) => {
    if (!data) {
      return data;
    }

    // Filter out geographic filters, keep all other filters
    const nonGeographicFilters = state.activeFilters.filter(filter => 
      filter.type !== FILTER_TYPES.COUNTRY && 
      filter.type !== FILTER_TYPES.SUBDIVISION &&
      filter.type !== FILTER_TYPES.REGION
    );
    
    const allFilters = [...nonGeographicFilters, ...chartSpecificFilters];
    
    if (!allFilters.length) {
      return data;
    }
    
    // Group filters by type for OR logic within each type
    const filterGroups = allFilters.reduce((groups, filter) => {
      if (!groups[filter.type]) {
        groups[filter.type] = [];
      }
      groups[filter.type].push(filter);
      return groups;
    }, {});
    
    return data.filter(item => {
      // Each filter type group must have at least one match (AND between groups)
      return Object.keys(filterGroups).every(filterType => {
        const filtersOfType = filterGroups[filterType];
        
        // Within each type, at least one filter must match (OR within group)
        return filtersOfType.some(filter => {
          switch (filter.type) {
            case FILTER_TYPES.QUARTER:
              return item.quarter === filter.value;
            case FILTER_TYPES.MONTH:
              return item.month === filter.value;
            case FILTER_TYPES.WEEK:
              return item.week === filter.value;
            case FILTER_TYPES.DELIVERY_STATUS:
              return item.deliveryStatus === filter.value;
            case FILTER_TYPES.LATE_REASON:
              return item.lateReason === filter.value;
            case FILTER_TYPES.CARRIER:
              return item.carrier === filter.value;
            case FILTER_TYPES.DAY:
              return item.day === filter.value;
            case FILTER_TYPES.YEAR:
              return item.date.includes(filter.value); // Simple year check
            case FILTER_TYPES.DATE_RANGE:
              // Parse date range from stored value (format: "2024-01-01_2024-12-31")
              const [startDateStr, endDateStr] = filter.value.split('_');
              const startDate = new Date(startDateStr);
              const endDate = new Date(endDateStr);
              const itemDate = new Date(item.date);
              return itemDate >= startDate && itemDate <= endDate;
            default:
              return true;
          }
        });
      });
    });
  }, [state.activeFilters]);

  // Check if legend item is hidden (for backward compatibility)
  const isLegendItemHidden = useCallback((chartId, itemKey) => {
    return state.hiddenLegendItems[chartId]?.[itemKey] || false;
  }, [state.hiddenLegendItems]);

  // Get legend filter status for an item
  const getLegendFilterStatus = useCallback((chartId, itemKey) => {
    // Map legend items to actual filter types
    const getFilterTypeForLegendItem = (chartId, itemKey) => {
      if (chartId === 'dual-axis-chart') {
        const deliveryStatusMapping = {
          'onTimeDelivery': 'On Time',
          'lateDelivery': 'Late', 
          'earlyDelivery': 'Early'
        };
        const mappedValue = deliveryStatusMapping[itemKey];
        return mappedValue ? { type: FILTER_TYPES.DELIVERY_STATUS, value: mappedValue } : null;
      } else if (chartId === 'late-delivery-chart' || chartId === 'carrier-late-delivery-chart') {
        return { type: FILTER_TYPES.LATE_REASON, value: itemKey };
      }
      return null;
    };

    const filterMapping = getFilterTypeForLegendItem(chartId, itemKey);
    if (!filterMapping) {
      return 'all-active';
    }

    // Check if this actual filter is active
    const isActive = state.activeFilters.some(filter => 
      filter.type === filterMapping.type && filter.value === filterMapping.value
    );
    
    return isActive ? 'active' : 'all-active';
  }, [state.activeFilters]);

  // Get active legend filters for a chart
  const getActiveLegendFilters = useCallback((chartId) => {
    const activeLegendItems = [];

    // Map active filters back to legend items
    if (chartId === 'dual-axis-chart') {
      // Check for delivery status filters
      const deliveryStatusFilters = state.activeFilters.filter(filter => filter.type === FILTER_TYPES.DELIVERY_STATUS);
      const deliveryStatusToLegendKey = {
        'On Time': 'onTimeDelivery',
        'Late': 'lateDelivery',
        'Early': 'earlyDelivery'
      };
      
      deliveryStatusFilters.forEach(filter => {
        const legendKey = deliveryStatusToLegendKey[filter.value];
        if (legendKey) {
          activeLegendItems.push(legendKey);
        }
      });
    } else if (chartId === 'late-delivery-chart' || chartId === 'carrier-late-delivery-chart') {
      // Check for late reason filters
      const lateReasonFilters = state.activeFilters.filter(filter => filter.type === FILTER_TYPES.LATE_REASON);
      lateReasonFilters.forEach(filter => {
        activeLegendItems.push(filter.value); // Late reasons map directly
      });
    }

    return activeLegendItems;
  }, [state.activeFilters]);

  // Get available drill-down options based on current filters
  const getAvailableDrillDowns = useCallback((baseOptions) => {
    const hasTimeFilter = state.activeFilters.some(filter => 
      [FILTER_TYPES.YEAR, FILTER_TYPES.QUARTER, FILTER_TYPES.MONTH, FILTER_TYPES.WEEK, FILTER_TYPES.DAY, FILTER_TYPES.DATE_RANGE].includes(filter.type)
    );

    if (!hasTimeFilter) {
      return baseOptions;
    }

    // If we have a time filter, disable broader views than the filter
    return baseOptions.map(option => {
      const shouldDisable = state.activeFilters.some(filter => {
        if (filter.type === FILTER_TYPES.YEAR && option.value === 'yearly') return true;
        if (filter.type === FILTER_TYPES.QUARTER && ['yearly'].includes(option.value)) return true;
        if (filter.type === FILTER_TYPES.MONTH && ['yearly', 'quarterly'].includes(option.value)) return true;
        if (filter.type === FILTER_TYPES.WEEK && ['yearly', 'quarterly', 'monthly'].includes(option.value)) return true;
        if (filter.type === FILTER_TYPES.DAY && ['yearly', 'quarterly', 'monthly', 'weekly'].includes(option.value)) return true;
        // For DATE_RANGE filters, disable broader time views based on the range span
        if (filter.type === FILTER_TYPES.DATE_RANGE) {
          try {
            const [startDateStr, endDateStr] = filter.value.split('_');
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            const diffInDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            // Disable broader views based on date range span
            if (diffInDays <= 1) { // Day range - disable weekly and broader
              return ['yearly', 'quarterly', 'monthly', 'weekly'].includes(option.value);
            } else if (diffInDays <= 7) { // Week range - disable monthly and broader
              return ['yearly', 'quarterly', 'monthly'].includes(option.value);
            } else if (diffInDays <= 35) { // Month range - disable quarterly and broader
              return ['yearly', 'quarterly'].includes(option.value);
            } else if (diffInDays <= 100) { // Quarter range - disable yearly
              return ['yearly'].includes(option.value);
            }
            // For longer ranges, don't disable anything additional
            return false;
          } catch (error) {
            // Fallback: disable all broader views if we can't parse
            return ['yearly', 'quarterly', 'monthly', 'weekly'].includes(option.value);
          }
        }
        return false;
      });

      return {
        ...option,
        disabled: shouldDisable
      };
    });
  }, [state.activeFilters]);

  // Analyze date range to determine its granularity
  const analyzeDateRangeGranularity = useCallback((dateRangeValue) => {
    try {
      const [startDateStr, endDateStr] = dateRangeValue.split('_');
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const diffInDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      // Determine granularity based on date span
      if (diffInDays <= 1) {
        return { type: 'DAY', suggestion: 'daily' };
      } else if (diffInDays <= 7) {
        return { type: 'WEEK', suggestion: 'daily' };
      } else if (diffInDays <= 35) { // ~1 month
        return { type: 'MONTH', suggestion: 'weekly' };
      } else if (diffInDays <= 100) { // ~1 quarter  
        return { type: 'QUARTER', suggestion: 'monthly' };
      } else if (diffInDays <= 370) { // ~1 year
        return { type: 'YEAR', suggestion: 'quarterly' };
      } else {
        return { type: 'MULTI_YEAR', suggestion: 'yearly' };
      }
    } catch (error) {
      console.error('Error analyzing date range:', error);
      return { type: 'UNKNOWN', suggestion: 'monthly' };
    }
  }, []);

  // Get optimal drill-down level based on active filters
  const getOptimalDrillDown = useCallback((chartType, currentDrillDown) => {
    const timeFilters = state.activeFilters.filter(filter => 
      [FILTER_TYPES.YEAR, FILTER_TYPES.QUARTER, FILTER_TYPES.MONTH, FILTER_TYPES.WEEK, FILTER_TYPES.DAY, FILTER_TYPES.DATE_RANGE].includes(filter.type)
    );
    
    if (timeFilters.length === 0) {
      return currentDrillDown;
    }

    // Handle DATE_RANGE filters by analyzing their span
    const dateRangeFilters = timeFilters.filter(filter => filter.type === FILTER_TYPES.DATE_RANGE);
    const otherTimeFilters = timeFilters.filter(filter => filter.type !== FILTER_TYPES.DATE_RANGE);
    
    let suggestedDrillDown = currentDrillDown;
    
    // Process DATE_RANGE filters
    if (dateRangeFilters.length > 0) {
      const dateRangeAnalysis = analyzeDateRangeGranularity(dateRangeFilters[0].value);
      suggestedDrillDown = dateRangeAnalysis.suggestion;
    }
    
    // Process other time filters if no DATE_RANGE
    if (dateRangeFilters.length === 0 && otherTimeFilters.length > 0) {
      const mostGranularFilter = otherTimeFilters.reduce((mostGranular, filter) => {
        const granularityOrder = [FILTER_TYPES.YEAR, FILTER_TYPES.QUARTER, FILTER_TYPES.MONTH, FILTER_TYPES.WEEK, FILTER_TYPES.DAY];
        const currentIndex = granularityOrder.indexOf(filter.type);
        const mostGranularIndex = granularityOrder.indexOf(mostGranular.type);
        return currentIndex > mostGranularIndex ? filter : mostGranular;
      });

      const suggestionMap = {
        [FILTER_TYPES.YEAR]: 'quarterly',
        [FILTER_TYPES.QUARTER]: 'monthly', 
        [FILTER_TYPES.MONTH]: 'weekly',
        [FILTER_TYPES.WEEK]: 'daily',
        [FILTER_TYPES.DAY]: 'daily'
      };
      
      suggestedDrillDown = suggestionMap[mostGranularFilter.type] || 'monthly';
    }

    // For categorical charts, if filtering by late reason, suggest time-based view
    if (chartType === 'categorical') {
      const hasReasonFilter = state.activeFilters.some(filter => filter.type === FILTER_TYPES.LATE_REASON);
      if (hasReasonFilter) {
        return suggestedDrillDown;
      }
    }

    return suggestedDrillDown;
  }, [state.activeFilters, analyzeDateRangeGranularity]);

  const value = {
    activeFilters: state.activeFilters,
    hiddenLegendItems: state.hiddenLegendItems,
    addFilter,
    addMultipleFilters,
    removeFilter,
    clearFilters,
    toggleLegendItem, // Deprecated, use handleLegendClick
    handleLegendClick,
    getFilteredData,
    getFilteredDataForMap,
    isLegendItemHidden, // Deprecated
    getLegendFilterStatus,
    getActiveLegendFilters,
    getAvailableDrillDowns,
    getOptimalDrillDown
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
