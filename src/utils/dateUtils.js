import { format, subDays, subWeeks, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

// Natural language date parsing
export const parseNaturalLanguage = (input) => {
  const normalizedInput = input.toLowerCase().trim();
  const now = new Date();
  
  // Common patterns
  const patterns = [
    // Last periods
    {
      pattern: /^last (\d+) (day|days)$/,
      handler: (match) => ({
        start: subDays(now, parseInt(match[1])),
        end: now
      })
    },
    {
      pattern: /^last week$/,
      handler: () => {
        const lastWeekEnd = subDays(startOfWeek(now), 1);
        const lastWeekStart = startOfWeek(lastWeekEnd);
        return { start: lastWeekStart, end: lastWeekEnd };
      }
    },
    {
      pattern: /^last (\d+) (week|weeks)$/,
      handler: (match) => ({
        start: subWeeks(now, parseInt(match[1])),
        end: now
      })
    },
    {
      pattern: /^last month$/,
      handler: () => {
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        };
      }
    },
    {
      pattern: /^last (\d+) (month|months)$/,
      handler: (match) => ({
        start: subMonths(now, parseInt(match[1])),
        end: now
      })
    },
    {
      pattern: /^last quarter$/,
      handler: () => {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const lastQuarterMonth = currentQuarter === 0 ? 9 : (currentQuarter - 1) * 3;
        const lastQuarterYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const lastQuarterStart = new Date(lastQuarterYear, lastQuarterMonth, 1);
        return {
          start: startOfQuarter(lastQuarterStart),
          end: endOfQuarter(lastQuarterStart)
        };
      }
    },
    {
      pattern: /^last year$/,
      handler: () => {
        const lastYear = subYears(now, 1);
        return {
          start: startOfYear(lastYear),
          end: endOfYear(lastYear)
        };
      }
    },
    // This periods
    {
      pattern: /^this week$/,
      handler: () => ({
        start: startOfWeek(now),
        end: endOfWeek(now)
      })
    },
    {
      pattern: /^this month$/,
      handler: () => ({
        start: startOfMonth(now),
        end: endOfMonth(now)
      })
    },
    {
      pattern: /^this quarter$/,
      handler: () => ({
        start: startOfQuarter(now),
        end: endOfQuarter(now)
      })
    },
    {
      pattern: /^this year$/,
      handler: () => ({
        start: startOfYear(now),
        end: endOfYear(now)
      })
    },
    // Quarterly patterns - Q1 2024, Q3 2023, etc.
    {
      pattern: /^q([1-4]) (\d{4})$/,
      handler: (match) => {
        const quarter = parseInt(match[1]);
        const year = parseInt(match[2]);
        const quarterStart = new Date(year, (quarter - 1) * 3, 1);
        return {
          start: startOfQuarter(quarterStart),
          end: endOfQuarter(quarterStart)
        };
      }
    },
    // Year patterns - 2023, 2024, etc.
    {
      pattern: /^(\d{4})$/,
      handler: (match) => {
        const year = parseInt(match[1]);
        return {
          start: new Date(year, 0, 1),
          end: new Date(year, 11, 31)
        };
      }
    },
    // Month year patterns - January 2024, Dec 2023, etc.
    {
      pattern: /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) (\d{4})$/,
      handler: (match) => {
        const monthNames = {
          january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
          april: 3, apr: 3, may: 4, june: 5, jun: 5,
          july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8,
          october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
        };
        const month = monthNames[match[1]];
        const year = parseInt(match[2]);
        const monthStart = new Date(year, month, 1);
        return {
          start: startOfMonth(monthStart),
          end: endOfMonth(monthStart)
        };
      }
    }
  ];

  // Try to match patterns
  for (const { pattern, handler } of patterns) {
    const match = normalizedInput.match(pattern);
    if (match) {
      try {
        const result = handler(match);
        return {
          start: result.start,
          end: result.end,
          label: formatDateRangeLabel(result.start, result.end),
          success: true
        };
      } catch (error) {
        console.warn('Date parsing error:', error);
        continue;
      }
    }
  }

  return {
    success: false,
    error: `Could not parse "${input}". Try formats like: "last week", "Q3 2024", "January 2024", "last 30 days"`
  };
};

// Format date range for display - consistent with chart component formatting
export const formatDateRangeLabel = (start, end) => {
  const isSameDay = start.getTime() === end.getTime();
  const isSameYear = start.getFullYear() === end.getFullYear();
  
  if (isSameDay) {
    return format(start, 'd MMM yyyy'); // Single day: "24 Aug 2024"
  } else if (isSameYear) {
    return `${format(start, 'd MMM')} to ${format(end, 'd MMM yyyy')}`; // Same year: "24 Aug to 30 Aug 2024"
  } else {
    return `${format(start, 'd MMM yyyy')} to ${format(end, 'd MMM yyyy')}`; // Different years: "24 Aug 2023 to 30 Aug 2024"
  }
};

// Get suggestions for natural language input
export const getDateSuggestions = () => [
  'last week',
  'last month',
  'last quarter',
  'last year',
  'this week',
  'this month',
  'this quarter',
  'this year',
  'last 7 days',
  'last 30 days',
  'last 90 days',
  'Q1 2024',
  'Q2 2024',
  'Q3 2024',
  'Q4 2024',
  'January 2024',
  'February 2024',
  '2023',
  '2024'
];

// Validate date range
export const validateDateRange = (start, end) => {
  if (!start || !end) {
    return { valid: false, error: 'Both start and end dates are required' };
  }
  
  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }
  
  const diffInDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffInDays > 730) { // 2 years
    return { valid: false, error: 'Date range cannot exceed 2 years' };
  }
  
  return { valid: true };
};
