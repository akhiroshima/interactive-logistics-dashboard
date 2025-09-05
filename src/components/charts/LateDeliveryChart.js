import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Select from 'react-select';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { useFilters, FILTER_TYPES } from '../../contexts/FilterContext';
import { processLateDeliveryData, getDrillDownOptions, LATE_REASONS } from '../../data/mockData';
import { CHART_COLORS, DRILL_DOWN_LABELS, CHART_TITLES, AXIS_LABELS } from '../../constants/chartConstants';
import InteractiveLegend from '../InteractiveLegend';

const LateDeliveryChart = ({ data, unfilteredData }) => {
  const { addFilter, addMultipleFilters, toggleLegendItem, isLegendItemHidden, getAvailableDrillDowns, getOptimalDrillDown, activeFilters, getActiveLegendFilters } = useFilters();
  const [drillDown, setDrillDown] = useState('all');

  // Auto-adjust drill-down based on active filters
  useEffect(() => {
    const optimalDrillDown = getOptimalDrillDown('categorical', drillDown);
    if (optimalDrillDown !== drillDown) {
      setDrillDown(optimalDrillDown);
    }
  }, [activeFilters, getOptimalDrillDown, drillDown]);

  // Use standardized color palette for different reasons
  const reasonColors = CHART_COLORS;

  // Process late delivery data based on drill-down level
  const chartData = useMemo(() => {
    return processLateDeliveryData(data, drillDown);
  }, [data, drillDown]);

  // Get drill-down options
  const drillDownOptions = useMemo(() => {
    return getAvailableDrillDowns(getDrillDownOptions('categorical'));
  }, [getAvailableDrillDowns]);

  // Legend data
  const legendData = useMemo(() => {
    // Generate legend from unfiltered data so all options always show
    const unfilteredChartData = processLateDeliveryData(unfilteredData || data, drillDown);
    
    if (drillDown === 'all') {
      return LATE_REASONS.map(reason => {
        const reasonData = unfilteredChartData.find(item => item.reason === reason);
        return {
          key: reason,
          label: reason,
          color: reasonColors[reason] || '#64748b',
          count: reasonData ? reasonData.count : 0
        };
      });
    } else {
      // For time-based drill-downs, show all possible reasons
      return LATE_REASONS.map(reason => ({
        key: reason,
        label: reason,
        color: reasonColors[reason] || '#64748b',
        count: unfilteredChartData.reduce((sum, period) => sum + (period[reason] || 0), 0)
      }));
    }
  }, [unfilteredData, data, drillDown]);

  // Convert period string to date range for consistent filtering
  const getDateRangeFromPeriod = useCallback((period, granularity) => {
    let startDate, endDate, label;
    
    try {
      switch (granularity) {
        case 'quarterly': {
          const [quarter, year] = period.split(' ');
          const quarterNum = parseInt(quarter.replace('Q', ''));
          const yearNum = parseInt(year);
          const quarterStart = new Date(yearNum, (quarterNum - 1) * 3, 1);
          startDate = startOfQuarter(quarterStart);
          endDate = endOfQuarter(quarterStart);
          label = period;
          break;
        }
        case 'weekly': {
          const weekStart = new Date(period.replace('Week of ', ''));
          startDate = startOfWeek(weekStart);
          endDate = endOfWeek(weekStart);
          label = period;
          break;
        }
        case 'daily': {
          const date = new Date(period);
          startDate = new Date(date);
          endDate = new Date(date);
          label = period;
          break;
        }
        case 'monthly':
        default: {
          const date = new Date(period + ' 1');
          startDate = startOfMonth(date);
          endDate = endOfMonth(date);
          label = period;
          break;
        }
      }
      
      // Format as consistent date range
      const isSameDay = startDate.getTime() === endDate.getTime();
      const isSameYear = startDate.getFullYear() === endDate.getFullYear();
      
      let dateRangeLabel;
      if (isSameDay) {
        dateRangeLabel = format(startDate, 'd MMM yyyy'); // Single day
      } else if (isSameYear) {
        dateRangeLabel = `${format(startDate, 'd MMM')} to ${format(endDate, 'd MMM yyyy')}`; // Same year
      } else {
        dateRangeLabel = `${format(startDate, 'd MMM yyyy')} to ${format(endDate, 'd MMM yyyy')}`; // Different years
      }
      
      return {
        startDate,
        endDate,
        label: dateRangeLabel,
        value: `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`
      };
    } catch (error) {
      console.error('Error parsing period:', period, error);
      return null;
    }
  }, []);

  // Enhanced bar click for filtering by both time period AND category
  const handleBarClick = useCallback((event) => {
    const point = event.points[0];
    
    if (drillDown === 'all') {
      // Filter by reason only
      const reason = point.x;
      addFilter(FILTER_TYPES.LATE_REASON, reason, `Late Reason: ${reason}`);
    } else {
      // For time-based drill-downs, capture both time period AND reason
      const period = point.x;
      const traceName = point.data.name; // This gives us the category/reason
      
      // Convert period to date range for consistency with date picker
      const dateRange = getDateRangeFromPeriod(period, drillDown);
      if (!dateRange) return;
      
      // Add both filters simultaneously
      const filters = [
        { type: FILTER_TYPES.DATE_RANGE, value: dateRange.value, label: dateRange.label },
        { type: FILTER_TYPES.LATE_REASON, value: traceName, label: `Late Reason: ${traceName}` }
      ];
      
      addMultipleFilters(filters);
    }
  }, [addFilter, addMultipleFilters, drillDown, getDateRangeFromPeriod]);

  // Create Plotly traces
  const traces = useMemo(() => {
    if (drillDown === 'all') {
      // Simple bar chart for all reasons
      const activeLegendFilters = getActiveLegendFilters('late-delivery-chart');
      const showAll = activeLegendFilters.length === 0;
      
      const visibleData = chartData.filter(item => 
        showAll || activeLegendFilters.includes(item.reason)
      );
      
      return [{
        x: visibleData.map(item => item.reason),
        y: visibleData.map(item => item.count),
        type: 'bar',
        name: 'Late Deliveries',
        marker: {
          color: visibleData.map(item => reasonColors[item.reason] || '#64748b'),
          opacity: 0.8
        },
        hovertemplate: '<b>%{x}</b><br>Count: %{y:,}<br>Avg Delay: %{customdata:.1f}h<extra></extra>',
        customdata: visibleData.map(item => item.avgDelay)
      }];
    } else {
      // Stacked bar chart for time-based drill-downs
      const activeLegendFilters = getActiveLegendFilters('late-delivery-chart');
      const showAll = activeLegendFilters.length === 0;
      const traces = [];
      
      LATE_REASONS.forEach(reason => {
        if (showAll || activeLegendFilters.includes(reason)) {
          traces.push({
            x: chartData.map(item => item.period),
            y: chartData.map(item => item[reason] || 0),
            type: 'bar',
            name: reason,
            marker: { color: reasonColors[reason] || '#64748b' },
            hovertemplate: `<b>%{x}</b><br>${reason}: %{y}<extra></extra>`
          });
        }
      });
      
      return traces;
    }
  }, [chartData, drillDown, getActiveLegendFilters]);

  // Plotly layout
  const layout = useMemo(() => ({
    title: {
      text: '',
      font: { size: 16 }
    },
    xaxis: {
      title: drillDown === 'all' ? 'Late Delivery Reason' : 'Time Period',
      tickangle: -45,
      automargin: true
    },
    yaxis: {
      title: 'Number of Late Deliveries'
    },
    barmode: drillDown === 'all' ? 'group' : 'stack',
    hovermode: 'closest',
    margin: { l: 60, r: 40, t: 40, b: 100 },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'system-ui, sans-serif' },
    showlegend: false, // We use our custom legend
    autosize: true
  }), [drillDown]);

  // Plotly config
  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    responsive: true
  };

  return (
    <div className="late-delivery-chart">
      <div className="chart-header">
        <h3 className="chart-title">{CHART_TITLES.late_delivery}</h3>
        <Select
          options={drillDownOptions}
          value={drillDownOptions.find(option => option.value === drillDown)}
          onChange={(option) => setDrillDown(option.value)}
          className="drill-down-select"
          placeholder="Select view..."
          isSearchable={false}
        />
      </div>

      <div className="chart-content">
        {chartData.length > 0 ? (
          <Plot
            data={traces}
            layout={layout}
            config={config}
            style={{ width: '100%' }}
            onClick={handleBarClick}
          />
        ) : (
          <div className="no-data">
            No late delivery data available for the selected filters
          </div>
        )}

        <InteractiveLegend
          chartId="late-delivery-chart"
          data={legendData}
        />


      </div>
    </div>
  );
};

export default LateDeliveryChart;
