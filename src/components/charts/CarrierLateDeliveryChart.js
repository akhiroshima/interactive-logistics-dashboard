import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Select from 'react-select';
import { useFilters, FILTER_TYPES } from '../../contexts/FilterContext';
import { CHART_COLORS, DRILL_DOWN_LABELS, CHART_TITLES, AXIS_LABELS } from '../../constants/chartConstants';
import InteractiveLegend from '../InteractiveLegend';

const CarrierLateDeliveryChart = ({ data, unfilteredData }) => {
  const { addFilter, addMultipleFilters, getAvailableDrillDowns, getOptimalDrillDown, activeFilters, getActiveLegendFilters } = useFilters();
  const [drillDown, setDrillDown] = useState('all');

  // Auto-adjust drill-down based on active filters
  useEffect(() => {
    const suggestedDrillDown = getOptimalDrillDown('categorical', drillDown);
    if (suggestedDrillDown !== drillDown) {
      setDrillDown(suggestedDrillDown);
    }
  }, [activeFilters, getOptimalDrillDown, drillDown]);

  // Use standardized color palette for late delivery reasons
  const reasonColors = CHART_COLORS;

  // Available drill-down options
  const drillDownOptions = useMemo(() => {
    const baseOptions = [
      { value: 'all', label: DRILL_DOWN_LABELS.all_carriers },
      { value: 'country', label: DRILL_DOWN_LABELS.by_country }
    ];
    return getAvailableDrillDowns(baseOptions);
  }, [getAvailableDrillDowns]);

  // Process data for carrier late delivery analysis
  const chartData = useMemo(() => {
    // Filter for late deliveries only
    const lateDeliveries = data.filter(order => order.deliveryStatus === 'Late');
    
    if (drillDown === 'all') {
      // Group by carrier and late reason
      const carrierData = {};
      
      lateDeliveries.forEach(order => {
        const carrier = order.carrier;
        const reason = order.lateReason;
        
        if (!carrierData[carrier]) {
          carrierData[carrier] = {};
        }
        
        if (!carrierData[carrier][reason]) {
          carrierData[carrier][reason] = 0;
        }
        
        carrierData[carrier][reason]++;
      });

      // Convert to array format for visualization
      return Object.keys(carrierData).map(carrier => ({
        carrier,
        ...carrierData[carrier],
        total: Object.values(carrierData[carrier]).reduce((sum, count) => sum + count, 0)
      })).sort((a, b) => b.total - a.total); // Sort by total descending
      
    } else if (drillDown === 'country') {
      // Group by country and late reason
      const countryData = {};
      
      lateDeliveries.forEach(order => {
        const country = order.country;
        const reason = order.lateReason;
        
        if (!countryData[country]) {
          countryData[country] = {};
        }
        
        if (!countryData[country][reason]) {
          countryData[country][reason] = 0;
        }
        
        countryData[country][reason]++;
      });

      // Convert to array format for visualization
      return Object.keys(countryData).map(country => ({
        country,
        ...countryData[country],
        total: Object.values(countryData[country]).reduce((sum, count) => sum + count, 0)
      })).sort((a, b) => b.total - a.total); // Sort by total descending
    }
    
    return [];
  }, [data, drillDown]);

  // Create legend data
  const legendData = useMemo(() => {
    // Generate legend from unfiltered data so all options always show
    const unfilteredLateDeliveries = (unfilteredData || data).filter(order => order.deliveryStatus === 'Late');
    const reasons = Object.keys(reasonColors);
    
    return reasons.map(reason => ({
      key: reason,
      label: reason,
      color: reasonColors[reason],
      count: unfilteredLateDeliveries.filter(order => order.lateReason === reason).length
    }));
  }, [unfilteredData, data, reasonColors]);

  // Handle carrier/bar click for filtering
  const handleBarClick = useCallback((event) => {
    if (!event || !event.points || event.points.length === 0) {
      return;
    }
    
    const point = event.points[0];
    const traceName = point.data.name; // Late delivery reason
    
    if (drillDown === 'all') {
      // Carrier view - filter by carrier + reason
      const carrier = point.y; // Y-axis has carrier names
      
      if (traceName && reasonColors[traceName]) {
        // Apply both carrier and late reason filters
        const filters = [
          { type: FILTER_TYPES.CARRIER, value: carrier, label: `Carrier: ${carrier}` },
          { type: FILTER_TYPES.LATE_REASON, value: traceName, label: `Late Reason: ${traceName}` }
        ];
        addMultipleFilters(filters);
      } else {
        // Just carrier filter
        addFilter(FILTER_TYPES.CARRIER, carrier, `Carrier: ${carrier}`);
      }
    } else if (drillDown === 'country') {
      // Country view - filter by country + reason
      const country = point.y; // Y-axis has country names
      
      if (traceName && reasonColors[traceName]) {
        // Apply both country and late reason filters
        const filters = [
          { type: FILTER_TYPES.COUNTRY, value: country, label: `Country: ${country}` },
          { type: FILTER_TYPES.LATE_REASON, value: traceName, label: `Late Reason: ${traceName}` }
        ];
        addMultipleFilters(filters);
      } else {
        // Just country filter
        addFilter(FILTER_TYPES.COUNTRY, country, `Country: ${country}`);
      }
    }
  }, [addFilter, addMultipleFilters, drillDown, reasonColors]);

  // Create Plotly traces
  const traces = useMemo(() => {
    const activeLegendFilters = getActiveLegendFilters('carrier-late-delivery-chart');
    const showAll = activeLegendFilters.length === 0;
    
    const reasons = Object.keys(reasonColors);
    const traces = [];
    
    reasons.forEach(reason => {
      if (showAll || activeLegendFilters.includes(reason)) {
        if (drillDown === 'all') {
          // Horizontal stacked bar chart - carriers on Y-axis
          traces.push({
            x: chartData.map(item => item[reason] || 0),
            y: chartData.map(item => item.carrier),
            type: 'bar',
            orientation: 'h',
            name: reason,
            marker: { color: reasonColors[reason] },
            hovertemplate: `<b>%{y}</b><br>${reason}: %{x}<extra></extra>`
          });
        } else if (drillDown === 'country') {
          // Country view - horizontal bars with countries on Y-axis
          traces.push({
            x: chartData.map(item => item[reason] || 0),
            y: chartData.map(item => item.country),
            type: 'bar',
            orientation: 'h',
            name: reason,
            marker: { color: reasonColors[reason] },
            hovertemplate: `<b>%{y}</b><br>${reason}: %{x}<extra></extra>`
          });
        }
      }
    });
    
    return traces;
  }, [chartData, drillDown, reasonColors, getActiveLegendFilters]);

  // Layout configuration
  const layout = useMemo(() => ({
    title: { text: '', font: { size: 16 } },
    xaxis: { 
      title: AXIS_LABELS.late_delivery_count,
      side: 'bottom'
    },
    yaxis: { 
      title: drillDown === 'all' ? AXIS_LABELS.carrier : AXIS_LABELS.country,
      side: 'left'
    },
    barmode: 'stack',
    hovermode: 'closest',
    margin: { l: 120, r: 60, t: 40, b: 80 },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'system-ui, sans-serif' },
    showlegend: false, // We use our custom legend
    autosize: true
  }), [drillDown]);

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    responsive: true
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="carrier-late-delivery-chart">
        <div className="chart-header">
          <h3 className="chart-title">{CHART_TITLES.carrier_late_delivery}</h3>
          <Select
            value={drillDownOptions.find(option => option.value === drillDown)}
            onChange={(selected) => setDrillDown(selected.value)}
            options={drillDownOptions}
            className="drill-down-select"
            classNamePrefix="select"
          />
        </div>
        <div className="no-data">No late delivery data available for the selected filters</div>
      </div>
    );
  }

  return (
    <div className="carrier-late-delivery-chart">
      <div className="chart-header">
        <h3 className="chart-title">{CHART_TITLES.carrier_late_delivery}</h3>
        <Select
          value={drillDownOptions.find(option => option.value === drillDown)}
          onChange={(selected) => setDrillDown(selected.value)}
          options={drillDownOptions}
          className="drill-down-select"
          classNamePrefix="select"
          isOptionDisabled={(option) => option.disabled}
        />
      </div>

      <div className="chart-content">
        <div style={{ height: '400px', minHeight: '400px' }}>
          <Plot
            data={traces}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '100%' }}
            onClick={handleBarClick}
          />
        </div>
        <InteractiveLegend chartId="carrier-late-delivery-chart" data={legendData} />
      </div>
    </div>
  );
};

export default CarrierLateDeliveryChart;
