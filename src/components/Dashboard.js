import React, { useMemo, useState } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { HIERARCHICAL_LOGISTICS_DATA } from '../data/geographicData';
import FilterTags from './FilterTags';
import FilterSideMenu from './FilterSideMenu';
import DateRangePicker from './DateRangePicker';
import PlotlyChoroplethMap from './charts/PlotlyChoroplethMap';
import DualAxisChart from './charts/DualAxisChart';
import LateDeliveryChart from './charts/LateDeliveryChart';

const Dashboard = () => {
  const { activeFilters, getFilteredData, getFilteredDataForMap } = useFilters();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Get filtered data for regular charts
  const filteredData = useMemo(() => {
    return getFilteredData(HIERARCHICAL_LOGISTICS_DATA);
  }, [getFilteredData]);

  // Get filtered data for map (excludes geographic filters)
  const mapData = useMemo(() => {
    return getFilteredDataForMap(HIERARCHICAL_LOGISTICS_DATA);
  }, [getFilteredDataForMap]);



  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Logistics Dashboard</h1>
        <p className="dashboard-subtitle">
          Interactive analytics for order delivery performance and geographic distribution
        </p>
        
                        {/* Header Controls */}
                <div className="header-controls">
                  <DateRangePicker />
                  
                  <button 
                    className="filter-menu-trigger"
                    onClick={() => setIsFilterMenuOpen(true)}
                  >
                    🔧 Advanced Filters
                    {activeFilters.length > 0 && (
                      <span className="filter-count">({activeFilters.length})</span>
                    )}
                  </button>
                </div>

        {/* Active Filters */}
        <FilterTags />
      </div>

      <div className="charts-grid">
        {/* Geographic Distribution Chart */}
        <div className="chart-container">
          <PlotlyChoroplethMap data={mapData} />
        </div>

        {/* Dual Axis Chart - Order Volume vs Delivery Times */}
        <div className="chart-container dual-axis-chart">
          <DualAxisChart data={filteredData} />
        </div>

        {/* Late Delivery Reasons Chart */}
        <div className="chart-container bar-chart">
          <LateDeliveryChart data={filteredData} />
        </div>
      </div>

      {/* Additional Info Panel */}
      <div className="info-panel">
        <div className="info-section">
          <h3>How to Use This Dashboard</h3>
          <ul>
            <li><strong>Filter by clicking:</strong> Click on any chart element (map regions, bars, points) to filter all charts</li>
            <li><strong>Toggle legends:</strong> Click legend items to show/hide data categories</li>
            <li><strong>Drill down:</strong> Use dropdowns above each chart to change time granularity</li>
            <li><strong>Manage filters:</strong> Remove active filters by clicking the × on filter tags above</li>
          </ul>
        </div>
      </div>

      {/* Filter Side Menu */}
      <FilterSideMenu 
        isOpen={isFilterMenuOpen} 
        onClose={() => setIsFilterMenuOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
