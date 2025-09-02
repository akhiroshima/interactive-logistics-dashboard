import React from 'react';
import { useFilters } from '../contexts/FilterContext';

const InteractiveLegend = ({ chartId, data, onToggle, isHidden, orientation = 'horizontal' }) => {
  const { handleLegendClick, getLegendFilterStatus } = useFilters();

  return (
    <div className={`interactive-legend ${orientation}`}>
      {data.map((item) => {
        const filterStatus = getLegendFilterStatus(chartId, item.key);
        const isActive = filterStatus === 'active' || filterStatus === 'all-active';
        const isFiltered = filterStatus !== 'all-active';
        
        return (
          <div
            key={item.key}
            className={`legend-item ${!isActive ? 'legend-inactive' : ''} ${isFiltered ? 'legend-filtered' : ''}`}
            onClick={() => handleLegendClick(chartId, item.key, item.label)}
            title={
              filterStatus === 'all-active' ? `Filter by ${item.label}` :
              filterStatus === 'active' ? `Remove ${item.label} filter` :
              `Add ${item.label} filter`
            }
          >
            <div
              className="legend-color"
              style={{
                backgroundColor: item.color,
                opacity: isActive ? 1 : 0.3
              }}
            />
            <span className="legend-label">
              {item.label}
              {item.count !== undefined && (
                <span className="legend-count"> ({item.count.toLocaleString()})</span>
              )}
              {filterStatus === 'active' && (
                <span className="legend-filter-indicator"> ✓</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default InteractiveLegend;
