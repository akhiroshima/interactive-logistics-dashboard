import React, { useState, useMemo, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { useFilters, FILTER_TYPES } from '../../contexts/FilterContext';

const PlotlyChoroplethMap = ({ data }) => {
  const { addFilter, removeFilter, activeFilters } = useFilters();
  const colorMetric = 'orderCount'; // Fixed to order volume
  const [currentLevel, setCurrentLevel] = useState('world'); // 'world' or 'usa'
  const [selectedCountry, setSelectedCountry] = useState(null);

  // State name to abbreviation mapping for Plotly USA-states
  const stateAbbreviations = {
    'California': 'CA',
    'Texas': 'TX',
    'New York': 'NY',
    'Florida': 'FL',
    'Illinois': 'IL'
  };

  // Check if a location is currently filtered/selected
  const isLocationSelected = useCallback((locationName) => {
    if (currentLevel === 'world') {
      return activeFilters.some(
        filter => filter.type === FILTER_TYPES.COUNTRY && filter.value === locationName
      );
    } else if (currentLevel === 'usa') {
      // Convert abbreviation back to full state name for checking
      const fullStateName = Object.keys(stateAbbreviations).find(
        stateName => stateAbbreviations[stateName] === locationName
      ) || locationName;
      return activeFilters.some(
        filter => filter.type === FILTER_TYPES.SUBDIVISION && filter.value === fullStateName
      );
    }
    return false;
  }, [activeFilters, currentLevel, stateAbbreviations]);

  // Process data for Plotly choropleth
  const processedData = useMemo(() => {
    const locationData = {};
    
    data.forEach(record => {
      const locationKey = currentLevel === 'world' ? record.country : record.subdivision;
      
      // Skip if we're at USA level but this record isn't from USA
      if (currentLevel === 'usa' && record.country !== 'United States') {
        return;
      }
      
      // Skip if we don't have subdivision data for USA level
      if (currentLevel === 'usa' && !locationKey) {
        return;
      }
      
      if (!locationData[locationKey]) {
        locationData[locationKey] = {
          orderCount: 0,
          totalDeliveryTime: 0,
          deliveryCount: 0,
          lateDeliveries: 0,
          revenue: 0
        };
      }
      
      locationData[locationKey].orderCount += 1;
      locationData[locationKey].totalDeliveryTime += record.deliveryTime;
      locationData[locationKey].deliveryCount += 1;
      locationData[locationKey].revenue += record.orderValue || 1000; // Default value
      
      if (record.status === 'late') {
        locationData[locationKey].lateDeliveries += 1;
      }
    });

    // Calculate averages and prepare arrays for Plotly
    const locations = [];
    const values = [];
    const texts = [];

    Object.entries(locationData).forEach(([location, stats]) => {
      // For USA states, use abbreviations that Plotly expects
      const plotlyLocation = currentLevel === 'usa' && stateAbbreviations[location] 
        ? stateAbbreviations[location] 
        : location;
      
      locations.push(plotlyLocation);
      
      let value;
      let displayText;
      const locationName = currentLevel === 'world' ? location : `${location}, USA`;
      
      // Always show order count
      value = stats.orderCount;
      displayText = `${locationName}<br>Orders: ${value}<br>Avg Delivery: ${(stats.totalDeliveryTime / stats.deliveryCount).toFixed(1)}h`;
      
      values.push(value);
      texts.push(displayText);
    });

    return { locations, values, texts };
  }, [data, currentLevel, stateAbbreviations]);

  // Handle map click for filtering and drill-down
  const handleMapClick = useCallback((event) => {
    if (event.points && event.points.length > 0) {
      const location = event.points[0].location;
      
      if (currentLevel === 'world') {
        if (location === 'United States') {
          // Check if US is already filtered
          const existingUSFilter = activeFilters.find(
            filter => filter.type === FILTER_TYPES.COUNTRY && filter.value === 'United States'
          );
          
          if (existingUSFilter) {
            // If already filtered, drill down to states view but keep the filter
            setCurrentLevel('usa');
            setSelectedCountry('United States');
          } else {
            // If not filtered, drill down AND apply USA filter
            setCurrentLevel('usa');
            setSelectedCountry('United States');
            addFilter(FILTER_TYPES.COUNTRY, 'United States', 'United States');
          }
        } else {
          // Toggle country filter for other countries
          const existingFilter = activeFilters.find(
            filter => filter.type === FILTER_TYPES.COUNTRY && filter.value === location
          );
          
          if (existingFilter) {
            // Remove filter if already selected
            removeFilter(existingFilter.id);
          } else {
            // Add filter if not selected
            addFilter(FILTER_TYPES.COUNTRY, location, location);
          }
        }
      } else if (currentLevel === 'usa') {
        // Convert abbreviation back to full state name for filtering
        const fullStateName = Object.keys(stateAbbreviations).find(
          stateName => stateAbbreviations[stateName] === location
        ) || location;
        
        // Toggle state filter
        const existingFilter = activeFilters.find(
          filter => filter.type === FILTER_TYPES.SUBDIVISION && filter.value === fullStateName
        );
        
        if (existingFilter) {
          // Remove filter if already selected
          removeFilter(existingFilter.id);
        } else {
          // Add filter if not selected
          addFilter(FILTER_TYPES.SUBDIVISION, fullStateName, `${fullStateName}, USA`);
        }
      }
    }
  }, [addFilter, removeFilter, activeFilters, currentLevel, stateAbbreviations]);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((level) => {
    if (level === 'world') {
      setCurrentLevel('world');
      setSelectedCountry(null);
    }
  }, []);

  // Color scale for order count - reversed so higher values are darker
  const getColorScale = () => {
    return [
      [0, '#f7fbff'],
      [0.2, '#deebf7'], 
      [0.4, '#c6dbef'],
      [0.6, '#9ecae1'],
      [0.8, '#6baed6'],
      [1.0, '#08519c']
    ];
  };

  // Plotly data with visual feedback for selected locations
  const plotlyData = useMemo(() => {
    // Create border styling arrays based on selection status
    const borderColors = processedData.locations.map(location => 
      isLocationSelected(location) ? '#ff6b6b' : 'rgb(180,180,180)'
    );
    const borderWidths = processedData.locations.map(location => 
      isLocationSelected(location) ? 3 : 0.5
    );

    return [
      {
        type: 'choropleth',
        locationmode: currentLevel === 'world' ? 'country names' : 'USA-states',
        locations: processedData.locations,
        z: processedData.values,
        text: processedData.texts,
        colorscale: getColorScale(),
        colorbar: {
          title: 'Order Volume',
          thickness: 15,
          len: 0.8
        },
        hovertemplate: '%{text}<extra></extra>',
        marker: {
          line: {
            color: borderColors,
            width: borderWidths
          }
        }
      }
    ];
  }, [processedData, isLocationSelected, currentLevel]);

  // Layout configuration
  const layout = {
    title: {
      text: currentLevel === 'world' ? 'World Geographic Distribution' : 'USA States Distribution',
      font: { size: 16, color: '#333' }
    },
    geo: {
      showframe: false,
      showcoastlines: currentLevel === 'world',
      coastlinecolor: 'rgb(204,204,204)',
      showland: true,
      landcolor: 'rgb(243,243,243)',
      showocean: currentLevel === 'world',
      oceancolor: 'rgb(230,245,255)',
      showlakes: currentLevel === 'world',
      lakecolor: 'rgb(230,245,255)',
      projection: {
        type: currentLevel === 'world' ? 'natural earth' : 'albers usa'
      },
      scope: currentLevel === 'world' ? 'world' : 'usa'
    },
    margin: { l: 0, r: 0, t: 40, b: 0 },
    autosize: true,
    height: 400
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    responsive: true
  };

  return (
    <div className="plotly-choropleth-map">
      <div className="chart-header">
        <h3 className="chart-title">
          Geographic Distribution
          {(() => {
            const selectedCountries = activeFilters.filter(f => f.type === FILTER_TYPES.COUNTRY).length;
            const selectedStates = activeFilters.filter(f => f.type === FILTER_TYPES.SUBDIVISION).length;
            const totalSelected = selectedCountries + selectedStates;
            
            if (totalSelected > 0) {
              return (
                <span style={{ fontSize: '14px', color: '#ff6b6b', marginLeft: '10px' }}>
                  ({totalSelected} selected)
                </span>
              );
            }
            return null;
          })()}
        </h3>
        <p style={{ 
          fontSize: '12px', 
          color: '#666', 
          margin: '5px 0 0 0',
          fontStyle: 'italic'
        }}>
          {currentLevel === 'world' 
            ? 'Click countries to select/deselect • Click USA to drill down' 
            : 'Click states to select/deselect • Click breadcrumb to return'
          }
        </p>
      </div>

      <div className="chart-content">
        {/* Breadcrumb Navigation */}
        {currentLevel !== 'world' && (
          <div style={{
            margin: '10px 0',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span
              onClick={() => handleBreadcrumbClick('world')}
              style={{
                cursor: 'pointer',
                color: '#007bff',
                textDecoration: 'underline'
              }}
            >
              🌍 World
            </span>
            <span style={{ margin: '0 8px', color: '#666' }}>›</span>
            <span style={{ color: '#333' }}>🇺🇸 United States</span>
          </div>
        )}
        
        <div className="map-container" style={{ height: '400px' }}>
          <Plot
            key={`map-${currentLevel}`}
            data={plotlyData}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '100%' }}
            onClick={handleMapClick}
            useResizeHandler={true}
          />
        </div>


      </div>
    </div>
  );
};

export default PlotlyChoroplethMap;
