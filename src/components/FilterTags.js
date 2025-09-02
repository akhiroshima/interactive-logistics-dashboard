import React from 'react';
import { useFilters } from '../contexts/FilterContext';

const FilterTags = () => {
  const { activeFilters, removeFilter, clearFilters } = useFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="filter-tags">
      {activeFilters.map((filter) => (
        <div key={filter.id} className="filter-tag">
          <span className="filter-tag-label">
            {filter.label || `${filter.type}: ${filter.value}`}
          </span>
          <button
            className="filter-tag-remove"
            onClick={() => removeFilter(filter.id)}
            title={`Remove ${filter.label || filter.value} filter`}
          >
            ×
          </button>
        </div>
      ))}
      
      {activeFilters.length > 1 && (
        <button
          className="filter-tag clear-all"
          onClick={clearFilters}
          title="Clear all filters"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default FilterTags;
