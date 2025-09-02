import React, { useState, useMemo } from 'react';
import { useFilters, FILTER_TYPES } from '../contexts/FilterContext';
import { HIERARCHICAL_LOGISTICS_DATA } from '../data/geographicData';
import { LATE_REASONS } from '../data/mockData';

const FilterSideMenu = ({ isOpen, onClose }) => {
  const { activeFilters, addFilter, removeFilter } = useFilters();
  const [selectedFilters, setSelectedFilters] = useState({});

  // Extract all available filter options from data
  const filterOptions = useMemo(() => {
    const options = {
      [FILTER_TYPES.COUNTRY]: [],
      [FILTER_TYPES.SUBDIVISION]: [],
      [FILTER_TYPES.REGION]: [],
      [FILTER_TYPES.DELIVERY_STATUS]: ['On Time', 'Late', 'Early'],
      [FILTER_TYPES.LATE_REASON]: LATE_REASONS
    };

    // Extract unique values from data
    const countries = [...new Set(HIERARCHICAL_LOGISTICS_DATA.map(item => item.country))].sort();
    const subdivisions = [...new Set(HIERARCHICAL_LOGISTICS_DATA.map(item => item.subdivision).filter(Boolean))].sort();
    const regions = [...new Set(HIERARCHICAL_LOGISTICS_DATA.map(item => item.region))].sort();

    options[FILTER_TYPES.COUNTRY] = countries;
    options[FILTER_TYPES.SUBDIVISION] = subdivisions;
    options[FILTER_TYPES.REGION] = regions;

    return options;
  }, []);

  const handleFilterToggle = (filterType, value, label) => {
    const filterId = `${filterType}-${value}`;
    const isActive = activeFilters.some(filter => filter.type === filterType && filter.value === value);

    if (isActive) {
      const filter = activeFilters.find(filter => filter.type === filterType && filter.value === value);
      removeFilter(filter.id);
    } else {
      addFilter(filterType, value, label || value);
    }
  };

  const isFilterActive = (filterType, value) => {
    return activeFilters.some(filter => filter.type === filterType && filter.value === value);
  };

  const getActiveCount = (filterType) => {
    return activeFilters.filter(filter => filter.type === filterType).length;
  };

  const filterSections = [
    {
      title: 'Geographic Filters',
      sections: [
        { type: FILTER_TYPES.COUNTRY, label: 'Countries', icon: '🌍' },
        { type: FILTER_TYPES.SUBDIVISION, label: 'States/Provinces', icon: '🏛️' },
        { type: FILTER_TYPES.REGION, label: 'Regions', icon: '🗺️' }
      ]
    },
    {
      title: 'Delivery Filters',
      sections: [
        { type: FILTER_TYPES.DELIVERY_STATUS, label: 'Delivery Status', icon: '📦' },
        { type: FILTER_TYPES.LATE_REASON, label: 'Late Reasons', icon: '⚠️' }
      ]
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="filter-menu-overlay" 
          onClick={onClose}
        />
      )}
      
      {/* Side Menu */}
      <div className={`filter-side-menu ${isOpen ? 'open' : ''}`}>
        <div className="filter-menu-header">
          <h3>📝 Advanced Filters</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="filter-menu-content">
          {filterSections.map((section) => (
            <div key={section.title} className="filter-section">
              <h4 className="section-title">{section.title}</h4>
              
              {section.sections.map((filterSection) => {
                const activeCount = getActiveCount(filterSection.type);
                const options = filterOptions[filterSection.type] || [];
                
                return (
                  <div key={filterSection.type} className="filter-subsection">
                    <div className="subsection-header">
                      <span className="subsection-title">
                        {filterSection.icon} {filterSection.label}
                        {activeCount > 0 && (
                          <span className="active-count">({activeCount})</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="filter-options">
                      {options.map((option) => (
                        <label key={option} className="filter-option">
                          <input
                            type="checkbox"
                            checked={isFilterActive(filterSection.type, option)}
                            onChange={() => handleFilterToggle(
                              filterSection.type, 
                              option, 
                              filterSection.type === FILTER_TYPES.SUBDIVISION ? `${option}` : option
                            )}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="option-label">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="filter-menu-footer">
          <div className="active-filters-summary">
            <strong>{activeFilters.length}</strong> active filter{activeFilters.length !== 1 ? 's' : ''}
          </div>
          <button 
            className="clear-all-button"
            onClick={() => {
              activeFilters.forEach(filter => removeFilter(filter.id));
            }}
            disabled={activeFilters.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSideMenu;
