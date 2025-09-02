import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useFilters, FILTER_TYPES } from '../contexts/FilterContext';
import { parseNaturalLanguage, formatDateRangeLabel, getDateSuggestions, validateDateRange } from '../utils/dateUtils';

const DateRangePicker = () => {
  const { addFilter, removeFilter, activeFilters } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('natural'); // 'natural' or 'picker'
  const [naturalInput, setNaturalInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [parseError, setParseError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Get active date range filter
  const activeDateFilter = activeFilters.find(filter => filter.type === FILTER_TYPES.DATE_RANGE);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (naturalInput.length > 0) {
      const filtered = getDateSuggestions().filter(suggestion =>
        suggestion.toLowerCase().includes(naturalInput.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8)); // Show max 8 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions(getDateSuggestions().slice(0, 6)); // Show default suggestions
      setShowSuggestions(false);
    }
  }, [naturalInput]);

  const handleNaturalLanguageSubmit = (input = naturalInput) => {
    if (!input.trim()) return;

    const parseResult = parseNaturalLanguage(input);
    
    if (parseResult.success) {
      // Remove existing date range filter
      if (activeDateFilter) {
        removeFilter(activeDateFilter.id);
      }
      
      // Add new date range filter
      addFilter(
        FILTER_TYPES.DATE_RANGE,
        `${format(parseResult.start, 'yyyy-MM-dd')}_${format(parseResult.end, 'yyyy-MM-dd')}`,
        parseResult.label
      );
      
      setNaturalInput('');
      setParseError('');
      setIsOpen(false);
      setShowSuggestions(false);
    } else {
      setParseError(parseResult.error);
    }
  };

  const handleDatePickerSubmit = () => {
    if (!startDate || !endDate) {
      setParseError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const validation = validateDateRange(start, end);
    if (!validation.valid) {
      setParseError(validation.error);
      return;
    }

    // Remove existing date range filter
    if (activeDateFilter) {
      removeFilter(activeDateFilter.id);
    }

    // Add new date range filter
    const label = formatDateRangeLabel(start, end);
    addFilter(
      FILTER_TYPES.DATE_RANGE,
      `${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}`,
      label
    );

    setStartDate('');
    setEndDate('');
    setParseError('');
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setNaturalInput(suggestion);
    handleNaturalLanguageSubmit(suggestion);
  };

  const clearDateFilter = () => {
    if (activeDateFilter) {
      removeFilter(activeDateFilter.id);
    }
  };

  return (
    <div className="date-range-picker" ref={containerRef}>
      <div className="date-picker-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="date-icon">📅</span>
        {activeDateFilter ? (
          <span className="active-date-range">
            {activeDateFilter.label}
            <button 
              className="clear-date" 
              onClick={(e) => {
                e.stopPropagation();
                clearDateFilter();
              }}
            >
              ✕
            </button>
          </span>
        ) : (
          <span className="date-placeholder">Select Date Range</span>
        )}
        <span className="dropdown-arrow">{isOpen ? '▴' : '▾'}</span>
      </div>

      {isOpen && (
        <div className="date-picker-dropdown">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-button ${mode === 'natural' ? 'active' : ''}`}
              onClick={() => {
                setMode('natural');
                setParseError('');
              }}
            >
              🔤 Natural Language
            </button>
            <button
              className={`mode-button ${mode === 'picker' ? 'active' : ''}`}
              onClick={() => {
                setMode('picker');
                setParseError('');
              }}
            >
              📅 Date Picker
            </button>
          </div>

          {mode === 'natural' ? (
            <div className="natural-language-section">
              <div className="input-section">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g., last week, Q3 2024, January 2024..."
                  value={naturalInput}
                  onChange={(e) => {
                    setNaturalInput(e.target.value);
                    setParseError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNaturalLanguageSubmit();
                    } else if (e.key === 'Escape') {
                      setIsOpen(false);
                      setShowSuggestions(false);
                    }
                  }}
                  autoFocus
                />
                <button
                  className="apply-button"
                  onClick={() => handleNaturalLanguageSubmit()}
                  disabled={!naturalInput.trim()}
                >
                  Apply
                </button>
              </div>

              {/* Suggestions */}
              {(showSuggestions || !naturalInput) && suggestions.length > 0 && (
                <div className="suggestions">
                  <div className="suggestions-header">
                    {naturalInput ? 'Matching suggestions:' : 'Quick options:'}
                  </div>
                  <div className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="date-picker-section">
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setParseError('');
                    }}
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setParseError('');
                    }}
                  />
                </div>
              </div>
              <button
                className="apply-button"
                onClick={handleDatePickerSubmit}
                disabled={!startDate || !endDate}
              >
                Apply Date Range
              </button>
            </div>
          )}

          {/* Error Message */}
          {parseError && (
            <div className="parse-error">
              <span className="error-icon">⚠️</span>
              {parseError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
