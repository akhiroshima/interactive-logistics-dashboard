# Interactive Logistics Dashboard

A highly interactive logistics dashboard that visualizes complex logistics data with multiple chart types, intelligent filtering, drill-down capabilities, and seamless chart interactions.

## Features

### 📊 Multiple Chart Types
- **Geographic Map**: Interactive world map showing order distribution by region with clickable areas
- **Dual Y-Axis Chart**: Combines order volume (bars) with average delivery times (line) on separate Y-axes
- **Late Delivery Analysis**: Bar chart showing reasons for late deliveries with time-based drill-downs

### 🎛️ Interactive Features
- **Page-wide Filtering**: Click any chart element to filter all other charts
- **Interactive Legends**: Toggle data categories on/off with visual feedback
- **Drill-down Controls**: Change time granularity (yearly/quarterly/monthly/weekly) for individual charts
- **Smart Filter Management**: Active filters displayed as removable tags
- **Intelligent Disabling**: Drill-down options automatically disabled when irrelevant

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Chart transitions and hover effects
- **Intuitive Tooltips**: Helpful information on hover and click
- **Summary Statistics**: Key metrics displayed at the top of the dashboard

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **Plotly.js**: Advanced charting library for dual-axis and bar charts  
- **Leaflet**: Interactive maps with React-Leaflet integration
- **D3.js**: Data manipulation and processing
- **Styled Components**: CSS-in-JS styling
- **React Select**: Enhanced dropdown components

### Backend (Mock)
- **Node.js + Express**: RESTful API endpoints
- **CORS**: Cross-origin resource sharing
- **Date-fns**: Date manipulation utilities

## Installation & Setup

### Prerequisites
Make sure you have Node.js installed on your system:
- Node.js (v16 or higher)
- npm or yarn package manager

### Quick Start

1. **Install Node.js** (if not already installed):
   ```bash
   # On macOS using Homebrew
   brew install node
   
   # On Windows, download from nodejs.org
   # On Linux (Ubuntu/Debian)
   sudo apt update && sudo apt install nodejs npm
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```
   The dashboard will open at `http://localhost:3000`

4. **Start the Mock Backend** (optional):
   ```bash
   npm run server
   ```
   The API will be available at `http://localhost:3001`

## Project Structure

```
logistics-dashboard/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── GeographicChart.js    # Map-based chart
│   │   │   ├── DualAxisChart.js      # Volume vs time chart
│   │   │   └── LateDeliveryChart.js  # Late delivery reasons
│   │   ├── Dashboard.js              # Main dashboard component
│   │   ├── FilterTags.js             # Filter management UI
│   │   └── InteractiveLegend.js      # Reusable legend component
│   ├── contexts/
│   │   └── FilterContext.js          # Global filter state management
│   ├── data/
│   │   └── mockData.js              # Data generation and processing
│   ├── utils/
│   ├── App.js                       # Main app component
│   ├── index.js                     # React entry point
│   ├── index.css                    # Global styles
│   └── App.css                      # App-specific styles
├── server/
│   └── index.js                     # Mock backend server
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

## Usage Guide

### Interacting with Charts

1. **Filtering by Clicking**:
   - Click any region on the map to filter by that region
   - Click bars in the time-series chart to filter by time period
   - Click bars in the late delivery chart to filter by reason or time

2. **Using Interactive Legends**:
   - Click legend items to show/hide data categories
   - Hidden categories are greyed out and can be re-enabled
   - Legends update across all charts simultaneously

3. **Drill-down Controls**:
   - Use dropdown above each chart to change time granularity
   - Options automatically disable based on active filters
   - Each chart's drill-down is independent

4. **Managing Filters**:
   - Active filters appear as tags at the top
   - Click the × on any filter tag to remove it
   - Use "Clear All" to remove all active filters

### Sample Data

The dashboard includes comprehensive mock data with:
- **5,000+ orders** across 6 global regions
- **Realistic delivery performance** with 75% on-time rate
- **8 different late delivery reasons** with varying frequencies
- **Geographic coordinates** for accurate map visualization
- **Time-based data** covering a full year of operations

## Customization

### Adding New Chart Types
1. Create a new component in `src/components/charts/`
2. Follow the pattern of existing charts for filtering integration
3. Add the chart to the Dashboard component's grid

### Modifying Filter Logic
- Edit `src/contexts/FilterContext.js` to add new filter types
- Update the `getFilteredData` function for new filtering logic
- Add new filter types to the `FILTER_TYPES` enum

### Styling Customization
- Global styles: `src/index.css`
- Component-specific styles: Use styled-components or CSS modules
- Color themes: Update the color constants in chart components

## API Endpoints (Mock Backend)

The mock backend provides the following endpoints:

- `GET /api/logistics-data` - Get filtered logistics data
- `GET /api/geographic-distribution` - Get geographic statistics
- `GET /api/delivery-performance` - Get delivery performance metrics
- `GET /api/late-delivery-analysis` - Get late delivery analysis
- `GET /health` - Health check endpoint

## Performance Optimizations

- **Memoization**: React.useMemo for expensive calculations
- **Debounced Updates**: Filters update intelligently to prevent excessive re-renders
- **Lazy Loading**: Chart components load data efficiently
- **Responsive Design**: Optimized layouts for different screen sizes

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions, issues, or feature requests, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for modern logistics analytics**
