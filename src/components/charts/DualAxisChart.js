import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Select from 'react-select';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { useFilters, FILTER_TYPES } from '../../contexts/FilterContext';
import { processDualAxisData, getDrillDownOptions } from '../../data/mockData';
import InteractiveLegend from '../InteractiveLegend';

const DualAxisChart = ({ data, unfilteredData }) => {
  const { addFilter, addMultipleFilters, toggleLegendItem, isLegendItemHidden, getAvailableDrillDowns, getOptimalDrillDown, activeFilters, getActiveLegendFilters } = useFilters();
  const [drillDown, setDrillDown] = useState('monthly');

  // Auto-adjust drill-down based on active filters
  useEffect(() => {
    const optimalDrillDown = getOptimalDrillDown('temporal', drillDown);
    if (optimalDrillDown !== drillDown) {
      setDrillDown(optimalDrillDown);
    }
  }, [activeFilters, getOptimalDrillDown, drillDown]);

  // Process dual axis data based on drill-down level
  const chartData = useMemo(() => {
    return processDualAxisData(data, drillDown);
  }, [data, drillDown]);

  // Get drill-down options
  const drillDownOptions = useMemo(() => {
    return getAvailableDrillDowns(getDrillDownOptions('temporal'));
  }, [getAvailableDrillDowns]);

  // Legend data
  const legendData = useMemo(() => {
    // Generate legend from unfiltered data so all options always show
    // Only show delivery status categories, not order volume (which is a line, not stackable)
    const unfilteredChartData = processDualAxisData(unfilteredData || data, drillDown);
    return [
      { key: 'onTimeDelivery', label: 'On Time %', color: '#10b981', count: unfilteredChartData.length },
      { key: 'lateDelivery', label: 'Late %', color: '#ef4444', count: unfilteredChartData.length },
      { key: 'earlyDelivery', label: 'Early %', color: '#06b6d4', count: unfilteredChartData.length }
    ];
  }, [unfilteredData, data, drillDown]);

  // Convert period string to date range for consistent filtering
  const getDateRangeFromPeriod = useCallback((period, granularity) => {
    let startDate, endDate, label;
    
    try {
      switch (granularity) {
        case 'quarterly': {
          // Parse "Q1 2024" format
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
          // Parse "Week of Jan 8, 2024" format
          const weekStart = new Date(period.replace('Week of ', ''));
          startDate = startOfWeek(weekStart);
          endDate = endOfWeek(weekStart);
          label = period;
          break;
        }
        case 'daily': {
          // Parse "Jan 15, 2024" format
          const date = new Date(period);
          startDate = new Date(date);
          endDate = new Date(date);
          label = period;
          break;
        }
        case 'monthly':
        default: {
          // Parse "Jan 2024" format
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

  // Handle bar click for filtering (both time period and delivery status)
  const handleBarClick = useCallback((event) => {
    if (!event || !event.points || event.points.length === 0) {
      return;
    }
    
    const point = event.points[0];
    const period = point.x;
    const traceName = point.data.name;
    
    // Map trace names to delivery status values
    const deliveryStatusMap = {
      'On Time Delivery': 'On Time',
      'Late Delivery': 'Late',
      'Early Delivery': 'Early'
    };
    
    // Only handle clicks on bar traces (delivery status), ignore line trace (order volume)
    if (point.data.type !== 'bar' || traceName === 'Order Volume') {
      return;
    }
    
    // Convert period to date range for consistent filtering
    const dateRange = getDateRangeFromPeriod(period, drillDown);
    if (!dateRange) return;
    
    // Apply both time period (as DATE_RANGE) and delivery status filters
    const filters = [
      { 
        type: FILTER_TYPES.DATE_RANGE, 
        value: dateRange.value, 
        label: dateRange.label 
      }
    ];
    
    // Add delivery status filter
    if (deliveryStatusMap[traceName]) {
      filters.push({ 
        type: FILTER_TYPES.DELIVERY_STATUS, 
        value: deliveryStatusMap[traceName], 
        label: `Delivery Status: ${deliveryStatusMap[traceName]}` 
      });
    }
    
    addMultipleFilters(filters);
  }, [addMultipleFilters, drillDown, getDateRangeFromPeriod]);

  // Create Plotly traces
  const traces = useMemo(() => {
    const activeLegendFilters = getActiveLegendFilters('dual-axis-chart');
    
    // If no legend filters are active, show all delivery status traces
    const showAll = activeLegendFilters.length === 0;
    
    // Order volume is always shown (not part of legend anymore)
    const showOnTimeDelivery = showAll || activeLegendFilters.includes('onTimeDelivery');
    const showLateDelivery = showAll || activeLegendFilters.includes('lateDelivery');
    const showEarlyDelivery = showAll || activeLegendFilters.includes('earlyDelivery');
    
    const traces = [];
    
    // Stacked percentage bars for delivery status distribution
    if (showOnTimeDelivery) {
      traces.push({
        x: chartData.map(item => item.period),
        y: chartData.map(item => item.onTimeCount),
        type: 'bar',
        name: 'On Time Delivery',
        marker: { color: '#10b981', opacity: 0.8 },
        hovertemplate: '<b>%{x}</b><br>On Time: %{customdata:.1f}%<br>Count: %{y}<extra></extra>',
        customdata: chartData.map(item => item.onTimePercentage),
        yaxis: 'y'
      });
    }
    
    if (showLateDelivery) {
      traces.push({
        x: chartData.map(item => item.period),
        y: chartData.map(item => item.lateCount),
        type: 'bar',
        name: 'Late Delivery',
        marker: { color: '#ef4444', opacity: 0.8 },
        hovertemplate: '<b>%{x}</b><br>Late: %{customdata:.1f}%<br>Count: %{y}<extra></extra>',
        customdata: chartData.map(item => item.latePercentage),
        yaxis: 'y'
      });
    }
    
    if (showEarlyDelivery) {
      traces.push({
        x: chartData.map(item => item.period),
        y: chartData.map(item => item.earlyCount),
        type: 'bar',
        name: 'Early Delivery',
        marker: { color: '#06b6d4', opacity: 0.8 },
        hovertemplate: '<b>%{x}</b><br>Early: %{customdata:.1f}%<br>Count: %{y}<extra></extra>',
        customdata: chartData.map(item => item.earlyPercentage),
        yaxis: 'y'
      });
    }
    
    // Line for order volume (always shown - not part of interactive legend)
    traces.push({
      x: chartData.map(item => item.period),
      y: chartData.map(item => item.orderCount),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Order Volume',
      line: { color: '#ef4444', width: 3 },
      marker: { 
        color: '#ef4444', 
        size: 8,
        line: { color: 'white', width: 2 }
      },
      hovertemplate: '<b>%{x}</b><br>Orders: %{y:,}<extra></extra>',
      hoverinfo: 'skip', // Skip hover on the line itself
      hoveron: 'points', // Only hover on marker points
      yaxis: 'y2'
    });
    
    return traces;
  }, [chartData, getActiveLegendFilters]);

  // Plotly layout
  const layout = useMemo(() => ({
    title: {
      text: '',
      font: { size: 16 }
    },
    xaxis: {
      title: 'Time Period',
      tickangle: -45,
      automargin: true
    },
    yaxis: {
      title: 'Delivery Status Distribution (%)',
      side: 'left',
      color: '#3b82f6'
    },
    yaxis2: {
      title: 'Number of Orders',
      side: 'right',
      overlaying: 'y',
      color: '#ef4444'
    },
    hovermode: 'closest',
    barmode: 'stack',
    barnorm: 'percent',
    margin: { l: 60, r: 60, t: 40, b: 80 },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'system-ui, sans-serif' },
    showlegend: false, // We use our custom legend
    autosize: true
  }), []);

  // Plotly config
  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    responsive: true
  };

  return (
    <div className="dual-axis-chart">
      <div className="chart-header">
        <h3 className="chart-title">Delivery Status Distribution vs. Order Volume</h3>
        <Select
          options={drillDownOptions}
          value={drillDownOptions.find(option => option.value === drillDown)}
          onChange={(option) => setDrillDown(option.value)}
          className="drill-down-select"
          placeholder="Select time period..."
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
            No data available for the selected filters
          </div>
        )}

                    <InteractiveLegend
              chartId="dual-axis-chart"
              data={legendData}
            />


      </div>
    </div>
  );
};

export default DualAxisChart;
